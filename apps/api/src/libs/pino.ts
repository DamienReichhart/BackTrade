import pino from "pino";
import { transport } from "../core/logger/transport";
import { serializers } from "../core/logger/serializers";
import { ENV } from "../config/env";

export const logger = pino(
  {
    level: ENV.LOG_LEVEL,
    serializers,
    base: {
      pid: false,
      service: "api-backend"
    }
  },
  transport
);

export function getModuleLogger(moduleName: string) {
    return logger.child({ module: moduleName });
  }
  