function withTrailingSlash(value) {
  if (!value) return value;
  return value.endsWith("/") ? value : `${value}/`;
}

export const API = withTrailingSlash(
  "https://disenosys-backendv2-9yuy.onrender.com/" || "http://localhost:8000/",
);
