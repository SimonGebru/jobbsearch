
const BASE = import.meta.env.VITE_API_URL || "";


function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postJSON<T = any>(path: string, body: unknown, withAuth = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(withAuth ? authHeaders() : {})
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`POST ${path} failed ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

export async function getJSON<T = any>(path: string, withAuth = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: withAuth ? authHeaders() : undefined,
  });
  if (!res.ok) throw new Error(`GET ${path} failed ${res.status}`);
  return res.json();
}

export async function putJSON<T = any>(path: string, body: unknown, withAuth = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(withAuth ? authHeaders() : {})
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed ${res.status}`);
  return res.json();
}

export async function delJSON<T = any>(path: string, withAuth = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: withAuth ? authHeaders() : undefined,
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed ${res.status}`);
  return res.json();
}