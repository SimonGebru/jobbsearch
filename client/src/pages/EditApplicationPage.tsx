import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Spinner from "../components/Spinner";

interface Application {
  company: string;
  role: string;
  location: string;
  status: string;
  contactPerson?: string;
  notes?: string;
  deadline?: string;
}

const BASE = import.meta.env.VITE_API_URL || "";

const EditApplicationPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Application>({
    company: "",
    role: "",
    location: "",
    status: "Skickad",
    contactPerson: "",
    notes: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // saknas id => tillbaka
    if (!id) {
      toast.error("Saknar ID för ansökan.");
      navigate("/dashboard");
      return;
    }

    const fetchApplication = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Du är inte inloggad.");
          navigate("/login");
          return;
        }

        const res = await fetch(`${BASE}/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            (data && (data.error || data.message)) || "Kunde inte hämta ansökan"
          );
        }

        setFormData({
          company: data.company || "",
          role: data.role || "",
          location: data.location || "",
          status: data.status || "Skickad",
          contactPerson: data.contactPerson || "",
          notes: data.notes || "",
          deadline: data.deadline || "",
        });
      } catch (error) {
        console.error("Fel vid hämtning:", error);
        toast.error(
          error instanceof Error ? error.message : "Kunde inte ladda ansökan"
        );
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Du är inte inloggad.");
        navigate("/login");
        return;
      }

      const res = await fetch(`${BASE}/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          (data && (data.error || data.message)) ||
            "Kunde inte uppdatera ansökan"
        );
      }

      toast.success("Ansökan uppdaterad!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Fel vid uppdatering:", error);
      toast.error(
        error instanceof Error ? error.message : "Misslyckades med att uppdatera"
      );
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white p-6 sm:p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-6 text-center">Redigera ansökan</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Företag</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Roll</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Plats</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kontaktperson</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Namn på kontaktperson"
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Anteckningar</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Valfria anteckningar om denna ansökan..."
              rows={4}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Skickad">Skickad</option>
              <option value="Pågående">Pågående</option>
              <option value="Intervju">Intervju</option>
              <option value="Avslutat">Avslutat</option>
              <option value="Nej tack">Nej tack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline || ""}
              onChange={handleChange}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded shadow-md transition"
          >
            💾 Spara ändringar
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditApplicationPage;