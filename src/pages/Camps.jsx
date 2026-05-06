import { useAppData } from "../hooks/useAppData";
import CampCard from "../components/CampCard";
import CalendarAgenda from "../components/CalendarAgenda";

export default function Camps() {
  const { camps } = useAppData();

  const sorted = [...camps].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="camps-page">
      <div className="page-header">
        <h1>Camps</h1>
        <p>Browse upcoming training camps, view details, and register your athlete.</p>
      </div>

      <section className="section">
        <h2>Upcoming Camps</h2>
        {sorted.length === 0 ? (
          <p className="empty-state">No camps have been added yet.</p>
        ) : (
          <div className="camps-grid">
            {sorted.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Camp Calendar</h2>
        <div className="card">
          <CalendarAgenda />
        </div>
      </section>
    </div>
  );
}
