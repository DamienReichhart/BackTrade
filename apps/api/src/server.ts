import { ENV } from "./config/env";
import { createApp } from "./app";

const app = createApp();
const server = app.listen(ENV.PORT, ENV.HOST, () => {
  process.stdout.write(`api listening on http://${ENV.HOST}:${ENV.PORT}\n`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
