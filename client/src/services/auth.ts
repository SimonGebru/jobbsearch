// client/src/services/auth.ts
const BASE = import.meta.env.VITE_API_URL || "";

export type AuthUser = { _id: string; username: string; email?: string };
export type LoginResponse = { token: string; user?: AuthUser };

/** --- Helpers --- */
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postJSON<T = unknown>(
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
    const text = await res.text().catch(() => "");
    throw new Error(text || `POST ${path} failed ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function getJSON<T = unknown>(
  path: string,
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    ...(withAuth ? authHeaders() : {}),
  };

  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `GET ${path} failed ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** --- Auth API --- */

/** Logga in med e-post *eller* användarnamn + lösenord. Sparar token i localStorage. */
export async function loginUser(
  identifier: string, // kan vara email eller username
  password: string
): Promise<LoginResponse> {
  const isEmail = identifier.includes("@");
  const payload = isEmail
    ? { email: identifier, password }
    : { username: identifier, password };

  const data = await postJSON<LoginResponse>("/api/auth/login", payload);

  if (!data?.token) throw new Error("Inget token returnerades från servern.");
  localStorage.setItem("token", data.token);
  return data;
}

/** Registrera ny användare */
export async function registerUser(username: string, password: string) {
  return postJSON<AuthUser>("/api/auth/signup", { username, password });
}

/** Skicka återställningsmail */
export async function sendReset(email: string) {
  return postJSON<{ ok: boolean; resetUrl?: string }>(
    "/api/auth/send-reset",
    { email }
  );
}

/** Återställ lösenord */
export async function resetPassword(token: string, password: string) {
  return postJSON<{ message: string }>(
    `/api/auth/reset-password/${token}`,
    { password }
  );
}

/** Hämta inloggad användare */
export async function me() {
  return getJSON<AuthUser>("/api/auth/me", true);
}

/** Token helpers */
export function getToken() {
  return localStorage.getItem("token");
}
export function logout() {
  localStorage.removeItem("token");
}