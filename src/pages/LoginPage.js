import { useState } from "react";
import "./LoginPage.css";

const API = "https://kavitha-backend.onrender.com";

const ADMIN_USER = { username: "prabhu", password: "prabhu123", role: "admin", name: "Admin" };

export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("user");
  const [form, setForm] = useState({ username: "", password: "", name: "", phone: "" });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    if (!form.username || !form.password) { setError("அனைத்து fields-ஐயும் நிரப்பவும்!"); return; }

    setLoading(true);

    if (tab === "admin") {
      if (form.username === ADMIN_USER.username && form.password === ADMIN_USER.password) {
        setTimeout(() => { onLogin(ADMIN_USER); setLoading(false); }, 800);
      } else {
        setTimeout(() => { setError("தவறான Admin credentials!"); setLoading(false); }, 800);
      }
      return;
    }

    // User login/register
    try {
      if (isRegister) {
        if (!form.name || !form.phone) { setError("பெயர் மற்றும் phone நிரப்பவும்!"); setLoading(false); return; }
        const res = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username, password: form.password, name: form.name, phone: form.phone })
        });
        const data = await res.json();
        if (res.ok) {
          onLogin({ ...data.user, role: "user" });
        } else {
          setError(data.message || "Registration failed! மீண்டும் try செய்யுங்கள்.");
        }
      } else {
        const res = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username, password: form.password })
        });
        const data = await res.json();
        if (res.ok) {
          onLogin({ ...data.user, role: "user" });
        } else {
          setError(data.message || "தவறான username அல்லது password!");
        }
      }
    } catch {
      setError("Server connection error! மீண்டும் try செய்யுங்கள்.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-icon">⚕️</div>
          <h1>Sree Kavithaa<br />Medicals</h1>
          <p>உங்கள் நம்பகமான மருந்தகம்</p>
        </div>
        <div className="login-features">
          <div className="feature-item"><span>🚚</span><span>Fast Delivery</span></div>
          <div className="feature-item"><span>💊</span><span>All Medicines</span></div>
          <div className="feature-item"><span>📋</span><span>Prescription</span></div>
          <div className="feature-item"><span>✅</span><span>Trusted Since 2010</span></div>
        </div>
        <div className="login-leaf leaf1">🌿</div>
        <div className="login-leaf leaf2">🌿</div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-tabs">
            <button className={tab === "user" ? "active" : ""} onClick={() => { setTab("user"); setError(""); }}>
              👤 Customer
            </button>
            <button className={tab === "admin" ? "active" : ""} onClick={() => { setTab("admin"); setError(""); setIsRegister(false); }}>
              🔑 Admin
            </button>
          </div>

          <h2>{tab === "admin" ? "Admin Login" : isRegister ? "New Account" : "Welcome Back"}</h2>
          <p className="login-sub">
            {tab === "admin" ? "Sree Kavithaa Medicals Admin Panel" : isRegister ? "Create your account to order medicines" : "Login to order your medicines"}
          </p>

          {isRegister && tab === "user" && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input name="name" placeholder="உங்கள் பெயர்" value={form.name} onChange={handle} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input name="phone" placeholder="9876543210" value={form.phone} onChange={handle} />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Username</label>
            <input name="username" placeholder="username" value={form.username} onChange={handle} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <button className="btn-primary login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "⏳ Please wait..." : tab === "admin" ? "🔑 Admin Login" : isRegister ? "✅ Create Account" : "🚀 Login"}
          </button>

          {tab === "user" && (
            <p className="login-switch">
              {isRegister ? "Already have account? " : "New user? "}
              <span onClick={() => { setIsRegister(!isRegister); setError(""); }}>
                {isRegister ? "Login here" : "Register here"}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}