import { useState } from "react";
import { AGE_GROUPS } from "../data/initialData";

const emptyAthlete = {
  name: "",
  birthYear: "",
  ageGroup: "U12",
  allergies: "",
  medicalNotes: "",
  equipmentLevel: "Training",
  clubGroup: "",
};

export default function FamilyMemberForm({ athlete, onSave, onCancel }) {
  const [form, setForm] = useState(athlete ?? emptyAthlete);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, id: athlete?.id ?? `athlete-${Date.now()}` });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>✕</button>
        <h2>{athlete ? "Edit Athlete" : "Add Athlete"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Birth Year</label>
              <input name="birthYear" type="number" value={form.birthYear} onChange={handleChange} className="form-control" required min="2005" max="2020" />
            </div>
            <div className="form-group">
              <label>Age Group</label>
              <select name="ageGroup" value={form.ageGroup} onChange={handleChange} className="form-control">
                {AGE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Club Group</label>
              <input name="clubGroup" value={form.clubGroup} onChange={handleChange} className="form-control" placeholder="e.g. U14 Group A" />
            </div>
            <div className="form-group">
              <label>Equipment Level</label>
              <select name="equipmentLevel" value={form.equipmentLevel} onChange={handleChange} className="form-control">
                <option>Beginner</option>
                <option>Training</option>
                <option>Race</option>
              </select>
            </div>
            <div className="form-group span-2">
              <label>Allergies</label>
              <input name="allergies" value={form.allergies} onChange={handleChange} className="form-control" placeholder="None if empty" />
            </div>
            <div className="form-group span-2">
              <label>Medical Notes</label>
              <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange} className="form-control" rows={2} placeholder="Medications, conditions, etc." />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: "1rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Athlete</button>
          </div>
        </form>
      </div>
    </div>
  );
}
