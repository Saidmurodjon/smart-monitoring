const express = require("express");
const http = require("http");
const cors = require("cors");
const winston = require("winston");
const { PORT } = require("./config/swagger/config");
const ws = require("./ws");                       // <— yangi modul

const app = express();
const server = http.createServer(app);           // <— HTTP server

app.use(cors({ origin: "http://localhost:3000", credentials: true, allowedHeaders: ["Content-Type", "Authorization", "auth"], // MUHIM
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],}));
app.use(express.json());

// Routes va DB
require("./api/v1/start/Routes")(app);
require("./config/swagger/db")();

// Socket.IO ni shu yerda init qilamiz
const io = ws.init(server);

io.on("connection", (socket) => {
  winston.info(`🟢 WS connected: ${socket.id}`);
});

server.listen(PORT || 5000, () => {
  winston.info(`HTTP+WS on http://localhost:${PORT || 5000}`);
});

module.exports = { io }; // ixtiyoriy, lekin endi controllerlar getIO() ishlatadi
