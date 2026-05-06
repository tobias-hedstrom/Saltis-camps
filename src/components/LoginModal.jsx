import { useState } from "react";
import { useAppData } from "../hooks/useAppData";
import { AGE_GROUPS } from "../data/initialData";

const EQUIPMENT_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

const emptyChild = () => ({
  name: "",
  birthYear: "",
  ageGroup: AGE_GROUPS[0] ?? "U10",
  allergies: "",
  medicalNotes: "",
  equipmentLevel: "Intermediate",
});

export default function LoginModal({ onClose }) {
  const { login, createAccount } = useAppData();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setForm({ name: "", email: "", password: "" });
    setChildren([]);
  }

  function addChild() {
    setChildren((prev) => [...prev, emptyChild()]);
  }

  function removeChild(i) {
    setChildren((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateChild(i, field, value) {
    setChildren((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );
  }

  function handleLogin(e) {
    e.preventDefault();
    const ok = login(form.email, form.password);
    if (ok) {
      onClose();
    } else {
      setError("Incorrect email or password.");
    }
  }

  function handleCreate(e) {
    e.preventDefault();
    const ok = createAccount({
      name: form.name,
      email: form.email,
      password: form.password,
      children: children.map((c) => ({
        ...c,
        birthYear: Number(c.birthYear) || new Date().getFullYear() - 12,
      })),
    });
    if (ok) {
      onClose();
    } else {
      setError("An account with this email already exists.");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>x</button>

        <div className="tabs" style={{ marginBottom: "1.5rem" }}>
          <button
            className={`tab-btn ${mode === "login" ? "tab-btn-active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Log In
          </button>
          <button
            className={`tab-btn ${mode === "create" ? "tab-btn-active" : ""}`}
            onClick={() => switchMode("create")}
          >
            Create Account
          </button>
        </div>

        {mode === "login" ? (
          <>
            <h2>Log In</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && (
                <div className="alert alert-danger" style={{ marginTop: "1rem" }}>
                  {error}
                </div>
              )}
              <div className="form-row" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Log In
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2>Create Account</h2>
            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group span-2">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Children / athletes section */}
              <div style={{ marginTop: "1.5rem" }}>
                <div className="tab-section-header" style={{ marginBottom: "0.75rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Athletes (optional)</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addChild}>
                    + Add Athlete
                  </button>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginBottom: "0.75rem" }}>
                  Add your children now so they appear immediately when registering for camps.
                </p>

                {children.map((child, i) => (
                  <div key={i} className="child-form-block card" style={{ marginBottom: "1rem", padding: "1rem" }}>
                    <div className="tab-section-header" style={{ marginBottom: "0.75rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Athlete {i + 1}</span>
                      <button
                        type="button"
                        className="btn-link btn-link-danger"
                        onClick={() => removeChild(i)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label-sm">Name</label>
                        <input
                          className="form-control"
                          value={child.name}
                          onChange={(e) => updateChild(i, "name", e.target.value)}
                          required
                          placeholder="Athlete name"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-sm">Birth Year</label>
                        <input
                          type="number"
                          className="form-control"
                          value={child.birthYear}
                          onChange={(e) => updateChild(i, "birthYear", e.target.value)}
                          required
                          min={2000}
                          max={new Date().getFullYear()}
                          placeholder="e.g. 2013"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-sm">Age Group</label>
                        <select
                          className="form-control"
                          value={child.ageGroup}
                          onChange={(e) => updateChild(i, "ageGroup", e.target.value)}
                        >
                          {AGE_GROUPS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label-sm">Equipment Level</label>
                        <select
                          className="form-control"
                          value={child.equipmentLevel}
                          onChange={(e) => updateChild(i, "equipmentLevel", e.target.value)}
                        >
                          {EQUIPMENT_LEVELS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label-sm">Allergies</label>
                        <input
                          className="form-control"
                          value={child.allergies}
                          onChange={(e) => updateChild(i, "allergies", e.target.value)}
                          placeholder="None"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-sm">Medical Notes</label>
                        <input
                          className="form-control"
                          value={child.medicalNotes}
                          onChange={(e) => updateChild(i, "medicalNotes", e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="alert alert-danger" style={{ marginTop: "1rem" }}>
                  {error}
                </div>
              )}
              <div className="form-row" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
