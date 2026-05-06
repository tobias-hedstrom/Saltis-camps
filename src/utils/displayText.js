export const CATEGORY_LABELS = {
  "Previous Camps": "Tidigare läger",
  "Camp Reminder": "Påminnelser",
  "Board News": "Styrelsen",
  "General News": "Allmänt",
};

export const CATEGORY_COLORS = {
  "Previous Camps": "#2f6f8f",
  "Camp Reminder": "#b7791f",
  "Board News": "#4b6b57",
  "General News": "#3f6f7f",
};

export function categoryLabel(category) {
  return CATEGORY_LABELS[category] ?? category ?? "Allmänt";
}

export function roleLabel(role) {
  const labels = {
    admin: "Admin",
    manager: "Lägeransvarig",
    coach: "Tränare",
    board: "Styrelse",
    parent: "Förälder",
  };
  return labels[role] ?? role;
}

export function paymentLabel(status) {
  const labels = {
    paid: "Betald",
    pending: "Kommande",
    overdue: "Saknas",
  };
  return labels[status] ?? status;
}
