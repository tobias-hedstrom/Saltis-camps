import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { generateAllCampsICS, downloadICS } from "../utils/calendarExport";
import FamilyMemberForm from "../components/FamilyMemberForm";
import LoginModal from "../components/LoginModal";
import PaymentTable from "../components/PaymentTable";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/costCalculations";
import { roleLabel } from "../utils/displayText";

export default function MyPage() {
  const { currentUser, isLoggedIn, athletes, getCamp, myRegistrations, saveAthlete, deleteAthlete, updateCurrentUser } = useAppData();
  const regs = myRegistrations();

  const [activeTab, setActiveTab] = useState("account");
  const [showAthleteForm, setShowAthleteForm] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [editingUser, setEditingUser] = useState(false);
  const [userForm, setUserForm] = useState({ ...(currentUser ?? {}) });
  const [showLogin, setShowLogin] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="my-page">
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        <div className="page-header">
          <h1>Min sida</h1>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Du är inte inloggad</h2>
          <p style={{ color: "var(--gray-500)", marginTop: "0.5rem" }}>
            Logga in för att hantera familj, anmälningar och betalningar.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: "1.5rem" }}
            onClick={() => setShowLogin(true)}
          >
            Logga in
          </button>
        </div>
      </div>
    );
  }

  const overdue = regs.filter((r) => r.paymentStatus === "overdue");
  const pending = regs.filter((r) => r.paymentStatus === "pending");

  function handleSaveAthlete(data) {
    saveAthlete(data);
    setShowAthleteForm(false);
    setEditingAthlete(null);
  }

  function handleSaveUser(e) {
    e.preventDefault();
    updateCurrentUser(userForm);
    setEditingUser(false);
  }

  function handleDownloadMyCamps() {
    const myCamps = regs
      .map((r) => getCamp(r.campId))
      .filter(Boolean)
      .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);
    if (myCamps.length === 0) return;
    const ics = generateAllCampsICS(myCamps);
    downloadICS("my-camps.ics", ics);
  }

  return (
    <div className="my-page">
      {(showAthleteForm || editingAthlete) && (
        <FamilyMemberForm
          athlete={editingAthlete}
          onSave={handleSaveAthlete}
          onCancel={() => { setShowAthleteForm(false); setEditingAthlete(null); }}
        />
      )}

      <div className="page-header">
        <h1>Min sida</h1>
        <p>En samlad översikt över familj, lägeranmälningar och betalningar.</p>
      </div>

      <div className="cards-row">
        <div className="summary-card card">
          <div className="summary-card-num">{athletes.length}</div>
          <div className="summary-card-label">Familjemedlemmar</div>
        </div>
        <div className="summary-card card">
          <div className="summary-card-num">{regs.length}</div>
          <div className="summary-card-label">Anmälningar</div>
        </div>
        <div className={`summary-card card ${overdue.length > 0 ? "summary-card-danger" : ""}`}>
          <div className="summary-card-num">{overdue.length}</div>
          <div className="summary-card-label">Saknade betalningar</div>
        </div>
        <div className="summary-card card">
          <div className="summary-card-num">{pending.length}</div>
          <div className="summary-card-label">Kommande betalningar</div>
        </div>
      </div>

      <div className="tabs">
        {[
          { key: "account",       label: "Konto" },
          { key: "athletes",      label: `Familj (${athletes.length})` },
          { key: "registrations", label: `Anmälningar (${regs.length})` },
          { key: "payments",      label: `Betalningar${overdue.length > 0 ? " (!)" : ""}` },
        ].map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? "tab-btn-active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <div className="card tab-content">
          <div className="tab-section-header">
            <h2>Kontouppgifter</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingUser((v) => !v)}>
              {editingUser ? "Avbryt" : "Redigera"}
            </button>
          </div>
          {editingUser ? (
            <form onSubmit={handleSaveUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Namn</label>
                  <input className="form-control" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>E-post</label>
                  <input type="email" className="form-control" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Telefon</label>
                  <input className="form-control" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Nödkontakt</label>
                  <input className="form-control" value={userForm.emergencyContact} onChange={(e) => setUserForm({ ...userForm, emergencyContact: e.target.value })} />
                </div>
              </div>
              <div className="form-row" style={{ marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(false)}>Avbryt</button>
                <button type="submit" className="btn btn-primary">Spara ändringar</button>
              </div>
            </form>
          ) : (
            <div className="profile-rows">
              <ProfileRow label="Namn" value={currentUser.name} />
              <ProfileRow label="E-post" value={currentUser.email} />
              <ProfileRow label="Telefon" value={currentUser.phone} />
              <ProfileRow label="Nödkontakt" value={currentUser.emergencyContact} />
              <ProfileRow label="Roller" value={(currentUser.roles ?? []).map(roleLabel).join(", ")} />
            </div>
          )}
        </div>
      )}

      {activeTab === "athletes" && (
        <div className="tab-content">
          <div className="tab-section-header">
            <h2>Barn och familjemedlemmar</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingAthlete(null); setShowAthleteForm(true); }}>
              + Lägg till åkare
            </button>
          </div>
          {athletes.length === 0 && (
            <div className="empty-card card"><p>Inga åkare tillagda ännu. Lägg till en åkare för att kunna anmäla till läger.</p></div>
          )}
          <div className="athlete-cards">
            {athletes.map((a) => (
              <div key={a.id} className="athlete-card card">
                <div className="athlete-card-header">
                  <div>
                    <div className="athlete-name">{a.name}</div>
                    <div className="athlete-meta">Född {a.birthYear} · {a.ageGroup} · {a.clubGroup}</div>
                  </div>
                  <div className="athlete-card-actions">
                    <button className="btn-link" onClick={() => setEditingAthlete(a)}>Redigera</button>
                    <button className="btn-link btn-link-danger" onClick={() => deleteAthlete(a.id)}>Ta bort</button>
                  </div>
                </div>
                <div className="athlete-details">
                  <span><strong>Nivå:</strong> {a.equipmentLevel}</span>
                  {a.allergies && a.allergies !== "Inga" && <span><strong>Allergier:</strong> {a.allergies}</span>}
                  {a.medicalNotes && <span><strong>Medicinskt:</strong> {a.medicalNotes}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "registrations" && (
        <div className="tab-content">
          <div className="tab-section-header">
            <h2>Mina anmälningar</h2>
            {regs.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadMyCamps}>
                Lägg till i kalender
              </button>
            )}
          </div>
          {regs.length === 0 ? (
            <div className="empty-card card">
              <p>Inga anmälningar ännu. <Link to="/camps">Visa läger</Link> för att anmäla åkare.</p>
            </div>
          ) : (
            <div className="table-wrap card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Åkare</th>
                    <th>Läger</th>
                    <th>Grupp</th>
                    <th>Anmäld</th>
                    <th>Status</th>
                    <th>Betalning</th>
                  </tr>
                </thead>
                <tbody>
                  {regs.map((r) => {
                    const camp = getCamp(r.campId);
                    return (
                      <tr key={r.id}>
                        <td>{r.athleteName}</td>
                        <td>
                          {camp
                            ? <Link to={`/camps/${r.campId}`} className="table-link">{camp.name}</Link>
                            : <span className="text-muted">Lägret borttaget</span>}
                        </td>
                        <td>{r.ageGroup}</td>
                        <td>{formatDate(r.registrationDate)}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td><StatusBadge status={r.paymentStatus} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="tab-content">
          {overdue.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h2>Saknade betalningar</h2>
              <div className="alert alert-danger" style={{ margin: "0.75rem 0" }}>
                Du har {overdue.length} saknade betalningar. Kontakta klubbens kassör vid frågor.
              </div>
              <PaymentTable registrations={overdue} />
            </div>
          )}
          <h2>Kommande betalningar</h2>
          {pending.length === 0
            ? <p className="empty-state">Inga kommande betalningar.</p>
            : <PaymentTable registrations={pending} />}
          <h2 style={{ marginTop: "1.5rem" }}>Betalningsstatus</h2>
          <PaymentTable registrations={regs} />
        </div>
      )}
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="profile-row">
      <span className="profile-label">{label}</span>
      <span className="profile-value">{value || "—"}</span>
    </div>
  );
}
