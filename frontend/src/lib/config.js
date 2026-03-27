import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, "")
  : "/api";

export function apiUrl(path = "") {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
