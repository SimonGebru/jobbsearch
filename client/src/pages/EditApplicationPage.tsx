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
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5001/api/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) throw new Error("Kunde inte hämta ansökan");
  
        const data = await res.json();
  
        // ✅ Sätt deadline till "" om den saknas eller är null
        setFormData({
          ...data,
          deadline: data.deadline || "",
        });
      } catch (error) {
        console.error("Fel vid hämtning:", error);
        toast.error("Kunde inte ladda ansökan");
      } finally {
        setLoading(false);
      }
    };
  
    fetchApplication();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5001/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Kunde inte uppdatera ansökan");

      toast.success("Ansökan uppdaterad!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Fel vid uppdatering:", error);
      toast.error("Misslyckades med att uppdatera");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Redigera ansökan</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Företag:</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Roll:</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Plats:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Kontaktperson:</label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Namn på kontaktperson"
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Anteckningar:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Valfria anteckningar om denna ansökan..."
            rows={4}
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Skickad">Skickad</option>
            <option value="Pågående">Pågående</option>
            <option value="Intervju">Intervju</option>
            <option value="Avslutat">Avslutat</option>
            <option value="Nej tack">Nej tack</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Deadline:</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition"
        >
          💾 Spara ändringar
        </button>
      </form>
    </div>
  );
};

export default EditApplicationPage;