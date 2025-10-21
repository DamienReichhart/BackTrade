const path = require("path");
const dotenv = require("dotenv");

const nodeEnv = process.env.NODE_ENV || "development";
const envFile = `.env.${nodeEnv}`;

try {
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
} catch {
  dotenv.config();
}

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET
};

module.exports = { env };
