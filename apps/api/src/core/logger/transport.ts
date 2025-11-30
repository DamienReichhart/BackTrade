import pino from "pino";
import path from "node:path";
import { ENV } from "../../config/env";

function getLogFilePath(filename: string): string {
  return path.resolve(ENV.API_LOG_DIR, filename);
}

export const transport = pino.transport({
  targets: [
    // stdout - pretty in development, plain JSON in production
    ENV.NODE_ENV === "production"
      ? {
          target: "pino/file",
          options: { destination: 1 },
          level: ENV.API_LOG_LEVEL,
        }
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            singleLine: false,
          },
          level: ENV.API_LOG_LEVEL,
        },
    {
      target: "pino/file",
      options: {
        destination: getLogFilePath("app.log"),
        mkdir: true,
      },
      level: ENV.API_LOG_LEVEL,
    },
    // error.log - only error level and above
    {
      target: "pino/file",
      options: {
        destination: getLogFilePath("error.log"),
        mkdir: true,
      },
      level: "error",
    },
  ],
});
