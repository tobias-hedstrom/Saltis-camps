import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { calculateCampFinancials, formatDate, formatSEK, daysUntil } from "../utils/costCalculations";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

export default function CampCard({ camp, showFinancials = true }) {
  const { registeredCount } = useAppData();
  const count = registeredCount(camp.id);
  const f = calculateCampFinancials(camp, count);
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
          <StatusBadge status={f.financialStatus} />
        </div>

        <div className="camp-meta">
          <span className="meta-chip">{formatDate(camp.startDate)} — {formatDate(camp.endDate)}</span>
          <span className="meta-chip">{camp.disciplines.join(", ")}</span>
          <span className="meta-chip">{camp.ageGroups.join(", ")}</span>
          <span className="meta-chip">{camp.trainingDays} training days</span>
        </div>

        <div className="camp-card-body">{camp.description}</div>

        {showFinancials && (
          <div className="camp-card-financials">
            <ProgressBar
              value={count}
              max={camp.maxAthletes}
              label={`Registrations: ${count}/${camp.maxAthletes}`}
              colorClass={
                count >= camp.maxAthletes
                  ? "progress-fill-green"
                  : count >= (f.minimumAthletesNeeded ?? 0)
                  ? "progress-fill-blue"
                  : "progress-fill-orange"
              }
            />
            <div className="camp-price-estimate">
              Price: <strong>{formatSEK(f.displayedPricePerDay)}/day</strong>
              {f.actualCostPerAthletePerDay !== null &&
                f.actualCostPerAthletePerDay > f.targetPricePerDay && (
                  <span className="camp-price-note"> (target price — needs more registrations)</span>
                )}
            </div>
          </div>
        )}

        <div className="camp-card-footer">
          {regDaysLeft !== null && regDaysLeft > 0 && (
            <span className="deadline-chip">
              Registration closes in {regDaysLeft} day{regDaysLeft !== 1 ? "s" : ""}
            </span>
          )}
          {regDaysLeft !== null && regDaysLeft <= 0 && (
            <span className="deadline-chip deadline-past">Registration closed</span>
          )}
          <Link to={`/camps/${camp.id}`} className="btn btn-primary">
            View Camp
          </Link>
        </div>
      </div>
    </div>
  );
}
