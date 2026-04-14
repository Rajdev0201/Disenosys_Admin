function withTrailingSlash(value) {
  if (!value) return value;
  return value.endsWith("/") ? value : `${value}/`;
}

export const API = withTrailingSlash(
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/",
);
