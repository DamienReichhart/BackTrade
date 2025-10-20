export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

/* eslint-disable react-refresh/only-export-components */
// Re-export all API functionality
export * from "./hooks";
export * from "./requests";
