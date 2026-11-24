import { createApp } from "./app.ts";
import { config } from "./config.ts";

const app = createApp();

const server = app.listen(config.port, () => {
  const mode = config.serveStatic ? "site + API" : "API";
  console.log(`Dhuraj Interiors ${mode} listening on http://localhost:${config.port}`);
  console.log(`Admin dashboard: http://localhost:${config.port}/admin`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
