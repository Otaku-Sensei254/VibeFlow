import { Socket } from "phoenix";

// Determine the correct WebSocket URL based on the environment
const getSocketUrl = () => {
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  if (process.env.NODE_ENV === "development") {
    return `${protocol}//${window.location.hostname}:4001/socket`;
  }
  // Default production: assume same-origin (change via REACT_APP_WS_URL)
  return `${protocol}//${window.location.host}/socket`;
};

const SOCKET_URL = getSocketUrl();

let socket = null;
const channels = {};
let statusChangeCallback = null;
let isSocketReady = false;

const PHOENIX_STATE_MAP = {
  open: "connected",
  opening: "connecting",
  connecting: "connecting",
  closing: "disconnecting",
  closed: "disconnected",
  error: "disconnected",
};

export function setStatusChangeCallback(cb) {
  statusChangeCallback = cb;
}

function normalizeConnectionState(state) {
  if (!state) return "disconnected";
  return PHOENIX_STATE_MAP[state] || state;
}

function notifyStatus(label = "") {
  if (!statusChangeCallback) return;

  if (!socket) {
    statusChangeCallback("disconnected");
    return;
  }

  const rawState = typeof socket.connectionState === "function"
    ? socket.connectionState()
    : socket.isConnected?.() ? "open" : "closed";

  const state = normalizeConnectionState(rawState);
  statusChangeCallback(state);
}

export function connectSocket(token, onReady) {
  if (socket) {
    if (isSocketReady && onReady) {
      onReady();
    } else if (onReady) {
      const prev = socket._onOpen;
      socket.onOpen(() => {
        if (prev) prev();
        onReady();
      });
    }
    return;
  }

  socket = new Socket(SOCKET_URL, { params: { token }, heartbeatIntervalMs: 15000 });

  socket.onOpen(() => {
    isSocketReady = true;
    if (onReady) onReady();
    notifyStatus("open");
  });
  socket.onClose(() => {
    isSocketReady = false;
    notifyStatus("close");
  });
  socket.onError((err) => {
    isSocketReady = false;
    notifyStatus("error");
  });

  socket.connect();
  notifyStatus("after connect() call");
}

export function disconnectSocket() {
  Object.keys(channels).forEach((t) => {
    try { channels[t].leave(); } catch {}
    delete channels[t];
  });
  isSocketReady = false;
  if (socket) {
    try { socket.disconnect(); } catch {}
    socket = null;
  }
  notifyStatus("after disconnect");
}

export function joinChannel(topic, callbacks = {}) {
  if (!socket) {
    return;
  }

  if (channels[topic]) {
    Object.entries(callbacks).forEach(([event, handler]) => {
      channels[topic].on(event, handler);
    });
    if (topic === "relay:user" && callbacks.presence_state) {
      channels[topic].push("get_presence", {})
        .receive("ok", (state) => {
          callbacks.presence_state(state);
        })
        .receive("error", (err) => console.error("[realtime] get_presence error:", err));
    }
    return;
  }

  const channel = socket.channel(topic);
  Object.entries(callbacks).forEach(([event, handler]) => {
    channel.on(event, handler);
  });
  channel.join()
    .receive("ok", () => {})
    .receive("error", (resp) => {});
  channels[topic] = channel;
}

export function leaveChannel(topic) {
  if (!channels[topic]) return;
  try { channels[topic].leave(); } catch {}
  delete channels[topic];
}

export function onChannel(topic, event, handler) {
  if (channels[topic]) {
    channels[topic].on(event, handler);
  }
}

export function offChannel(topic, event) {
  if (channels[topic]) {
    channels[topic].off(event);
  }
}

export function getSocket() {
  return socket;
}
