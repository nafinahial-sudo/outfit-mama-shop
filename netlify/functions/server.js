import worker from "../../dist/server/index.js";

export default async (request, context) => {
  return worker.fetch(request, process.env, context);
};


