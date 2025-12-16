import pino from "pino";
import { transport } from "./transport";
import { serializers } from "./serializers";
import { ENV } from "../../config/env";

export const logger = pino({
    level: ENV.API_LOG_LEVEL,
    serializers,
    base: {
        pid: false,
        service: "api-backend",
    },
    ...transport,
});
