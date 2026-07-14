require("dotenv").config();
const { env } = process;

module.exports = {
  PORT: env.PORT,
  JWT_KEY: env.JWT_KEY,
  JWT_EXPIRES_IN:env.JWT_EXPIRES_IN
};
