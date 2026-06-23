import type { FastifyInstance } from "fastify";

import { getHealthStatus } from "../../services/health-service.js";

export async function registerHealthRoute(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => getHealthStatus());
}
