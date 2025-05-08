import type { Application } from "../types/application";

export const getApplications = async (): Promise<Application[]> => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5001/api/applications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Kunde inte hämta ansökningar");
  }

  return await res.json();
};