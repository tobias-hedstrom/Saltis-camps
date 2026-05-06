import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { calculateCampFinancials, formatDate, daysUntil } from "../utils/costCalculations";
import CampCard from "../components/CampCard";
import CalendarAgenda from "../components/CalendarAgenda";
import StatusBadge from "../components/StatusBadge";

export default function Home() {
  const { camps, registeredCount } = useAppData();

  const sorted = [...camps].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const upcomingDeadlines = sorted
    .map((c) => ({ camp: c, days: daysUntil(c.registrationDeadline) }))
    .filter((x) => x.days !== null && x.days > 0)
    .sort((a, b) => a.days - b.days);

  const nextDeadline = upcomingDeadlines[0];

  const atRiskCamps = camps.filter((c) => {
    const f = calculateCampFinancials(c, registeredCount(c.id));
    return f.financialStatus === "at-risk";
  });

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">Saltsjöbadens SLK</div>
          <h1 className="hero-title">Training Camps</h1>
          <p className="hero-sub">
            Plan, register, and manage ski training camps for athletes in U10–U16.
          </p>
          <div className="hero-actions">
            <Link to="/camps" className="btn btn-primary btn-lg">View Camps</Link>
            <Link to="/my-page" className="btn btn-outline btn-lg">My Page</Link>
          </div>
        </div>
      </section>

      {/* Alert cards */}
      <div className="cards-row">
        {nextDeadline && (
          <div className="info-card info-card-deadline">
            <div className="info-card-indicator info-card-indicator-deadline">!</div>
            <div>
              <div className="info-card-label">Next Deadline</div>
              <div className="info-card-title">{nextDeadline.camp.name}</div>
              <div className="info-card-sub">
                Registration closes {formatDate(nextDeadline.camp.registrationDeadline)} —{" "}
                <strong>{nextDeadline.days} days left</strong>
              </div>
              <Link
                to={`/camps/${nextDeadline.camp.id}`}
                className="btn btn-sm btn-primary"
                style={{ marginTop: "0.5rem" }}
              >
                Register Now
              </Link>
            </div>
          </div>
        )}

        {atRiskCamps.length > 0 && (
          <div className="info-card info-card-warning">
            <div className="info-card-indicator info-card-indicator-warning">!</div>
            <div>
              <div className="info-card-label">Camp at Risk</div>
              <div className="info-card-title">{atRiskCamps[0].name}</div>
              <div className="info-card-sub">
                Needs more registrations to be financially viable.
              </div>
              <Link
                to={`/camps/${atRiskCamps[0].id}`}
                className="btn btn-sm btn-warning"
                style={{ marginTop: "0.5rem" }}
              >
                View Camp
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming camps */}
      <section className="section">
        <div className="section-header">
          <h2>Upcoming Camps</h2>
          <Link to="/camps" className="section-link">View all</Link>
        </div>
        <div className="camps-grid">
          {sorted.slice(0, 2).map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
        </div>
      </section>

      {/* Calendar */}
      <section className="section">
        <div className="section-header">
          <h2>Upcoming Dates</h2>
          <Link to="/camps" className="section-link">Full calendar</Link>
        </div>
        <div className="card">
          <CalendarAgenda limit={8} />
        </div>
      </section>

      {/* Status overview */}
      <section className="section">
        <h2>Camp Status Overview</h2>
        <div className="table-wrap card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Camp</th>
                <th>Dates</th>
                <th>Registered</th>
                <th>Reg. Deadline</th>
                <th>Financial Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((camp) => {
                const count = registeredCount(camp.id);
                const f = calculateCampFinancials(camp, count);
                return (
                  <tr key={camp.id}>
                    <td>
                      <Link to={`/camps/${camp.id}`} className="table-link">
                        {camp.name}
                      </Link>
                    </td>
                    <td>{formatDate(camp.startDate)}</td>
                    <td>{count}/{camp.maxAthletes}</td>
                    <td>{formatDate(camp.registrationDeadline)}</td>
                    <td><StatusBadge status={f.financialStatus} /></td>
                  </tr>
                );
              })}
              {camps.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">No camps added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
