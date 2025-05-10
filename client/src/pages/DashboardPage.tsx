import { useEffect, useState } from "react";
import { getApplications } from "../services/application";
import type { Application } from "../types/application";
import { Link } from "react-router-dom";
import { HiPaperAirplane, HiRefresh, HiUser, HiCheckCircle, HiXCircle } from "react-icons/hi";

const statuses = ["Skickad", "Pågående", "Intervju", "Avslutat", "Nej tack"];

// Färg och ikon för varje status
const statusStyles: Record<
  string,
  { bg: string; text: string; icon: JSX.Element }
> = {
  Skickad: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    icon: <HiPaperAirplane className="text-blue-400 mr-2" />,
  },
  Pågående: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    icon: <HiRefresh className="text-yellow-400 mr-2" />,
  },
  Intervju: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    icon: <HiUser className="text-purple-400 mr-2" />,
  },
  Avslutat: {
    bg: "bg-green-50",
    text: "text-green-800",
    icon: <HiCheckCircle className="text-green-400 mr-2" />,
  },
  "Nej tack": {
    bg: "bg-red-50",
    text: "text-red-800",
    icon: <HiXCircle className="text-red-400 mr-2" />,
  },
};

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

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Är du säker på att du vill ta bort ansökan?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5001/api/applications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Kunde inte ta bort ansökan");

      setApplications((prev) => prev.filter((app) => app._id !== id));
      alert("Ansökan borttagen!");
    } catch (err) {
      console.error("Fel vid borttagning:", err);
      alert("Misslyckades med att ta bort ansökan");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4 text-center">Din ansökningsöversikt</h2>

      {/* Lägg till-knapp */}
      <div className="flex justify-center mb-6">
        <Link
          to="/new-application"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition"
        >
          ➕ Lägg till ny ansökan
        </Link>
      </div>

      {loading ? (
        <p className="text-center">Laddar ansökningar...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statuses.map((status) => (
            <div
              key={status}
              className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col"
            >
              <h3 className={`text-lg font-semibold mb-2 text-center ${statusStyles[status].text}`}>
                {statusStyles[status].icon}
                {status}
              </h3>
              <ul className="space-y-2">
                {applications
                  .filter((app) => app.status === status)
                  .map((app) => (
                    <li
                      key={app._id}
                      className={`rounded p-2 flex justify-between items-center transition border ${statusStyles[status].bg} ${statusStyles[status].text}`}
                    >
                      <Link
                        to={`/edit-application/${app._id}`}
                        className="font-medium hover:underline flex-1"
                      >
                        {app.company} – {app.role}
                      </Link>
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="text-sm ml-2 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;