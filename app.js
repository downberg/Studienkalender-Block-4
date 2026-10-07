/* ===========================================================
   Studienkalender - Logik (Daten, Storage, Render)
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

/* ---- Zusätzliche Termin-Pakete (werden einmalig in vorhandene Daten eingemischt) ----
   Jedes Paket hat einen eigenen Schlüssel; bereits vorhandene Termine (gleiches Datum
   + gleicher Titel) werden übersprungen, eigene Änderungen bleiben erhalten.        */
const SEED_PACKS = {
  // FI241 Gr. a – Gesamtplan ABB WS 26/27 (Wintersemester 2026/27)
  ws2627_v1: {
    "2026-10-05": [{ title: "ITGP (1) – Or", category: "lecture", time: "13:00", location: "Raum 1.02" }],
    "2026-10-06": [{ title: "ITM (1) – Hil", category: "lecture", time: "11:00", location: "Raum 1.02" }],
    "2026-10-23": [{ title: "ITGP (2) – Or", category: "lecture", time: "14:00", location: "Online" }],
    "2026-10-29": [{ title: "Auftakt WPF", category: "lecture", time: "17:00" }],
    "2026-10-30": [{ title: "ITM (2) – Hil", category: "lecture", time: "14:00", location: "Online" }],
    "2026-11-06": [{ title: "HRL (1) – Ost", category: "lecture", time: "14:00", location: "Online" }],
    "2026-11-13": [{ title: "ITGP (3) – Or", category: "lecture", time: "14:00", location: "Raum 1.02" }],
    "2026-11-20": [{ title: "HRL (2) – Ost", category: "lecture", time: "14:00", location: "Online" }],
    "2026-11-27": [{ title: "WPF UN-Planspiel", category: "lecture", time: "14:00", location: "Raum 2.04" }],
    "2026-11-28": [{ title: "WPF UN-Planspiel", category: "lecture" }],
    "2026-12-04": [{ title: "ITGP (4) – Or", category: "lecture", time: "14:00", location: "Online" }],
    "2026-12-11": [{ title: "HRL (3) – Ost", category: "lecture", time: "14:00", location: "Online" }],
    "2027-01-07": [{ title: "ITGP (5) – Or", category: "lecture", time: "14:00", location: "Online" }],
    "2027-01-08": [{ title: "ITM (3) – Hil", category: "lecture", time: "14:00", location: "Online" }],
    "2027-01-15": [{ title: "HRL (4) – Ost", category: "lecture", time: "14:00", location: "Online" }],
    "2027-01-22": [{ title: "WPF Datengetr. Opt.", category: "lecture", time: "14:00", location: "Raum 2.04" }],
    "2027-01-26": [{ title: "ITM Präsi", category: "lecture" }],
    "2027-01-27": [{ title: "ITGP Refresher – Or", category: "lecture", time: "14:00", location: "Raum 3.04 / Online" }],
    "2027-01-30": [{ title: "Datenbank", category: "lecture" }],
    "2027-02-01": [{ title: "HRL Klausur", category: "exam", time: "10:00" }],
    "2027-02-05": [{ title: "ITGP Klausur", category: "exam", time: "08:00" }],
    "2027-02-06": [{ title: "A&D Klausur", category: "exam" }],
  },
};
const PACK_FLAG_PREFIX = "calendar_pack_";

/* Mischt noch nicht angewendete Pakete in `data` ein. Gibt true zurück, wenn sich etwas geändert hat. */
function applySeedPacks(data) {
  let changed = false;
  for (const [packKey, pack] of Object.entries(SEED_PACKS)) {
    const flag = PACK_FLAG_PREFIX + packKey;
    if (localStorage.getItem(flag)) continue;
    for (const [date, list] of Object.entries(pack)) {
      const target = data[date] || (data[date] = []);
      for (const e of list) {
        if (target.some((x) => x.title === e.title)) continue;
        target.push({ id: uid(), ...e });
        changed = true;
      }
    }
    localStorage.setItem(flag, "1");
  }
  return changed;
}

/* Beim Zurücksetzen: Paket-Markierungen löschen, damit alle Pakete neu geladen werden */
function clearSeedPackFlags() {
  Object.keys(SEED_PACKS).forEach((k) => localStorage.removeItem(PACK_FLAG_PREFIX + k));
}

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
    applySeedPacks(seeded);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (applySeedPacks(parsed)) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
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
/* toast("Text") oder toast("Text", { label: "Rückgängig", run: () => ... }) */
function toast(msg, action) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  if (action) {
    const b = document.createElement("button");
    b.textContent = action.label;
    b.addEventListener("click", () => { el.classList.remove("show"); action.run(); });
    el.appendChild(b);
  }
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), action ? 5000 : 1800);
}

/* ============================ Icons ============================ */
/* Phosphor Icons (regular), https://phosphoricons.com - MIT-Lizenz */
function _ph(d) {
  return `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
}
const ICON = {
  plus: _ph("M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"),
  chevL: _ph("M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"),
  chevR: _ph("M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"),
  cal: _ph("M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"),
  home: _ph("M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"),
  reset: _ph("M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"),
  gym: _ph("M248,120h-8V88a16,16,0,0,0-16-16H208V64a16,16,0,0,0-16-16H168a16,16,0,0,0-16,16v56H104V64A16,16,0,0,0,88,48H64A16,16,0,0,0,48,64v8H32A16,16,0,0,0,16,88v32H8a8,8,0,0,0,0,16h8v32a16,16,0,0,0,16,16H48v8a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V136h48v56a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16v-8h16a16,16,0,0,0,16-16V136h8a8,8,0,0,0,0-16ZM32,168V88H48v80Zm56,24H64V64H88V192Zm104,0H168V64h24V175.82c0,.06,0,.12,0,.18s0,.12,0,.18V192Zm32-24H208V88h16Z"),
  check: _ph("M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"),
  shift: _ph("M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"),
  close: _ph("M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"),
};

/* ============================ Text-Helfer ============================ */
function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

/* "14:00 · Raum 1.02" oder, wenn beides fehlt, der Kategoriename */
function eventMeta(e) {
  const cat = CATS[e.category] || CATS.lecture;
  return [e.time, e.location].filter(Boolean).join(" · ") || cat.label;
}

/* Semester aus dem Datum: Apr-Sep = Sommer, Okt-Mär = Winter */
function semesterLabel(d = new Date()) {
  const m = d.getMonth(), y = d.getFullYear();
  if (m >= 3 && m <= 8) return `SoSe ${y}`;
  const start = m >= 9 ? y : y - 1;
  return `WiSe ${start}/${String(start + 1).slice(2)}`;
}

/* ============================ Tab-Leiste ============================ */
/* active: "home" | "cal" | "gym". onAdd: Funktion (Kalender) oder nichts (Link zur Kalenderseite). */
function mountTabbar(active, onAdd) {
  const nav = document.getElementById("tabbar");
  if (!nav) return;
  const tab = (key, href, icon, label) =>
    `<a class="tab" href="${href}" ${active === key ? 'aria-current="page"' : ""}>${icon}<span>${label}</span></a>`;
  nav.innerHTML = `
    <div class="tabs">
      ${tab("home", "index.html", ICON.home, "Übersicht")}
      ${tab("cal", "calendar.html", ICON.cal, "Kalender")}
      ${tab("gym", "training.html", ICON.gym, "Training")}
    </div>
    ${onAdd
      ? `<button class="fab pressable" id="fabAdd" aria-label="Neuer Termin">${ICON.plus}</button>`
      : `<a class="fab pressable" href="calendar.html?new=1" aria-label="Neuer Termin">${ICON.plus}</a>`}`;
  if (onAdd) nav.querySelector("#fabAdd").addEventListener("click", onAdd);
}
