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
  csv += row("EKONOMISK SAMMANSTÄLLNING");
  csv += row("Total fast kostnad", formatSEK(f.totalFixedCost));
  csv += row("Rörlig kostnad per åkare", formatSEK(f.variableCostPerAthlete));
  csv += row("Total rörlig kostnad", formatSEK(f.totalVariableCost));
  csv += row("Total kostnad", formatSEK(f.totalCost));
  csv += row("Faktisk kostnad per åkare", formatSEK(f.actualCostPerAthlete));
  csv += row("Faktisk kostnad per åkare och dag", formatSEK(f.actualCostPerAthletePerDay));
  csv += row("Målpris per dag", formatSEK(f.targetPricePerDay));
  csv += row("Visat pris per dag", formatSEK(f.displayedPricePerDay));
  csv += row("Visat totalpris per åkare", formatSEK(f.displayedTotalPricePerAthlete));
  csv += row("Minsta antal åkare för målpris", f.minimumAthletesNeeded ?? "—");
  csv += row("Fler åkare behövs", f.additionalAthletesNeeded ?? "—");
  csv += row("Ekonomisk status", f.financialStatus);
  csv += row("Förväntad intäkt", formatSEK(f.expectedRevenue));
  csv += row("Förväntat överskott / underskott", formatSEK(f.expectedSurplusDeficit));
  csv += "\n";
  return csv;
}

function campOverviewRows(camp, campRegs) {
  let csv = "";
  csv += row("LÄGERÖVERSIKT");
  csv += row("Lägernamn", camp.name);
  csv += row("Plats", camp.location);
  csv += row("Startdatum", camp.startDate);
  csv += row("Slutdatum", camp.endDate);
  csv += row("Träningsdagar", camp.trainingDays);
  csv += row("Grupper", camp.ageGroups.join(", "));
  csv += row("Discipliner", camp.disciplines.join(", "));
  csv += row("Tränare", camp.coaches.join(", "));
  csv += row("Anmälda åkare", campRegs.length);
  csv += row("Max antal åkare", camp.maxAthletes);
  csv += row("Sista anmälningsdag", camp.registrationDeadline);
  csv += row("Sista betalningsdag", camp.paymentDeadline);
  csv += "\n";
  return csv;
}

function campCostBreakdownRows(camp) {
  let csv = "";
  csv += row("KOSTNADSSTRUKTUR");
  csv += row("Namn", "Kategori", "Belopp (SEK)", "Typ", "Anteckningar");
  camp.costs.forEach((c) => {
    csv += row(c.name, c.category, c.amount, c.isFixed ? "Fast" : "Rörlig", c.notes);
  });
  csv += "\n";
  return csv;
}

function campRegistrationRows(campRegs) {
  let csv = "";
  csv += row("ANMÄLDA ÅKARE");
  csv += row(
    "Åkarens namn",
    "Grupp",
    "Förälder / vårdnadshavare",
    "E-post",
    "Telefon",
    "Anmälningsdatum",
    "Betalningsstatus",
    "Kommentarer",
    "Särskilda anteckningar"
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
