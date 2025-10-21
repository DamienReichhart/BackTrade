import { useFetch } from "./useFetch.jsx";

export function useDelete(url, options) {
  return useFetch(url, { ...options, method: "DELETE" });
}
