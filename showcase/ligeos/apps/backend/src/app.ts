import Fastify, { type FastifyInstance } from "fastify";

import { registerHealthRoute } from "./http/routes/health.js";
import { registerPlugins } from "./plugins/index.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true
  });

  await registerPlugins(app);
  await registerHealthRoute(app);

  return app;
}
