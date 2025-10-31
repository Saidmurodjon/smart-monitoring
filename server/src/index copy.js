const express = require("express");
const app = express();
const { PORT } = require("./config/swagger/config");
const winston = require("winston");
const cors = require("cors");
app.use(express.json());
app.use(cors());
require("./config/swagger/logging")(); //! its position is important
require("./api/v1/start/Routes")(app);
require("./config/swagger/db")();
app.listen(PORT, () => {
  winston.info(`¡Server UP! en http://localhost:${PORT}/api`);
});
