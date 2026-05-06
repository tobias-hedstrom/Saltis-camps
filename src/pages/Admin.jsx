import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { calculateCampFinancials, formatDate, formatSEK, daysUntil } from "../utils/costCalculations";
import { exportSingleCamp, exportBoardCsv } from "../utils/exportUtils";
import StatusBadge from "../components/StatusBadge";
import CostSummary from "../components/CostSummary";
import AdminCampForm from "../components/AdminCampForm";
import AdminCostEditor from "../components/AdminCostEditor";
import AdminNewsForm from "../components/AdminNewsForm";
import ExportButton from "../components/ExportButton";

const ADMIN_TABS = [
  { key: "dashboard",     label: "Dashboard" },
  { key: "camps",         label: "Camps" },
  { key: "news",          label: "News" },
  { key: "registrations", label: "Registrations" },
  { key: "costs",         label: "Costs" },
  { key: "export",        label: "Export" },
];

export default function Admin() {
  const {
    camps, registrations, registeredCount, campRegistrations,
    addCamp, updateCamp, deleteCamp, resetData,
    newsPosts, addNews, updateNews, deleteNews,
  } = useAppData();

  const [activeTab, setActiveTab]       = useState("dashboard");
  const [showCampForm, setShowCampForm] = useState(false);
  const [editingCamp, setEditingCamp]   = useState(null);
  const [activeCostCampId, setActiveCostCampId] = useState(camps[0]?.id ?? null);
  const [regFilter, setRegFilter]       = useState({ camp: "all", ageGroup: "all", paymentStatus: "all" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews]   = useState(null);
  const [confirmDeleteNews, setConfirmDeleteNews] = useState(null);

  const costCamp = camps.find((c) => c.id === activeCostCampId) ?? camps[0] ?? null;

  function handleSaveCamp(campData) {
    if (camps.find((c) => c.id === campData.id)) {
      updateCamp(campData.id, campData);
    } else {
      addCamp(campData);
    }
    setShowCampForm(false);
    setEditingCamp(null);
  }

  function handleDeleteCamp(camp) {
    const regCount = registeredCount(camp.id);
    setConfirmDelete({ camp, regCount });
  }

  function confirmDeleteCamp() {
    if (!confirmDelete) return;
    deleteCamp(confirmDelete.camp.id);
    if (activeCostCampId === confirmDelete.camp.id) {
      setActiveCostCampId(camps.find((c) => c.id !== confirmDelete.camp.id)?.id ?? null);
    }
    setConfirmDelete(null);
  }

  function handleSaveNews(post) {
    if (newsPosts.find((p) => p.id === post.id)) {
      updateNews(post.id, post);
    } else {
      addNews(post);
    }
    setShowNewsForm(false);
    setEditingNews(null);
  }

  const filteredRegs = registrations.filter((r) => {
    if (regFilter.camp !== "all" && r.campId !== regFilter.camp) return false;
    if (regFilter.ageGroup !== "all" && r.ageGroup !== regFilter.ageGroup) return false;
    if (regFilter.paymentStatus !== "all" && r.paymentStatus !== regFilter.paymentStatus) return false;
    return true;
  });

  const sortedCamps = [...camps].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const sortedNews  = [...(newsPosts ?? [])].sort((a, b) =>
    (b.publishDate || b.date || "").localeCompare(a.publishDate || a.date || "")
  );

  const atRiskCount = camps.filter((c) => {
    const f = calculateCampFinancials(c, registeredCount(c.id));
    return f.financialStatus === "at-risk";
  }).length;

  return (
    <div className="admin-page">
      {/* Camp form modal */}
      {(showCampForm || editingCamp) && (
        <AdminCampForm
          camp={editingCamp}
          onSave={handleSaveCamp}
          onCancel={() => { setShowCampForm(false); setEditingCamp(null); }}
        />
      )}

      {/* News form modal */}
      {(showNewsForm || editingNews) && (
        <AdminNewsForm
          post={editingNews}
          camps={camps}
          onSave={handleSaveNews}
          onCancel={() => { setShowNewsForm(false); setEditingNews(null); }}
        />
      )}

      {/* Delete camp confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Camp</h2>
            <p>
              Are you sure you want to delete <strong>{confirmDelete.camp.name}</strong>?
            </p>
            {confirmDelete.regCount > 0 && (
              <div className="alert alert-danger" style={{ margin: "1rem 0" }}>
                This will also delete <strong>{confirmDelete.regCount} registration{confirmDelete.regCount !== 1 ? "s" : ""}</strong> linked to this camp.
              </div>
            )}
            <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>This action cannot be undone.</p>
            <div className="form-row" style={{ marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn" style={{ background: "var(--red-600)", color: "#fff" }} onClick={confirmDeleteCamp}>
                Delete Camp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete news confirmation */}
      {confirmDeleteNews && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteNews(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete News Post</h2>
            <p>Are you sure you want to delete <strong>{confirmDeleteNews.title}</strong>?</p>
            <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>This action cannot be undone.</p>
            <div className="form-row" style={{ marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDeleteNews(null)}>Cancel</button>
              <button className="btn" style={{ background: "var(--red-600)", color: "#fff" }}
                onClick={() => { deleteNews(confirmDeleteNews.id); setConfirmDeleteNews(null); }}>
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">Admin Panel</div>
          <nav className="admin-nav">
            {ADMIN_TABS.map((t) => (
              <button
                key={t.key}
                className={`admin-nav-item ${activeTab === t.key ? "admin-nav-active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "1rem", borderTop: "1px solid var(--gray-100)", marginTop: "auto" }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: "100%" }}
              onClick={() => { if (window.confirm("Reset all data to the original mock data? This will delete all your changes.")) resetData(); }}
            >
              Reset Data
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="admin-main">

          {/* ── DASHBOARD ─────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div>
              <h1>Admin Dashboard</h1>

              {atRiskCount > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>
                  {atRiskCount} camp{atRiskCount !== 1 ? "s are" : " is"} at financial risk. Check the Costs tab.
                </div>
              )}

              <div className="cards-row">
                <div className="summary-card card">
                  <div className="summary-card-num">{camps.length}</div>
                  <div className="summary-card-label">Total Camps</div>
                </div>
                <div className="summary-card card">
                  <div className="summary-card-num">{registrations.length}</div>
                  <div className="summary-card-label">Total Registrations</div>
                </div>
                <div className="summary-card card">
                  <div className="summary-card-num">{registrations.filter((r) => r.paymentStatus === "paid").length}</div>
                  <div className="summary-card-label">Paid</div>
                </div>
                <div className={`summary-card card ${registrations.filter((r) => r.paymentStatus === "overdue").length > 0 ? "summary-card-danger" : ""}`}>
                  <div className="summary-card-num">{registrations.filter((r) => r.paymentStatus === "overdue").length}</div>
                  <div className="summary-card-label">Overdue</div>
                </div>
              </div>

              <h2 style={{ marginTop: "1.5rem" }}>Camp Overview</h2>
              <div className="table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Camp</th>
                      <th>Dates</th>
                      <th>Registered</th>
                      <th>Reg. Deadline</th>
                      <th>Pay. Deadline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCamps.map((camp) => {
                      const count = registeredCount(camp.id);
                      const f = calculateCampFinancials(camp, count);
                      const daysLeft = daysUntil(camp.registrationDeadline);
                      return (
                        <tr key={camp.id} className={f.financialStatus === "at-risk" ? "row-warning" : ""}>
                          <td><Link to={`/camps/${camp.id}`} className="table-link">{camp.name}</Link></td>
                          <td>{formatDate(camp.startDate)}</td>
                          <td>{count}/{camp.maxAthletes}</td>
                          <td>
                            {formatDate(camp.registrationDeadline)}
                            {daysLeft !== null && daysLeft > 0 && daysLeft <= 14 && (
                              <span className="deadline-chip" style={{ marginLeft: "0.4rem" }}>{daysLeft}d</span>
                            )}
                          </td>
                          <td>{formatDate(camp.paymentDeadline)}</td>
                          <td><StatusBadge status={f.financialStatus} /></td>
                          <td>
                            <button className="btn-link" onClick={() => setEditingCamp(camp)}>Edit</button>
                            {" · "}
                            <button className="btn-link btn-link-danger" onClick={() => handleDeleteCamp(camp)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                    {camps.length === 0 && (
                      <tr><td colSpan={7} className="empty-state">No camps yet. Add one above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h2 style={{ marginTop: "1.5rem" }}>Upcoming Deadlines</h2>
              <div className="table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Camp</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Days Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {camps.flatMap((c) => [
                      { camp: c, type: "Registration", date: c.registrationDeadline, days: daysUntil(c.registrationDeadline) },
                      { camp: c, type: "Payment",      date: c.paymentDeadline,      days: daysUntil(c.paymentDeadline) },
                    ])
                      .filter((x) => x.days !== null && x.days >= 0)
                      .sort((a, b) => a.days - b.days)
                      .map((x, i) => (
                        <tr key={i} className={x.days <= 7 ? "row-warning" : ""}>
                          <td>{x.camp.name}</td>
                          <td>{x.type} Deadline</td>
                          <td>{formatDate(x.date)}</td>
                          <td>{x.days} days</td>
                        </tr>
                      ))}
                    {camps.length === 0 && (
                      <tr><td colSpan={4} className="empty-state">No deadlines.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CAMPS ─────────────────────────────────────────────── */}
          {activeTab === "camps" && (
            <div>
              <div className="tab-section-header">
                <h1>Camps</h1>
                <button className="btn btn-primary" onClick={() => { setEditingCamp(null); setShowCampForm(true); }}>
                  + Add Camp
                </button>
              </div>
              {sortedCamps.map((camp) => {
                const count = registeredCount(camp.id);
                const f = calculateCampFinancials(camp, count);
                return (
                  <div key={camp.id} className="camp-admin-row card">
                    <div className="camp-admin-row-header">
                      <div>
                        <h3>{camp.name}</h3>
                        <div className="text-muted">{camp.location} · {formatDate(camp.startDate)} – {formatDate(camp.endDate)}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        <StatusBadge status={f.financialStatus} />
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingCamp(camp)}>Edit</button>
                        <Link to={`/camps/${camp.id}`} className="btn btn-outline-dark btn-sm">View</Link>
                        <button
                          className="btn btn-sm"
                          style={{ background: "var(--green-100, #f0fdf4)", color: "var(--green-700, #15803d)" }}
                          onClick={() => exportSingleCamp(camp, registrations)}
                        >
                          Export CSV
                        </button>
                        <button className="btn btn-sm" style={{ background: "var(--red-100)", color: "var(--red-600)" }} onClick={() => handleDeleteCamp(camp)}>Delete</button>
                      </div>
                    </div>
                    <div className="camp-admin-stats">
                      <span>Registered: <strong>{count}/{camp.maxAthletes}</strong></span>
                      <span>Price/athlete: <strong>{f.displayedTotalPricePerAthlete !== null ? formatSEK(Math.round(f.displayedTotalPricePerAthlete)) : "—"}</strong></span>
                      <span>Actual price/day: <strong>{f.actualCostPerAthletePerDay !== null ? formatSEK(Math.round(f.actualCostPerAthletePerDay)) : "—"}</strong></span>
                      <span>Reg. deadline: <strong>{formatDate(camp.registrationDeadline)}</strong></span>
                    </div>
                  </div>
                );
              })}
              {camps.length === 0 && <p className="empty-state">No camps yet. Click "+ Add Camp" to get started.</p>}
            </div>
          )}

          {/* ── NEWS ──────────────────────────────────────────────── */}
          {activeTab === "news" && (
            <div>
              <div className="tab-section-header">
                <h1>News</h1>
                <button className="btn btn-primary" onClick={() => { setEditingNews(null); setShowNewsForm(true); }}>
                  + Add Post
                </button>
              </div>
              {sortedNews.length === 0 && (
                <p className="empty-state">No news posts yet. Click "+ Add Post" to get started.</p>
              )}
              {sortedNews.map((post) => {
                const relatedCamp = post.relatedCampId
                  ? camps.find((c) => c.id === post.relatedCampId)
                  : null;
                return (
                  <div key={post.id} className="camp-admin-row card">
                    <div className="camp-admin-row-header">
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        {post.thumbnailImage && (
                          <img
                            src={post.thumbnailImage}
                            alt=""
                            style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0 }}
                          />
                        )}
                        <div>
                          <h3 style={{ marginBottom: "0.2rem" }}>{post.title}</h3>
                          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                            {post.category && <span className="news-admin-cat">{post.category}</span>}
                            {" "}
                            {formatDate(post.publishDate || post.date)}
                            {relatedCamp && (
                              <span> · Linked to <Link to={`/camps/${relatedCamp.id}`} className="table-link">{relatedCamp.name}</Link></span>
                            )}
                          </div>
                          {(post.excerpt || post.summary) && (
                            <div className="text-muted" style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
                              {(post.excerpt || post.summary).slice(0, 120)}{(post.excerpt || post.summary).length > 120 ? "…" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                        <Link to={`/news/${post.id}`} className="btn btn-outline-dark btn-sm">View</Link>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingNews(post)}>Edit</button>
                        <button
                          className="btn btn-sm"
                          style={{ background: "var(--red-100)", color: "var(--red-600)" }}
                          onClick={() => setConfirmDeleteNews(post)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── REGISTRATIONS ─────────────────────────────────────── */}
          {activeTab === "registrations" && (
            <div>
              <h1>Registrations</h1>
              <div className="filter-row">
                <div className="form-group">
                  <label>Camp</label>
                  <select className="form-control" value={regFilter.camp} onChange={(e) => setRegFilter((f) => ({ ...f, camp: e.target.value }))}>
                    <option value="all">All Camps</option>
                    {camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Age Group</label>
                  <select className="form-control" value={regFilter.ageGroup} onChange={(e) => setRegFilter((f) => ({ ...f, ageGroup: e.target.value }))}>
                    <option value="all">All Groups</option>
                    {["U10", "U12", "U14", "U16"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Status</label>
                  <select className="form-control" value={regFilter.paymentStatus} onChange={(e) => setRegFilter((f) => ({ ...f, paymentStatus: e.target.value }))}>
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Athlete</th>
                      <th>Age Group</th>
                      <th>Parent</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Camp</th>
                      <th>Reg. Date</th>
                      <th>Payment</th>
                      <th>Comments</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.map((r) => {
                      const camp = camps.find((c) => c.id === r.campId);
                      return (
                        <tr key={r.id} className={r.paymentStatus === "overdue" ? "row-danger" : ""}>
                          <td>{r.athleteName}</td>
                          <td>{r.ageGroup}</td>
                          <td>{r.parentName}</td>
                          <td className="text-sm">{r.email}</td>
                          <td className="text-sm">{r.phone}</td>
                          <td>
                            {camp
                              ? <Link to={`/camps/${camp.id}`} className="table-link">{camp.name}</Link>
                              : <span className="text-muted">Removed</span>}
                          </td>
                          <td>{formatDate(r.registrationDate)}</td>
                          <td><StatusBadge status={r.paymentStatus} /></td>
                          <td className="text-sm text-muted">{r.comments || "—"}</td>
                          <td className="text-sm text-muted">{r.specialNotes || "—"}</td>
                        </tr>
                      );
                    })}
                    {filteredRegs.length === 0 && (
                      <tr><td colSpan={10} className="empty-state">No registrations match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                Showing {filteredRegs.length} of {registrations.length} registrations
              </div>
            </div>
          )}

          {/* ── COSTS ─────────────────────────────────────────────── */}
          {activeTab === "costs" && (
            <div>
              <h1>Cost Management</h1>
              {camps.length === 0 ? (
                <p className="empty-state">No camps yet. Add a camp first.</p>
              ) : (
                <>
                  <div className="tabs" style={{ marginBottom: "1.5rem" }}>
                    {sortedCamps.map((c) => (
                      <button
                        key={c.id}
                        className={`tab-btn ${costCamp?.id === c.id ? "tab-btn-active" : ""}`}
                        onClick={() => setActiveCostCampId(c.id)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                  {costCamp && (
                    <>
                      <CostSummary camp={costCamp} registeredCount={registeredCount(costCamp.id)} adminView={true} />
                      <div className="card" style={{ marginTop: "1.5rem" }}>
                        <h2>Cost Items</h2>
                        <AdminCostEditor camp={costCamp} />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── EXPORT ────────────────────────────────────────────── */}
          {activeTab === "export" && (
            <div>
              <h1>Export</h1>
              <div className="card">
                <h2>All Camps Export</h2>
                <p>
                  Download a comprehensive CSV with all camp information, registered athletes,
                  cost breakdowns, financial summaries, and payment statuses.
                </p>
                <ul style={{ margin: "1rem 0 1.5rem", paddingLeft: "1.5rem" }}>
                  <li>Camp overview (all camps)</li>
                  <li>Registered athletes per camp</li>
                  <li>Parent contact details</li>
                  <li>Payment status</li>
                  <li>Full cost breakdown</li>
                  <li>Financial summary (revenue, surplus/deficit)</li>
                </ul>
                <ExportButton />
                <p className="text-muted" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
                  File format: CSV (opens directly in Excel and Google Sheets).
                </p>
              </div>

              <h2 style={{ marginTop: "2rem" }}>Per-Camp Export</h2>
              <div className="table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Camp</th>
                      <th>Registered</th>
                      <th>Price/athlete</th>
                      <th>Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCamps.map((camp) => {
                      const count = registeredCount(camp.id);
                      const f = calculateCampFinancials(camp, count);
                      return (
                        <tr key={camp.id}>
                          <td>{camp.name}</td>
                          <td>{count}/{camp.maxAthletes}</td>
                          <td>{f.displayedTotalPricePerAthlete !== null ? formatSEK(Math.round(f.displayedTotalPricePerAthlete)) : "—"}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => exportSingleCamp(camp, registrations)}
                            >
                              Download CSV
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {camps.length === 0 && (
                      <tr><td colSpan={4} className="empty-state">No camps yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h2 style={{ marginTop: "2rem" }}>Financial Summaries</h2>
              {sortedCamps.map((camp) => (
                <div key={camp.id} style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ marginBottom: "0.75rem" }}>{camp.name}</h3>
                  <CostSummary camp={camp} registeredCount={registeredCount(camp.id)} adminView={true} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
