import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cachedHandler: ((request: Request) => Promise<Response>) | null = null;

async function getHandler() {
  if (cachedHandler) return cachedHandler;
  
  try {
    const serverPath = path.resolve(__dirname, "../dist/server/index.js");
    console.log("Loading server from:", serverPath);
    
    const module = await import(serverPath);
    cachedHandler = module.default;
    
    if (!cachedHandler || typeof cachedHandler !== "function") {
      throw new Error(`Server module does not export a callable default: ${typeof cachedHandler}`);
    }
    
    console.log("Server loaded successfully");
    return cachedHandler;
  } catch (error) {
    console.error("Failed to load server:", error);
    throw error;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    const handler = await getHandler();

    // Build the complete URL
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string) || "localhost";
    const url = new URL(req.url || "/", `${proto}://${host}`);

    // Prepare headers
    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      } else if (Array.isArray(value)) {
        headers[key] = value.join(",");
      }
    });

    // Build request
    const options: RequestInit = {
      method: req.method || "GET",
      headers,
    };

    // Add body if present
    if (req.body && !["GET", "HEAD"].includes((req.method || "GET").toUpperCase())) {
      if (Buffer.isBuffer(req.body)) {
        options.body = req.body;
      } else if (typeof req.body === "string") {
        options.body = req.body;
      } else {
        options.body = JSON.stringify(req.body);
      }
    }

    // Call the server handler
    const webRequest = new Request(url.toString(), options);
    const webResponse = await handler(webRequest);

    // Send the response
    res.status(webResponse.status);

    // Copy headers
    webResponse.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    // Copy body
    const buffer = await webResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
