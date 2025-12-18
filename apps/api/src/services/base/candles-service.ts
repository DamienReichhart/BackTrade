import { logger } from "../../libs/pino";

/**
 * Candles Service
 *
 * Handles business logic for candle operations including CRUD and caching.
 */
class CandlesService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "candle-service",
        });
    }
}

export default new CandlesService();
