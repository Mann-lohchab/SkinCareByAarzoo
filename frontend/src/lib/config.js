import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

function normalizeApiBaseUrl(value) {
  if (!value) {
    return "/api";
  }

  const trimmedValue = value.replace(/\/+$/, "");

  if (trimmedValue === "/api" || trimmedValue.endsWith("/api")) {
    return trimmedValue;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    const url = new URL(trimmedValue);
    const pathname = url.pathname.replace(/\/+$/, "");

    url.pathname = pathname ? `${pathname}/api` : "/api";
    return url.toString().replace(/\/+$/, "");
  }

  if (trimmedValue.startsWith("/")) {
    return `${trimmedValue}/api`;
  }

  return trimmedValue;
}

export const API_BASE_URL = normalizeApiBaseUrl(configuredBaseUrl);

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
