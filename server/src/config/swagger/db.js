const winston = require("winston");
const prisma = require("../prisma");

module.exports = function () {
  prisma
    .$connect()
    .then(() => {
      winston.info("🟢 Neon (Postgres) bazasiga ulanish hosil qilindi");
    })
    .catch((err) => {
      winston.error("🔴 Neon (Postgres) connection error: " + err.message);
    });
};
