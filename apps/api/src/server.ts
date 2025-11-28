import { ENV } from "./config/env";
import { createApp } from "./app";
import { logger } from "./libs/pino";

const app = createApp();
const server = app.listen(ENV.PORT, ENV.HOST, () => {
  logger.info(`api listening on http://${ENV.HOST}:${ENV.PORT}`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
