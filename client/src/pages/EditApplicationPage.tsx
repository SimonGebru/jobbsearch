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
  const { id } = useParams(); // plockar ut :id från URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Application>({
    company: "",
    role: "",
    location: "",
    status: "Skickad",
  });

  const [loading, setLoading] = useState(true);

  // Hämta ansökan när sidan laddas
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

  if (loading) return <p>Laddar ansökan...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Redigera ansökan</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Företag:</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Roll:</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Plats:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Skickad">Skickad</option>
            <option value="Pågående">Pågående</option>
            <option value="Intervju">Intervju</option>
            <option value="Avslutat">Avslutat</option>
            <option value="Nej tack">Nej tack</option>
          </select>
        </div>
        <button style={{ marginTop: "1.5rem" }} type="submit">Spara ändringar</button>
      </form>
    </div>
  );
};

export default EditApplicationPage;