import { buildApp } from "./app.js";
import { loadEnv } from "./config/env.js";

async function start(): Promise<void> {
  const env = loadEnv();
  const app = await buildApp();

  await app.listen({
    host: "0.0.0.0",
    port: env.port
  });
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
