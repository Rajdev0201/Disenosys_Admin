import { API } from "@/components/utils/Constant";

const ENDPOINTS = {
  list: "getAllCourses",
  getByCategory: "getCourseBycategory",
  create: ["course", "course/createCourse"], // backward-compatible
  get: (id) => `course/${id}`,
  update: (id) => [
    `course/${id}`,
    `course/updateCourse/${id}`, // backward-compatible
  ],
};

const COURSE_FIELDS = [
  "courseName",
  "name",
  "description",
  "category",
  "duration",
  "imagePath",
  "video_url",
  "live",
  "record",
  "noOfLessons",
  "detailsDescription",
  "curriculum",
  "questions",
];

function decodeBase64Maybe(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Quick heuristic: base64 usually has only these chars (plus '=' padding).
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

function decodeWrappedBase64(parsed) {
  const direct = decodeBase64JsonMaybe(parsed?.data);
  if (direct != null) return direct;
  const nested = decodeBase64JsonMaybe(parsed?.data?.data);
  if (nested != null) return nested;
  return null;
}

function parseResponseBody(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return null;

  // First try plain JSON.
  try {
    const parsed = JSON.parse(text);

    // If backend wraps base64 in `{ data: "<b64>" }` (Buffer encode case)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const decoded = decodeWrappedBase64(parsed);
      if (decoded != null) return decoded;
    }

    // If backend returns raw base64 string JSON (e.g. "eyJ...")
    if (typeof parsed === "string") {
      const decoded = decodeBase64JsonMaybe(parsed);
      if (decoded != null) return decoded;
    }

    return parsed;
  } catch {
    // If response isn't valid JSON, it still might be raw base64.
    const decoded = decodeBase64JsonMaybe(text);
    if (decoded != null) return decoded;
    return text;
  }
}

async function fetchJson(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
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

function ensureId(id) {
  const value = String(id || "").trim();
  if (!value) throw new Error("Course id is missing.");
  return value;
}

function toCoursePayload(input) {
  const course = input && typeof input === "object" ? input : {};
  const payload = {};

  for (const key of COURSE_FIELDS) {
    if (course[key] !== undefined) payload[key] = course[key];
  }

  if (!payload.courseName && payload.name) payload.courseName = payload.name;
  if (payload.name && payload.courseName) delete payload.name;

  payload.category = Array.isArray(payload.category)
    ? payload.category.filter(Boolean)
    : payload.category
      ? String(payload.category)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];

  payload.curriculum = Array.isArray(payload.curriculum) ? payload.curriculum : [];
  payload.questions = Array.isArray(payload.questions) ? payload.questions : [];

  return payload;
}

function pickFirstArray(candidate) {
  if (Array.isArray(candidate)) return candidate;
  const keys = ["data", "DataList", "courses", "course", "result", "results"];
  for (const key of keys) {
    const value = candidate?.[key];
    if (Array.isArray(value)) return value;
  }
  if (Array.isArray(candidate?.data?.data)) return candidate.data.data;
  return [];
}

function pickFirstObject(candidate) {
  if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
    if (candidate?._id) return candidate;
    const keys = ["data", "course", "result"];
    for (const key of keys) {
      const value = candidate?.[key];
      if (value && typeof value === "object" && !Array.isArray(value)) return value;
    }
  }
  return null;
}

export const courseApi = {
  toPayload: toCoursePayload,
  async list() {
    const json = await fetchJson(ENDPOINTS.list);
    return pickFirstArray(json);
  },
  async listByCategory(category) {
    const q = String(category || "").trim();
    const path = q
      ? `${ENDPOINTS.getByCategory}?category=${encodeURIComponent(q)}`
      : ENDPOINTS.getByCategory;
    const json = await fetchJson(path);
    return pickFirstArray(json);
  },
  async getById(id) {
    const courseId = ensureId(id);
    const json = await fetchJson(ENDPOINTS.get(courseId));
    return pickFirstObject(json) || json;
  },
  async create(payload) {
    const json = await fetchAnyPath(ENDPOINTS.create, {
      method: "POST",
      body: toCoursePayload(payload),
    });
    return pickFirstObject(json) || json;
  },
  async update(id, payload) {
    const courseId = ensureId(id);
    const body = toCoursePayload(payload);

    const paths = ENDPOINTS.update(courseId);
    const methods = ["PATCH", "PUT"];
    let lastError = null;

    for (const method of methods) {
      try {
        const json = await fetchAnyPath(paths, { method, body });
        return pickFirstObject(json) || json;
      } catch (err) {
        lastError = err;
        if (err?.status !== 404 && err?.status !== 405) break;
      }
    }

    throw lastError || new Error("Failed to update course.");
  },
  async remove(id) {
    const courseId = ensureId(id);
    const paths = [
      `course/${courseId}`,
      `course/deleteCourse/${courseId}`,
      `course/updateCourse/${courseId}`,
    ];

    try {
      return await fetchAnyPath(paths, { method: "DELETE" });
    } catch (err) {
      // Some backends respond 405 for unsupported DELETE.
      if (err?.status === 405) {
        throw new Error("Delete not supported by backend (HTTP 405).");
      }
      throw err;
    }
  },
};
