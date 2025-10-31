// src/utils/socket.js
import { io } from "socket.io-client";

let socket;
let subscribed = false;

export function getSocket() {
  if (socket) return socket;
  const origin = process.env.REACT_APP_WS_ORIGIN || "http://localhost:5000";
  socket = io(origin, {
    withCredentials: true,
    auth: { token: localStorage.getItem("token") || "" },
    // transports: ["websocket"], // ixtiyoriy
  });
  return socket;
}

export function subscribeGesEvents(store) {
  const s = getSocket();
  if (subscribed) return () => {};
  subscribed = true;

  const onNew    = (doc) => store.dispatch({ type: "ges/addGes",    payload: doc });
  const onUpdate = (doc) => store.dispatch({ type: "ges/updateGes", payload: doc });
  const onRemove = ({ _id, id }) =>
    store.dispatch({ type: "ges/removeGes", payload: { _id, id } });

  s.on("ges:new", onNew);
  s.on("ges:update", onUpdate);     // <-- STATUS o‘zgarsa shu kerak!
  s.on("ges:remove", onRemove);

  // Agar backend bitta “event” jo‘natayotgan bo‘lsa:
  const onEvent = (evt) => {
    if (!evt?.doc) return;
    if (evt.type === "deleted" || evt.type === "removed") onRemove(evt.doc);
    else if (evt.type === "updated") onUpdate(evt.doc);
    else onNew(evt.doc);
  };
  s.on("ges:event", onEvent);

  return () => {
    s.off("ges:new", onNew);
    s.off("ges:update", onUpdate);
    s.off("ges:remove", onRemove);
    s.off("ges:event", onEvent);
    subscribed = false;
  };
}
