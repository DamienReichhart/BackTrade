/**
 * ClickHouse Client Initialization
 *
 * ClickHouse client singleton for the @backtrade/data package.
 * Reads ClickHouse configuration from environment variables.
 */

import { createClient, type ClickHouseClient } from "@clickhouse/client";
import { ENV } from "../config/ENV";

/**
 * ClickHouse client singleton instance.
 * Initialized once and reused across all repositories.
 */
const clickhouse: ClickHouseClient = createClient({
    url: `http://${ENV.CLICKHOUSE_HOST}:${ENV.CLICKHOUSE_PORT}`,
    username: ENV.CLICKHOUSE_USER,
    password: ENV.CLICKHOUSE_PASSWORD,
    database: ENV.CLICKHOUSE_DB,
});

export { clickhouse };
