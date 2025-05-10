import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Samma interface som för ny ansökan
interface Application {
  company: string;
  role: string;
  location: string;
  status: string;
}

const EditApplicationPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Application>({
    company: "",
    role: "",
    location: "",
    status: "Skickad",
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
        setFormData(data);
      } catch (error) {
        console.error("Fel vid hämtning:", error);
        alert("Kunde inte ladda ansökan");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      alert("Ansökan uppdaterad!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Fel vid uppdatering:", error);
      alert("Misslyckades med att uppdatera");
    }
  };

  if (loading) return <p className="text-center mt-10">Laddar ansökan...</p>;

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