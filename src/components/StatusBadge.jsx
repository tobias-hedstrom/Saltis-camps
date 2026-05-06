export default function StatusBadge({ status }) {
  const map = {
    viable: { label: "Ekonomiskt genomförbart", cls: "badge-viable" },
    "needs-target": { label: "Målpris ej uppnått", cls: "badge-risk" },
    "at-risk": { label: "Målpris ej uppnått", cls: "badge-risk" },
    "not-viable": { label: "Ej genomförbart", cls: "badge-not-viable" },
    full: { label: "Fullt", cls: "badge-full" },
    completed: { label: "Genomfört", cls: "badge-completed" },
    canceled: { label: "Inställt", cls: "badge-canceled" },
    closed: { label: "Stängd", cls: "badge-closed" },
    unknown: { label: "Inväntar", cls: "badge-pending" },
    upcoming: { label: "Kommande", cls: "badge-upcoming" },
    confirmed: { label: "Bekräftad", cls: "badge-viable" },
    paid: { label: "Betald", cls: "badge-viable" },
    pending: { label: "Kommande", cls: "badge-pending" },
    overdue: { label: "Saknas", cls: "badge-risk" },
  };
  const entry = map[status] ?? { label: status, cls: "badge-pending" };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
}
