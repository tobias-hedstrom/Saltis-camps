import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { formatDate } from "../utils/costCalculations";

const TYPE_COLORS = {
  deadline: "#e53e3e",
  payment:  "#d69e2e",
  camp:     "#3182ce",
  travel:   "#6b7280",
  meeting:  "#805ad5",
};

const TYPE_LABELS = {
  deadline: "Anmälan stänger",
  payment:  "Betalning",
  camp:     "Läger",
  travel:   "Resa",
  meeting:  "Möte",
};

export default function CalendarAgenda({ limit }) {
  const { calendarEvents } = useAppData();
  const events = calendarEvents();
  const visible = limit ? events.slice(0, limit) : events;

  if (visible.length === 0) {
    return <p className="empty-state">Inga kommande händelser.</p>;
  }

  return (
    <div className="agenda-list">
      {visible.map((ev, i) => {
        const color = TYPE_COLORS[ev.type] ?? "#4a5568";
        const typeLabel = TYPE_LABELS[ev.type] ?? ev.type;
        return (
          <div className="agenda-item" key={i}>
            <div className="agenda-date">{formatDate(ev.date)}</div>
            <div className="agenda-dot" style={{ background: color }} />
            <div className="agenda-content">
              <span className="agenda-type-tag" style={{ color, background: color + "18" }}>
                {typeLabel}
              </span>
              <span className="agenda-label">{ev.label}</span>
              {ev.campId && (
                <Link to={`/camps/${ev.campId}`} className="agenda-link">
                  Visa
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
