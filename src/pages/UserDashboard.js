import { useState, useEffect } from "react";
import "./UserDashboard.css";

const API = "https://kavitha-backend.onrender.com";
const WHATSAPP = "9842885151"; // Change to shop's number

export default function UserDashboard({ onLogout, user }) {
  const [tab, setTab] = useState("order");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [form, setForm] = useState({
    customerName: user.name || "",
    medicineName: "",
    quantity: 1,
    phoneNumber: user.phone || "",
    address: "",
    notes: ""
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders`);
      const data = await res.json();
      // Show only this user's orders
      const mine = data.filter(o => o.phoneNumber === form.phoneNumber || o.customerName === user.name);
      setOrders(mine);
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { if (tab === "history") fetchOrders(); }, [tab]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.customerName || !form.medicineName || !form.phoneNumber || !form.address) {
      showToast("அனைத்து fields-ஐயும் நிரப்பவும்!", "error"); return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (prescriptionFile) formData.append("prescription", prescriptionFile);

      const res = await fetch(`${API}/api/orders/submit`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        showToast("✅ Order வெற்றிகரமாக submit ஆனது!");
        setForm({ ...form, medicineName: "", quantity: 1, notes: "" });
        setPrescriptionFile(null);
      } else {
        showToast(data.error || "Order submit ஆகவில்லை!", "error");
      }
    } catch {
      showToast("Server connection error!", "error");
    }
    setSubmitting(false);
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`வணக்கம்! நான் ${user.name}. Medicine order பற்றி கேட்கிறேன்.`);
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  };

  const statusColor = (s) => {
    if (s === "Pending") return "badge-pending";
    if (s === "Approved") return "badge-approved";
    if (s === "Delivered") return "badge-delivered";
    return "badge-cancelled";
  };

  return (
    <div className="user-dash">
      {/* HEADER */}
      <header className="user-header">
        <div className="header-left">
          <div className="header-logo">⚕️</div>
          <div>
            <h1>Sree Kavithaa Medicals</h1>
            <p>வணக்கம், {user.name || user.username}! 👋</p>
          </div>
        </div>
        <div className="header-right">
          <button className="whatsapp-btn" onClick={openWhatsApp}>
            <span>💬</span> WhatsApp
          </button>
          <button className="btn-outline logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* TABS */}
      <div className="user-tabs-wrap">
        <div className="user-tabs">
          <button className={tab === "order" ? "active" : ""} onClick={() => setTab("order")}>
            💊 New Order
          </button>
          <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
            📋 Order History
          </button>
        </div>
      </div>

      <div className="user-content">

        {/* ORDER FORM */}
        {tab === "order" && (
          <div className="order-section">
            <div className="order-hero">
              <h2>Medicine Order</h2>
              <p>உங்கள் மருந்துகளை order செய்யுங்கள் — நாங்கள் deliver செய்வோம்</p>
            </div>
            <div className="order-form-grid">
              <div className="card order-form-card">
                <h3>📝 Order Details</h3>
                <div className="form-row">
                  <div className="input-group">
                    <label>Full Name *</label>
                    <input name="customerName" value={form.customerName} onChange={handle} placeholder="உங்கள் பெயர்" />
                  </div>
                  <div className="input-group">
                    <label>Phone Number *</label>
                    <input name="phoneNumber" value={form.phoneNumber} onChange={handle} placeholder="9842885151" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Medicine Name *</label>
                    <input name="medicineName" value={form.medicineName} onChange={handle} placeholder="மருந்தின் பெயர்" />
                  </div>
                  <div className="input-group">
                    <label>Quantity *</label>
                    <input name="quantity" type="number" min="1" value={form.quantity} onChange={handle} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Delivery Address *</label>
                  <textarea name="address" value={form.address} onChange={handle} placeholder="முழு முகவரி..." />
                </div>
                <div className="input-group">
                  <label>Additional Notes</label>
                  <input name="notes" value={form.notes} onChange={handle} placeholder="எந்த கூடுதல் தகவலும்..." />
                </div>

                {/* PRESCRIPTION UPLOAD */}
                <div className="prescription-upload">
                  <label>📎 Prescription Upload (Optional)</label>
                  <div
                    className={`upload-box ${prescriptionFile ? "has-file" : ""}`}
                    onClick={() => document.getElementById("pres-input").click()}
                  >
                    {prescriptionFile ? (
                      <div className="file-selected">
                        <span>✅</span>
                        <span>{prescriptionFile.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setPrescriptionFile(null); }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon">📷</div>
                        <p>Photo எடுக்கவும் அல்லது file select செய்யவும்</p>
                        <span>JPG, PNG, PDF supported</span>
                      </>
                    )}
                  </div>
                  <input id="pres-input" type="file" accept="image/*,.pdf" style={{ display: "none" }}
                    onChange={(e) => setPrescriptionFile(e.target.files[0])} />
                </div>

                <button className="btn-primary submit-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "⏳ Submitting..." : "🚀 Submit Order"}
                </button>
              </div>

              {/* INFO CARD */}
              <div className="order-info-col">
                <div className="card info-card">
                  <h4>📞 Contact Us</h4>
                  <p>Sree Kavithaa Medicals</p>
                  <p className="shop-phone">📱 9842885151</p>
                  <button className="whatsapp-big" onClick={openWhatsApp}>
                    💬 Chat on WhatsApp
                  </button>
                </div>
                <div className="card steps-card">
                  <h4>🛒 How it works</h4>
                  <div className="step"><div className="step-num">1</div><span>Order Submit செய்யுங்கள்</span></div>
                  <div className="step"><div className="step-num">2</div><span>நாங்கள் Confirm செய்வோம்</span></div>
                  <div className="step"><div className="step-num">3</div><span>உங்கள் வீட்டிற்கு Delivery</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER HISTORY */}
        {tab === "history" && (
          <div className="history-section">
            <div className="order-hero">
              <h2>Order History</h2>
              <p>உங்கள் அனைத்து orders-ஐயும் இங்கே பார்க்கலாம்</p>
            </div>
            {loading ? (
              <div className="loader"><div className="spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-icon">📦</div>
                <h3>Orders இல்லை</h3>
                <p>இதுவரை orders submit செய்யவில்லை</p>
                <button className="btn-primary" onClick={() => setTab("order")}>First Order செய்யுங்கள்</button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(o => (
                  <div className="card order-item" key={o._id}>
                    <div className="order-item-top">
                      <div>
                        <h4>{o.medicineName}</h4>
                        <p>Qty: {o.quantity} | 📱 {o.phoneNumber}</p>
                      </div>
                      <span className={`badge ${statusColor(o.status)}`}>{o.status}</span>
                    </div>
                    <div className="order-item-bottom">
                      <span>📍 {o.address}</span>
                      <span>🕐 {new Date(o.createdAt).toLocaleDateString("ta-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}