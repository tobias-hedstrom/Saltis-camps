import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/costCalculations";

export default function PaymentTable({ registrations }) {
  const { getCamp } = useAppData();

  if (!registrations || registrations.length === 0) {
    return <p className="empty-state">No registrations to show.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Athlete</th>
            <th>Camp</th>
            <th>Payment Status</th>
            <th>Registration Date</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => {
            const camp = getCamp(r.campId);
            return (
              <tr key={r.id}>
                <td>{r.athleteName}</td>
                <td>
                  {camp
                    ? <Link to={`/camps/${r.campId}`} className="table-link">{camp.name}</Link>
                    : <span className="text-muted">Camp removed</span>}
                </td>
                <td><StatusBadge status={r.paymentStatus} /></td>
                <td>{formatDate(r.registrationDate)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
