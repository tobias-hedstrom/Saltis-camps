import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { calculateCampFinancials, getCampDisplayStatus, formatDate, daysUntil, formatSEK } from "../utils/costCalculations";
import { generateCampICS, downloadICS } from "../utils/calendarExport";
import CostSummary from "../components/CostSummary";
import StatusBadge from "../components/StatusBadge";
import RegistrationForm from "../components/RegistrationForm";
import LoginModal from "../components/LoginModal";
import ProgressBar from "../components/ProgressBar";

export default function CampDetail() {
  const { id } = useParams();
  const {
    getCamp,
    campRegistrations,
    athletes,
    currentUser,
    isLoggedIn,
    addRegistration,
    registeredCount,
  } = useAppData();
  const [showRegForm, setShowRegForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const camp = getCamp(id);

  if (!camp) {
    return (
      <div className="camp-detail">
        <Link to="/camps" className="back-link">Tillbaka till läger</Link>
        <div className="card" style={{ marginTop: "2rem", textAlign: "center", padding: "3rem" }}>
          <h2>Lägret hittades inte</h2>
          <p style={{ color: "var(--gray-500)", marginTop: "0.5rem" }}>
            Lägret kan ha tagits bort.
          </p>
          <Link to="/camps" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Visa alla läger
          </Link>
        </div>
      </div>
    );
  }

  const campRegs = campRegistrations(camp.id);
  const count = registeredCount(camp.id);
  const f = calculateCampFinancials(camp, count);
  const displayStatus = getCampDisplayStatus(camp, f);
  const regDays = daysUntil(camp.registrationDeadline);

  const registeredAthleteIds = new Set(campRegs.map((r) => r.athleteId));
  const eligibleAthletes = athletes.filter(
    (a) => camp.ageGroups.includes(a.ageGroup) && !registeredAthleteIds.has(a.id)
  );

  function handleRegister(formData) {
    addRegistration({
      athleteId: formData.athleteId,
      athleteName: formData.athleteName,
      campId: camp.id,
      ageGroup: formData.ageGroup,
      parentName: formData.parentName,
      email: formData.email,
      phone: formData.phone,
      comments: formData.comments,
      specialNotes: formData.specialNotes,
    });
    setShowRegForm(false);
  }

  function handleRegisterClick() {
    if (!isLoggedIn) {
      setShowLogin(true);
    } else {
      setShowRegForm(true);
    }
  }

  function handleDownloadCalendar() {
    const ics = generateCampICS(camp);
    const safe = camp.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    downloadICS(`${safe}.ics`, ics);
  }

  const isFull = count >= camp.maxAthletes;
  const isClosed = regDays !== null && regDays <= 0;

  return (
    <div className="camp-detail">
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showRegForm && (
        <RegistrationForm
          camp={camp}
          athletes={eligibleAthletes}
          user={currentUser}
          onSubmit={handleRegister}
          onClose={() => setShowRegForm(false)}
        />
      )}

      <Link to="/camps" className="back-link">Tillbaka till läger</Link>

      {/* Hero image or placeholder */}
      {camp.thumbnailImage ? (
        <div className="camp-hero-image-wrap">
          <img src={camp.thumbnailImage} alt={camp.name} className="camp-hero-image" />
        </div>
      ) : null}

      <div className="detail-header card">
        <div className="detail-header-content">
          <div>
            <div className="detail-location">{camp.location}</div>
            <h1 className="detail-title">{camp.name}</h1>
            <div className="detail-meta">
              <span className="meta-chip">{formatDate(camp.startDate)} — {formatDate(camp.endDate)}</span>
              <span className="meta-chip">{camp.trainingDays} {camp.trainingDays === 1 ? "träningsdag" : "träningsdagar"}</span>
              <span className="meta-chip">{camp.disciplines.join(", ")}</span>
              <span className="meta-chip">{camp.ageGroups.join(", ")}</span>
            </div>
          </div>
          <div className="detail-header-actions">
            <StatusBadge status={displayStatus} />
            {!isClosed ? (
              <div className="deadline-badge">
                Anmälan stänger om {regDays} dagar
              </div>
            ) : (
              <div className="deadline-badge deadline-past">Anmälan stängd</div>
            )}
            <button
              className="btn btn-primary btn-lg"
              onClick={handleRegisterClick}
              disabled={isFull || isClosed}
            >
              {isFull ? "Fullt" : isClosed ? "Anmälan stängd" : "Anmäl"}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadCalendar}
              title="Ladda ner kalenderfil"
            >
              Lägg till i kalender
            </button>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <ProgressBar
            value={count}
            max={camp.maxAthletes}
            label={`${count} av ${camp.maxAthletes} platser fyllda`}
            colorClass={isFull ? "progress-fill-green" : "progress-fill-blue"}
          />
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card">
            <h2>Om lägret</h2>
            <p>{camp.description}</p>
          </div>

          <div className="card">
            <h2>Lägerdetaljer</h2>
            <div className="detail-rows">
              <DetailRow label="Tränare" value={camp.coaches.join(", ")} />
              <DetailRow label="Grupper" value={camp.ageGroups.join(", ")} />
              <DetailRow label="Discipliner" value={camp.disciplines.join(", ")} />
              <DetailRow label="Träningsdagar" value={camp.trainingDays} />
              <DetailRow label="Max antal åkare" value={camp.maxAthletes} />
              <DetailRow label="Anmälda åkare" value={count} />
              <DetailRow
                label="Sista anmälningsdag"
                value={formatDate(camp.registrationDeadline)}
              />
              <DetailRow label="Sista betalningsdag" value={formatDate(camp.paymentDeadline)} />
              {camp.infoMeetingDate && (
                <DetailRow label="Informationsmöte" value={formatDate(camp.infoMeetingDate)} />
              )}
              {camp.travelDateOut && (
                <DetailRow label="Avresa" value={formatDate(camp.travelDateOut)} />
              )}
              {camp.travelDateHome && (
                <DetailRow label="Hemresa" value={formatDate(camp.travelDateHome)} />
              )}
            </div>
          </div>

          <div className="card">
            <h2>Anmälda åkare</h2>
            {campRegs.length === 0 ? (
              <p className="empty-state compact">Inga åkare är anmälda ännu.</p>
            ) : (
              <div className="registered-list">
                {campRegs.map((reg) => (
                  <div key={reg.id} className="registered-public-row">
                    <div>
                      <strong>{reg.athleteName}</strong>
                      <span>{reg.ageGroup || "Grupp saknas"}</span>
                    </div>
                    <span className="badge badge-upcoming">
                      {reg.registrationType === "self" ? "Egen anmälan" : "Familjeanmälan"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {camp.accommodationInfo && (
            <div className="card">
              <h2>Boende</h2>
              <p>{camp.accommodationInfo}</p>
            </div>
          )}

          {camp.travelInfo && (
            <div className="card">
              <h2>Reseinformation</h2>
              <p>{camp.travelInfo}</p>
            </div>
          )}

          {camp.packingList?.length > 0 && (
            <div className="card">
              <h2>Packlista</h2>
              <ul className="packing-list">
                {camp.packingList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Camp image gallery */}
          {camp.images?.length > 0 && (
            <div className="card">
              <h2>Bilder</h2>
              <div className="camp-gallery">
                {camp.images.map((img) => (
                  <div key={img.id} className="camp-gallery-item">
                    <img src={img.url} alt={img.caption || camp.name} className="camp-gallery-img" />
                    {img.caption && (
                      <p className="camp-gallery-caption">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          <CostSummary camp={camp} registeredCount={count} />

          {f.displayedTotalPricePerAthlete !== null && (
            <div className="price-box card">
              <div className="price-box-label">Beräknat pris per åkare</div>
              <div className="price-box-value">
                {formatSEK(Math.round(f.displayedTotalPricePerAthlete))}
              </div>
              <div className="price-box-sub">
                {formatSEK(Math.round(f.displayedPricePerDay))} / dag
              </div>
              {f.actualCostPerAthletePerDay !== null &&
                f.actualCostPerAthletePerDay > f.targetPricePerDay && (
                  <div className="camp-risk-box">
                    <strong>Riskerar att ställas in</strong>
                    <span>Det behövs {f.additionalAthletesNeeded ?? 0} fler anmälda för att nå målpriset 800 kr/dag.</span>
                  </div>
                )}
            </div>
          )}

          <div className="card cta-card">
            <h3>Anmäl åkare</h3>
            <p>
              Sista betalningsdag: <strong>{formatDate(camp.paymentDeadline)}</strong>
            </p>
            <button
              className="btn btn-primary btn-block"
              onClick={handleRegisterClick}
              disabled={isFull || isClosed}
            >
              {isFull ? "Fullt" : isClosed ? "Anmälan stängd" : "Anmäl"}
            </button>
            <button
              className="btn btn-secondary btn-block"
              style={{ marginTop: "0.5rem" }}
              onClick={handleDownloadCalendar}
            >
              Lägg till i kalender
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-row-label">{label}</span>
      <span className="detail-row-value">{value}</span>
    </div>
  );
}
