import { calculateCampFinancials, getCampDisplayStatus, formatSEK } from "../utils/costCalculations";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

export default function CostSummary({ camp, registeredCount, adminView = false }) {
  const f = calculateCampFinancials(camp, registeredCount);
  const displayStatus = getCampDisplayStatus(camp, f);

  return (
    <div className="cost-summary card">
      <div className="cost-summary-header">
        <h3>Kostnadssummering</h3>
        <StatusBadge status={displayStatus} />
      </div>

      {/* Parent-facing price (always shown) */}
      <div className="price-display-block">
        <div className="price-display-row">
          <span className="price-display-label">Pris per åkare</span>
          <span className="price-display-value">
            {f.displayedTotalPricePerAthlete !== null
              ? formatSEK(Math.round(f.displayedTotalPricePerAthlete))
              : formatSEK(f.targetTotalPricePerAthlete)}
          </span>
        </div>
        <div className="price-display-row">
          <span className="price-display-label">Per dag</span>
          <span className="price-display-value price-per-day">
            {formatSEK(Math.round(f.displayedPricePerDay))} / dag
          </span>
        </div>
        {f.targetPricePerDay && (
          <div className="price-display-row price-target-row">
            <span className="price-display-label">Målpris (styrelsebeslut)</span>
            <span className="price-display-note">{formatSEK(f.targetPricePerDay)} / dag</span>
          </div>
        )}
      </div>

      {/* Price warning when above target */}
      {registeredCount === 0 && (
        <div className="alert alert-warning" style={{ marginTop: "0.75rem" }}>
          Inga anmälningar ännu. Målpris: {formatSEK(f.targetPricePerDay)}/dag.
        </div>
      )}

      {registeredCount > 0 &&
        f.actualCostPerAthletePerDay !== null &&
        f.actualCostPerAthletePerDay > f.targetPricePerDay && (
          <div className="alert alert-warning" style={{ marginTop: "0.75rem" }}>
            <strong>Riskerar att ställas in.</strong>{" "}
            Lägret riskerar att ställas in om inte fler anmäler sig.
            {f.additionalAthletesNeeded !== null && (
              <div style={{ marginTop: "0.35rem" }}>
                Det behövs <strong>{f.additionalAthletesNeeded}</strong> fler anmälda för att nå målpriset {formatSEK(f.targetPricePerDay)}/dag.
              </div>
            )}
          </div>
        )}

      {!f.canBeViable && adminView && (
        <div className="alert alert-danger" style={{ marginTop: "0.75rem" }}>
          Lägret kan inte nå målpriset {formatSEK(f.targetPricePerDay)}/dag med nuvarande kostnadsstruktur.
        </div>
      )}

      {/* Admin-only detail breakdown */}
      {adminView && (
        <>
          <div className="cost-divider" style={{ margin: "1rem 0" }} />
          <div className="cost-grid">
            <CostRow label="Total fast kostnad" value={formatSEK(f.totalFixedCost)} />
            <CostRow label="Rörlig kostnad / åkare" value={formatSEK(f.variableCostPerAthlete)} />
            <CostRow label="Total kostnad" value={formatSEK(f.totalCost)} strong />
            <div className="cost-divider" />
            <CostRow
              label="Faktiskt pris / åkare"
              value={f.actualCostPerAthlete !== null ? formatSEK(Math.round(f.actualCostPerAthlete)) : "—"}
              highlight
            />
            <CostRow
              label="Faktiskt pris / åkare / dag"
              value={
                f.actualCostPerAthletePerDay !== null
                  ? formatSEK(Math.round(f.actualCostPerAthletePerDay))
                  : "—"
              }
            />
            <div className="cost-divider" />
            <CostRow
              label="Min. åkare för målpris"
              value={f.canBeViable ? (f.minimumAthletesNeeded ?? "—") : "Ej genomförbart"}
            />
            <CostRow
              label="Fler åkare behövs"
              value={
                f.canBeViable
                  ? f.additionalAthletesNeeded === 0
                    ? "Nej — genomförbart"
                    : (f.additionalAthletesNeeded ?? "—")
                  : "—"
              }
            />
            <div className="cost-divider" />
            <CostRow label="Förväntad intäkt" value={formatSEK(f.expectedRevenue)} />
            <CostRow
              label="Förväntat överskott / underskott"
              value={formatSEK(f.expectedSurplusDeficit)}
              highlight
            />
          </div>

          {f.minimumAthletesNeeded && (
            <div style={{ marginTop: "1rem" }}>
              <ProgressBar
                value={registeredCount}
                max={f.minimumAthletesNeeded}
                label="Anmälda vs. minsta antal"
                colorClass={
                  registeredCount >= f.minimumAthletesNeeded
                    ? "progress-fill-green"
                    : "progress-fill-orange"
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CostRow({ label, value, strong, highlight }) {
  return (
    <div
      className={`cost-row ${strong ? "cost-row-strong" : ""} ${highlight ? "cost-row-highlight" : ""}`}
    >
      <span className="cost-row-label">{label}</span>
      <span className="cost-row-value">{value}</span>
    </div>
  );
}
