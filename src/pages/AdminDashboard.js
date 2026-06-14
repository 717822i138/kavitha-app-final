import { useState, useEffect } from "react";
import "./AdminDashboard.css";

const API = "https://kavitha-backend.onrender.com";

export default function AdminDashboard({ onLogout, user }) {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState(null);
  const [updating, setUpdating] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders`);
      const data = await res.json();
      setOrders(data);
      setFiltered(data);
    } catch { showToast("Orders load ஆகவில்லை!", "error"); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  // Filter
  useEffect(() => {
    let result = [...orders];
    if (statusFilter !== "All") result = result.filter(o => o.status === statusFilter);
    if (search) result = result.filter(o =>
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.medicineName?.toLowerCase().includes(search.toLowerCase()) ||
      o.phoneNumber?.includes(search)
    );
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
        showToast(`✅ Status "${newStatus}" ஆக மாற்றப்பட்டது!`);
      } else {
        showToast("Status update ஆகவில்லை!", "error");
      }
    } catch { showToast("Server error!", "error"); }
    setUpdating(null);
  };

  // Excel Export
  const exportExcel = () => {
    const header = ["Customer Name", "Medicine", "Quantity", "Phone", "Address", "Status", "Date"];
    const rows = filtered.map(o => [
      o.customerName, o.medicineName, o.quantity, o.phoneNumber,
      o.address, o.status, new Date(o.createdAt).toLocaleDateString("en-IN")
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `kavitha-orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast("📥 Excel export ஆனது!");
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    approved: orders.filter(o => o.status === "Approved").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
  };

  const statusColor = (s) => {
    if (s === "Pending") return "badge-pending";
    if (s === "Approved") return "badge-approved";
    if (s === "Delivered") return "badge-delivered";
    return "badge-cancelled";
  };

  return (
    <div className="admin-dash">
      {/* HEADER */}
      <header className="admin-header">
        <div className="header-left">
          <div className="header-logo">⚕️</div>
          <div>
            <h1>Sree Kavithaa Medicals</h1>
            <p>Admin Panel — வணக்கம், {user.name}!</p>
          </div>
        </div>
        <button className="btn-outline logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <div className="admin-content">

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📦</div>
            <div><div className="stat-num">{stats.total}</div><div className="stat-label">Total Orders</div></div>
          </div>
          <div className="stat-card pending" onClick={() => setStatusFilter("Pending")}>
            <div className="stat-icon">⏳</div>
            <div><div className="stat-num">{stats.pending}</div><div className="stat-label">Pending</div></div>
          </div>
          <div className="stat-card approved" onClick={() => setStatusFilter("Approved")}>
            <div className="stat-icon">✅</div>
            <div><div className="stat-num">{stats.approved}</div><div className="stat-label">Approved</div></div>
          </div>
          <div className="stat-card delivered" onClick={() => setStatusFilter("Delivered")}>
            <div className="stat-icon">🚚</div>
            <div><div className="stat-num">{stats.delivered}</div><div className="stat-label">Delivered</div></div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="card controls-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Customer, Medicine, Phone search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="clear-btn" onClick={() => setSearch("")}>✕</button>}
          </div>
          <div className="filter-wrap">
            {["All", "Pending", "Approved", "Delivered", "Cancelled"].map(s => (
              <button
                key={s}
                className={`filter-btn ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >{s}</button>
            ))}
          </div>
          <div className="controls-right">
            <button className="btn-outline refresh-btn" onClick={fetchOrders}>🔄 Refresh</button>
            <button className="btn-primary export-btn" onClick={exportExcel}>📥 Export Excel</button>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="card orders-table-wrap">
          <div className="table-header">
            <h3>Orders ({filtered.length})</h3>
          </div>

          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div>📭</div>
              <p>Orders இல்லை</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Medicine</th>
                    <th>Qty</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Prescription</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => (
                    <tr key={o._id} className={o.status === "Delivered" ? "row-delivered" : ""}>
                      <td className="td-num">{i + 1}</td>
                      <td className="td-name">{o.customerName}</td>
                      <td className="td-med">{o.medicineName}</td>
                      <td className="td-qty">{o.quantity}</td>
                      <td>
                        <a href={`tel:${o.phoneNumber}`} className="phone-link">📱 {o.phoneNumber}</a>
                      </td>
                      <td className="td-addr">{o.address}</td>
                      <td className="td-pres">
                        {o.prescription ? (
                          <a href={`${API}/uploads/${o.prescription}`} target="_blank" rel="noreferrer" className="pres-link">
                            📎 View
                          </a>
                        ) : <span className="no-pres">—</span>}
                      </td>
                      <td className="td-date">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                      <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                      <td>
                        <div className="action-btns">
                          {o.status !== "Approved" && o.status !== "Delivered" && (
                            <button
                              className="action-btn approve"
                              disabled={updating === o._id}
                              onClick={() => updateStatus(o._id, "Approved")}
                            >✅ Approve</button>
                          )}
                          {o.status === "Approved" && (
                            <button
                              className="action-btn deliver"
                              disabled={updating === o._id}
                              onClick={() => updateStatus(o._id, "Delivered")}
                            >🚚 Delivered</button>
                          )}
                          {o.status !== "Cancelled" && o.status !== "Delivered" && (
                            <button
                              className="action-btn cancel"
                              disabled={updating === o._id}
                              onClick={() => updateStatus(o._id, "Cancelled")}
                            >✕</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}