import { API } from "@/components/utils/Constant";

function decodeBase64Maybe(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^[A-Za-z0-9+/=_-]+$/.test(trimmed)) return null;

  const normalized = trimmed.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  try {
    return atob(padded);
  } catch {
    return null;
  }
}

function decodeBase64JsonMaybe(value) {
  const decoded = decodeBase64Maybe(value);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function parseResponseBody(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "string") {
      const decoded = decodeBase64JsonMaybe(parsed);
      if (decoded != null) return decoded;
    }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const decoded =
        decodeBase64JsonMaybe(parsed?.data) ??
        decodeBase64JsonMaybe(parsed?.data?.data);
      if (decoded != null) return decoded;
    }
    return parsed;
  } catch {
    const decoded = decodeBase64JsonMaybe(text);
    if (decoded != null) return decoded;
    return text;
  }
}

async function fetchJson(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text().catch(() => "");
  const json = parseResponseBody(text);
  if (!res.ok) {
    const message =
      json?.message || json?.error || `Request failed (HTTP ${res.status}).`;
    const err = new Error(message);
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json;
}

async function fetchAnyPath(paths, init) {
  const candidates = Array.isArray(paths) ? paths : [paths];
  let lastError = null;

  for (const path of candidates) {
    try {
      return await fetchJson(path, init);
    } catch (err) {
      lastError = err;
      if (err?.status !== 404) break;
    }
  }

  throw lastError || new Error("Request failed.");
}

function pickFirstArray(candidate) {
  if (Array.isArray(candidate)) return candidate;
  const keys = ["data", "DataList", "result", "results", "list", "items"];
  for (const key of keys) {
    const value = candidate?.[key];
    if (Array.isArray(value)) return value;
  }
  if (Array.isArray(candidate?.data?.data)) return candidate.data.data;
  return [];
}

function pickPagination(candidate) {
  const p = candidate?.pagination || candidate?.meta?.pagination || candidate?.pageInfo;
  const totalPages =
    p?.totalPages ??
    p?.total_pages ??
    candidate?.totalPages ??
    candidate?.total_pages ??
    null;
  return { totalPages: Number(totalPages) || 1 };
}

// API endpoints confirmed by user:
// - University: POST /generate-code, GET /studentCode, PATCH/DELETE /studentCode/:id
// - External: POST /generate-external-code, GET /externalCode, PATCH/DELETE /externalCode/:id
const UNIVERSITY_ENDPOINTS = {
  list: ["studentCode"],
  create: ["generate-code"],
  update: (id) => [`studentCode/${id}`],
  remove: (id) => [`studentCode/${id}`],
};

const EXTERNAL_ENDPOINTS = {
  list: ["externalCode"],
  generate: ["generate-external-code"],
  update: (id) => [`externalCode/${id}`],
  remove: (id) => [`externalCode/${id}`],
};

export const gpdxApi = {
  pickRows: pickFirstArray,
  pickPagination,

  async listUniversities({ page = 1, limit = 10, search = "" } = {}) {
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: String(search || ""),
    });
    return await fetchAnyPath(UNIVERSITY_ENDPOINTS.list.map((p) => `${p}?${q}`));
  },

  async createUniversity(payload) {
    return await fetchAnyPath(UNIVERSITY_ENDPOINTS.create, {
      method: "POST",
      body: payload,
    });
  },

  async updateUniversity(id, payload) {
    const paths = UNIVERSITY_ENDPOINTS.update(id);
    const methods = ["PATCH", "PUT"];
    let lastError = null;

    for (const method of methods) {
      try {
        return await fetchAnyPath(paths, { method, body: payload });
      } catch (err) {
        lastError = err;
        if (err?.status !== 404 && err?.status !== 405) break;
      }
    }

    throw lastError || new Error("Failed to update university.");
  },

  async removeUniversity(id) {
    const paths = UNIVERSITY_ENDPOINTS.remove(id);
    return await fetchAnyPath(paths, { method: "DELETE" });
  },

  async toggleUniversity(id, isActive) {
    const paths = UNIVERSITY_ENDPOINTS.update(id);
    const methods = ["PATCH", "PUT"];
    let lastError = null;

    for (const method of methods) {
      try {
        return await fetchAnyPath(paths, { method, body: { isActive } });
      } catch (err) {
        lastError = err;
        if (err?.status !== 404 && err?.status !== 405) break;
      }
    }

    throw lastError || new Error("Failed to update status.");
  },

  async listExternal({ page = 1, limit = 10, search = "" } = {}) {
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: String(search || ""),
    });
    return await fetchAnyPath(EXTERNAL_ENDPOINTS.list.map((p) => `${p}?${q}`));
  },

  async generateExternalCode(payload) {
    return await fetchAnyPath(EXTERNAL_ENDPOINTS.generate, {
      method: "POST",
      body: payload,
    });
  },

  async removeExternal(id) {
    const paths = EXTERNAL_ENDPOINTS.remove(id);
    return await fetchAnyPath(paths, { method: "DELETE" });
  },

  async toggleExternal(id, isActive) {
    const paths = EXTERNAL_ENDPOINTS.update(id);
    const methods = ["PATCH", "PUT"];
    let lastError = null;

    for (const method of methods) {
      try {
        return await fetchAnyPath(paths, { method, body: { isActive } });
      } catch (err) {
        lastError = err;
        if (err?.status !== 404 && err?.status !== 405) break;
      }
    }

    throw lastError || new Error("Failed to update status.");
  },
};
