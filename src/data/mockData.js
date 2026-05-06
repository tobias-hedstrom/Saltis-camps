// Re-export everything from the canonical source so any remaining
// import from mockData.js continues to work during the transition.
export {
  INITIAL_CAMPS as CAMPS,
  INITIAL_NEWS_POSTS as NEWS_POSTS,
  INITIAL_ATHLETES,
  INITIAL_USER,
  INITIAL_REGISTRATIONS,
  COST_CATEGORIES,
  AGE_GROUPS,
  DISCIPLINES,
} from "./initialData";

// Legacy alias — context now derives calendar events from camps.
// This constant is kept only for import compatibility; CalendarAgenda
// no longer reads it directly.
export const CALENDAR_EVENTS = [];
