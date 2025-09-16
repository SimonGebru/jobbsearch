import type { Application } from "../types/application";

const BASE = import.meta.env.VITE_API_URL || "";


export const getApplications = async (): Promise<Application[]> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Ingen token hittad. Användaren är inte inloggad.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${BASE}/api/applications`, { headers });

  if (res.status === 403) {
    throw new Error("Åtkomst nekad (forbidden). Logga in igen.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Kunde inte hämta ansökningar");
  }

  return (await res.json()) as Application[];
};