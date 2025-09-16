// client/src/services/auth.ts
const BASE = import.meta.env.VITE_API_URL || "";

export type AuthUser = { _id: string; username: string; email?: string };
export type LoginResponse = { token: string; user?: AuthUser };

/** --- Helpers --- */
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postJSON<T = any>(
  path: string,
  body: unknown,
  withAuth = false
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(withAuth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `POST ${path} failed ${res.status}`);
  }
  return res.json();
}

async function getJSON<T = any>(path: string, withAuth = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: withAuth ? authHeaders() : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `GET ${path} failed ${res.status}`);
  }
  return res.json();
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

/** Registrera ny användare (username + password).
 *  Byt endpoint/payload om din backend kräver även email.
 */
export async function registerUser(username: string, password: string) {
  return postJSON<AuthUser>("/api/auth/signup", { username, password });
}

/** Skicka återställningsmail (i demo/stub får du resetUrl i svaret). */
export async function sendReset(email: string) {
  return postJSON<{ ok: boolean; resetUrl?: string }>(
    "/api/auth/send-reset",
    { email }
  );
}

/** Sätt nytt lösenord med token från mail/reset-länk. */
export async function resetPassword(token: string, password: string) {
  return postJSON<{ message: string }>(
    `/api/auth/reset-password/${token}`,
    { password }
  );
}

/** Hämta inloggad användare (kräver Authorization-header). */
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