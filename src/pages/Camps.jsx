import { useState } from "react";
import { useAppData } from "../hooks/useAppData";
import CampCard from "../components/CampCard";
import CalendarAgenda from "../components/CalendarAgenda";
import { AGE_GROUPS } from "../data/initialData";
import { calculateCampFinancials, getCampDisplayStatus, daysUntil } from "../utils/costCalculations";

export default function Camps() {
  const { camps, registeredCount } = useAppData();
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const [ageFilter, setAgeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const sorted = [...camps]
    .filter((camp) => {
      const startsIn = daysUntil(camp.startDate);
      if (timeFilter === "upcoming" && startsIn !== null && startsIn < 0) return false;
      if (timeFilter === "past" && (startsIn === null || startsIn >= 0)) return false;
      if (ageFilter !== "all" && !camp.ageGroups.includes(ageFilter)) return false;
      if (statusFilter !== "all") {
        const f = calculateCampFinancials(camp, registeredCount(camp.id));
        if (getCampDisplayStatus(camp, f) !== statusFilter) return false;
      }
      return true;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="camps-page">
      <div className="page-header">
        <h1>Läger</h1>
        <p>Bläddra bland kommande träningsläger, se detaljer och anmäl åkare.</p>
      </div>

      <div className="filter-panel">
        <div className="segmented-control" aria-label="Filtrera på tid">
          <button className={timeFilter === "upcoming" ? "active" : ""} onClick={() => setTimeFilter("upcoming")}>Kommande</button>
          <button className={timeFilter === "all" ? "active" : ""} onClick={() => setTimeFilter("all")}>Alla</button>
          <button className={timeFilter === "past" ? "active" : ""} onClick={() => setTimeFilter("past")}>Tidigare</button>
        </div>
        <select className="form-control compact-select" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} aria-label="Filtrera på grupp">
          <option value="all">Alla grupper</option>
          {AGE_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
        </select>
        <select className="form-control compact-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrera på status">
          <option value="all">Alla statusar</option>
          <option value="viable">Ekonomiskt genomförbart</option>
          <option value="needs-target">Målpris ej uppnått</option>
          <option value="completed">Genomfört</option>
          <option value="canceled">Inställt</option>
        </select>
      </div>

      <section className="section">
        <h2>Kommande läger</h2>
        {sorted.length === 0 ? (
          <p className="empty-state">Inga läger har lagts till ännu.</p>
        ) : (
          <div className="camps-grid">
            {sorted.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Kommande datum och deadlines</h2>
        <div className="card">
          <CalendarAgenda />
        </div>
      </section>
    </div>
  );
}
