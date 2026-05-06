import { calculateCampFinancials, formatSEK } from "../utils/costCalculations";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

export default function CostSummary({ camp, registeredCount, adminView = false }) {
  const f = calculateCampFinancials(camp, registeredCount);

  return (
    <div className="cost-summary card">
      <div className="cost-summary-header">
        <h3>Cost Summary</h3>
        <StatusBadge status={f.financialStatus} />
      </div>

      {/* Parent-facing price (always shown) */}
      <div className="price-display-block">
        <div className="price-display-row">
          <span className="price-display-label">Price per athlete</span>
          <span className="price-display-value">
            {f.displayedTotalPricePerAthlete !== null
              ? formatSEK(Math.round(f.displayedTotalPricePerAthlete))
              : formatSEK(f.targetTotalPricePerAthlete)}
          </span>
        </div>
        <div className="price-display-row">
          <span className="price-display-label">Per day</span>
          <span className="price-display-value price-per-day">
            {formatSEK(Math.round(f.displayedPricePerDay))} / day
          </span>
        </div>
        {f.targetPricePerDay && (
          <div className="price-display-row price-target-row">
            <span className="price-display-label">Target (board policy)</span>
            <span className="price-display-note">{formatSEK(f.targetPricePerDay)} / day</span>
          </div>
        )}
      </div>

      {/* Price warning when above target */}
      {registeredCount === 0 && (
        <div className="alert alert-warning" style={{ marginTop: "0.75rem" }}>
          No registrations yet. Target price: {formatSEK(f.targetPricePerDay)}/day.
        </div>
      )}

      {registeredCount > 0 &&
        f.actualCostPerAthletePerDay !== null &&
        f.actualCostPerAthletePerDay > f.targetPricePerDay && (
          <div className="alert alert-warning" style={{ marginTop: "0.75rem" }}>
            Current cost is above the {formatSEK(f.targetPricePerDay)}/day target. Showing
            target price to families.
            {f.additionalAthletesNeeded !== null && f.additionalAthletesNeeded > 0 && (
              <>
                {" "}We need{" "}
                <strong>
                  {f.additionalAthletesNeeded} more athlete
                  {f.additionalAthletesNeeded !== 1 ? "s" : ""}
                </strong>{" "}
                to reach the target price.
              </>
            )}
          </div>
        )}

      {!f.canBeViable && (
        <div className="alert alert-danger" style={{ marginTop: "0.75rem" }}>
          This camp cannot reach the {formatSEK(f.targetPricePerDay)}/day target under the
          current cost structure. Variable costs alone exceed the target.
        </div>
      )}

      {/* Admin-only detail breakdown */}
      {adminView && (
        <>
          <div className="cost-divider" style={{ margin: "1rem 0" }} />
          <div className="cost-grid">
            <CostRow label="Total fixed cost" value={formatSEK(f.totalFixedCost)} />
            <CostRow label="Variable cost / athlete" value={formatSEK(f.variableCostPerAthlete)} />
            <CostRow label="Total cost" value={formatSEK(f.totalCost)} strong />
            <div className="cost-divider" />
            <CostRow
              label="Actual price / athlete"
              value={f.actualCostPerAthlete !== null ? formatSEK(Math.round(f.actualCostPerAthlete)) : "—"}
              highlight
            />
            <CostRow
              label="Actual price / athlete / day"
              value={
                f.actualCostPerAthletePerDay !== null
                  ? formatSEK(Math.round(f.actualCostPerAthletePerDay))
                  : "—"
              }
            />
            <div className="cost-divider" />
            <CostRow
              label="Min. athletes for target"
              value={f.canBeViable ? (f.minimumAthletesNeeded ?? "—") : "Cannot be viable"}
            />
            <CostRow
              label="Additional athletes needed"
              value={
                f.canBeViable
                  ? f.additionalAthletesNeeded === 0
                    ? "None — viable"
                    : (f.additionalAthletesNeeded ?? "—")
                  : "—"
              }
            />
            <div className="cost-divider" />
            <CostRow label="Expected revenue" value={formatSEK(f.expectedRevenue)} />
            <CostRow
              label="Expected surplus / deficit"
              value={formatSEK(f.expectedSurplusDeficit)}
              highlight
            />
          </div>

          {f.minimumAthletesNeeded && (
            <div style={{ marginTop: "1rem" }}>
              <ProgressBar
                value={registeredCount}
                max={f.minimumAthletesNeeded}
                label="Registered vs. minimum needed"
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
