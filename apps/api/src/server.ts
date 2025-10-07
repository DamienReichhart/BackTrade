import { env } from "@backtrade/config";
import { createApp } from "./app.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`api listening on :${env.PORT}`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
