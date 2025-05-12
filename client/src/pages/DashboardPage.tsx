import { useEffect, useState, type JSX } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getApplications } from "../services/application";
import type { Application } from "../types/application";
import {
  HiPaperAirplane,
  HiPencilAlt,
  HiRefresh,
  HiUser,
  HiCheckCircle,
  HiXCircle,
  HiStar,
} from "react-icons/hi";
import { toast } from "react-hot-toast";
import Spinner from "../components/Spinner";

const getUsernameFromToken = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username || payload.user || null;
  } catch {
    return null;
  }
};

const statuses = ["Skickad", "Pågående", "Intervju", "Avslutat", "Nej tack"];

const statusStyles: Record<
  string,
  { bg: string; text: string; icon: () => JSX.Element }
> = {
  Skickad: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    icon: () => <HiPaperAirplane className="text-blue-400 mr-2" />,
  },
  Pågående: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    icon: () => <HiRefresh className="text-yellow-400 mr-2" />,
  },
  Intervju: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    icon: () => <HiUser className="text-purple-400 mr-2" />,
  },
  Avslutat: {
    bg: "bg-green-50",
    text: "text-green-800",
    icon: () => <HiCheckCircle className="text-green-400 mr-2" />,
  },
  "Nej tack": {
    bg: "bg-red-50",
    text: "text-red-800",
    icon: () => <HiXCircle className="text-red-400 mr-2" />,
  },
};

const DashboardPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = getUsernameFromToken(token);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string"
        ) {
          const message = (error as { message: string }).message;
  
          if (message === "forbidden") {
            localStorage.removeItem("token");
            navigate("/login");
          } else {
            toast.error("Kunde inte hämta ansökningar.");
          }
        } else {
          toast.error("Ett oväntat fel inträffade.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchApplications();
  }, [navigate]);

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
      toast.success("Ansökan borttagen!");
    } catch (err) {
      console.error("Fel vid borttagning:", err);
      toast.error("Misslyckades med att ta bort ansökan");
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5001/api/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favorite: !current }),
      });

      if (!res.ok) throw new Error("Kunde inte uppdatera favoritstatus");

      setApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, favorite: !current } : app
        )
      );
    } catch (err) {
      console.error("Fel vid favorituppdatering:", err);
      toast.error("Misslyckades med att uppdatera favoritstatus");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold">Din ansökningsöversikt</h2>
          {username && (
            <p className="text-sm text-gray-700">Inloggad som: <strong>{username}</strong></p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Sök företag eller roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded shadow text-sm"
          >
            Logga ut
          </button>
        </div>
      </div>

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
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statuses.map((status) => (
            <div
              key={status}
              className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex flex-col"
            >
              <h3 className={`text-lg font-semibold mb-2 text-center ${statusStyles[status].text}`}>
                <div className="flex justify-center items-center">
                  {statusStyles[status].icon()} {status}
                </div>
              </h3>

              <ul className="space-y-2">
                {applications
                  .filter((app) => app.status === status)
                  .filter((app) =>
                    `${app.company} ${app.role}`.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .sort((a, b) => {
                    const now = new Date().getTime();
                    const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
                    const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;

                    if (a.favorite && !b.favorite) return -1;
                    if (!a.favorite && b.favorite) return 1;

                    const aPassed = aDeadline < now;
                    const bPassed = bDeadline < now;
                    if (aPassed && !bPassed) return -1;
                    if (!aPassed && bPassed) return 1;

                    return (
                        new Date(b.createdAt ?? 0).getTime() -
                        new Date(a.createdAt ?? 0).getTime()
                      );
                  })
                  .map((app) => (
                    <li
                      key={app._id}
                      className={`rounded p-2 flex flex-col border transition ${statusStyles[status].bg} ${statusStyles[status].text}`}
                    >
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/edit-application/${app._id}`}
                          className="font-medium hover:underline flex items-center gap-2"
                        >
                          {app.company} – {app.role}
                          {app.notes && (
                            <HiPencilAlt
                              title="Har anteckningar"
                              className="text-sm text-gray-600"
                            />
                          )}
                        </Link>
                        <button
                          onClick={() => handleToggleFavorite(app._id, app.favorite || false)}
                          className="ml-2"
                          title="Favorit"
                        >
                          <HiStar
                            className={`text-lg ${
                              app.favorite ? "text-yellow-400" : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>

                      <span className="text-xs text-gray-500">
  {new Date(app.createdAt ?? "").toLocaleDateString("sv-SE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</span>

                      {app.deadline && (
                        <span
                          className={`text-xs ${
                            new Date(app.deadline) < new Date()
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          Deadline:{" "}
                          {new Date(app.deadline).toLocaleDateString("sv-SE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(app._id)}
                        className="text-sm self-end mt-1 hover:text-red-700"
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