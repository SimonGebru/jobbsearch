import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Formulärfältets struktur
interface NewApplicationData {
  company: string;
  role: string;
  location: string;
  status: string;
}

// Komponent
const NewApplicationPage: React.FC = () => {
  // State för varje fält
  const [formData, setFormData] = useState<NewApplicationData>({
    company: "",
    role: "",
    location: "",
    status: "Skickad", // Standardvärde
  });

  const navigate = useNavigate(); // Används för att gå tillbaka till dashboard

  // Hantera ändringar i fälten
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Hantera submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Något gick fel vid skapandet av ansökan");
      }

      alert("Ansökan skapad!");
      navigate("/dashboard"); // Gå till dashboard
    } catch (error) {
      console.error(error);
      alert("Misslyckades med att skapa ansökan");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Ny jobbansökan</h2>
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
        <button style={{ marginTop: "1.5rem" }} type="submit">Skapa ansökan</button>
      </form>
    </div>
  );
};

export default NewApplicationPage;