import { useFetch } from "./useFetch.jsx";

export function usePut(url, options) {
  return useFetch(url, { ...options, method: "PUT" });
}
