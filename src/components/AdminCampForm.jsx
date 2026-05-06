import { useState } from "react";
import { AGE_GROUPS, DISCIPLINES } from "../data/initialData";
import { ThumbnailUpload, GalleryUpload } from "./ImageUpload";

const emptyCamp = {
  name: "",
  location: "",
  startDate: "",
  endDate: "",
  trainingDays: "",
  travelDateOut: "",
  travelDateHome: "",
  ageGroups: [],
  disciplines: [],
  coaches: "",
  maxAthletes: "",
  registrationDeadline: "",
  paymentDeadline: "",
  infoMeetingDate: "",
  description: "",
  travelInfo: "",
  accommodationInfo: "",
  packingList: "",
  status: "upcoming",
  thumbnailImage: null,
  images: [],
};

export default function AdminCampForm({ camp, onSave, onCancel }) {
  const initial = camp
    ? {
        ...camp,
        coaches: camp.coaches.join(", "),
        packingList: camp.packingList.join("\n"),
        thumbnailImage: camp.thumbnailImage ?? null,
        images: camp.images ?? [],
      }
    : emptyCamp;
  const [form, setForm] = useState(initial);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toggleMulti(field, value) {
    setForm((f) => {
      const arr = f[field] ?? [];
      return {
        ...f,
        [field]: arr.includes(value)
          ? arr.filter((x) => x !== value)
          : [...arr, value],
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      id: camp?.id ?? `camp-${Date.now()}`,
      coaches: form.coaches.split(",").map((s) => s.trim()).filter(Boolean),
      packingList: form.packingList.split("\n").map((s) => s.trim()).filter(Boolean),
      trainingDays: Number(form.trainingDays),
      maxAthletes: Number(form.maxAthletes),
      costs: camp?.costs ?? [],
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>x</button>
        <h2>{camp ? "Redigera läger" : "Lägg till läger"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Lägernamn</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group span-2">
              <label>Plats</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Startdatum</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Slutdatum</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Avresedatum</label>
              <input
                type="date"
                name="travelDateOut"
                value={form.travelDateOut}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Hemresedatum</label>
              <input
                type="date"
                name="travelDateHome"
                value={form.travelDateHome}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Träningsdagar</label>
              <input
                type="number"
                name="trainingDays"
                value={form.trainingDays}
                onChange={handleChange}
                className="form-control"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Max antal åkare</label>
              <input
                type="number"
                name="maxAthletes"
                value={form.maxAthletes}
                onChange={handleChange}
                className="form-control"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Sista anmälningsdag</label>
              <input
                type="date"
                name="registrationDeadline"
                value={form.registrationDeadline}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Sista betalningsdag</label>
              <input
                type="date"
                name="paymentDeadline"
                value={form.paymentDeadline}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Informationsmöte</label>
              <input
                type="date"
                name="infoMeetingDate"
                value={form.infoMeetingDate ?? ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Tränare (kommaseparerat)</label>
              <input
                name="coaches"
                value={form.coaches}
                onChange={handleChange}
                className="form-control"
                placeholder="Tränare A, Tränare B"
              />
            </div>

            <div className="form-group span-2">
              <label>Grupper</label>
              <div className="checkbox-row">
                {AGE_GROUPS.map((g) => (
                  <label key={g} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.ageGroups.includes(g)}
                      onChange={() => toggleMulti("ageGroups", g)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group span-2">
              <label>Discipliner</label>
              <div className="checkbox-row">
                {DISCIPLINES.map((d) => (
                  <label key={d} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.disciplines.includes(d)}
                      onChange={() => toggleMulti("disciplines", d)}
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group span-2">
              <label>Beskrivning</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
                rows={3}
              />
            </div>
            <div className="form-group span-2">
              <label>Reseinformation</label>
              <textarea
                name="travelInfo"
                value={form.travelInfo}
                onChange={handleChange}
                className="form-control"
                rows={2}
              />
            </div>
            <div className="form-group span-2">
              <label>Boendeinformation</label>
              <textarea
                name="accommodationInfo"
                value={form.accommodationInfo}
                onChange={handleChange}
                className="form-control"
                rows={2}
              />
            </div>
            <div className="form-group span-2">
              <label>Packlista (en rad per sak)</label>
              <textarea
                name="packingList"
                value={form.packingList}
                onChange={handleChange}
                className="form-control"
                rows={5}
              />
            </div>

            {/* Images */}
            <div className="form-group span-2">
              <ThumbnailUpload
                value={form.thumbnailImage}
                onChange={(url) => setForm((f) => ({ ...f, thumbnailImage: url }))}
                label="Lägerbild"
              />
            </div>
            <div className="form-group span-2">
              <label>Bildgalleri</label>
              <GalleryUpload
                images={form.images}
                onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Avbryt
            </button>
            <button type="submit" className="btn btn-primary">
              Spara läger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
