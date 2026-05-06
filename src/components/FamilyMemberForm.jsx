import { useState } from "react";
import { AGE_GROUPS } from "../data/initialData";

const emptyAthlete = {
  name: "",
  birthYear: "",
  ageGroup: "U12",
  allergies: "",
  medicalNotes: "",
  equipmentLevel: "Träning",
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
        <h2>{athlete ? "Redigera åkare" : "Lägg till åkare"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Namn</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Födelseår</label>
              <input name="birthYear" type="number" value={form.birthYear} onChange={handleChange} className="form-control" required min="2005" max="2020" />
            </div>
            <div className="form-group">
              <label>Grupp</label>
              <select name="ageGroup" value={form.ageGroup} onChange={handleChange} className="form-control">
                {AGE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Klubbgrupp</label>
              <input name="clubGroup" value={form.clubGroup} onChange={handleChange} className="form-control" placeholder="t.ex. U14 Grupp A" />
            </div>
            <div className="form-group">
              <label>Nivå</label>
              <select name="equipmentLevel" value={form.equipmentLevel} onChange={handleChange} className="form-control">
                <option>Nybörjare</option>
                <option>Träning</option>
                <option>Tävling</option>
              </select>
            </div>
            <div className="form-group span-2">
              <label>Allergier</label>
              <input name="allergies" value={form.allergies} onChange={handleChange} className="form-control" placeholder="Lämna tomt om inga" />
            </div>
            <div className="form-group span-2">
              <label>Medicinska anteckningar</label>
              <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange} className="form-control" rows={2} placeholder="Mediciner, skador eller annat viktigt." />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: "1rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Avbryt</button>
            <button type="submit" className="btn btn-primary">Spara åkare</button>
          </div>
        </form>
      </div>
    </div>
  );
}
