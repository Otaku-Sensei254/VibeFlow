import axios from "axios";
import { transformRelativeUrls, restoreRelativeUrls } from "./media";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4001/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data) {
    config.data = restoreRelativeUrls(config.data);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = transformRelativeUrls(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// Drift API
export const driftApi = {
  getFeed: () => api.get("/drifts").then((r) => r.data.data.drifts),
  get: (id) => api.get(`/drifts/${id}`).then((r) => r.data.data.drift),
  create: (data) => api.post("/drifts", { drift: data }).then((r) => r.data.data.drift),
  react: (id, emoji) => api.post(`/drifts/${id}/react`, { emoji }).then((r) => r.data.data.drift),
  removeReaction: (id, emoji) => api.delete(`/drifts/${id}/react`, { data: { emoji } }).then((r) => r.data.data.drift),
  reply: (id, content) => api.post(`/drifts/${id}/reply`, { reply: { content } }).then((r) => r.data.data.drift),
  delete: (id) => api.delete(`/drifts/${id}`).then((r) => r.data.data),
  update: (id, data) => api.put(`/drifts/${id}`, { drift: data }).then((r) => r.data.data.drift),
};

// Admin API
export const adminApi = {
  sendBroadcastEmail: (data) => api.post("/admin/broadcast-email", data).then((r) => r.data.data),
  stats: () => api.get("/admin/stats").then((r) => r.data.data),
};

export default api;
