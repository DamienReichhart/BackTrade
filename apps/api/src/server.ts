import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();
const server = app.listen(env.PORT, env.HOST, () => {
  process.stdout.write(`api listening on http://${env.HOST}:${env.PORT}\n`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
