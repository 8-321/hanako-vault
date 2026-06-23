const DEFAULT_PORT = 3000;

export type BackendEnv = {
  nodeEnv: string;
  port: number;
};

export function loadEnv(): BackendEnv {
  const portFromEnv = Number.parseInt(process.env.PORT ?? "", 10);

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number.isFinite(portFromEnv) ? portFromEnv : DEFAULT_PORT
  };
}
