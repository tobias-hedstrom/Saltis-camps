import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { calculateCampFinancials, getCampDisplayStatus, formatDate, formatSEK, daysUntil } from "../utils/costCalculations";
import { exportSingleCamp, exportBoardCsv } from "../utils/exportUtils";
import StatusBadge from "../components/StatusBadge";
import CostSummary from "../components/CostSummary";
import AdminCampForm from "../components/AdminCampForm";
import AdminCostEditor from "../components/AdminCostEditor";
import AdminNewsForm from "../components/AdminNewsForm";
import ExportButton from "../components/ExportButton";
import { categoryLabel } from "../utils/displayText";

const ADMIN_TABS = [
  { key: "dashboard",     label: "Översikt" },
  { key: "camps",         label: "Läger" },
  { key: "costs",         label: "Kostnader" },
  { key: "registrations", label: "Anmälningar" },
  { key: "news",          label: "Nyheter" },
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
    return getCampDisplayStatus(c, f) === "needs-target";
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
            <h2>Ta bort läger</h2>
            <p>
              Vill du ta bort <strong>{confirmDelete.camp.name}</strong>?
            </p>
            {confirmDelete.regCount > 0 && (
              <div className="alert alert-danger" style={{ margin: "1rem 0" }}>
                Detta tar också bort <strong>{confirmDelete.regCount} anmälningar</strong> kopplade till lägret.
              </div>
            )}
            <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Åtgärden kan inte ångras.</p>
            <div className="form-row" style={{ marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Avbryt</button>
              <button className="btn" style={{ background: "var(--red-600)", color: "#fff" }} onClick={confirmDeleteCamp}>
                Ta bort läger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete news confirmation */}
      {confirmDeleteNews && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteNews(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Ta bort nyhet</h2>
            <p>Vill du ta bort <strong>{confirmDeleteNews.title}</strong>?</p>
            <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Åtgärden kan inte ångras.</p>
            <div className="form-row" style={{ marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDeleteNews(null)}>Avbryt</button>
              <button className="btn" style={{ background: "var(--red-600)", color: "#fff" }}
                onClick={() => { deleteNews(confirmDeleteNews.id); setConfirmDeleteNews(null); }}>
                Ta bort nyhet
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">Admin</div>
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
              onClick={() => { if (window.confirm("Återställ all lokal data till startläget? Detta tar bort lokala ändringar.")) resetData(); }}
            >
              Återställ data
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="admin-main">

          {/* ── DASHBOARD ─────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div>
              <h1>Översikt</h1>

              {atRiskCount > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>
                  {atRiskCount} läger har inte nått målpriset 800 kr/dag. Se kostnadsfliken för detaljer.
                </div>
              )}

              <div className="cards-row">
                <div className="summary-card card">
                  <div className="summary-card-num">{camps.length}</div>
                  <div className="summary-card-label">Läger</div>
                </div>
                <div className="summary-card card">
                  <div className="summary-card-num">{registrations.length}</div>
                  <div className="summary-card-label">Anmälningar</div>
                </div>
                <div className="summary-card card">
                  <div className="summary-card-num">{registrations.filter((r) => r.paymentStatus === "paid").length}</div>
                  <div className="summary-card-label">Betalda</div>
                </div>
                <div className={`summary-card card ${registrations.filter((r) => r.paymentStatus === "overdue").length > 0 ? "summary-card-danger" : ""}`}>
                  <div className="summary-card-num">{registrations.filter((r) => r.paymentStatus === "overdue").length}</div>
                  <div className="summary-card-label">Saknade</div>
                </div>
              </div>

              <h2 style={{ marginTop: "1.5rem" }}>Lägeröversikt</h2>
              <div className="table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Läger</th>
                      <th>Datum</th>
                      <th>Anmälda</th>
                      <th>Anmälan</th>
                      <th>Betalning</th>
                      <th>Status</th>
                      <th>Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCamps.map((camp) => {
                      const count = registeredCount(camp.id);
                      const f = calculateCampFinancials(camp, count);
                      const displayStatus = getCampDisplayStatus(camp, f);
                      const daysLeft = daysUntil(camp.registrationDeadline);
                      return (
                        <tr key={camp.id} className={displayStatus === "needs-target" ? "row-warning" : ""}>
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
                          <td><StatusBadge status={displayStatus} /></td>
                          <td>
                            <button className="btn-link" onClick={() => setEditingCamp(camp)}>Redigera</button>
                            {" · "}
                            <button className="btn-link btn-link-danger" onClick={() => handleDeleteCamp(camp)}>Ta bort</button>
                          </td>
                        </tr>
                      );
                    })}
                    {camps.length === 0 && (
                      <tr><td colSpan={7} className="empty-state">Inga läger ännu.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h2 style={{ marginTop: "1.5rem" }}>Kommande datum och deadlines</h2>
              <div className="table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Läger</th>
                      <th>Typ</th>
                      <th>Datum</th>
                      <th>Dagar kvar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {camps.flatMap((c) => [
                      { camp: c, type: "Anmälan", date: c.registrationDeadline, days: daysUntil(c.registrationDeadline) },
                      { camp: c, type: "Betalning",      date: c.paymentDeadline,      days: daysUntil(c.paymentDeadline) },
                    ])
                      .filter((x) => x.days !== null && x.days >= 0)
                      .sort((a, b) => a.days - b.days)
                      .map((x, i) => (
                        <tr key={i} className={x.days <= 7 ? "row-warning" : ""}>
                          <td>{x.camp.name}</td>
                          <td>{x.type}</td>
                          <td>{formatDate(x.date)}</td>
                          <td>{x.days} dagar</td>
                        </tr>
                      ))}
                    {camps.length === 0 && (
                      <tr><td colSpan={4} className="empty-state">Inga kommande deadlines.</td></tr>
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
                <h1>Läger</h1>
                <button className="btn btn-primary" onClick={() => { setEditingCamp(null); setShowCampForm(true); }}>
                  + Lägg till läger
                </button>
              </div>
              {sortedCamps.map((camp) => {
                const count = registeredCount(camp.id);
                const f = calculateCampFinancials(camp, count);
                const displayStatus = getCampDisplayStatus(camp, f);
                return (
                  <div key={camp.id} className="camp-admin-row card">
                    <div className="camp-admin-row-header">
                      <div>
                        <h3>{camp.name}</h3>
                        <div className="text-muted">{camp.location} · {formatDate(camp.startDate)} – {formatDate(camp.endDate)}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        <StatusBadge status={displayStatus} />
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingCamp(camp)}>Redigera</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setActiveCostCampId(camp.id); setActiveTab("costs"); }}>Hantera kostnader</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setRegFilter((filt) => ({ ...filt, camp: camp.id })); setActiveTab("registrations"); }}>Visa anmälda</button>
                        <Link to={`/camps/${camp.id}`} className="btn btn-outline-dark btn-sm">Visa</Link>
                        <button
                          className="btn btn-sm"
                          style={{ background: "var(--green-100, #f0fdf4)", color: "var(--green-700, #15803d)" }}
                          onClick={() => exportSingleCamp(camp, registrations)}
                        >
                          Ladda ner CSV
                        </button>
                        <button className="btn btn-sm" style={{ background: "var(--red-100)", color: "var(--red-600)" }} onClick={() => handleDeleteCamp(camp)}>Ta bort</button>
                      </div>
                    </div>
                    <div className="camp-admin-stats">
                      <span>Anmälda: <strong>{count}/{camp.maxAthletes}</strong></span>
                      <span>Pris/åkare: <strong>{f.displayedTotalPricePerAthlete !== null ? formatSEK(Math.round(f.displayedTotalPricePerAthlete)) : "—"}</strong></span>
                      <span>Faktisk kostnad/dag: <strong>{f.actualCostPerAthletePerDay !== null ? formatSEK(Math.round(f.actualCostPerAthletePerDay)) : "—"}</strong></span>
                      <span>Sista anmälan: <strong>{formatDate(camp.registrationDeadline)}</strong></span>
                    </div>
                  </div>
                );
              })}
              {camps.length === 0 && <p className="empty-state">Inga läger ännu. Lägg till ett läger för att komma igång.</p>}
            </div>
          )}

          {/* ── NEWS ──────────────────────────────────────────────── */}
          {activeTab === "news" && (
            <div>
              <div className="tab-section-header">
                <h1>Nyheter</h1>
                <button className="btn btn-primary" onClick={() => { setEditingNews(null); setShowNewsForm(true); }}>
                  + Lägg till nyhet
                </button>
              </div>
              {sortedNews.length === 0 && (
                <p className="empty-state">Inga nyheter ännu. Lägg till en nyhet för att komma igång.</p>
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
                            {post.category && <span className="news-admin-cat">{categoryLabel(post.category)}</span>}
                            {" "}
                            {formatDate(post.publishDate || post.date)}
                            {relatedCamp && (
                              <span> · Kopplat till <Link to={`/camps/${relatedCamp.id}`} className="table-link">{relatedCamp.name}</Link></span>
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
                        <Link to={`/news/${post.id}`} className="btn btn-outline-dark btn-sm">Visa</Link>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingNews(post)}>Redigera</button>
                        <button
                          className="btn btn-sm"
                          style={{ background: "var(--red-100)", color: "var(--red-600)" }}
                          onClick={() => setConfirmDeleteNews(post)}
                        >
                          Ta bort
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
              <h1>Anmälningar</h1>
              <div className="filter-row">
                <div className="form-group">
                  <label>Läger</label>
                  <select className="form-control" value={regFilter.camp} onChange={(e) => setRegFilter((f) => ({ ...f, camp: e.target.value }))}>
                    <option value="all">Alla läger</option>
                    {camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Grupp</label>
                  <select className="form-control" value={regFilter.ageGroup} onChange={(e) => setRegFilter((f) => ({ ...f, ageGroup: e.target.value }))}>
                    <option value="all">Alla grupper</option>
                    {["U10", "U12", "U14", "U16"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Betalningsstatus</label>
                  <select className="form-control" value={regFilter.paymentStatus} onChange={(e) => setRegFilter((f) => ({ ...f, paymentStatus: e.target.value }))}>
                    <option value="all">Alla statusar</option>
                    <option value="paid">Betald</option>
                    <option value="pending">Kommande</option>
                    <option value="overdue">Saknas</option>
                  </select>
                </div>
              </div>
              <div className="table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Åkare</th>
                      <th>Grupp</th>
                      <th>Förälder</th>
                      <th>E-post</th>
                      <th>Telefon</th>
                      <th>Läger</th>
                      <th>Anmäld</th>
                      <th>Betalning</th>
                      <th>Kommentarer</th>
                      <th>Anteckningar</th>
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
                              : <span className="text-muted">Borttaget</span>}
                          </td>
                          <td>{formatDate(r.registrationDate)}</td>
                          <td><StatusBadge status={r.paymentStatus} /></td>
                          <td className="text-sm text-muted">{r.comments || "—"}</td>
                          <td className="text-sm text-muted">{r.specialNotes || "—"}</td>
                        </tr>
                      );
                    })}
                    {filteredRegs.length === 0 && (
                      <tr><td colSpan={10} className="empty-state">Inga anmälningar matchar filtren.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                Visar {filteredRegs.length} av {registrations.length} anmälningar
              </div>
            </div>
          )}

          {/* ── COSTS ─────────────────────────────────────────────── */}
          {activeTab === "costs" && (
            <div>
              <h1>Kostnader</h1>
              {camps.length === 0 ? (
                <p className="empty-state">Inga läger ännu. Lägg till ett läger först.</p>
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
                        <h2>Kostnadsposter</h2>
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
                <h2>Export för alla läger</h2>
                <p>
                  Ladda ner en samlad CSV med lägerinformation, anmälda åkare,
                  kostnader, ekonomiska sammanställningar och betalningsstatus.
                </p>
                <ul style={{ margin: "1rem 0 1.5rem", paddingLeft: "1.5rem" }}>
                  <li>Lägeröversikt</li>
                  <li>Anmälda åkare per läger</li>
                  <li>Kontaktuppgifter till föräldrar</li>
                  <li>Betalningsstatus</li>
                  <li>Full kostnadsstruktur</li>
                  <li>Ekonomisk sammanställning</li>
                </ul>
                <ExportButton />
                <p className="text-muted" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
                  Filformat: CSV (kan öppnas i Excel och Google Sheets).
                </p>
              </div>

              <h2 style={{ marginTop: "2rem" }}>Export per läger</h2>
              <div className="table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Läger</th>
                      <th>Anmälda</th>
                      <th>Pris/åkare</th>
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
                              Ladda ner CSV
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {camps.length === 0 && (
                      <tr><td colSpan={4} className="empty-state">Inga läger ännu.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h2 style={{ marginTop: "2rem" }}>Ekonomisk status</h2>
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
