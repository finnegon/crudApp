const BASE = "/api/v1";

/**
 * Thin wrapper around fetch that always resolves with a result object instead
 * of throwing, so the UI can log every request (url, status, timing, body).
 */
export async function apiRequest({ method = "GET", path, body }) {
  const url = `${BASE}${path}`;
  const startedAt = performance.now();

  let status = 0;
  let ok = false;
  let data = null;

  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    status = res.status;
    ok = res.ok;

    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  } catch {
    data = {
      message:
        "Network error — is the backend running (npm run dev in the project root)?",
    };
  }

  return {
    method,
    url,
    status,
    ok,
    data,
    ms: Math.round(performance.now() - startedAt),
  };
}
