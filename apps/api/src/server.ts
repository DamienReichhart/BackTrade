const { env } = require("./config");
const { createApp: createAppFunction } = require("./app");

const app = createAppFunction();
const server = app.listen(env.PORT, env.HOST, () => {
  process.stdout.write(`api listening on ${env.HOST}:${env.PORT}\n`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
