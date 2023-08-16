const express = require("express");
const errorMiddleware = require("../middlewares/error");
const appRouter = require("../routes/index");
module.exports = function (app) {
  app.use("/api", appRouter);
  app.use("/uploads", express.static((__dirname, "uploads")));
  app.use("/public", express.static((__dirname, "public")));

  app.use(errorMiddleware);
};
