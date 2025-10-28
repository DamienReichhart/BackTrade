export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

// Re-export all API functionality
export * from "./hooks";
export * from "./requests";
