import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NewApplicationData {
  company: string;
  role: string;
  location: string;
  status: string;
}

const NewApplicationPage: React.FC = () => {
  const [formData, setFormData] = useState<NewApplicationData>({
    company: "",
    role: "",
    location: "",
    status: "Skickad",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

      if (!res.ok) throw new Error("Något gick fel vid skapandet av ansökan");

      alert("Ansökan skapad!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Misslyckades med att skapa ansökan");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Ny jobbansökan</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block font-semibold mb-1">Företag</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Roll</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Plats</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow transition"
        >
          Skapa ansökan
        </button>
      </form>
    </div>
  );
};

export default NewApplicationPage;