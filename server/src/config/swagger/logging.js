const winston = require("winston");
require("express-async-error");
module.exports = function () {
  winston.add(new winston.transports.Console());
  winston.add(new winston.transports.File({ filename: "error.log" }));
  winston.exceptions.handle(
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log" })
  );
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
