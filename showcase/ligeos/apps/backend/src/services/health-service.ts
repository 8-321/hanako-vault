export type HealthResponse = {
  status: "ok";
  service: string;
  uptime: number;
};

export function getHealthStatus(): HealthResponse {
  return {
    status: "ok",
    service: "ligeos-backend",
    uptime: process.uptime()
  };
}
