/**
 * Utilities Module
 *
 * Central export point for utility functions.
 */

export {
    getDeviceInfo,
    getClientIp,
    formatLoginDate,
    formatDate,
    type DeviceInfo,
} from "./request-context";

export { buildOrderBy, buildPagination } from "./query-builders";
export { toNumber, toNumberOrNull } from "./decimal";
export {
    filterByAccess,
    filterByAccessSync,
    type AccessFilterResult,
} from "./access-filter";

// Re-export PII masking utilities
export { maskEmail, maskEmailForLogging } from "@backtrade/utils";
