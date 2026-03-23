const baseURL = import.meta.env.VITE_API_BASE_URL;

function buildUrl(url, params) {
  const base = String(baseURL || "").replace(/\/$/, "");
  const path = String(url || "");
  const full = /^https?:\/\//i.test(path) ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  if (!params || typeof params !== "object") return full;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${full}${full.includes("?") ? "&" : "?"}${query}` : full;
}

async function request(method, url, data, config = {}) {
  const headers = { ...(config.headers || {}) };
  const token = localStorage.getItem("admin_token");
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  if (!isFormData && data !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(url, config.params), {
    method,
    headers,
    body: data === undefined ? undefined : isFormData ? data : JSON.stringify(data),
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!response.ok) {
    const error = new Error(
      parsed?.message || response.statusText || `Request failed with status ${response.status}`,
    );
    error.response = { status: response.status, data: parsed };
    throw error;
  }

  return { data: parsed, status: response.status };
}

export const apiClient = {
  get(url, config) {
    return request("GET", url, undefined, config);
  },
  post(url, data, config) {
    return request("POST", url, data, config);
  },
  put(url, data, config) {
    return request("PUT", url, data, config);
  },
  patch(url, data, config) {
    return request("PATCH", url, data, config);
  },
  delete(url, config) {
    return request("DELETE", url, undefined, config);
  },
};
