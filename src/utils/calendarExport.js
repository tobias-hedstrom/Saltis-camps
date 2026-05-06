// Prototype-only calendar export — generates .ics files in the browser.
// In production this logic could remain client-side or move to a server endpoint.

function toICSDate(dateStr) {
  // "YYYY-MM-DD" → "YYYYMMDD"
  return dateStr ? dateStr.replace(/-/g, "") : null;
}

function escapeText(text) {
  if (!text) return "";
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function stamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function buildEvent({ uid, summary, description, location, startDate, endDate }) {
  const dtStart = toICSDate(startDate);
  const dtEnd = toICSDate(endDate || startDate);
  if (!dtStart) return "";

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp()}Z`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeText(summary)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : "",
    location ? `LOCATION:${escapeText(location)}` : "",
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function campDescription(camp) {
  return [
    camp.description,
    `Coaches: ${camp.coaches?.join(", ")}`,
    `Age groups: ${camp.ageGroups?.join(", ")}`,
    `Training days: ${camp.trainingDays}`,
    camp.registrationDeadline ? `Registration deadline: ${camp.registrationDeadline}` : "",
    camp.paymentDeadline ? `Payment deadline: ${camp.paymentDeadline}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function campEvents(camp) {
  const events = [];

  // Main camp event
  events.push(
    buildEvent({
      uid: `camp-${camp.id}@saltissklk`,
      summary: camp.name,
      description: campDescription(camp),
      location: camp.location,
      startDate: camp.startDate,
      endDate: camp.endDate,
    })
  );

  // Registration deadline
  if (camp.registrationDeadline) {
    events.push(
      buildEvent({
        uid: `camp-${camp.id}-reg@saltissklk`,
        summary: `Registration Deadline — ${camp.name}`,
        description: `Last day to register for ${camp.name}.`,
        location: "",
        startDate: camp.registrationDeadline,
        endDate: camp.registrationDeadline,
      })
    );
  }

  // Payment deadline
  if (camp.paymentDeadline) {
    events.push(
      buildEvent({
        uid: `camp-${camp.id}-pay@saltissklk`,
        summary: `Payment Deadline — ${camp.name}`,
        description: `Payment due for ${camp.name}.`,
        location: "",
        startDate: camp.paymentDeadline,
        endDate: camp.paymentDeadline,
      })
    );
  }

  return events;
}

function wrapCalendar(eventBlocks) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Saltsjöbadens SLK//Camp Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...eventBlocks,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function generateCampICS(camp) {
  return wrapCalendar(campEvents(camp));
}

export function generateAllCampsICS(camps) {
  return wrapCalendar(camps.flatMap(campEvents));
}

export function downloadICS(filename, icsContent) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
