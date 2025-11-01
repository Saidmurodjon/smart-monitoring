import { useEffect } from "react";
import { useStore } from "react-redux";
import { subscribeGesEvents } from "../utils/socket"; // 

export default function AppSockets() {
  const store = useStore();

  useEffect(() => {
    const off = subscribeGesEvents(store);
    return () => off && off();
  }, [store]);

  return null;
}
