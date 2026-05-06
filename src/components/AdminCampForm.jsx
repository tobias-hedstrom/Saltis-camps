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
        <h2>{camp ? "Edit Camp" : "Add Camp"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Camp Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group span-2">
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Start Date</label>
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
              <label>End Date</label>
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
              <label>Travel Date Out</label>
              <input
                type="date"
                name="travelDateOut"
                value={form.travelDateOut}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Travel Date Home</label>
              <input
                type="date"
                name="travelDateHome"
                value={form.travelDateHome}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Training Days</label>
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
              <label>Max Athletes</label>
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
              <label>Registration Deadline</label>
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
              <label>Payment Deadline</label>
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
              <label>Info Meeting Date</label>
              <input
                type="date"
                name="infoMeetingDate"
                value={form.infoMeetingDate ?? ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Coaches (comma-separated)</label>
              <input
                name="coaches"
                value={form.coaches}
                onChange={handleChange}
                className="form-control"
                placeholder="Coach A, Coach B"
              />
            </div>

            <div className="form-group span-2">
              <label>Age Groups</label>
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
              <label>Disciplines</label>
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
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
                rows={3}
              />
            </div>
            <div className="form-group span-2">
              <label>Travel Information</label>
              <textarea
                name="travelInfo"
                value={form.travelInfo}
                onChange={handleChange}
                className="form-control"
                rows={2}
              />
            </div>
            <div className="form-group span-2">
              <label>Accommodation Information</label>
              <textarea
                name="accommodationInfo"
                value={form.accommodationInfo}
                onChange={handleChange}
                className="form-control"
                rows={2}
              />
            </div>
            <div className="form-group span-2">
              <label>Packing List (one item per line)</label>
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
                label="Camp Thumbnail Image"
              />
            </div>
            <div className="form-group span-2">
              <label>Camp Gallery Images</label>
              <GalleryUpload
                images={form.images}
                onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Camp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
