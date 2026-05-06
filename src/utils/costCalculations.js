export const TARGET_PRICE_PER_DAY = 800; // SEK — board policy maximum

export function calculateCampFinancials(camp, registeredCount) {
  const { costs, trainingDays, maxAthletes } = camp;

  const totalFixedCost = costs
    .filter((c) => c.isFixed)
    .reduce((sum, c) => sum + c.amount, 0);

  const variableCostPerAthlete = costs
    .filter((c) => !c.isFixed)
    .reduce((sum, c) => sum + c.amount, 0);

  const totalVariableCost = variableCostPerAthlete * registeredCount;
  const totalCost = totalFixedCost + totalVariableCost;

  // Maximum total price per athlete at the 800 SEK/day board policy
  const targetTotalPricePerAthlete = trainingDays * TARGET_PRICE_PER_DAY;

  // Room per athlete after variable costs are covered
  const margin = targetTotalPricePerAthlete - variableCostPerAthlete;

  // Minimum athletes needed so that fixed cost per athlete ≤ margin
  let minimumAthletesNeeded = null;
  let canBeViable = true;
  if (margin <= 0) {
    // Variable cost alone exceeds target — no number of athletes can fix this
    canBeViable = false;
  } else {
    minimumAthletesNeeded = Math.ceil(totalFixedCost / margin);
  }

  const additionalAthletesNeeded =
    minimumAthletesNeeded !== null
      ? Math.max(0, minimumAthletesNeeded - registeredCount)
      : null;

  // Actual per-athlete cost (only meaningful when at least 1 athlete is registered)
  let fixedCostPerAthlete = null;
  let actualCostPerAthlete = null;
  let actualCostPerAthletePerDay = null;
  if (registeredCount > 0) {
    fixedCostPerAthlete = totalFixedCost / registeredCount;
    actualCostPerAthlete = fixedCostPerAthlete + variableCostPerAthlete;
    actualCostPerAthletePerDay = actualCostPerAthlete / trainingDays;
  }

  // Parent-facing displayed price — capped at 800 SEK/day until the camp becomes viable
  let displayedPricePerDay = TARGET_PRICE_PER_DAY;
  let displayedTotalPricePerAthlete = targetTotalPricePerAthlete;
  if (actualCostPerAthletePerDay !== null && actualCostPerAthletePerDay <= TARGET_PRICE_PER_DAY) {
    displayedPricePerDay = actualCostPerAthletePerDay;
    displayedTotalPricePerAthlete = actualCostPerAthlete;
  }

  // Revenue and surplus/deficit calculated against actual cost
  const expectedRevenue =
    actualCostPerAthlete !== null ? actualCostPerAthlete * registeredCount : 0;
  const expectedSurplusDeficit =
    registeredCount > 0 ? expectedRevenue - totalCost : -totalFixedCost;

  // Financial status
  let financialStatus = "unknown";
  if (!canBeViable) {
    financialStatus = "not-viable";
  } else if (registeredCount >= maxAthletes) {
    financialStatus = "full";
  } else if (
    actualCostPerAthlete !== null &&
    actualCostPerAthlete <= targetTotalPricePerAthlete &&
    registeredCount >= (minimumAthletesNeeded ?? Infinity)
  ) {
    financialStatus = "viable";
  } else {
    financialStatus = "at-risk"; // covers both zero registrations and not-yet-viable
  }

  return {
    // Raw cost figures
    totalFixedCost,
    variableCostPerAthlete,
    totalVariableCost,
    totalCost,
    fixedCostPerAthlete,

    // Actual per-athlete cost (admin view)
    actualCostPerAthlete,
    actualCostPerAthletePerDay,

    // Parent-facing displayed price
    displayedPricePerDay,
    displayedTotalPricePerAthlete,

    // Target (board policy)
    targetPricePerDay: TARGET_PRICE_PER_DAY,
    targetTotalPricePerAthlete,

    // Viability
    canBeViable,
    minimumAthletesNeeded,
    additionalAthletesNeeded,
    financialStatus,

    // Revenue projection
    expectedRevenue,
    expectedSurplusDeficit,

    // Convenience aliases (backward compat)
    registeredCount,
    maxAthletes,
    maxAcceptablePricePerAthlete: targetTotalPricePerAthlete,
    estimatedCostPerAthlete: actualCostPerAthlete,
    estimatedCostPerAthletePerDay: actualCostPerAthletePerDay,
  };
}

export function formatSEK(amount) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
