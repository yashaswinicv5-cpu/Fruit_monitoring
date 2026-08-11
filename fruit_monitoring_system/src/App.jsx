import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { signOutLocal } from "./services/localAuth";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fruitAppUser");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("fruitAppUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("fruitAppUser");
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await signOutLocal();
    } catch (error) {
      console.warn("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
