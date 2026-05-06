import { calculateCampFinancials, formatSEK } from "./costCalculations";

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(...cells) {
  return cells.map(escapeCsv).join(",") + "\n";
}

function campFinancialRows(camp, campRegs) {
  const f = calculateCampFinancials(camp, campRegs.length);
  let csv = "";
  csv += row("FINANCIAL SUMMARY");
  csv += row("Total fixed cost", formatSEK(f.totalFixedCost));
  csv += row("Variable cost per athlete", formatSEK(f.variableCostPerAthlete));
  csv += row("Total variable cost", formatSEK(f.totalVariableCost));
  csv += row("Total cost", formatSEK(f.totalCost));
  csv += row("Actual cost per athlete", formatSEK(f.actualCostPerAthlete));
  csv += row("Actual cost per athlete per day", formatSEK(f.actualCostPerAthletePerDay));
  csv += row("Target price per day (board policy)", formatSEK(f.targetPricePerDay));
  csv += row("Displayed parent price per day", formatSEK(f.displayedPricePerDay));
  csv += row("Displayed total parent price", formatSEK(f.displayedTotalPricePerAthlete));
  csv += row("Minimum athletes needed for target", f.minimumAthletesNeeded ?? "—");
  csv += row("Additional athletes needed", f.additionalAthletesNeeded ?? "—");
  csv += row("Financial status", f.financialStatus);
  csv += row("Expected revenue", formatSEK(f.expectedRevenue));
  csv += row("Expected surplus / deficit", formatSEK(f.expectedSurplusDeficit));
  csv += "\n";
  return csv;
}

function campOverviewRows(camp, campRegs) {
  let csv = "";
  csv += row("CAMP OVERVIEW");
  csv += row("Camp name", camp.name);
  csv += row("Location", camp.location);
  csv += row("Start date", camp.startDate);
  csv += row("End date", camp.endDate);
  csv += row("Training days", camp.trainingDays);
  csv += row("Age groups", camp.ageGroups.join(", "));
  csv += row("Disciplines", camp.disciplines.join(", "));
  csv += row("Coaches", camp.coaches.join(", "));
  csv += row("Registered athletes", campRegs.length);
  csv += row("Max athletes", camp.maxAthletes);
  csv += row("Registration deadline", camp.registrationDeadline);
  csv += row("Payment deadline", camp.paymentDeadline);
  csv += "\n";
  return csv;
}

function campCostBreakdownRows(camp) {
  let csv = "";
  csv += row("COST BREAKDOWN");
  csv += row("Name", "Category", "Amount (SEK)", "Type", "Notes");
  camp.costs.forEach((c) => {
    csv += row(c.name, c.category, c.amount, c.isFixed ? "Fixed" : "Variable", c.notes);
  });
  csv += "\n";
  return csv;
}

function campRegistrationRows(campRegs) {
  let csv = "";
  csv += row("REGISTERED ATHLETES");
  csv += row(
    "Athlete name",
    "Age group",
    "Parent / guardian",
    "Email",
    "Phone",
    "Registration date",
    "Payment status",
    "Comments",
    "Special notes"
  );
  campRegs.forEach((r) => {
    csv += row(
      r.athleteName,
      r.ageGroup,
      r.parentName,
      r.email,
      r.phone,
      r.registrationDate,
      r.paymentStatus,
      r.comments,
      r.specialNotes
    );
  });
  csv += "\n";
  return csv;
}

function triggerDownload(filename, csv) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Export a single camp to CSV */
export function exportSingleCamp(camp, allRegistrations) {
  const campRegs = allRegistrations.filter((r) => r.campId === camp.id);
  let csv = "";
  csv += campOverviewRows(camp, campRegs);
  csv += campFinancialRows(camp, campRegs);
  csv += campCostBreakdownRows(camp);
  csv += campRegistrationRows(campRegs);

  const safeName = camp.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  triggerDownload(`saltis-camp-${safeName}-${camp.startDate}.csv`, csv);
}

/** Export all camps in a single CSV (board overview) */
export function exportBoardCsv(camps, allRegistrations) {
  let csv = "";
  camps.forEach((camp) => {
    const campRegs = allRegistrations.filter((r) => r.campId === camp.id);
    csv += campOverviewRows(camp, campRegs);
    csv += campFinancialRows(camp, campRegs);
    csv += campCostBreakdownRows(camp);
    csv += campRegistrationRows(campRegs);
    csv += "\n";
  });
  triggerDownload(
    `saltis-ski-club-board-export-${new Date().toISOString().slice(0, 10)}.csv`,
    csv
  );
}
