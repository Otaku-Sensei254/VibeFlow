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

console.warn("[realtime] ⚡ Socket URL resolved to:", SOCKET_URL);

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
    console.warn("[realtime] notifyStatus: no socket → disconnected", label);
    statusChangeCallback("disconnected");
    return;
  }

  const rawState = typeof socket.connectionState === "function"
    ? socket.connectionState()
    : socket.isConnected?.() ? "open" : "closed";

  const state = normalizeConnectionState(rawState);
  console.warn(`[realtime] notifyStatus${label ? " (" + label + ")" : ""}: raw="${rawState}" → "${state}"`);
  statusChangeCallback(state);
}

export function connectSocket(token, onReady) {
  if (socket) {
    console.log("[realtime] connectSocket: socket already exists, ready=", isSocketReady);
    if (isSocketReady && onReady) {
      onReady();
    } else if (onReady) {
      // Queue callback for when socket opens
      const prev = socket._onOpen;
      socket.onOpen(() => {
        if (prev) prev();
        onReady();
      });
    }
    return;
  }

  console.warn("[realtime] connectSocket: creating socket →", SOCKET_URL);
  socket = new Socket(SOCKET_URL, { params: { token }, heartbeatIntervalMs: 15000 });

  socket.onOpen(() => {
    console.warn("[realtime] ✅ socket OPEN");
    isSocketReady = true;
    if (onReady) onReady();
    notifyStatus("open");
  });
  socket.onClose(() => {
    console.warn("[realtime] 🔴 socket CLOSED");
    isSocketReady = false;
    notifyStatus("close");
  });
  socket.onError((err) => {
    console.error("[realtime] ❌ socket ERROR:", err);
    isSocketReady = false;
    notifyStatus("error");
  });

  socket.connect();
  notifyStatus("after connect() call");
}

export function disconnectSocket() {
  console.log("[realtime] disconnectSocket called");
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
    console.warn("[realtime] joinChannel: no socket, cannot join", topic);
    return;
  }

  if (channels[topic]) {
    console.log("[realtime] joinChannel: channel already exists for", topic, "— re-attaching listeners");
    Object.entries(callbacks).forEach(([event, handler]) => {
      channels[topic].on(event, handler);
    });
    // Request a fresh presence snapshot so we don't miss state pushed on initial join
    if (topic === "relay:user" && callbacks.presence_state) {
      console.log("[realtime] requesting fresh presence snapshot via get_presence");
      channels[topic].push("get_presence", {})
        .receive("ok", (state) => {
          console.log("[realtime] get_presence reply:", state);
          callbacks.presence_state(state);
        })
        .receive("error", (err) => console.error("[realtime] get_presence error:", err));
    }
    return;
  }

  console.log("[realtime] joinChannel: joining", topic);
  const channel = socket.channel(topic);
  Object.entries(callbacks).forEach(([event, handler]) => {
    channel.on(event, handler);
  });
  channel.join()
    .receive("ok", () => {
      console.log("[realtime] ✅ joined channel:", topic);
    })
    .receive("error", (resp) => {
      console.error("[realtime] ❌ failed to join channel:", topic, resp);
    });
  channels[topic] = channel;
}

export function leaveChannel(topic) {
  if (!channels[topic]) return;
  console.log("[realtime] leaveChannel:", topic);
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
