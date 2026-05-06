// Supabase REST API client — no npm package needed, uses plain fetch.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (local)
// and in Netlify → Site settings → Environment variables (production).

const URL  = import.meta.env.VITE_SUPABASE_URL;
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

const baseHeaders = () => ({
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
});

// Returns null if env vars not set — app falls back to localStorage only.
export const db = URL && KEY ? {

  // ── Camps ────────────────────────────────────────────────────────────────────

  async getCamps() {
    const res = await fetch(`${URL}/rest/v1/camps?select=*`, { headers: baseHeaders() });
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => r.data);
  },

  async upsertCamp(camp) {
    await fetch(`${URL}/rest/v1/camps`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id: camp.id, data: camp }),
    });
  },

  async deleteCamp(id) {
    await fetch(`${URL}/rest/v1/camps?id=eq.${id}`, {
      method: "DELETE",
      headers: baseHeaders(),
    });
  },

  // ── News ─────────────────────────────────────────────────────────────────────

  async getNews() {
    const res = await fetch(`${URL}/rest/v1/news_posts?select=*`, { headers: baseHeaders() });
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => r.data);
  },

  async upsertNews(post) {
    await fetch(`${URL}/rest/v1/news_posts`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id: post.id, data: post }),
    });
  },

  async deleteNews(id) {
    await fetch(`${URL}/rest/v1/news_posts?id=eq.${id}`, {
      method: "DELETE",
      headers: baseHeaders(),
    });
  },

  // ── Users ─────────────────────────────────────────────────────────────────────

  async getUsers() {
    const res = await fetch(`${URL}/rest/v1/users?select=*`, { headers: baseHeaders() });
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => r.data);
  },

  async upsertUser(user) {
    await fetch(`${URL}/rest/v1/users`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id: user.id, data: user }),
    });
  },

  async deleteUser(id) {
    await fetch(`${URL}/rest/v1/users?id=eq.${id}`, {
      method: "DELETE",
      headers: baseHeaders(),
    });
  },

  // ── Athletes ──────────────────────────────────────────────────────────────────

  async getAthletes() {
    const res = await fetch(`${URL}/rest/v1/athletes?select=*`, { headers: baseHeaders() });
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => r.data);
  },

  async upsertAthlete(athlete) {
    await fetch(`${URL}/rest/v1/athletes`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id: athlete.id, data: athlete }),
    });
  },

  async deleteAthlete(id) {
    await fetch(`${URL}/rest/v1/athletes?id=eq.${id}`, {
      method: "DELETE",
      headers: baseHeaders(),
    });
  },

  // ── Image storage ─────────────────────────────────────────────────────────────

  async uploadImage(file) {
    const ext = file.name.split(".").pop().toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await fetch(`${URL}/storage/v1/object/images/${filename}`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });
    if (!res.ok) throw new Error("Image upload failed");
    return `${URL}/storage/v1/object/public/images/${filename}`;
  },

} : null;
