import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { calculateCampFinancials, getCampDisplayStatus, formatDate, formatSEK, daysUntil } from "../utils/costCalculations";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

export default function CampCard({ camp, showFinancials = true }) {
  const { registeredCount } = useAppData();
  const count = registeredCount(camp.id);
  const f = calculateCampFinancials(camp, count);
  const displayStatus = getCampDisplayStatus(camp, f);
  const regDaysLeft = daysUntil(camp.registrationDeadline);

  return (
    <div className="camp-card card">
      {/* Thumbnail */}
      {camp.thumbnailImage ? (
        <img src={camp.thumbnailImage} alt={camp.name} className="camp-thumb" />
      ) : (
        <div className="camp-thumb-placeholder">
          <span className="camp-thumb-label">{camp.location}</span>
        </div>
      )}

      <div className="camp-card-content">
        <div className="camp-card-header">
          <div>
            <h3 className="camp-card-title">{camp.name}</h3>
            <div className="camp-card-location">{camp.location}</div>
          </div>
          <StatusBadge status={displayStatus} />
        </div>

        <div className="camp-meta">
          <span className="meta-chip">{formatDate(camp.startDate)} — {formatDate(camp.endDate)}</span>
          <span className="meta-chip">{camp.disciplines.join(", ")}</span>
          <span className="meta-chip">{camp.ageGroups.join(", ")}</span>
          <span className="meta-chip">{camp.trainingDays} {camp.trainingDays === 1 ? "träningsdag" : "träningsdagar"}</span>
        </div>

        <div className="camp-card-body">{camp.description}</div>

        {showFinancials && (
          <div className="camp-card-financials">
            <ProgressBar
              value={count}
              max={camp.maxAthletes}
              label={`Anmälda: ${count}/${camp.maxAthletes}`}
              colorClass={
                count >= camp.maxAthletes
                  ? "progress-fill-green"
                  : count >= (f.minimumAthletesNeeded ?? 0)
                  ? "progress-fill-blue"
                  : "progress-fill-orange"
              }
            />
            <div className="camp-price-estimate">
              Pris: <strong>{formatSEK(Math.round(f.displayedPricePerDay))}/dag</strong>
            </div>
          </div>
        )}

        <div className="camp-card-footer">
          {regDaysLeft !== null && regDaysLeft > 0 && (
            <span className="deadline-chip">
              Anmälan stänger om {regDaysLeft} dagar
            </span>
          )}
          {regDaysLeft !== null && regDaysLeft <= 0 && (
            <span className="deadline-chip deadline-past">Anmälan stängd</span>
          )}
          <Link to={`/camps/${camp.id}`} className="btn btn-primary">
            Visa mer
          </Link>
        </div>
      </div>
    </div>
  );
}
