import { env } from "../config/index.jsx";

export const API_BASE_URL = env.API_URL;

// Re-export all API functionality
export * from "./hooks/index.jsx";
export * from "./requests/index.jsx";
