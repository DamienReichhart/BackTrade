
import { type Health } from "@backtrade/types";

async function getHealth(): Promise<Health> {
  return {
    status: "ok",
    time: new Date().toISOString(),
  };
}

export default {
  getHealth,
};