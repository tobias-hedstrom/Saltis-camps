import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/costCalculations";

export default function PaymentTable({ registrations }) {
  const { getCamp } = useAppData();

  if (!registrations || registrations.length === 0) {
    return <p className="empty-state">Inga anmälningar att visa.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Åkare</th>
            <th>Läger</th>
            <th>Betalningsstatus</th>
            <th>Anmäld</th>
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
                    : <span className="text-muted">Lägret borttaget</span>}
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
