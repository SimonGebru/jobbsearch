export const loginUser = async (username: string, password: string) => {
    const res = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
  
    if (!res.ok) {
      throw new Error("Inloggning misslyckades");
    }
  
    const data = await res.json();
    return data.token; // Returnerar JWT-token
  };