import { useFetch } from "./useFetch.jsx";

export function useGet(url, options) {
  return useFetch(url, { ...options, method: "GET" });
}
