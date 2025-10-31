// client/src/utils/socket.js
import { io } from "socket.io-client";

let socket;
let subscribed = false;

// --- socket yaratish ---
export function getSocket() {
  if (socket) return socket;

  const origin = process.env.REACT_APP_WS_ORIGIN || "http://localhost:5000";
  const path = process.env.REACT_APP_WS_PATH || "/ws";

  const opts = {
    withCredentials: true,
    auth: { token: localStorage.getItem("token") || "" },
    path, // ✅ muhim
    transports: ["websocket"], // faqat websocket
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
  };

  console.log("[SOCKET] connecting to:", origin, opts);
  socket = io(origin, opts);

  socket.on("connect", () => console.log("[SOCKET] connected:", socket.id));
  socket.on("disconnect", (r) => console.warn("[SOCKET] disconnected:", r));
  socket.on("connect_error", (e) => console.error("[SOCKET] connect_error:", e.message));

  return socket;
}

// --- real-time hodisalar bilan ishlash ---
export function subscribeGesEvents(store) {
  const s = getSocket();
  if (subscribed) return () => {};
  subscribed = true;

  const onNew = (doc) => store.dispatch({ type: "ges/addGes", payload: doc });
  const onUpdate = (doc) => store.dispatch({ type: "ges/updateGes", payload: doc });
  const onRemove = ({ _id, id }) => store.dispatch({ type: "ges/removeGes", payload: { _id, id } });

  s.on("ges:new", onNew);
  s.on("ges:update", onUpdate);
  s.on("ges:remove", onRemove);

  console.log("✅ Subscribed to GES WebSocket events");

  return () => {
    s.off("ges:new", onNew);
    s.off("ges:update", onUpdate);
    s.off("ges:remove", onRemove);
    subscribed = false;
  };
}
