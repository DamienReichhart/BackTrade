import { useGet } from "../hooks/index.jsx";

export function useHealth() {
  return useGet("/health");
}
