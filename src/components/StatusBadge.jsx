export default function StatusBadge({ status }) {
  const map = {
    viable: { label: "Financially Viable", cls: "badge-viable" },
    "at-risk": { label: "At Risk", cls: "badge-risk" },
    "not-viable": { label: "Not Viable", cls: "badge-not-viable" },
    full: { label: "Full", cls: "badge-full" },
    closed: { label: "Closed", cls: "badge-closed" },
    unknown: { label: "Pending", cls: "badge-pending" },
    upcoming: { label: "Upcoming", cls: "badge-upcoming" },
    confirmed: { label: "Confirmed", cls: "badge-viable" },
    paid: { label: "Paid", cls: "badge-viable" },
    pending: { label: "Pending", cls: "badge-pending" },
    overdue: { label: "Overdue", cls: "badge-risk" },
  };
  const entry = map[status] ?? { label: status, cls: "badge-pending" };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
}
