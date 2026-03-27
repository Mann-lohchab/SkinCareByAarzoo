import { WebSocketServer } from "ws";

const userSockets = new Map();
const adminSockets = new Set();
const channelSockets = new Map();
const socketState = new WeakMap();

const WS_PATH = "/ws";

const noop = () => {};

function createSessionResponseMock() {
  return {
    getHeader: noop,
    setHeader: noop,
    removeHeader: noop,
    writeHead: noop,
    end: noop,
    on: noop,
    once: noop,
  };
}

function addToSetMap(map, key, value) {
  if (!key) {
    return;
  }

  if (!map.has(key)) {
    map.set(key, new Set());
  }

  map.get(key).add(value);
}

function removeFromSetMap(map, key, value) {
  if (!key || !map.has(key)) {
    return;
  }

  const values = map.get(key);
  values.delete(value);

  if (values.size === 0) {
    map.delete(key);
  }
}

function safeSend(socket, payload) {
  if (socket.readyState !== 1) {
    return;
  }

  socket.send(JSON.stringify(payload));
}

function broadcastToSockets(sockets, payload) {
  if (!sockets) {
    return;
  }

  sockets.forEach((socket) => safeSend(socket, payload));
}

function subscribeToChannel(socket, channel) {
  addToSetMap(channelSockets, channel, socket);
  socketState.get(socket)?.subscriptions.add(channel);
}

function unsubscribeFromChannel(socket, channel) {
  removeFromSetMap(channelSockets, channel, socket);
  socketState.get(socket)?.subscriptions.delete(channel);
}

function cleanupSocket(socket) {
  const state = socketState.get(socket);

  if (!state) {
    return;
  }

  removeFromSetMap(userSockets, state.email, socket);

  if (state.role === "admin") {
    adminSockets.delete(socket);
  }

  state.subscriptions.forEach((channel) => {
    removeFromSetMap(channelSockets, channel, socket);
  });

  socketState.delete(socket);
}

export function createRealtimeEvent(type, payload = {}) {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
}

export function emitRealtimeEvent(event, options = {}) {
  const { targetUserEmail, includeAdmins = false, channel } = options;

  if (targetUserEmail) {
    broadcastToSockets(userSockets.get(targetUserEmail), event);
  }

  if (includeAdmins) {
    broadcastToSockets(adminSockets, event);
  }

  if (channel) {
    broadcastToSockets(channelSockets.get(channel), event);
  }
}

export function setupWebSocketServer({ server, sessionMiddleware, getUserByEmail }) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    if (!request.url?.startsWith(WS_PATH)) {
      return;
    }

    sessionMiddleware(request, createSessionResponseMock(), async () => {
      try {
        const sessionEmail = request.session?.passport?.user;

        if (!sessionEmail) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        const user = await getUserByEmail(sessionEmail);

        if (!user) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        wss.handleUpgrade(request, socket, head, (websocket) => {
          wss.emit("connection", websocket, request, user);
        });
      } catch (error) {
        socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        socket.destroy();
      }
    });
  });

  wss.on("connection", (socket, request, user) => {
    const state = {
      email: user.email,
      role: user.role,
      subscriptions: new Set(),
    };

    socketState.set(socket, state);
    addToSetMap(userSockets, user.email, socket);

    if (user.role === "admin") {
      adminSockets.add(socket);
      subscribeToChannel(socket, "admin");
    }

    subscribeToChannel(socket, `user:${user.email}`);

    safeSend(
      socket,
      createRealtimeEvent("connection.ready", {
        user: {
          email: user.email,
          fullname: user.fullname,
          role: user.role,
        },
        path: request.url,
      })
    );

    socket.on("message", (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());

        if (message.type === "ping") {
          safeSend(socket, createRealtimeEvent("pong"));
          return;
        }

        if (message.type === "subscribe") {
          const channels = Array.isArray(message.channels) ? message.channels : [];
          channels.forEach((channel) => subscribeToChannel(socket, channel));
          safeSend(
            socket,
            createRealtimeEvent("subscription.updated", {
              channels: [...state.subscriptions],
            })
          );
          return;
        }

        if (message.type === "unsubscribe") {
          const channels = Array.isArray(message.channels) ? message.channels : [];
          channels.forEach((channel) => unsubscribeFromChannel(socket, channel));
          safeSend(
            socket,
            createRealtimeEvent("subscription.updated", {
              channels: [...state.subscriptions],
            })
          );
        }
      } catch (error) {
        safeSend(
          socket,
          createRealtimeEvent("error", {
            message: "Invalid WebSocket payload",
          })
        );
      }
    });

    socket.on("close", () => cleanupSocket(socket));
    socket.on("error", () => cleanupSocket(socket));
  });

  return wss;
}
