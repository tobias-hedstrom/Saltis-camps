import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegistrationForm({ camp, athletes, user, onSubmit, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedAthleteId, setSelectedAthleteId] = useState(athletes[0]?.id ?? "");
  const [form, setForm] = useState({
    parentName: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    comments: "",
    specialNotes: "",
    agreeTerms: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.agreeTerms) return;
    onSubmit({
      athleteId: selectedAthleteId,
      athleteName: selectedAthlete?.name,
      campId: camp.id,
      campName: camp.name,
      ageGroup: selectedAthlete?.ageGroup,
      ...form,
    });
    setSubmitted(true);
  }

  if (athletes.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>Anmälan till {camp.name}</h2>
          <p>
            Du har inga åkare tillagda på kontot. Lägg först till en familjemedlem under{" "}
            <Link to="/my-page" onClick={onClose}>
              Min sida
            </Link>{" "}
          </p>
          <button className="btn btn-secondary" onClick={onClose}>
            Stäng
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-icon" aria-hidden="true" />
          <h2>Anmälan bekräftad</h2>
          <p>
            <strong>{selectedAthlete?.name}</strong> är anmäld till{" "}
            <strong>{camp.name}</strong>.
          </p>
          <p>Bekräftelse visas på Min sida.</p>
          <button className="btn btn-primary" onClick={onClose}>
            Klart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>Anmälan till {camp.name}</h2>
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1. Åkare</div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2. Uppgifter</div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>3. Bekräfta</div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label>Välj åkare</label>
                <select
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  className="form-control"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.ageGroup})
                    </option>
                  ))}
                </select>
              </div>
              {selectedAthlete && (
                <div className="athlete-preview">
                  <div><strong>Grupp:</strong> {selectedAthlete.ageGroup}</div>
                  <div><strong>Födelseår:</strong> {selectedAthlete.birthYear}</div>
                  {selectedAthlete.allergies && (
                    <div><strong>Allergier:</strong> {selectedAthlete.allergies}</div>
                  )}
                </div>
              )}
              {!camp.ageGroups.includes(selectedAthlete?.ageGroup) && (
                <div className="alert alert-warning">
                  Den här gruppen ({selectedAthlete?.ageGroup}) matchar inte lägrets angivna grupper: {camp.ageGroups.join(", ")}.
                </div>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                Nästa
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label>Förälder / vårdnadshavare</label>
                <input
                  type="text"
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>E-post</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Allergier / särskilda behov</label>
                <textarea
                  name="specialNotes"
                  value={form.specialNotes}
                  onChange={handleChange}
                  className="form-control"
                  rows={2}
                  placeholder="Lämna tomt om inget"
                />
              </div>
              <div className="form-group">
                <label>Kommentar om resa / boende</label>
                <textarea
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  className="form-control"
                  rows={2}
                  placeholder="Eventuella önskemål eller anteckningar"
                />
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  Tillbaka
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                  Nästa
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3>Bekräfta anmälan</h3>
              <div className="confirm-summary">
                <div><strong>Åkare:</strong> {selectedAthlete?.name} ({selectedAthlete?.ageGroup})</div>
                <div><strong>Läger:</strong> {camp.name}</div>
                <div><strong>Datum:</strong> {camp.startDate} - {camp.endDate}</div>
                <div><strong>Kontakt:</strong> {form.parentName}</div>
                <div><strong>E-post:</strong> {form.email}</div>
                <div><strong>Telefon:</strong> {form.phone}</div>
                {form.specialNotes && <div><strong>Särskilda anteckningar:</strong> {form.specialNotes}</div>}
                {form.comments && <div><strong>Kommentar:</strong> {form.comments}</div>}
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeTerms">
                  Jag bekräftar att uppgifterna stämmer och accepterar lägrets villkor och avbokningsregler.
                </label>
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                  Tillbaka
                </button>
                <button type="submit" className="btn btn-primary" disabled={!form.agreeTerms}>
                  Skicka anmälan
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
