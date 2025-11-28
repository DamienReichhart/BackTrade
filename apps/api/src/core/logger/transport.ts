import pino from "pino";
import { ENV } from "../../config/env";

export const transport =
  ENV.NODE_ENV === "production"
    ? pino.transport({
        targets: [
          {
            target: "pino/file",
            options: { destination: 1 }, // stdout
            level: ENV.LOG_LEVEL
          }
        ]
      })
    : pino.transport({
        targets: [
          {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              singleLine: false
            },
            level: ENV.LOG_LEVEL
          }
        ]
      });
