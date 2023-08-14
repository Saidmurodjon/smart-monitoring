require("dotenv").config();
const { env } = process;

module.exports = {
  PORT: env.PORT,
  DB: env.MONGODB_URL,
  JWT_KEY: env.JWT_KEY,
  JWT_EXPIRES_IN:env.JWT_EXPIRES_IN
};
