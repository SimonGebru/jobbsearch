import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ProfilePage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);

    const fetchEmail = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setEmail(data.email || "");
        } else {
          throw new Error(data.error || "Kunde inte hämta e-post.");
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(`Fel: ${err.message}`);
        } else {
          toast.error("Något gick fel vid hämtning av profilinfo.");
        }
      }
    };

    fetchEmail();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5001/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profilen uppdaterad!");
        navigate("/dashboard");
      } else {
        throw new Error(data.error || "Uppdatering misslyckades.");
      }
    } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(`Fel: ${err.message}`);
        } else {
          toast.error("Kunde inte uppdatera profilen.");
        }
      }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Profil</h2>

      <div className="mb-4">
        <p className="text-gray-700">
          <strong>Användarnamn:</strong> {username}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1 font-semibold">E-postadress</label>
          <input
            type="email"
            placeholder="din@email.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Nytt lösenord</label>
          <input
            type="password"
            placeholder="Lämna tomt för att inte ändra"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
        >
          Spara ändringar
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;