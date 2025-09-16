import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { toast } from "react-hot-toast";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // loginUser sköter både anropet och lagring av token
      await loginUser(username, password);

      // Vill du ändå spara username separat:
      localStorage.setItem("username", username);

      toast.success("Inloggning lyckades!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Fel vid inloggning:", error);
      toast.error(error.message || "Fel användarnamn eller lösenord");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Logga in</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="username" className="block mb-1 font-medium">
              Användarnamn:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Lösenord:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Logga in
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
          <p>
            Har du inget konto?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Skapa konto
            </a>
          </p>
          <p>
            Glömt lösenordet?{" "}
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Återställ här
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
