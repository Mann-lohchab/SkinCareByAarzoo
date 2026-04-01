import http from "http";
import { createApp } from "./app.js";
import { loadEnv } from "./env.js";
import { setupWebSocketServer } from "./websocket.js";

loadEnv();

const { app, sessionMiddleware, getUserByEmail } = createApp();
const server = http.createServer(app);

setupWebSocketServer({
  server,
  sessionMiddleware,
  getUserByEmail,
});

const port = Number(process.env.PORT || 3000);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
