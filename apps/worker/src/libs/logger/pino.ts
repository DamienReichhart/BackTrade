import pino from "pino";
import { ENV } from "../../config/env";

const loggerConfig: pino.LoggerOptions = {
    level: ENV.WORKER_LOG_LEVEL,
    base: {
        pid: false,
        service: "data-worker",
    },
};

// Use pino-pretty in development
const transport =
    ENV.NODE_ENV === "development"
        ? pino.transport({
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "HH:MM:ss.l",
                  ignore: "pid,hostname",
              },
          })
        : undefined;

export const logger = transport
    ? pino(loggerConfig, transport)
    : pino(loggerConfig);

export function getModuleLogger(moduleName: string) {
    return logger.child({ module: moduleName });
}
