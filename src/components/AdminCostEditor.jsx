import { useState } from "react";
import { useAppData } from "../hooks/useAppData";
import { COST_CATEGORIES } from "../data/initialData";
import { formatSEK } from "../utils/costCalculations";

const emptyItem = { name: "", category: "Accommodation", amount: "", isFixed: true, notes: "" };

export default function AdminCostEditor({ camp }) {
  const { updateCamp } = useAppData();
  const [editing, setEditing] = useState(null); // null | "new" | itemId
  const [form, setForm] = useState(emptyItem);

  const items = camp.costs ?? [];

  function save(updatedItems) {
    updateCamp(camp.id, { costs: updatedItems });
  }

  function startNew() { setForm(emptyItem); setEditing("new"); }
  function startEdit(item) { setForm({ ...item }); setEditing(item.id); }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSave() {
    const newItem = { ...form, amount: Number(form.amount) };
    const updated = editing === "new"
      ? [...items, { ...newItem, id: `cost-${Date.now()}` }]
      : items.map((item) => item.id === editing ? newItem : item);
    save(updated);
    setEditing(null);
  }

  function handleDelete(id) {
    save(items.filter((item) => item.id !== id));
  }

  const totalFixed    = items.filter((i) => i.isFixed).reduce((s, i) => s + Number(i.amount), 0);
  const totalVariable = items.filter((i) => !i.isFixed).reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="cost-editor">
      <div className="cost-editor-header">
        <div className="cost-totals">
          <span>Fixed: <strong>{formatSEK(totalFixed)}</strong></span>
          <span>Variable/athlete: <strong>{formatSEK(totalVariable)}</strong></span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={startNew}>+ Add Cost Item</button>
      </div>

      {editing !== null && (
        <div className="cost-edit-form card">
          <h4>{editing === "new" ? "New Cost Item" : "Edit Cost Item"}</h4>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="form-control">
                {COST_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (SEK)</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} className="form-control" min="0" required />
            </div>
            <div className="form-group span-2">
              <label className="checkbox-label">
                <input type="checkbox" name="isFixed" checked={form.isFixed} onChange={handleChange} />
                Fixed cost (not per athlete)
              </label>
            </div>
            <div className="form-group span-2">
              <label>Notes</label>
              <input name="notes" value={form.notes} onChange={handleChange} className="form-control" />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: "0.75rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{formatSEK(item.amount)}</td>
                <td>
                  <span className={`badge ${item.isFixed ? "badge-upcoming" : "badge-pending"}`}>
                    {item.isFixed ? "Fixed" : "Variable"}
                  </span>
                </td>
                <td className="text-muted">{item.notes}</td>
                <td>
                  <button className="btn-link" onClick={() => startEdit(item)}>Edit</button>
                  {" · "}
                  <button className="btn-link btn-link-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="empty-state">No cost items yet. Click "+ Add Cost Item".</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
