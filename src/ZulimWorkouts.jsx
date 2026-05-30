import React, { useState, useEffect, useCallback } from "react";

/* ============================================================
   ZULIM WORKOUTS — collaborative fitness app for two
   - Two fully separate tracks (His / Hers)
   - Workout logging (weights, reps, checkmarks)
   - Weight + 4-tier goal tracking with custom rewards
   - Shared progress view
   - In-app reminders (water / walk / eat to satisfaction)
   Data persists via browser localStorage (per device).
   ============================================================ */

const C = {
  ink: "#0f1115",      // near-black text
  paper: "#ffffff",    // pure white base
  ember: "#ff5a3c",    // vivid coral — Christian
  clay: "#e8472b",
  olive: "#12c08a",    // fresh green — Zulim
  gold: "#ffb020",     // amber accent (shared)
  cream: "#f7f8fa",    // subtle gray surface
  line: "#e8eaee",     // hairline borders
  mute: "#8a909c",     // secondary text
};

const PROFILES = {
  his: { key: "his", name: "Christian", accent: C.ember, label: "CHRISTIAN'S TRACK" },
  hers: { key: "hers", name: "Zulim", accent: C.olive, label: "ZULIM'S TRACK" },
};

/* ---------- Workout programs (from your notes) ---------- */
const PROGRAMS = {
  his: [
    {
      day: "Day 1 — Chest · Shoulders · Triceps",
      ex: [
        { n: "Incline Dumbbell Press", s: "4 × 6–10", rest: "90s" },
        { n: "Flat Bench / Machine Chest Press", s: "3 × 8–12", rest: "90s" },
        { n: "Cable Fly / Pec Deck", s: "3 × 12–15", rest: "60s" },
        { n: "Dumbbell Lateral Raises", s: "4 × 12–20", rest: "45–60s" },
        { n: "Seated Shoulder Press", s: "3 × 8–12", rest: "90s" },
        { n: "Triceps Rope Pushdowns", s: "3 × 10–15", rest: "60s" },
        { n: "Overhead Triceps Extension", s: "2 × 12–15", rest: "60s" },
      ],
    },
    {
      day: "Day 2 — Legs · Calves · Core",
      ex: [
        { n: "Squat / Leg Press", s: "4 × 6–10", rest: "90–120s" },
        { n: "Romanian Deadlift", s: "3 × 8–12", rest: "90s" },
        { n: "Bulgarian Split Squat", s: "3 × 8–10 ea", rest: "75–90s" },
        { n: "Leg Extension", s: "3 × 12–15", rest: "60s" },
        { n: "Calf Raises", s: "4 × 12–20", rest: "45–60s" },
        { n: "Hanging Leg Raises", s: "3 × 10–15", rest: "—" },
        { n: "Cable Crunch / Plank", s: "3 × 12–20", rest: "—" },
      ],
    },
    {
      day: "Day 3 — Back · Biceps · Rear Delts",
      ex: [
        { n: "Pull-Ups / Lat Pulldown", s: "4 × 8–12", rest: "90s" },
        { n: "Chest-Supported Row", s: "4 × 8–12", rest: "90s" },
        { n: "Seated Cable Row", s: "3 × 10–12", rest: "75s" },
        { n: "Straight-Arm / 1-Arm Pulldown", s: "3 × 12–15", rest: "60s" },
        { n: "Rear Delt Fly", s: "4 × 12–20", rest: "45–60s" },
        { n: "Dumbbell Curls", s: "3 × 8–12", rest: "60s" },
        { n: "Hammer Curls", s: "3 × 10–15", rest: "60s" },
      ],
    },
    {
      day: "Day 4 — Shoulders · Arms · Core",
      ex: [
        { n: "Dumbbell Lateral Raises", s: "4 × 12–20", rest: "45–60s" },
        { n: "Rear Delt Fly / Reverse Pec Deck", s: "3 × 12–20", rest: "45–60s" },
        { n: "Shoulder Press", s: "3 × 8–12", rest: "90s" },
        { n: "Cable Lateral Raises", s: "3 × 12–15 ea", rest: "45–60s" },
        { n: "EZ-Bar / Preacher Curl", s: "3 × 8–12", rest: "60s" },
        { n: "Incline Dumbbell Curl", s: "2–3 × 10–12", rest: "60s" },
        { n: "Triceps Dips / Close-Grip Press", s: "3 × 8–12", rest: "75–90s" },
        { n: "Rope Pushdowns / OH Extension", s: "3 × 12–15", rest: "60s" },
        { n: "Cable Crunch / Hanging Leg Raise", s: "3 × 12–20", rest: "—" },
      ],
    },
  ],
  hers: [
    {
      day: "Day 1 — Glutes + Push-Up Strength",
      ex: [
        { n: "Hip Thrusts", s: "4 × 8–12", rest: "90s" },
        { n: "Bulgarian Split Squats", s: "3 × 8–10 ea", rest: "75s" },
        { n: "Incline Push-Ups", s: "3 × 6–10", rest: "60s" },
        { n: "Dumbbell Chest Press", s: "3 × 8–12", rest: "75s" },
        { n: "Tricep Pressdowns / Bench Dips", s: "2 × 10–12", rest: "60s" },
        { n: "Plank", s: "2 × 30–45s", rest: "—" },
      ],
    },
    {
      day: "Day 2 — Back + Pull-Up Strength",
      ex: [
        { n: "Assisted / Band Pull-Ups", s: "4 × 5–8", rest: "90s" },
        { n: "Lat Pulldown", s: "3 × 8–12", rest: "75s" },
        { n: "Seated Cable Row", s: "3 × 8–12", rest: "75s" },
        { n: "Dumbbell Bicep Curls", s: "3 × 10–12", rest: "60s" },
        { n: "Dead Hangs", s: "3 × 10–30s", rest: "60s" },
        { n: "Scapular Pull-Ups", s: "2 × 5–8", rest: "60s" },
      ],
    },
    {
      day: "Day 3 — Glutes + Legs + Core",
      ex: [
        { n: "Romanian Deadlifts", s: "4 × 8–10", rest: "90s" },
        { n: "Cable Kickbacks", s: "3 × 12–15 ea", rest: "60s" },
        { n: "Goblet Squats / Leg Press", s: "3 × 10–12", rest: "75s" },
        { n: "Hip Abductions", s: "3 × 15–20", rest: "45s" },
        { n: "Walking Lunges", s: "2 × 10 ea", rest: "60s" },
        { n: "Dead Bugs / Hanging Knee Raises", s: "2 × 10–12", rest: "—" },
      ],
    },
    {
      day: "Day 4 — Upper Aesthetic + Push/Pull Practice",
      ex: [
        { n: "Push-Up Negatives (3–5s)", s: "3 × 3–5", rest: "75s" },
        { n: "Negative Pull-Ups (3–5s)", s: "3 × 2–4", rest: "90s" },
        { n: "Dumbbell Shoulder Press", s: "3 × 8–10", rest: "75s" },
        { n: "Lateral Raises", s: "3 × 12–15", rest: "45s" },
        { n: "Face Pulls", s: "3 × 12–15", rest: "45s" },
        { n: "Hammer Curls", s: "2 × 10–12", rest: "60s" },
        { n: "Plank Shoulder Taps", s: "2 × 10–20", rest: "—" },
      ],
    },
  ],
};

const PROGRESSIONS = {
  his: {
    title: "His progression rules",
    items: [
      "Push-ups: Wk1 = 5/day · Wk2 = 10/day · Wk3 = 20/day (2 wks) · then 25/day (4 wks) · +5/day each week after.",
      "Bench goal: work toward 220 lb × 5 reps.",
      "Pull-ups (at home, separate from gym): goal of 20.",
      "Daily 3-mile walk — time it, watch the pace drop.",
      "Travel day = 30 min treadmill, skip the lift guilt-free.",
      "Every week improve ONE thing: +5 lb, +1–2 reps, slower negative, or cleaner form.",
      "Most sets stop 1–2 reps from failure. ~60 min lift, then 20 min sauna.",
    ],
  },
  hers: {
    title: "Her progression rules",
    items: [
      "Push-ups: Wk 1–2 high-incline · Wk 3–4 lower incline · Wk 5–6 knees + slow negatives · Wk 7–8 attempt full, finish on incline.",
      "Pull-ups: Wk 1–2 assisted + dead hangs · Wk 3–4 less assist + scapular · Wk 5–6 add slow negatives · Wk 7–8 try 1 then assisted.",
      "Don't rush — clean reps, tight core, controlled lowering beat sloppy volume.",
      "Glutes trained twice a week; recovery days between upper sessions.",
    ],
  },
};

const DEFAULT_TIERS = (unit) => [
  { tier: 1, target: 10, reward: "" },
  { tier: 2, target: 20, reward: "" },
  { tier: 3, target: 30, reward: "" },
  { tier: 4, target: 40, reward: "" },
];

const REMINDERS = [
  { id: "water", icon: "💧", text: "Lots of water — sip something now" },
  { id: "eat", icon: "🍽️", text: "Eat only to satisfaction, not to full" },
  { id: "walk", icon: "🚶", text: "Daily 3-mile walk — beat your last time" },
  { id: "weighin", icon: "⚖️", text: "Biweekly weigh-in — log it & check the chart" },
];

/* ---------- storage helpers (browser localStorage) ---------- */
async function loadKey(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("save failed", e);
  }
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ZulimWorkouts() {
  const [who, setWho] = useState("his");
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);

  // per-profile state
  const [state, setState] = useState({
    his: { startWeight: "", current: "", goalUnit: "lbs", tiers: DEFAULT_TIERS(), logs: {}, weighIns: [] },
    hers: { startWeight: "", current: "", goalUnit: "lbs", tiers: DEFAULT_TIERS(), logs: {}, weighIns: [] },
  });
  const [reminderState, setReminderState] = useState({ his: {}, hers: {} });
  const [toast, setToast] = useState(null);
  const [exportText, setExportText] = useState("");

  useEffect(() => {
    (async () => {
      const his = await loadKey("zulim:his", state.his);
      const hers = await loadKey("zulim:hers", state.hers);
      const rem = await loadKey("zulim:reminders", { his: {}, hers: {} });
      setState({ his, hers });
      setReminderState(rem);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  const persist = useCallback((next) => {
    setState(next);
    saveKey("zulim:his", next.his);
    saveKey("zulim:hers", next.hers);
  }, []);

  const p = state[who];
  const prof = PROFILES[who];

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  /* ---------- derived ---------- */
  const lost = (() => {
    const s = parseFloat(p.startWeight),
      c = parseFloat(p.current);
    if (isNaN(s) || isNaN(c)) return 0;
    return Math.max(0, +(s - c).toFixed(1));
  })();

  const tierStatus = p.tiers.map((t) => ({
    ...t,
    done: lost >= t.target,
    pct: Math.min(100, t.target ? (lost / t.target) * 100 : 0),
  }));
  const nextTier = tierStatus.find((t) => !t.done);

  /* ---------- training history (derived from logs) ----------
     A date counts as "trained" if, on any day-template that date,
     at least one exercise was completed OR it was marked travel. */
  const trainedMap = (() => {
    const m = {}; // date -> { sets, travel, days:Set }
    Object.entries(p.logs || {}).forEach(([key, entry]) => {
      const [date, dayIdx] = key.split("|");
      if (!entry) return;
      const sets = Object.entries(entry).filter(([k, v]) => k !== "__travel" && v).length;
      const travel = !!entry.__travel;
      if (sets === 0 && !travel) return;
      if (!m[date]) m[date] = { sets: 0, travel: false, days: new Set() };
      m[date].sets += sets;
      m[date].travel = m[date].travel || travel;
      m[date].days.add(parseInt(dayIdx, 10));
    });
    return m;
  })();
  const trainedDates = Object.keys(trainedMap).sort(); // ascending

  const streaks = (() => {
    if (trainedDates.length === 0) return { current: 0, best: 0, total: 0 };
    const set = new Set(trainedDates);
    // best run of consecutive calendar days
    let best = 0;
    trainedDates.forEach((d) => {
      const prev = new Date(d + "T00:00:00");
      prev.setDate(prev.getDate() - 1);
      const prevStr = prev.toISOString().slice(0, 10);
      if (!set.has(prevStr)) {
        // start of a run — count forward
        let run = 0;
        let cur = new Date(d + "T00:00:00");
        while (set.has(cur.toISOString().slice(0, 10))) {
          run++;
          cur.setDate(cur.getDate() + 1);
        }
        if (run > best) best = run;
      }
    });
    // current streak counting back from today (allow today not-yet-trained)
    let current = 0;
    let cur = new Date(todayStr() + "T00:00:00");
    if (!set.has(cur.toISOString().slice(0, 10))) cur.setDate(cur.getDate() - 1);
    while (set.has(cur.toISOString().slice(0, 10))) {
      current++;
      cur.setDate(cur.getDate() - 1);
    }
    return { current, best, total: trainedDates.length };
  })();

  // sessions logged in the last 7 days (rolling)
  const last7 = (() => {
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayStr() + "T00:00:00");
      d.setDate(d.getDate() - i);
      if (trainedMap[d.toISOString().slice(0, 10)]) n++;
    }
    return n;
  })();

  /* ---------- updates ---------- */
  const update = (field, val) => persist({ ...state, [who]: { ...p, [field]: val } });

  const setTierField = (idx, field, val) => {
    const tiers = p.tiers.map((t, i) => (i === idx ? { ...t, [field]: val } : t));
    persist({ ...state, [who]: { ...p, tiers } });
  };

  const toggleExercise = (dayIdx, exIdx) => {
    const day = todayStr();
    const logs = { ...p.logs };
    const dayKey = `${day}|${dayIdx}`;
    const entry = logs[dayKey] ? { ...logs[dayKey] } : {};
    entry[exIdx] = entry[exIdx] ? null : { done: true, weight: entry[exIdx]?.weight || "", reps: entry[exIdx]?.reps || "" };
    if (!entry[exIdx]) delete entry[exIdx];
    logs[dayKey] = entry;
    persist({ ...state, [who]: { ...p, logs } });
  };

  const setExField = (dayIdx, exIdx, field, val) => {
    const day = todayStr();
    const logs = { ...p.logs };
    const dayKey = `${day}|${dayIdx}`;
    const entry = logs[dayKey] ? { ...logs[dayKey] } : {};
    entry[exIdx] = { done: entry[exIdx]?.done || false, weight: entry[exIdx]?.weight || "", reps: entry[exIdx]?.reps || "", [field]: val };
    logs[dayKey] = entry;
    persist({ ...state, [who]: { ...p, logs } });
  };

  const toggleTravelDay = (dayIdx) => {
    const day = todayStr();
    const logs = { ...p.logs };
    const dayKey = `${day}|${dayIdx}`;
    const entry = logs[dayKey] ? { ...logs[dayKey] } : {};
    if (entry.__travel) delete entry.__travel;
    else entry.__travel = true;
    logs[dayKey] = entry;
    persist({ ...state, [who]: { ...p, logs } });
    flash(entry.__travel ? "✈️ Travel day credited — 30 min treadmill counts" : "Travel credit removed");
  };

  const logWeighIn = () => {
    const c = parseFloat(p.current);
    if (isNaN(c)) return flash("Enter a current weight first");
    const weighIns = [{ date: todayStr(), weight: c }, ...p.weighIns.filter((w) => w.date !== todayStr())];
    persist({ ...state, [who]: { ...p, weighIns } });
    flash("Weigh-in saved ✓");
  };

  const fireReminder = (r) => {
    const rs = { ...reminderState, [who]: { ...reminderState[who], [r.id]: todayStr() } };
    setReminderState(rs);
    saveKey("zulim:reminders", rs);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Zulim Workouts", { body: r.text });
    }
    flash(`${r.icon} ${r.text}`);
  };

  const askNotif = () => {
    if ("Notification" in window) Notification.requestPermission().then(() => flash("Notifications enabled — they'll fire while the app is open"));
    else flash("This browser doesn't support notifications");
  };

  // Build the data.json the email backend reads. Counts this week's
  // trained days (Mon–Sun) per person, plus weigh-ins and tiers.
  const buildExport = () => {
    const monday = (() => {
      const t = new Date(todayStr() + "T00:00:00");
      const d = (t.getDay() + 6) % 7;
      t.setDate(t.getDate() - d);
      return t;
    })();
    const weekDates = new Set();
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.add(d.toISOString().slice(0, 10));
    }
    const pack = (key) => {
      const sp = state[key];
      // trained dates this week
      const trained = new Set();
      Object.entries(sp.logs || {}).forEach(([k, entry]) => {
        if (!entry) return;
        const [date] = k.split("|");
        const sets = Object.entries(entry).filter(([kk, v]) => kk !== "__travel" && v).length;
        if ((sets > 0 || entry.__travel) && weekDates.has(date)) trained.add(date);
      });
      // weigh-ins oldest->newest for the backend
      const weighIns = [...(sp.weighIns || [])].sort((a, b) => a.date.localeCompare(b.date));
      return {
        startWeight: parseFloat(sp.startWeight) || (weighIns[0]?.weight ?? 0),
        weighIns,
        sessionsThisWeek: trained.size,
        tiers: sp.tiers.map((t) => ({ tier: t.tier, target: t.target })),
        tiersAlreadyAnnounced: [],
      };
    };
    return JSON.stringify({ christian: pack("his"), zulim: pack("hers") }, null, 2);
  };

  const copyExport = async () => {
    const json = buildExport();
    try {
      await navigator.clipboard.writeText(json);
      flash("Copied ✓ — paste into data.json on your server");
    } catch {
      // fallback: show in a prompt-like flash
      flash("Copy failed — select the text below manually");
    }
    setExportText(json);
  };

  if (loading) {
    return (
      <div style={{ ...wrap, alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 22, color: C.ember }}>Loading Zulim…</div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        .zbtn{transition:transform .14s cubic-bezier(.34,1.56,.64,1), opacity .12s ease, box-shadow .2s ease;}
        .zbtn:active{transform:scale(.95);}
        .zcard{transition:transform .18s ease, box-shadow .2s ease;}
        .zcard:hover{box-shadow:0 8px 30px rgba(15,17,21,.08);}
        @keyframes pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes slideup{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
        .stagger{animation:slideup .45s cubic-bezier(.16,1,.3,1) both;}
        input::placeholder{color:${C.mute};opacity:.7;}
        input:focus{outline:none;}
        details summary::-webkit-details-marker{display:none;}
        *{-webkit-tap-highlight-color:transparent;}
      `}</style>

      {/* ---- masthead ---- */}
      <div style={{ paddingBottom: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 0.95, letterSpacing: -1.5, color: C.ink }}>
              {prof.name}<span style={{ color: prof.accent }}>.</span>
            </div>
            <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, color: C.mute, marginTop: 2 }}>
              {prof.label}
            </div>
          </div>
          {/* track switch */}
          <div style={{ display: "flex", gap: 4, background: C.cream, padding: 4, borderRadius: 999, border: `1px solid ${C.line}` }}>
            {Object.values(PROFILES).map((pr) => (
              <button
                key={pr.key}
                className="zbtn"
                onClick={() => setWho(pr.key)}
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 0,
                  padding: "9px 20px",
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  background: who === pr.key ? pr.accent : "transparent",
                  color: who === pr.key ? "#fff" : C.mute,
                  boxShadow: who === pr.key ? `0 4px 14px ${pr.accent}44` : "none",
                }}
              >
                {pr.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- tabs ---- */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {[
          ["today", "Today"],
          ["weight", "Weight & Tiers"],
          ["history", "History"],
          ["shared", "Both of Us"],
          ["plan", "The Plan"],
        ].map(([k, label]) => (
          <button
            key={k}
            className="zbtn"
            onClick={() => setTab(k)}
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: 13.5,
              letterSpacing: 0,
              padding: "10px 16px",
              border: "none",
              background: tab === k ? C.ink : C.cream,
              color: tab === k ? "#fff" : C.mute,
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: tab === k ? 700 : 600,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* =================== TODAY =================== */}
      {tab === "today" && (
        <div className="stagger">
          <SectionTitle accent={prof.accent}>Log Today's Workout</SectionTitle>
          <p style={pNote}>Pick the day you're training, tap each exercise as you finish, and jot the weight × reps you hit.</p>
          {PROGRAMS[who].map((d, dayIdx) => {
            const dayKey = `${todayStr()}|${dayIdx}`;
            const done = p.logs[dayKey] || {};
            const isTravel = !!done.__travel;
            const completed = Object.entries(done).filter(([k, v]) => k !== "__travel" && v).length;
            const credited = isTravel || completed > 0;
            return (
              <details key={dayIdx} style={{ ...dayCard, borderColor: credited ? prof.accent + "55" : C.line }} open={dayIdx === 0}>
                <summary style={daySummary}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>{d.day}</span>
                    {isTravel && <span style={{ fontSize: 15 }}>✈️</span>}
                  </span>
                  <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 12.5, fontWeight: 700, color: credited ? prof.accent : C.mute }}>
                    {isTravel ? "Travel ✓" : `${completed}/${d.ex.length}`}
                  </span>
                </summary>
                <div style={{ padding: "6px 0 4px", opacity: isTravel ? 0.45 : 1, pointerEvents: isTravel ? "none" : "auto" }}>
                  {d.ex.map((ex, exIdx) => {
                    const e = done[exIdx];
                    const isDone = !!e?.done;
                    return (
                      <div key={exIdx} style={{ ...exRow, background: isDone ? prof.accent + "0f" : "transparent" }}>
                        <button
                          className="zbtn"
                          onClick={() => toggleExercise(dayIdx, exIdx)}
                          style={{
                            width: 26, height: 26, minWidth: 26, borderRadius: 8, marginTop: 1,
                            border: `2px solid ${isDone ? prof.accent : C.line}`,
                            background: isDone ? prof.accent : "#fff",
                            color: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {isDone ? "✓" : ""}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 15, color: C.ink }}>
                            {ex.n}
                          </div>
                          <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 12.5, fontWeight: 500, color: C.mute, marginTop: 2 }}>
                            {ex.s} &nbsp;·&nbsp; rest {ex.rest}
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            <input
                              value={e?.weight || ""}
                              onChange={(ev) => setExField(dayIdx, exIdx, "weight", ev.target.value)}
                              placeholder="weight"
                              style={miniInput}
                            />
                            <input
                              value={e?.reps || ""}
                              onChange={(ev) => setExField(dayIdx, exIdx, "reps", ev.target.value)}
                              placeholder="reps hit"
                              style={miniInput}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="zbtn"
                  onClick={() => toggleTravelDay(dayIdx)}
                  style={{
                    width: "100%", marginTop: 8, padding: "11px", borderRadius: 12, cursor: "pointer",
                    fontFamily: "Manrope, sans-serif", fontSize: 13.5, fontWeight: 700,
                    border: `1.5px solid ${isTravel ? prof.accent : C.line}`,
                    background: isTravel ? prof.accent : "#fff",
                    color: isTravel ? "#fff" : C.mute,
                  }}
                >
                  {isTravel ? "✈️ Travel day credited — tap to undo" : "✈️ Out of town? Credit this as a travel day"}
                </button>
              </details>
            );
          })}

          {/* reminders */}
          <SectionTitle accent={prof.accent} style={{ marginTop: 26 }}>Daily Nudges</SectionTitle>
          <p style={pNote}>Tap to log + fire a notification. Enable browser alerts so they pop even when you tab away.</p>
          <button className="zbtn" onClick={askNotif} style={{ ...ghostBtn, marginBottom: 10 }}>
            Enable notifications
          </button>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {REMINDERS.map((r) => {
              const hit = reminderState[who]?.[r.id] === todayStr();
              return (
                <button
                  key={r.id}
                  className="zbtn"
                  onClick={() => fireReminder(r)}
                  style={{
                    flex: "1 1 150px", textAlign: "left", padding: "12px 14px", cursor: "pointer",
                    border: `1.5px solid ${hit ? prof.accent : C.line}`, borderRadius: 4,
                    background: hit ? "rgba(216,82,29,0.06)" : C.cream,
                  }}
                >
                  <div style={{ fontSize: 20 }}>{r.icon}</div>
                  <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: C.ink, marginTop: 4 }}>{r.text}</div>
                  <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 10, color: hit ? prof.accent : C.mute, marginTop: 4 }}>
                    {hit ? "logged today ✓" : "tap to log"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =================== WEIGHT & TIERS =================== */}
      {tab === "weight" && (
        <div className="stagger">
          <SectionTitle accent={prof.accent}>Weight & Goal Tiers</SectionTitle>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <Field label="Starting weight">
              <input value={p.startWeight} onChange={(e) => update("startWeight", e.target.value)} placeholder="e.g. 210" style={bigInput} />
            </Field>
            <Field label="Current weight">
              <input value={p.current} onChange={(e) => update("current", e.target.value)} placeholder="e.g. 205" style={bigInput} />
            </Field>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="zbtn" onClick={logWeighIn} style={{ ...solidBtn, background: prof.accent }}>
                Save weigh-in
              </button>
            </div>
          </div>

          <div style={{ ...lostBanner, borderColor: prof.accent }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 54, color: prof.accent, lineHeight: 0.9 }}>
              {lost} <span style={{ fontSize: 22 }}>lbs lost</span>
            </div>
            {nextTier ? (
              <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 12, color: C.mute, marginTop: 4 }}>
                {(nextTier.target - lost).toFixed(1)} lbs to Tier {nextTier.tier}
              </div>
            ) : (
              <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 12, color: prof.accent, marginTop: 4 }}>
                🏆 All tiers cleared — legend.
              </div>
            )}
          </div>

          <p style={{ ...pNote, marginTop: 18 }}>Type whatever reward you two agreed on into each tier. They save automatically.</p>
          {tierStatus.map((t, idx) => (
            <div key={idx} style={{ ...tierCard, borderColor: t.done ? prof.accent : C.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, width: 40, height: 40,
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: t.done ? prof.accent : "transparent", color: t.done ? "#fff" : C.ink,
                      border: `2px solid ${prof.accent}`,
                    }}
                  >
                    {t.tier}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 12, color: C.mute }}>Target</span>
                      <input
                        value={t.target}
                        onChange={(e) => setTierField(idx, "target", parseFloat(e.target.value) || 0)}
                        style={{ ...miniInput, width: 50, fontSize: 14 }}
                      />
                      <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 12, color: C.mute }}>lbs</span>
                    </div>
                  </div>
                </div>
                {t.done && <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: prof.accent }}>UNLOCKED ✓</span>}
              </div>
              <div style={{ height: 6, background: C.line, borderRadius: 3, margin: "10px 0 8px", overflow: "hidden" }}>
                <div style={{ width: `${t.pct}%`, height: "100%", background: prof.accent, transition: "width .4s ease" }} />
              </div>
              <input
                value={t.reward}
                onChange={(e) => setTierField(idx, "reward", e.target.value)}
                placeholder="🎁 your reward for this tier…"
                style={{ ...bigInput, width: "100%", boxSizing: "border-box" }}
              />
            </div>
          ))}

          {/* weight chart */}
          {p.weighIns.length > 0 && (
            <>
              <SectionTitle accent={prof.accent} style={{ marginTop: 24 }}>Progress Chart</SectionTitle>
              <WeightChart weighIns={p.weighIns} accent={prof.accent} tiers={p.tiers} startWeight={parseFloat(p.startWeight)} />
            </>
          )}

          {/* weigh-in history */}
          {p.weighIns.length > 0 && (
            <>
              <SectionTitle accent={prof.accent} style={{ marginTop: 24 }}>Weigh-in History</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.weighIns.slice(0, 14).map((w, i) => (
                  <div key={i} style={historyChip}>
                    <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 10, color: C.mute }}>{w.date.slice(5)}</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: C.ink }}>{w.weight}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* =================== HISTORY =================== */}
      {tab === "history" && (
        <div className="stagger">
          <SectionTitle accent={prof.accent}>Training History</SectionTitle>
          <p style={pNote}>Every day you log a set — or credit a travel day — lights up here. Travel days count too.</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <StatTile label="Current streak" value={streaks.current} unit={streaks.current === 1 ? "day" : "days"} accent={prof.accent} big />
            <StatTile label="Best streak" value={streaks.best} unit={streaks.best === 1 ? "day" : "days"} accent={prof.accent} />
            <StatTile label="Last 7 days" value={`${last7}/7`} unit="trained" accent={prof.accent} />
            <StatTile label="Total days" value={streaks.total} unit="logged" accent={prof.accent} />
          </div>

          {trainedDates.length === 0 ? (
            <div style={{ ...dayCard, textAlign: "center", padding: "32px 18px" }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>🗓️</div>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600, color: C.mute }}>
                No sessions logged yet. Check off a workout on the Today tab and it'll appear here.
              </div>
            </div>
          ) : (
            <>
              <SectionTitle accent={prof.accent} style={{ marginTop: 4 }}>Last 12 Weeks</SectionTitle>
              <Heatmap trainedMap={trainedMap} accent={prof.accent} />

              <SectionTitle accent={prof.accent} style={{ marginTop: 24 }}>Recent Sessions</SectionTitle>
              <div>
                {[...trainedDates].reverse().slice(0, 20).map((d) => {
                  const info = trainedMap[d];
                  const dateObj = new Date(d + "T00:00:00");
                  const label = dateObj.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                  const dayNames = [...info.days].sort().map((di) => PROGRAMS[who][di]?.day.split("—")[0].trim() || `Day ${di + 1}`);
                  return (
                    <div key={d} style={sessionRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: info.travel ? C.gold : prof.accent }} />
                        <div>
                          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 14.5, color: C.ink }}>{label}</div>
                          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 500, fontSize: 12.5, color: C.mute }}>
                            {info.travel ? "✈️ Travel day" : dayNames.join(" · ")}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: info.travel ? C.gold : prof.accent }}>
                        {info.travel ? "✓" : `${info.sets} sets`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* =================== SHARED =================== */}
      {tab === "shared" && (
        <div className="stagger">
          <SectionTitle accent={C.gold}>Both of Us</SectionTitle>
          <p style={pNote}>Separate goals, shared scoreboard. Cheer each other on.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.values(PROFILES).map((pr) => {
              const sp = state[pr.key];
              const sLost = (() => {
                const s = parseFloat(sp.startWeight), c = parseFloat(sp.current);
                return isNaN(s) || isNaN(c) ? 0 : Math.max(0, +(s - c).toFixed(1));
              })();
              const clears = sp.tiers.filter((t) => sLost >= t.target).length;
              const todayDays = PROGRAMS[pr.key].map((_, di) => sp.logs[`${todayStr()}|${di}`]).filter((d) => d && Object.keys(d).length);
              const setsToday = todayDays.reduce((a, d) => a + Object.entries(d).filter(([k, v]) => k !== "__travel" && v).length, 0);
              return (
                <div key={pr.key} className="zcard" style={{ ...sharedCard, borderTopColor: pr.accent }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, color: pr.accent }}>{pr.name}</div>
                  <div style={statRow}>
                    <span style={statLabel}>Lost</span>
                    <span style={{ ...statVal, color: pr.accent }}>{sLost} lbs</span>
                  </div>
                  <div style={statRow}>
                    <span style={statLabel}>Tiers cleared</span>
                    <span style={statVal}>{clears}/4</span>
                  </div>
                  <div style={statRow}>
                    <span style={statLabel}>Sets logged today</span>
                    <span style={statVal}>{setsToday}</span>
                  </div>
                  <div style={statRow}>
                    <span style={statLabel}>Last weigh-in</span>
                    <span style={statVal}>{sp.weighIns[0]?.weight ?? "—"}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {sp.tiers.map((t, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "Manrope, sans-serif", fontSize: 11, padding: "3px 0", color: sLost >= t.target ? pr.accent : C.mute }}>
                        <span>T{t.tier} · {t.target}lb {sLost >= t.target ? "✓" : ""}</span>
                        <span style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.reward || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ ...lostBanner, borderColor: C.gold, marginTop: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "Manrope, sans-serif", fontStyle: "italic", fontSize: 15, color: C.ink }}>
              Combined: {(["his", "hers"].reduce((a, k) => {
                const s = parseFloat(state[k].startWeight), c = parseFloat(state[k].current);
                return a + (isNaN(s) || isNaN(c) ? 0 : Math.max(0, s - c));
              }, 0)).toFixed(1)} lbs down together.
            </div>
          </div>

          {/* export for email backend */}
          <SectionTitle accent={C.gold} style={{ marginTop: 26 }}>Sync to Email Reminders</SectionTitle>
          <p style={pNote}>
            The recap, tier-unlock, and monthly-goal emails read a <b>data.json</b> file on your server.
            Tap below to copy your current numbers, then paste them into that file (replace its contents). Do this weekly — ideally Sunday night.
          </p>
          <button className="zbtn" onClick={copyExport} style={{ ...solidBtn, background: C.gold }}>
            Copy my data for the backend
          </button>
          {exportText && (
            <textarea
              readOnly
              value={exportText}
              onFocus={(e) => e.target.select()}
              style={{
                width: "100%", boxSizing: "border-box", marginTop: 12, minHeight: 200,
                fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11.5, lineHeight: 1.5,
                padding: 14, borderRadius: 14, border: `1.5px solid ${C.line}`, background: C.cream, color: C.ink, resize: "vertical",
              }}
            />
          )}
        </div>
      )}

      {/* =================== PLAN =================== */}
      {tab === "plan" && (
        <div className="stagger">
          <SectionTitle accent={prof.accent}>{prof.name} — Weekly Split</SectionTitle>
          <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 12, color: C.mute, marginBottom: 14, lineHeight: 1.8 }}>
            {who === "his"
              ? "Mon · Chest/Shoulders/Tris   —   Tue · Legs/Core   —   Thu · Back/Bis   —   Fri/Sat · Shoulders/Arms"
              : "Mon · Glutes + Push   —   Tue · Back + Pull   —   Thu · Glutes/Legs/Core   —   Sat · Upper + Skill"}
          </div>
          {PROGRAMS[who].map((d, i) => (
            <div key={i} style={dayCard}>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 16, color: C.ink, marginBottom: 8 }}>{d.day}</div>
              {d.ex.map((ex, j) => (
                <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px dashed ${C.line}` }}>
                  <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 14, color: C.ink }}>{ex.n}</span>
                  <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 11.5, color: C.mute, whiteSpace: "nowrap", marginLeft: 8 }}>{ex.s}</span>
                </div>
              ))}
            </div>
          ))}
          <SectionTitle accent={prof.accent} style={{ marginTop: 22 }}>{PROGRESSIONS[who].title}</SectionTitle>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {PROGRESSIONS[who].items.map((it, i) => (
              <li key={i} style={{ fontFamily: "Manrope, sans-serif", fontSize: 14, color: C.ink, marginBottom: 8, lineHeight: 1.45 }}>{it}</li>
            ))}
          </ul>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff", padding: "14px 22px", borderRadius: 14, fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 14, boxShadow: "0 12px 32px rgba(15,17,21,.28)", animation: "pop .2s ease", zIndex: 50, maxWidth: "90%" }}>
          {toast}
        </div>
      )}

      <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${C.line}`, fontFamily: "Manrope, sans-serif", fontSize: 10.5, color: C.mute, lineHeight: 1.6 }}>
        Your data saves automatically on this device. Notifications fire while the app is open — add it to your phone's home screen to get them on mobile. (Each phone keeps its own data for now; ask about a shared login to sync both.)
      </div>
    </div>
  );
}

/* ---------- small components ---------- */
function WeightChart({ weighIns, accent, tiers, startWeight }) {
  // weighIns are newest-first; chart oldest->newest
  const data = [...weighIns].reverse();
  if (data.length < 1) return null;
  const W = 680, H = 220, padL = 44, padR = 16, padT = 16, padB = 30;
  const weights = data.map((d) => d.weight);
  let min = Math.min(...weights), max = Math.max(...weights, startWeight || -Infinity);
  if (!isFinite(max)) max = Math.max(...weights);
  if (min === max) { min -= 2; max += 2; }
  const span = max - min || 1;
  const pad = span * 0.12;
  min -= pad; max += pad;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const x = (i) => data.length === 1 ? padL + innerW / 2 : padL + (i / (data.length - 1)) * innerW;
  const y = (w) => padT + innerH - ((w - min) / (max - min)) * innerH;
  const pts = data.map((d, i) => `${x(i)},${y(d.weight)}`).join(" ");
  const areaPts = `${padL},${padT + innerH} ${pts} ${x(data.length - 1)},${padT + innerH}`;
  const yticks = 4;
  return (
    <div style={{ background: C.cream, border: `1.5px solid ${C.line}`, borderRadius: 8, padding: 12, overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 320, display: "block" }}>
        <defs>
          <linearGradient id={`g-${accent.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: yticks + 1 }).map((_, i) => {
          const val = min + ((max - min) * i) / yticks;
          const yy = y(val);
          return (
            <g key={i}>
              <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke={C.line} strokeWidth="1" />
              <text x={padL - 8} y={yy + 3} textAnchor="end" fontFamily="Manrope, sans-serif" fontSize="10" fill={C.mute}>
                {val.toFixed(0)}
              </text>
            </g>
          );
        })}
        <polygon points={areaPts} fill={`url(#g-${accent.replace("#", "")})`} />
        <polyline points={pts} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.weight)} r="3.5" fill={C.cream} stroke={accent} strokeWidth="2" />
            {(i === 0 || i === data.length - 1 || data.length <= 6) && (
              <text x={x(i)} y={H - padB + 16} textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="9.5" fill={C.mute}>
                {d.date.slice(5)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function SectionTitle({ children, accent, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 10px", ...style }}>
      <div style={{ width: 5, height: 20, background: accent, borderRadius: 3 }} />
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 21, letterSpacing: -0.5, color: C.ink, margin: 0 }}>{children}</h2>
    </div>
  );
}

function StatTile({ label, value, unit, accent, big }) {
  return (
    <div className="zcard" style={{
      flex: big ? "1 1 150px" : "1 1 110px", background: "#fff", border: `1.5px solid ${C.line}`,
      borderRadius: 18, padding: "16px 18px", boxShadow: "0 1px 3px rgba(15,17,21,.04)",
    }}>
      <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 11.5, color: C.mute, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: big ? 40 : 30, color: accent, lineHeight: 1 }}>{value}</span>
        <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 12, color: C.mute }}>{unit}</span>
      </div>
    </div>
  );
}

function Heatmap({ trainedMap, accent }) {
  // 12 weeks ending this week. Columns = weeks, rows = Mon..Sun.
  const WEEKS = 12;
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
  // find Monday of current week
  const dow = (today.getDay() + 6) % 7; // 0=Mon
  const thisMon = new Date(today); thisMon.setDate(today.getDate() - dow);
  const cells = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const col = [];
    for (let r = 0; r < 7; r++) {
      const d = new Date(thisMon);
      d.setDate(thisMon.getDate() - w * 7 + r);
      const ds = d.toISOString().slice(0, 10);
      const info = trainedMap[ds];
      const future = d > today;
      col.push({ ds, info, future, isToday: ds === today.toISOString().slice(0, 10) });
    }
    cells.push(col);
  }
  const cell = (c, i) => {
    let bg = C.cream, border = `1px solid ${C.line}`;
    if (c.info?.travel) bg = C.gold;
    else if (c.info) bg = c.info.sets >= 5 ? accent : accent + "99";
    if (c.future) { bg = "transparent"; border = `1px dashed ${C.line}`; }
    return (
      <div key={i} title={c.ds + (c.info ? ` · ${c.info.travel ? "travel" : c.info.sets + " sets"}` : "")}
        style={{ width: 15, height: 15, borderRadius: 4, background: bg, border, boxSizing: "border-box",
          boxShadow: c.isToday ? `0 0 0 2px ${C.ink}` : "none" }} />
    );
  };
  const dayLabels = ["M", "", "W", "", "F", "", "S"];
  return (
    <div style={{ ...dayCard, overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginRight: 4, justifyContent: "space-between" }}>
          {dayLabels.map((l, i) => (
            <div key={i} style={{ height: 15, fontFamily: "Manrope, sans-serif", fontSize: 9, fontWeight: 700, color: C.mute, display: "flex", alignItems: "center" }}>{l}</div>
          ))}
        </div>
        {cells.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {col.map((c, ri) => cell(c, ri))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <Legend color={accent} label="Workout" />
        <Legend color={accent + "99"} label="Light day" />
        <Legend color={C.gold} label="Travel" />
        <Legend color={C.cream} label="Rest" border />
      </div>
    </div>
  );
}
function Legend({ color, label, border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: border ? `1px solid ${C.line}` : "none" }} />
      <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 11, fontWeight: 600, color: C.mute }}>{label}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: 0.3, color: C.mute, marginBottom: 6 }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

/* ---------- styles ---------- */
const wrap = {
  fontFamily: "Manrope, sans-serif",
  maxWidth: 760,
  margin: "0 auto",
  padding: "26px 18px 40px",
  background: `linear-gradient(180deg, #ffffff 0%, ${C.cream} 100%)`,
  color: C.ink,
  minHeight: "100vh",
  boxSizing: "border-box",
};
const pNote = { fontFamily: "Manrope, sans-serif", fontWeight: 500, fontSize: 13.5, color: C.mute, margin: "0 0 16px", lineHeight: 1.5 };
const dayCard = { background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 18, padding: "16px 18px", marginBottom: 12, boxShadow: "0 1px 3px rgba(15,17,21,.04)" };
const daySummary = { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", listStyle: "none", outline: "none" };
const exRow = { display: "flex", gap: 12, padding: "10px 10px", borderRadius: 12, marginBottom: 4, alignItems: "flex-start" };
const miniInput = { width: 78, padding: "8px 10px", border: `1.5px solid ${C.line}`, borderRadius: 10, fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 13, background: C.cream, color: C.ink };
const bigInput = { padding: "12px 14px", border: `1.5px solid ${C.line}`, borderRadius: 12, fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 15, background: "#fff", color: C.ink, width: 120 };
const solidBtn = { fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: 0, color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", cursor: "pointer" };
const ghostBtn = { fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 13, color: C.ink, background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "11px 16px", cursor: "pointer" };
const lostBanner = { background: "#fff", border: `1.5px solid`, borderRadius: 18, padding: "20px 22px", marginTop: 16, boxShadow: "0 1px 3px rgba(15,17,21,.04)" };
const tierCard = { background: "#fff", border: `1.5px solid`, borderRadius: 18, padding: "16px 18px", marginBottom: 12, boxShadow: "0 1px 3px rgba(15,17,21,.04)" };
const historyChip = { display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "8px 12px", minWidth: 52 };
const sharedCard = { flex: "1 1 280px", background: "#fff", border: `1.5px solid ${C.line}`, borderTop: `4px solid`, borderRadius: 18, padding: "18px 20px", boxShadow: "0 1px 3px rgba(15,17,21,.04)" };
const statRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.line}` };
const statLabel = { fontFamily: "Manrope, sans-serif", fontWeight: 500, fontSize: 12.5, color: C.mute };
const statVal = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: C.ink };
const sessionRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 14, marginBottom: 8 };
