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

const BASE = import.meta.env.VITE_API_URL || "";

const getUsernameFromToken = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username || payload.user || null;
  } catch {
    return null;
  }
};

const statuses = ["Skickad", "Pågående", "Intervju", "Avslutat", "Nej tack"] as const;

const getStats = (apps: Application[]) => ({
  total: apps.length,
  skickade: apps.filter((app) => app.status === "Skickad").length,
  pagaende: apps.filter((app) => app.status === "Pågående").length,
  intervju: apps.filter((app) => app.status === "Intervju").length,
  avslutat: apps.filter((app) => app.status === "Avslutat").length,
  favoriter: apps.filter((app) => app.favorite).length,
});

const isDeadlineSoon = (deadline: string | undefined): boolean => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diff = deadlineDate.getTime() - today.getTime();
  const daysLeft = diff / (1000 * 60 * 60 * 24);
  return daysLeft <= 3 && daysLeft >= 0;
};

const statusStyles: Record<
  (typeof statuses)[number],
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteLoading, setNoteLoading] = useState<Record<string, boolean>>({});
  const [noteTimers, setNoteTimers] = useState<Record<string, ReturnType<typeof setTimeout>>>({});
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = getUsernameFromToken(token);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (error: any) {
        if (error.message === "forbidden") {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error("Kunde inte hämta ansökningar.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return;
      const allNotes: Record<string, string> = {};

      await Promise.all(
        statuses.map(async (status) => {
          try {
            const res = await fetch(`${BASE}/api/notes/${encodeURIComponent(status)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            allNotes[status] = data.text || "";
          } catch {
            allNotes[status] = "";
          }
        })
      );

      setNotes(allNotes);
    };

    fetchNotes();
  }, [token]);

  const handleNoteChange = (status: string, newText: string) => {
    setNotes((prev) => ({ ...prev, [status]: newText }));
  
    // Rensa befintlig timer om den finns
    if (noteTimers[status]) {
      clearTimeout(noteTimers[status]);
    }
  
    // Sätt en ny timer
    const newTimer = setTimeout(async () => {
      setNoteLoading((prev) => ({ ...prev, [status]: true }));
  
      try {
        const res = await fetch(`${BASE}/api/notes/${encodeURIComponent(status)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newText }),
        });
  
        if (!res.ok) throw new Error("Kunde inte spara anteckningen");
  
        toast.success(`💾 Sparat anteckning för ${status}`);
      } catch {
        toast.error("Misslyckades med att spara anteckningen");
      } finally {
        setNoteLoading((prev) => ({ ...prev, [status]: false }));
      }
    }, 4000); // ⏱️ Vänta 4 sekunder
  
    // Spara timern i state
    setNoteTimers((prev) => ({ ...prev, [status]: newTimer }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Är du säker på att du vill ta bort ansökan?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Du är inte inloggad.");
        navigate("/login");
        return;
      }

      const res = await fetch(`${BASE}/api/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Kunde inte ta bort ansökan");
      }

      setApplications((prev) => prev.filter((app) => app._id !== id));
      toast.success("Ansökan borttagen!");
    } catch (err) {
      toast.error("Misslyckades med att ta bort ansökan");
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Du är inte inloggad.");
        navigate("/login");
        return;
      }

      const res = await fetch(`${BASE}/api/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favorite: !current }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Kunde inte uppdatera favoritstatus");
      }

      setApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, favorite: !current } : app
        )
      );
    } catch (err) {
      toast.error("Misslyckades med att uppdatera favoritstatus");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold">Din ansökningsöversikt</h2>
          {username && (
            <p className="text-sm text-gray-700">
              Inloggad som:{" "}
              <Link to="/profile" className="font-semibold text-blue-600 hover:underline">
                {username}
              </Link>
            </p>
          )}
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Sök företag eller roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow text-sm"
          >
            Logga ut
          </button>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={() => setShowFavoritesOnly((prev) => !prev)}
              className="accent-yellow-500"
            />
            Visa endast favoriter
          </label>
        </div>
      </div>

      {/* Lägg till-knapp */}
      <div className="flex justify-center mb-6">
        <Link
          to="/new-application"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition w-full sm:w-auto text-center"
        >
          ➕ Lägg till ny ansökan
        </Link>
      </div>

      {/* Statistikpanel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 text-sm mb-6">
        <div className="bg-white rounded shadow p-2 sm:p-4 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Totalt antal ansökningar</p>
          <p className="text-base sm:text-xl font-bold">{getStats(applications).total}</p>
        </div>
        <div className="bg-white rounded shadow p-2 sm:p-4 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Skickade</p>
          <p className="text-base sm:text-xl font-bold">{getStats(applications).skickade}</p>
        </div>
        <div className="bg-white rounded shadow p-2 sm:p-4 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Pågående</p>
          <p className="text-base sm:text-xl font-bold">{getStats(applications).pagaende}</p>
        </div>
        <div className="bg-white rounded shadow p-2 sm:p-4 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Till intervju</p>
          <p className="text-base sm:text-xl font-bold">{getStats(applications).intervju}</p>
        </div>
        <div className="bg-white rounded shadow p-2 sm:p-4 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Avslutade</p>
          <p className="text-base sm:text-xl font-bold">{getStats(applications).avslutat}</p>
        </div>
        <div className="bg-white rounded shadow p-2 sm:p-4 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Favoritmarkerade</p>
          <p className="text-base sm:text-xl font-bold">{getStats(applications).favoriter}</p>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statuses.map((status) => (
            <div
              key={status}
              className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex flex-col"
            >
              <h3 className={`text-lg font-semibold mb-2 text-center ${statusStyles[status].text}`}>
                <div className="flex justify-center items-center">
                  {statusStyles[status].icon()} {status}
                </div>
              </h3>

              <ul className="space-y-2 flex-grow">
                {applications
                  .filter((app) => app.status === status)
                  .filter((app) =>
                    `${app.company} ${app.role}`.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter((app) => (showFavoritesOnly ? app.favorite : true))
                  .sort((a, b) => {
                    const now = Date.now();
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
                            <HiPencilAlt title="Har anteckningar" className="text-sm text-gray-600" />
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
                              : isDeadlineSoon(app.deadline)
                              ? "text-yellow-600"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(app.deadline) < new Date()
                            ? "⛔ Deadline passerad: "
                            : isDeadlineSoon(app.deadline)
                            ? "⏰ Deadline snart: "
                            : "Deadline: "}
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

              {/* 📝 Anteckningsfält */}
              <div className="mt-4">
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded-md text-sm shadow focus:ring focus:outline-none"
                  placeholder={`Anteckningar för ${status}...`}
                  value={notes[status] || ""}
                  onChange={(e) => handleNoteChange(status, e.target.value)}
                  disabled={noteLoading[status]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
