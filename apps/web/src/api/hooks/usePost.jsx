import { useFetch } from "./useFetch.jsx";

export function usePost(url, options) {
  return useFetch(url, { ...options, method: "POST" });
}
