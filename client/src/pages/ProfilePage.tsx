import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE = import.meta.env.VITE_API_URL || "";

const ProfilePage: React.FC = () => {
  const [currentUsername, setCurrentUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setCurrentUsername(storedUsername);
      setNewUsername(storedUsername);
    }

    const fetchEmail = async () => {
      try {
        const res = await fetch(`${BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Kunde inte hämta profil.");
        setEmail(data.email || "");
      } catch {
        toast.error("Något gick fel vid hämtning av profilinfo.");
      }
    };

    fetchEmail();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Du är inte inloggad.");
      return;
    }

    try {
      // 1) Uppdatera email/lösen (skicka bara med om de är ifyllda)
      const profilePayload: Record<string, string> = {};
      if (email) profilePayload.email = email;
      if (password) profilePayload.password = password;

      if (Object.keys(profilePayload).length > 0) {
        const res = await fetch(`${BASE}/api/auth/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profilePayload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Uppdatering av profil misslyckades.");
      }

      // 2) Uppdatera username om det ändrats
      if (newUsername && newUsername !== currentUsername) {
        const res = await fetch(`${BASE}/api/auth/username`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newUsername }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Uppdatering av användarnamn misslyckades.");
        localStorage.setItem("username", data.username || newUsername);
        setCurrentUsername(data.username || newUsername);
      }

      toast.success("Profilen uppdaterad!");
      setPassword(""); // rensa lösenordsfältet
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Kunde inte uppdatera profilen.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center">Profil</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Användarnamn</label>
            <input
              type="text"
              autoComplete="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">E-postadress</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Nytt lösenord</label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Lämna tomt för att behålla"
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
    </div>
  );
};

export default ProfilePage;