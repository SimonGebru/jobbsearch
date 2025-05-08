import { useEffect, useState } from "react";
import { getApplications } from "../services/application";
import type { Application } from "../types/application";

const DashboardPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (error) {
        console.error("Fel vid hämtning:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Din ansökningsöversikt</h2>
      {loading ? (
        <p>Laddar ansökningar...</p>
      ) : applications.length === 0 ? (
        <p>Inga ansökningar hittades.</p>
      ) : (
        <ul>
          {applications.map((app) => (
            <li key={app._id}>
            <a href={`/edit-application/${app._id}`}>
              <strong>{app.company}</strong> – {app.role} ({app.status})
            </a>
          </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardPage;