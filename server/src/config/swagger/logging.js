const winston = require("winston");
require("express-async-error");
require('winston-mongodb')
module.exports = function () {
  winston.add(new winston.transports.Console());
  winston.add(new winston.transports.File({ filename: "error.log" }));
  winston.add(
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URL,
      level: "info",
    })
  );
  winston.exceptions.handle(
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log" })
  );
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
