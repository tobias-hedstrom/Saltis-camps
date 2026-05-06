import { createContext, useReducer, useEffect } from "react";
import {
  INITIAL_CAMPS,
  INITIAL_NEWS_POSTS,
  INITIAL_ATHLETES,
  INITIAL_USERS,
  INITIAL_REGISTRATIONS,
} from "../data/initialData";
import { db } from "../lib/supabase";

// ─── DEFAULT STATE ─────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  _schemaVersion: 3,
  users: INITIAL_USERS,
  currentUserId: null,
  camps: INITIAL_CAMPS,
  newsPosts: INITIAL_NEWS_POSTS,
  athletes: INITIAL_ATHLETES,
  registrations: INITIAL_REGISTRATIONS,
};

const STORAGE_KEY = "saltis_app_state";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw);
    if (!saved.users || saved._schemaVersion !== DEFAULT_STATE._schemaVersion) {
      return DEFAULT_STATE;
    }
    return { ...DEFAULT_STATE, ...saved };
  } catch {
    return DEFAULT_STATE;
  }
}

// ─── REDUCER ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, currentUserId: action.payload };

    case "LOGOUT":
      return { ...state, currentUserId: null };

    case "CREATE_ACCOUNT": {
      const { user, athletes: newAthletes = [] } = action.payload;
      return {
        ...state,
        users: [...state.users, user],
        currentUserId: user.id,
        athletes: [...state.athletes, ...newAthletes],
      };
    }

    case "UPDATE_CURRENT_USER":
      if (!state.currentUserId) return state;
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === state.currentUserId ? { ...u, ...action.payload } : u
        ),
      };

    case "SET_CAMPS":
      return { ...state, camps: action.payload };

    case "ADD_CAMP":
      return { ...state, camps: [...state.camps, action.payload] };

    case "UPDATE_CAMP":
      return {
        ...state,
        camps: state.camps.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };

    case "DELETE_CAMP": {
      const campId = action.payload;
      return {
        ...state,
        camps: state.camps.filter((c) => c.id !== campId),
        registrations: state.registrations.filter((r) => r.campId !== campId),
      };
    }

    case "ADD_REGISTRATION":
      return { ...state, registrations: [...state.registrations, action.payload] };

    case "UPDATE_REGISTRATION":
      return {
        ...state,
        registrations: state.registrations.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      };

    case "DELETE_REGISTRATION":
      return {
        ...state,
        registrations: state.registrations.filter((r) => r.id !== action.payload),
      };

    case "ADD_ATHLETE":
      return { ...state, athletes: [...state.athletes, action.payload] };

    case "UPDATE_ATHLETE":
      return {
        ...state,
        athletes: state.athletes.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      };

    case "DELETE_ATHLETE":
      return {
        ...state,
        athletes: state.athletes.filter((a) => a.id !== action.payload),
      };

    case "SET_NEWS":
      return { ...state, newsPosts: action.payload };

    case "ADD_NEWS":
      return { ...state, newsPosts: [...state.newsPosts, action.payload] };

    case "UPDATE_NEWS":
      return {
        ...state,
        newsPosts: state.newsPosts.map((n) =>
          n.id === action.payload.id ? { ...n, ...action.payload } : n
        ),
      };

    case "DELETE_NEWS":
      return {
        ...state,
        newsPosts: state.newsPosts.filter((n) => n.id !== action.payload),
      };

    case "RESET":
      return { ...DEFAULT_STATE };

    default:
      return state;
  }
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadFromStorage);

  // Save non-camp/news state to localStorage (registrations, users, athletes, auth)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently ignore (private browsing, quota exceeded)
    }
  }, [state]);

  // ── Load camps + news from Supabase on mount ───────────────────────────────
  useEffect(() => {
    if (!db) return; // No Supabase config — use localStorage only
    async function loadFromSupabase() {
      try {
        const [camps, news] = await Promise.all([db.getCamps(), db.getNews()]);

        if (camps.length > 0) {
          dispatch({ type: "SET_CAMPS", payload: camps });
        } else {
          // First run: seed Supabase with the initial data
          await Promise.all(INITIAL_CAMPS.map((c) => db.upsertCamp(c)));
        }

        if (news.length > 0) {
          dispatch({ type: "SET_NEWS", payload: news });
        } else {
          await Promise.all(INITIAL_NEWS_POSTS.map((p) => db.upsertNews(p)));
        }
      } catch (err) {
        console.warn("Supabase load failed, using local data:", err);
      }
    }
    loadFromSupabase();
  }, []);

  // ── Derived auth values ──────────────────────────────────────────────────────
  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
  const isLoggedIn  = state.currentUserId !== null;

  function hasRole(role) {
    return currentUser?.roles.includes(role) ?? false;
  }

  const isAdmin           = hasRole("admin");
  const isManager         = hasRole("manager");
  const isCoach           = hasRole("coach");
  const canManageCamps    = isAdmin || isManager;
  const canExportBoardFiles = isAdmin || isManager || hasRole("board");

  const userAthletes = state.currentUserId
    ? state.athletes.filter((a) => a.userId === state.currentUserId)
    : [];

  function registeredCount(campId) {
    return state.registrations.filter((r) => r.campId === campId).length;
  }

  function campRegistrations(campId) {
    return state.registrations.filter((r) => r.campId === campId);
  }

  function myRegistrations() {
    const myAthleteIds = new Set(userAthletes.map((a) => a.id));
    return state.registrations.filter((r) => myAthleteIds.has(r.athleteId));
  }

  function getCamp(campId) {
    return state.camps.find((c) => c.id === campId) ?? null;
  }

  function getNews(newsId) {
    return state.newsPosts.find((n) => n.id === newsId) ?? null;
  }

  function calendarEvents() {
    const events = [];
    for (const camp of state.camps) {
      if (camp.startDate)
        events.push({ date: camp.startDate, label: `${camp.name} starts`, type: "camp", campId: camp.id });
      if (camp.endDate && camp.endDate !== camp.startDate)
        events.push({ date: camp.endDate, label: `${camp.name} ends`, type: "camp", campId: camp.id });
      if (camp.registrationDeadline)
        events.push({ date: camp.registrationDeadline, label: `Registration deadline — ${camp.name}`, type: "deadline", campId: camp.id });
      if (camp.paymentDeadline)
        events.push({ date: camp.paymentDeadline, label: `Payment deadline — ${camp.name}`, type: "payment", campId: camp.id });
      if (camp.travelDateOut && camp.travelDateOut !== camp.startDate)
        events.push({ date: camp.travelDateOut, label: `Travel day — ${camp.name}`, type: "travel", campId: camp.id });
      if (camp.infoMeetingDate)
        events.push({ date: camp.infoMeetingDate, label: `Info meeting — ${camp.name}`, type: "meeting", campId: camp.id });
    }
    return events.sort((a, b) => a.date.localeCompare(b.date));
  }

  // ── Auth actions ─────────────────────────────────────────────────────────────

  function login(email, password) {
    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return false;
    dispatch({ type: "LOGIN", payload: user.id });
    return true;
  }

  function logout() {
    dispatch({ type: "LOGOUT" });
  }

  function createAccount({ name, email, password, children = [] }) {
    const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;
    const ts = Date.now();
    const userId = `user-${ts}`;
    const newUser = { id: userId, name, email, password, roles: ["parent"], phone: "", emergencyContact: "" };
    const newAthletes = children.map((child, i) => ({
      id: `athlete-${ts}-${i}`,
      userId,
      name: child.name,
      birthYear: Number(child.birthYear),
      ageGroup: child.ageGroup,
      allergies: child.allergies || "",
      medicalNotes: child.medicalNotes || "",
      equipmentLevel: child.equipmentLevel || "Training",
      clubGroup: "",
    }));
    dispatch({ type: "CREATE_ACCOUNT", payload: { user: newUser, athletes: newAthletes } });
    return true;
  }

  function updateCurrentUser(updates) {
    dispatch({ type: "UPDATE_CURRENT_USER", payload: updates });
  }

  // ── Camp actions ─────────────────────────────────────────────────────────────

  async function addCamp(camp) {
    const newCamp = { thumbnailImage: null, images: [], ...camp, id: camp.id ?? `camp-${Date.now()}` };
    dispatch({ type: "ADD_CAMP", payload: newCamp });
    if (db) db.upsertCamp(newCamp).catch(console.warn);
  }

  async function updateCamp(campId, updates) {
    const existing = state.camps.find((c) => c.id === campId);
    const updated  = { ...existing, ...updates, id: campId };
    dispatch({ type: "UPDATE_CAMP", payload: updated });
    if (db) db.upsertCamp(updated).catch(console.warn);
  }

  async function deleteCamp(campId) {
    dispatch({ type: "DELETE_CAMP", payload: campId });
    if (db) db.deleteCamp(campId).catch(console.warn);
  }

  // ── Registration actions ──────────────────────────────────────────────────────

  function addRegistration(reg) {
    dispatch({
      type: "ADD_REGISTRATION",
      payload: {
        id: `reg-${Date.now()}`,
        userId: state.currentUserId,
        registrationDate: new Date().toISOString().slice(0, 10),
        paymentStatus: "pending",
        status: "confirmed",
        ...reg,
      },
    });
  }

  function updateRegistration(registrationId, updates) {
    dispatch({ type: "UPDATE_REGISTRATION", payload: { id: registrationId, ...updates } });
  }

  function deleteRegistration(registrationId) {
    dispatch({ type: "DELETE_REGISTRATION", payload: registrationId });
  }

  // ── Athlete actions ───────────────────────────────────────────────────────────

  function saveAthlete(data) {
    const exists = state.athletes.find((a) => a.id === data.id);
    dispatch({
      type: exists ? "UPDATE_ATHLETE" : "ADD_ATHLETE",
      payload: { id: `athlete-${Date.now()}`, userId: state.currentUserId, ...data },
    });
  }

  function deleteAthlete(athleteId) {
    dispatch({ type: "DELETE_ATHLETE", payload: athleteId });
  }

  // ── News actions ──────────────────────────────────────────────────────────────

  async function addNews(post) {
    const newPost = { thumbnailImage: null, images: [], relatedCampId: null, ...post, id: post.id ?? `news-${Date.now()}` };
    dispatch({ type: "ADD_NEWS", payload: newPost });
    if (db) db.upsertNews(newPost).catch(console.warn);
  }

  async function updateNews(newsId, updates) {
    const existing = state.newsPosts.find((n) => n.id === newsId);
    const updated  = { ...existing, ...updates, id: newsId };
    dispatch({ type: "UPDATE_NEWS", payload: updated });
    if (db) db.upsertNews(updated).catch(console.warn);
  }

  async function deleteNews(newsId) {
    dispatch({ type: "DELETE_NEWS", payload: newsId });
    if (db) db.deleteNews(newsId).catch(console.warn);
  }

  // ── Reset ────────────────────────────────────────────────────────────────────

  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "RESET" });
  }

  // ─────────────────────────────────────────────────────────────────────────────

  const value = {
    camps: state.camps,
    newsPosts: state.newsPosts,
    registrations: state.registrations,
    currentUser,
    isLoggedIn,
    isAdmin,
    isManager,
    isCoach,
    canManageCamps,
    canExportBoardFiles,
    athletes: userAthletes,
    registeredCount,
    campRegistrations,
    myRegistrations,
    getCamp,
    getNews,
    calendarEvents,
    login,
    logout,
    createAccount,
    updateCurrentUser,
    addCamp,
    updateCamp,
    deleteCamp,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    saveAthlete,
    deleteAthlete,
    addNews,
    updateNews,
    deleteNews,
    resetData,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export { AppDataContext };
