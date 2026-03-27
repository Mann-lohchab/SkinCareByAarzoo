const DEFAULT_WS_URL = "ws://localhost:3000/ws";

function resolveWebSocketUrl() {
  const configuredUrl = import.meta.env.VITE_WS_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window === "undefined") {
    return DEFAULT_WS_URL;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const isViteDev = window.location.port === "5173";
  const host = isViteDev ? "localhost:3000" : window.location.host;

  return `${protocol}//${host}/ws`;
}

export function connectRealtime({ onMessage, onOpen, onClose } = {}) {
  const socket = new WebSocket(resolveWebSocketUrl());

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "ping" }));
    onOpen?.(socket);
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data, socket);
    } catch (error) {
      console.error("Invalid realtime payload", error);
    }
  });

  socket.addEventListener("close", () => {
    onClose?.();
  });

  return socket;
}
