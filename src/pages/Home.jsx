import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { formatDate, daysUntil } from "../utils/costCalculations";
import CampCard from "../components/CampCard";
import CalendarAgenda from "../components/CalendarAgenda";

export default function Home() {
  const { camps, isLoggedIn, myRegistrations } = useAppData();

  const sorted = [...camps].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const upcoming = sorted.filter((c) => daysUntil(c.startDate) === null || daysUntil(c.startDate) >= -1);
  const campsById = new Map(camps.map((camp) => [camp.id, camp]));
  const upcomingForUser = myRegistrations()
    .map((registration) => ({ registration, camp: campsById.get(registration.campId) }))
    .filter(({ camp }) => camp && (daysUntil(camp.startDate) === null || daysUntil(camp.startDate) >= -1))
    .sort((a, b) => a.camp.startDate.localeCompare(b.camp.startDate));

  return (
    <div className="home-page">
      <section className="hero">
        <img src="/images/solden.jpg" alt="" className="hero-bg" />
        <div className="hero-content">
          <div className="hero-eyebrow">Saltsjöbadens SLK</div>
          <h1 className="hero-title">Läger, träning och gemenskap på snö</h1>
          <p className="hero-sub">
            En tydlig plats för klubbens läger, anmälningar, nyheter och viktiga datum.
          </p>
          <div className="hero-actions">
            <Link to="/camps" className="btn btn-primary btn-lg">Visa läger</Link>
            <Link to="/news" className="btn btn-outline btn-lg">Nyheter</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Kommande för dig</h2>
          <Link to="/my-page" className="section-link">Min sida</Link>
        </div>
        <div className="upcoming-list card">
          {upcomingForUser.map(({ camp, registration }) => (
            <Link to={`/camps/${camp.id}`} className="upcoming-list-row" key={registration.id}>
              <div className="upcoming-list-main">
                <strong>{camp.name}</strong>
                <span>{camp.location}</span>
                <span>Åkare: {registration.athleteName}</span>
              </div>
              <div className="upcoming-list-meta">
                <span>{formatDate(camp.startDate)} - {formatDate(camp.endDate)}</span>
                <span>Sista anmälan {formatDate(camp.registrationDeadline)}</span>
              </div>
            </Link>
          ))}
          {upcomingForUser.length === 0 && (
            <p className="empty-state compact">
              {isLoggedIn
                ? "Du har inga kommande lägeranmälningar just nu."
                : "Logga in för att se kommande läger för dina åkare."}
            </p>
          )}
        </div>
      </section>

      {/* Upcoming camps */}
      <section className="section">
        <div className="section-header">
          <h2>Kommande läger</h2>
          <Link to="/camps" className="section-link">Se alla</Link>
        </div>
        <div className="camps-carousel">
          {upcoming.slice(0, 4).map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
        </div>
      </section>
      {/* Calendar */}
      <section className="section">
        <div className="section-header">
          <h2>Kommande datum och deadlines</h2>
          <Link to="/camps" className="section-link">Alla datum</Link>
        </div>
        <div className="card">
          <CalendarAgenda limit={8} />
        </div>
      </section>

    </div>
  );
}
