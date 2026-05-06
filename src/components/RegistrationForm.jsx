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
          <h2>Register for {camp.name}</h2>
          <p>
            You have no athletes added to your account. Please add a family member under{" "}
            <Link to="/my-page" onClick={onClose}>
              My Page
            </Link>{" "}
            first.
          </p>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-icon">✅</div>
          <h2>Registration Confirmed!</h2>
          <p>
            <strong>{selectedAthlete?.name}</strong> has been registered for{" "}
            <strong>{camp.name}</strong>.
          </p>
          <p>You will receive a confirmation email at {form.email}.</p>
          <button className="btn btn-primary" onClick={onClose}>
            Done
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
        <h2>Register for {camp.name}</h2>
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1. Athlete</div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2. Details</div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>3. Confirm</div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label>Select Athlete</label>
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
                  <div><strong>Age group:</strong> {selectedAthlete.ageGroup}</div>
                  <div><strong>Birth year:</strong> {selectedAthlete.birthYear}</div>
                  {selectedAthlete.allergies && (
                    <div><strong>Allergies:</strong> {selectedAthlete.allergies}</div>
                  )}
                </div>
              )}
              {!camp.ageGroups.includes(selectedAthlete?.ageGroup) && (
                <div className="alert alert-warning">
                  This athlete's age group ({selectedAthlete?.ageGroup}) may not be eligible for
                  this camp. Eligible age groups: {camp.ageGroups.join(", ")}.
                </div>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label>Parent / Guardian Name</label>
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
                <label>Email</label>
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
                <label>Phone</label>
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
                <label>Allergies / Special needs</label>
                <textarea
                  name="specialNotes"
                  value={form.specialNotes}
                  onChange={handleChange}
                  className="form-control"
                  rows={2}
                  placeholder="Leave blank if none"
                />
              </div>
              <div className="form-group">
                <label>Travel / Accommodation comments</label>
                <textarea
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  className="form-control"
                  rows={2}
                  placeholder="Any specific requests or notes"
                />
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3>Confirm Registration</h3>
              <div className="confirm-summary">
                <div><strong>Athlete:</strong> {selectedAthlete?.name} ({selectedAthlete?.ageGroup})</div>
                <div><strong>Camp:</strong> {camp.name}</div>
                <div><strong>Dates:</strong> {camp.startDate} – {camp.endDate}</div>
                <div><strong>Parent/Contact:</strong> {form.parentName}</div>
                <div><strong>Email:</strong> {form.email}</div>
                <div><strong>Phone:</strong> {form.phone}</div>
                {form.specialNotes && <div><strong>Special notes:</strong> {form.specialNotes}</div>}
                {form.comments && <div><strong>Comments:</strong> {form.comments}</div>}
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
                  I confirm that the information is correct and I accept the camp terms and cancellation policy.
                </label>
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={!form.agreeTerms}>
                  Submit Registration
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
