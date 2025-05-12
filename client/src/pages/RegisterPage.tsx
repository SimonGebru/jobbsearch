import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const res = await fetch("http://localhost:5001/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
      
        if (!res.ok) throw new Error("Registrering misslyckades");
      
        toast.success("Användare skapad! Logga in nu.");
        navigate("/login");
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message); // Visar specifikt felmeddelande
        } else {
          toast.error("Något gick fel vid registrering");
        }
      }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-lg space-y-4 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center">Skapa konto</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Användarnamn:</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lösenord:</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow"
        >
          Registrera
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;