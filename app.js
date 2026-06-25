/* ===========================================================
   Studienkalender SoSe 2026 — Logik (Daten, Storage, Render)
   Quelle der Wahrheit: localStorage["calendar_events_2026"]
   =========================================================== */

const STORAGE_KEY = "calendar_events_2026";

/* ---- Kategorien ---- */
const CATS = {
  exam:    { label: "Klausur",    color: "var(--red)",    cls: "exam" },
  abgabe:  { label: "Abgabe",     color: "var(--red)",    cls: "abgabe" },
  lecture: { label: "Vorlesung",  color: "var(--blue)",   cls: "lecture" },
  block:   { label: "Block",      color: "var(--green)",  cls: "block" },
  holiday: { label: "Feiertag",   color: "var(--orange)", cls: "holiday" },
};

/* Kategorien, die als "Deadline" (rot) auf der Startseite zählen */
const DEADLINE_CATS = ["exam", "abgabe"];

/* ---- Vorbelegte Termine aus dem Gesamtplan ABB SoSe 26 ---- */
/* (Daten gegen den Excel-Plan geprüft; Wochentage verifiziert.)   */
const SEED = {
  // Feiertage
  "2026-04-06": [{ title: "Ostermontag", category: "holiday" }],
  "2026-05-01": [{ title: "Tag der Arbeit", category: "holiday" }],
  "2026-05-14": [{ title: "Christi Himmelfahrt", category: "holiday" }],
  "2026-05-25": [{ title: "Pfingstmontag", category: "holiday" }],
  "2026-06-04": [{ title: "Fronleichnam", category: "holiday" }],

  // Vorlesungen (Do/Fr 14:00)
  "2026-04-10": [{ title: "BI 1 (1) – Rüe", category: "lecture", time: "14:00", location: "Online" }],
  "2026-04-17": [{ title: "Marketing (1) – Gr", category: "lecture", time: "14:00" }],
  "2026-04-24": [{ title: "IT-Security (1) – Wel", category: "lecture", time: "14:00", location: "Raum A" }],
  "2026-05-08": [{ title: "BI 1 (2) – Rüe", category: "lecture", time: "14:00", location: "Online" }],
  "2026-05-21": [{ title: "IT-Security (2) – Wel", category: "lecture", time: "14:00", location: "Raum A" }],
  "2026-05-28": [{ title: "Marketing (2) – Gr", category: "lecture", time: "14:00", location: "Online" }],
  "2026-06-12": [{ title: "Marketing (3) – Gr", category: "lecture", time: "14:00", location: "Online" }],
  "2026-06-25": [{ title: "Marketing (4) – Gr", category: "lecture", time: "14:00", location: "Online" }],
  "2026-07-09": [{ title: "Marketing (5) – Gr", category: "lecture", time: "14:00", location: "Online" }],
  "2026-07-10": [{ title: "SAP ERP Ref. – Hil", category: "lecture", time: "14:00", location: "Online" }],
  "2026-07-17": [{ title: "BI 1 (3) – Rüe", category: "lecture", time: "14:00", location: "Online" }],
  "2026-07-23": [{ title: "Marketing (6) – Gr", category: "lecture", time: "14:00" }],
  "2026-07-24": [{ title: "BI Präsentationen", category: "lecture" }],

  // SWE ERP Block (Mo–Fr, ganztägig)
  "2026-06-15": [{ title: "SWE ERP – Hil", category: "block", time: "09:00–15:00", location: "Online" }],
  "2026-06-16": [{ title: "SWE ERP – Hil", category: "block", time: "09:00–15:00", location: "Online" }],
  "2026-06-17": [{ title: "SWE ERP – Hil", category: "block", time: "09:00–15:00", location: "Online" }],
  "2026-06-18": [{ title: "SWE ERP – Hil", category: "block", time: "09:00–15:00", location: "Online" }],
  "2026-06-19": [{ title: "SWE ERP – Hil", category: "block", time: "09:00–15:00", location: "Online" }],

  // Klausuren
  "2026-07-27": [{ title: "IT-Sicherheit Klausur", category: "exam" }],
  "2026-08-04": [{ title: "SWE ERP Klausur", category: "exam" }],
  "2026-08-07": [{ title: "Marketing Klausur", category: "exam" }],
};

/* ============================ Storage ============================ */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadEvents() {
  let raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = {};
    for (const [date, list] of Object.entries(SEED)) {
      seeded[date] = list.map((e) => ({ id: uid(), ...e }));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveEvents(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getEventsForDate(data, dateStr) {
  return (data[dateStr] || []).slice().sort((a, b) => (a.time || "").localeCompare(b.time || ""));
}

function upsertEvent(data, dateStr, ev) {
  // Remove existing copy (it may move to another date)
  if (ev.id) {
    for (const k of Object.keys(data)) {
      data[k] = (data[k] || []).filter((x) => x.id !== ev.id);
      if (data[k].length === 0) delete data[k];
    }
  } else {
    ev.id = uid();
  }
  if (!data[dateStr]) data[dateStr] = [];
  data[dateStr].push(ev);
  saveEvents(data);
}

function deleteEvent(data, id) {
  for (const k of Object.keys(data)) {
    data[k] = (data[k] || []).filter((x) => x.id !== id);
    if (data[k].length === 0) delete data[k];
  }
  saveEvents(data);
}

/* ============================ Datum-Helfer ============================ */
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTHS_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const DAYS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function pad(n) { return String(n).padStart(2, "0"); }
function toKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function todayKey() { return toKey(new Date()); }
function parseKey(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }

/* Whole-day difference, independent of clock time */
function daysUntil(dateStr) {
  const now = new Date();
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t1 = parseKey(dateStr);
  return Math.round((t1 - t0) / 86400000);
}

function relativeLabel(days) {
  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  if (days === -1) return "Gestern";
  if (days < 0) return `vor ${Math.abs(days)} Tagen`;
  return `in ${days} Tagen`;
}

function formatLongDate(dateStr) {
  const d = parseKey(dateStr);
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/* Flatten store -> sorted array of {date, ...event} */
function allEventsSorted(data) {
  const out = [];
  for (const [date, list] of Object.entries(data)) {
    for (const ev of list) out.push({ date, ...ev });
  }
  out.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
  return out;
}

/* ============================ Toast ============================ */
let _toastTimer;
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 1700);
}

/* ============================ Icons ============================ */
const ICON = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  chevL: '<svg viewBox="0 0 13 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2 3 11l8 9"/></svg>',
  chevR: '<svg viewBox="0 0 13 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l8 9-8 9"/></svg>',
  back: '<svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2 4.5 8.5 11 15"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>',
};
