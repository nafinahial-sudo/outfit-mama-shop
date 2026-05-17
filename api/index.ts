import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedServer: { fetch: (request: Request) => Promise<Response> } | null = null;

async function getServer() {
  if (cachedServer) return cachedServer;
  
  try {
    const possiblePaths = [
      path.resolve(__dirname, "../dist/server/index.js"),
      path.resolve(__dirname, "./dist/server/index.js"),
      path.resolve(process.cwd(), "dist/server/index.js"),
    ];
    
    let serverModule;
    
    for (const serverPath of possiblePaths) {
      try {
        console.log("Attempting to load server from:", serverPath);
        if (!existsSync(serverPath)) {
          console.log("File does not exist:", serverPath);
          continue;
        }
        serverModule = await import(serverPath + `?t=${Date.now()}`);
        console.log("Successfully loaded from:", serverPath);
        break;
      } catch (e) {
        console.log("Failed to load from:", serverPath, e instanceof Error ? e.message : String(e));
        continue;
      }
    }
    
    if (!serverModule) {
      throw new Error(`Could not load server from any path. Tried: ${possiblePaths.join(", ")}`);
    }
    
    cachedServer = serverModule.default;
    
    if (!cachedServer || typeof cachedServer.fetch !== "function") {
      throw new Error(`Server module does not export fetch method. Got keys: ${JSON.stringify(Object.keys(cachedServer || {}))}`);
    }
    
    console.log("Server loaded and ready");
    return cachedServer;
  } catch (error) {
    console.error("Failed to load server:", error);
    throw error;
  }
}

function isStaticAsset(pathname: string): boolean {
  return /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/.test(pathname) ||
         pathname.includes("assets/");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    const pathname = new URL(req.url || "/", "http://localhost").pathname;
    console.log(`[${new Date().toISOString()}] Request: ${req.method} ${pathname}`);

    if (isStaticAsset(pathname)) {
      console.log("Skipping static asset:", pathname);
      res.status(404).send("Not found");
      return;
    }

    const server = await getServer();

    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string) || "localhost";
    const url = new URL(req.url || "/", `${proto}://${host}`);

    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      } else if (Array.isArray(value)) {
        headers[key] = value.join(",");
      }
    });

    const options: RequestInit = {
      method: req.method || "GET",
      headers,
    };

    if (req.body && !["GET", "HEAD"].includes((req.method || "GET").toUpperCase())) {
      if (Buffer.isBuffer(req.body)) {
        options.body = req.body;
      } else if (typeof req.body === "string") {
        options.body = req.body;
      } else {
        options.body = JSON.stringify(req.body);
      }
    }

    const webRequest = new Request(url.toString(), options);
    console.log("Calling server.fetch for:", url.toString());
    const webResponse = await server.fetch(webRequest);
    console.log(`Server responded with status: ${webResponse.status}`);

    res.status(webResponse.status);
    webResponse.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    const buffer = await webResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("[ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    res.status(500).json({ 
      error: "Internal Server Error",
      details: errorMessage,
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined
    });
  }
}
