import React, { useState } from "react";
import { loginUser } from "../services/auth";
import styles from "./LoginPage.module.css"; // 👈 importera CSS-modul

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = await loginUser(username, password);
      console.log("Token från backend:", token);
      localStorage.setItem("token", token);
      alert("Inloggning lyckades!");
    } catch (error) {
      console.error("Fel vid inloggning:", error);
      alert("Fel användarnamn eller lösenord");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Logga in</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Användarnamn:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Lösenord:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">Logga in</button>
      </form>
    </div>
  );
};

export default LoginPage;