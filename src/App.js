import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("skm_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("skm_user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("skm_user");
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.role === "admin") return <AdminDashboard onLogout={handleLogout} user={user} />;
  return <UserDashboard onLogout={handleLogout} user={user} />;
}

export default App;