"use client";

const ADMIN_TOKEN_KEY = "ds_admin_token";

function readStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredAdminToken() {
  const storage = readStorage();
  return storage?.getItem(ADMIN_TOKEN_KEY) || "";
}

export function storeAdminToken(token) {
  const storage = readStorage();
  const value = String(token || "").trim();
  if (!storage) return "";
  if (!value) {
    storage.removeItem(ADMIN_TOKEN_KEY);
    return "";
  }
  storage.setItem(ADMIN_TOKEN_KEY, value);
  return value;
}

export function clearAdminToken() {
  const storage = readStorage();
  storage?.removeItem(ADMIN_TOKEN_KEY);
}

export function extractAdminToken(payload) {
  const candidates = [
    payload?.token,
    payload?.accessToken,
    payload?.jwt,
    payload?.data?.token,
    payload?.data?.accessToken,
    payload?.data?.jwt,
    payload?.admin?.token,
    payload?.admin?.accessToken,
    payload?.admin?.jwt,
    payload?.admin?.admin?.token,
    payload?.admin?.admin?.accessToken,
    payload?.admin?.admin?.jwt,
  ];

  const match = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return match ? match.trim() : "";
}

export function getAdminAuthHeaders(headers = {}) {
  const nextHeaders = { ...headers };
  const token = getStoredAdminToken();
  if (token && !nextHeaders.Authorization) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }
  return nextHeaders;
}
