// server/src/ws.js
const { Server } = require("socket.io");

let io;

function init(server) {
  io = new Server(server, {
    path: "/ws",
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST","PUT"],
      credentials: true,
    },
    transports: ["websocket"], // ✅ Faqat websocket ishlat
  });
  console.log("✅ Socket.IO initialized on /ws");
  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { init, getIO };
