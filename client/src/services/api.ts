// client/src/services/api.ts
const BASE = import.meta.env.VITE_API_URL || "";

// Returnera alltid ett Record<string, string>
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postJSON<T = unknown>(
  path: string,
  body: unknown,
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(withAuth ? authHeaders() : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`POST ${path} failed ${res.status}: ${txt || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getJSON<T = unknown>(
  path: string,
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    ...(withAuth ? authHeaders() : {}),
  };

  const res = await fetch(`${BASE}${path}`, { headers });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed ${res.status}: ${txt || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function putJSON<T = unknown>(
  path: string,
  body: unknown,
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(withAuth ? authHeaders() : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`PUT ${path} failed ${res.status}: ${txt || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function delJSON<T = unknown>(
  path: string,
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    ...(withAuth ? authHeaders() : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`DELETE ${path} failed ${res.status}: ${txt || res.statusText}`);
  }
  return res.json() as Promise<T>;
}