import { ENV } from "./config/env";
import { createApp } from "./app";
import { logger } from "./libs/pino";

const app = createApp();
const server = app.listen(ENV.API_PORT, ENV.API_HOST, () => {
    logger.info(`api listening on http://${ENV.API_HOST}:${ENV.API_PORT}`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
