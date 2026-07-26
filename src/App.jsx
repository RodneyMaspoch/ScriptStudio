import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ======================================================================
   Data: frameworks + beat definitions (copy is exact from the handoff)
   ====================================================================== */

const FRAMEWORKS = [
  { key: "clock", name: "Story Clock", count: 8, unit: "beats", blurb: "The story circle — comfort, desire, descent, return. Lean and rhythmic.", best: "Best for shorts", fits: ["micro", "short", "long_short"] },
  { key: "journey", name: "Hero's Journey", count: 12, unit: "stages", blurb: "The classic mythic arc — call, threshold, ordeal, elixir.", best: "Best for transformation", fits: ["long_short", "feature"] },
  { key: "cat", name: "Save the Cat", count: 15, unit: "beats", blurb: "Blake Snyder’s beat sheet — precise page-count turns and a midpoint pivot.", best: "Best for tight plotting", fits: ["feature", "long_short"] },
  { key: "threeact", name: "Three-Act", count: 6, unit: "movements", blurb: "Setup, confrontation, resolution — the bare structural bones.", best: "Best for fast drafts", fits: ["micro", "short", "long_short", "feature"] },
  { key: "sequence", name: "Sequence Method", count: 8, unit: "sequences", blurb: "Eight mini-movies, each with its own tension and release.", best: "Best for episodic shorts", fits: ["long_short", "feature"] },
  { key: "kisho", name: "Kishōtenketsu", count: 4, unit: "acts", blurb: "Four movements built on a twist rather than conflict.", best: "Best for mood pieces", fits: ["micro", "short", "long_short", "feature"] },
];

function defsFor(fw) {
  if (fw === "cat") return [
    { title: "Opening Image", question: "What single first shot sets the tone and shows the world before change?", hint: "It should rhyme with your final image." },
    { title: "Theme Stated", question: "What line or moment quietly poses the question your film will answer?", hint: "Say it sideways, not as a thesis." },
    { title: "Setup", question: "Who is your protagonist, what do they want, and what is broken in their life?", hint: "Plant everything you will pay off later." },
    { title: "Catalyst", question: "What event knocks the status quo off its rails?", hint: "External, concrete, unmissable." },
    { title: "Debate", question: "What does the protagonist argue with themselves about before committing?", hint: "This is where the fear lives." },
    { title: "Break into Two", question: "How do they actively choose the new world?", hint: "A choice, never an accident." },
    { title: "B Story", question: "What relationship or subplot carries the theme?", hint: "Often the person who teaches the lesson." },
    { title: "Fun and Games", question: "What is the promise of the premise — the sequence people came to see?", hint: "Let the concept play." },
    { title: "Midpoint", question: "What false victory or false defeat raises the stakes and flips the goal?", hint: "Stakes must become personal here." },
    { title: "Bad Guys Close In", question: "How does opposition tighten, internally and externally?", hint: "Erode their support system." },
    { title: "All Is Lost", question: "What is the lowest point, and what dies here?", hint: "Something must truly be lost." },
    { title: "Dark Night of the Soul", question: "What do they realize while sitting in the wreckage?", hint: "Grief before insight." },
    { title: "Break into Three", question: "What new understanding lets them act differently?", hint: "Fuse A story and B story." },
    { title: "Finale", question: "How do they prove the change and resolve the want?", hint: "Dismantle the problem for good." },
    { title: "Final Image", question: "What last shot shows how far they travelled?", hint: "Mirror the opening image." },
  ];
  if (fw === "threeact") return [
    { title: "Setup", question: "Establish the world, the protagonist, and the flaw or lack driving them.", hint: "One telling detail beats a biography." },
    { title: "Inciting Incident", question: "What disrupts the ordinary and starts the story engine?", hint: "Make it specific and irreversible." },
    { title: "Rising Complications", question: "What escalating obstacles make the goal harder to reach?", hint: "Each attempt should cost more." },
    { title: "Midpoint Turn", question: "What revelation or reversal changes the nature of the problem?", hint: "Shift from reactive to active." },
    { title: "Climax", question: "What final confrontation forces a decisive choice?", hint: "The choice should reveal character." },
    { title: "Resolution", question: "What is the new equilibrium, and what has changed?", hint: "Show change as behavior." },
  ];
  if (fw === "sequence") return [
    { title: "Sequence 1 — Status Quo", question: "What world and central tension do we open on?", hint: "End the sequence on a question." },
    { title: "Sequence 2 — Predicament", question: "What lock-in traps the protagonist in the story problem?", hint: "Close the exit door." },
    { title: "Sequence 3 — First Attempt", question: "What is their first plan, and how does it fall short?", hint: "Failure should teach them something." },
    { title: "Sequence 4 — Raised Stakes", question: "What complication forces a bigger commitment?", hint: "Drive toward the midpoint." },
    { title: "Sequence 5 — New Plan", question: "After the midpoint, what different approach do they take?", hint: "New information, new tactic." },
    { title: "Sequence 6 — Pressure", question: "How does opposition nearly break them?", hint: "Strip away their advantages." },
    { title: "Sequence 7 — Final Push", question: "What is the all-in effort toward the goal?", hint: "No safety net." },
    { title: "Sequence 8 — Aftermath", question: "How does it resolve, and what is the cost?", hint: "Answer the opening question." },
  ];
  if (fw === "kisho") return [
    { title: "Ki — Introduction", question: "Introduce the characters and the world without conflict.", hint: "Observe rather than provoke." },
    { title: "Sho — Development", question: "How does that world deepen and reveal texture?", hint: "Accumulate detail, not tension." },
    { title: "Ten — Twist", question: "What unexpected element recontextualizes everything so far?", hint: "The turn need not be a conflict." },
    { title: "Ketsu — Conclusion", question: "How do the first parts and the twist reconcile into meaning?", hint: "Resonance over resolution." },
  ];
  if (fw === "clock") return [
    { title: "You", question: "Establish your protagonist in their normal world. Who are they, and what's the comfortable — or stuck — routine we're pulling them out of?", hint: "Ground us in one specific, telling detail, not a résumé." },
    { title: "Need", question: "Something cracks the routine and creates a want or lack. What does your protagonist desire, consciously or not?", hint: "Do you know the surface want and the deeper need underneath it?" },
    { title: "Go", question: "They step into an unfamiliar situation to chase that want. What threshold do they cross?", hint: "It should cost something or feel irreversible." },
    { title: "Search", question: "They adapt and struggle in this new world. What trials, choices, and characters do they meet?", hint: "Escalate — each attempt should raise the price." },
    { title: "Find", question: "They get what they were looking for. What do they obtain, and is it what they expected?", hint: "The win should carry a catch." },
    { title: "Take", question: "They pay a heavy price for it. What is the cost, sacrifice, or consequence?", hint: "This is the low point — make it hurt." },
    { title: "Return", question: "Changed by what happened, they head back toward the familiar world. What is the journey back?", hint: "Show momentum and pursuit, not just relocation." },
    { title: "Change", question: "How is your protagonist different now? What has the story proven or transformed?", hint: "State the change as new behavior, not just a feeling." },
  ];
  return [
    { title: "Ordinary World", question: "Show the hero's normal life and what's missing or unbalanced in it.", hint: "Contrast makes the coming change land." },
    { title: "Call to Adventure", question: "What disrupts the status quo and presents the central problem or quest?", hint: "Be concrete about the inciting event." },
    { title: "Refusal of the Call", question: "Why does the hero hesitate? What fear or obligation holds them back?", hint: "Refusal reveals the internal wound." },
    { title: "Meeting the Mentor", question: "Who or what gives the hero guidance, tools, or the confidence to proceed?", hint: "A mentor can be a person, object, or memory." },
    { title: "Crossing the Threshold", question: "The hero commits and enters the special world. What is the point of no return?", hint: "Make the commitment active and costly." },
    { title: "Tests, Allies, Enemies", question: "What challenges, friends, and foes define the rules of this new world?", hint: "Each should test a specific weakness." },
    { title: "Approach to the Inmost Cave", question: "How does the hero prepare for the biggest challenge, and what is truly at stake?", hint: "Raise the stakes before the plunge." },
    { title: "The Ordeal", question: "The central crisis. What life-or-death confrontation — literal or emotional — happens?", hint: "The hero should face their deepest fear." },
    { title: "Reward", question: "What does the hero gain from surviving the ordeal, and what did it cost?", hint: "The reward can be an object, a truth, or reconciliation." },
    { title: "The Road Back", question: "What drives the hero back toward the ordinary world? What chases them?", hint: "Reignite urgency before the finale." },
    { title: "Resurrection", question: "The final test where the hero proves their transformation. What is the climax?", hint: "Show the old self dying, the new self acting." },
    { title: "Return with the Elixir", question: "The hero returns changed, with something that benefits the ordinary world. What is it?", hint: "Close the loop opened in the ordinary world." },
  ];
}

const COACH_STYLES = {
  "Gentle nudges": "Be warm and encouraging; raise only the single most important gap, gently.",
  "Socratic": "Be probing but supportive; ask sharp questions that make the writer think.",
  "Blunt script-doctor": "Be direct and unsparing, like a seasoned script doctor; name weaknesses plainly.",
};

const ELS = [
  { key: "scene", label: "Scene", hint: "Scene heading — INT./EXT." },
  { key: "action", label: "Action", hint: "Action / description" },
  { key: "character", label: "Character", hint: "Character cue" },
  { key: "paren", label: "Paren", hint: "Parenthetical" },
  { key: "dialogue", label: "Dialogue", hint: "Dialogue" },
  { key: "transition", label: "Transition", hint: "CUT TO:" },
];
const NEXT_EL = { scene: "action", action: "action", character: "dialogue", paren: "dialogue", dialogue: "action", transition: "scene" };
const EL_PLACEHOLDER = { scene: "INT. LOCATION — DAY", action: "Action…", character: "CHARACTER", paren: "(beat)", dialogue: "Dialogue…", transition: "CUT TO:" };
const FDX_TYPE = { scene: "Scene Heading", action: "Action", character: "Character", paren: "Parenthetical", dialogue: "Dialogue", transition: "Transition" };

const GROUP_META = {
  structure: { label: "Structure", color: "#5AA9FF" },
  character: { label: "Character & Arc", color: "#C08BFF" },
  pacing: { label: "Pacing", color: "#46D18A" },
  stakes: { label: "Stakes & Tension", color: "#FF8B5A" },
};
const SEV_COLOR = { high: "#FF5A5A", medium: "#F5A623", low: "#8B8B93" };

const CORK_ROTATIONS = [-1.6, 1.1, -0.6, 1.4, -1.1, 0.8, -1.3, 0.6, -0.9, 1.2, -0.5, 1.5];

const LENGTH_OPTIONS = [
  { key: "micro", label: "Micro (under 2 min)", phrase: "a micro short film (under 2 minutes)", range: [0, 2] },
  { key: "short", label: "Short (3\u201310 min)", phrase: "a short film (roughly 3\u201310 minutes)", range: [3, 10] },
  { key: "long_short", label: "Long short (10\u201320 min)", phrase: "a longer short film (roughly 10\u201320 minutes)", range: [10, 20] },
  { key: "feature", label: "Full feature (90\u2013120 min)", phrase: "a feature film (roughly 90\u2013120 minutes)", range: [90, 120] },
  { key: "other", label: "Other (specify)\u2026", phrase: null, range: null },
];

function lengthPhrase(state) {
  const opt = LENGTH_OPTIONS.find((o) => o.key === state.targetLength);
  if (!opt) return "a short film";
  if (opt.key === "other") {
    const custom = (state.targetLengthCustom || "").trim();
    return custom ? `a film with a target length of "${custom}"` : "a film of unspecified length";
  }
  return opt.phrase;
}

function targetRange(state) {
  const opt = LENGTH_OPTIONS.find((o) => o.key === state.targetLength);
  if (!opt) return null;
  if (opt.key !== "other") return opt.range;
  const m = (state.targetLengthCustom || "").match(/(\d+(\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return [n * 0.8, n * 1.2];
}

const DEFAULT_STATE = {
  framework: null,
  data: {},
  reviewInput: "",
  boardQuery: "",
  filters: { size: "Any", angle: "Any", mood: "Any" },
  developView: "write",
  overview: "",
  targetLength: "short",
  targetLengthCustom: "",
  settings: { coachStyle: "Socratic", referenceCount: 6 },
  script: [{ type: "scene", text: "" }, { type: "action", text: "" }],
};

/* ======================================================================
   Storage + AI helpers
   ====================================================================== */

const LEGACY_STORAGE_KEY = "scriptstudio_v1";
const INDEX_KEY = "scriptstudio_index";
const projectKey = (id) => `scriptstudio_project:${id}`;
const newProjectId = () => "proj_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

async function loadIndex() {
  try {
    const res = await window.storage.get(INDEX_KEY, false);
    return res ? JSON.parse(res.value) : [];
  } catch (e) {
    return [];
  }
}
async function saveIndex(list) {
  try {
    await window.storage.set(INDEX_KEY, JSON.stringify(list), false);
  } catch (e) {
    console.error("saveIndex failed", e);
  }
}
async function loadProjectData(id) {
  try {
    const res = await window.storage.get(projectKey(id), false);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}
async function saveProjectData(id, data) {
  try {
    await window.storage.set(projectKey(id), JSON.stringify(data), false);
  } catch (e) {
    console.error("saveProjectData failed", e);
  }
}
async function deleteProjectData(id) {
  try {
    await window.storage.delete(projectKey(id), false);
  } catch (e) {
    console.error("deleteProjectData failed", e);
  }
}

// One-time migration: if this browser has data from before multi-project support
// existed, fold it into a new "My First Project" entry instead of losing it.
async function migrateLegacyIfNeeded() {
  let existingIndex = await loadIndex();
  if (existingIndex.length > 0) return existingIndex;
  let legacy = null;
  try {
    const res = await window.storage.get(LEGACY_STORAGE_KEY, false);
    legacy = res ? JSON.parse(res.value) : null;
  } catch (e) {
    legacy = null;
  }
  const id = newProjectId();
  const data = legacy || { ...DEFAULT_STATE };
  await saveProjectData(id, data);
  const idx = [{ id, title: legacy ? "My First Project" : "Untitled Project", updatedAt: Date.now() }];
  await saveIndex(idx);
  return idx;
}

// Set this to your deployed AI proxy Worker URL (see worker/index.js + README).
// Configure it via a .env file: VITE_AI_PROXY_URL=https://your-worker.workers.dev
const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || "";

async function callClaude({ system, messages }) {
  if (!AI_PROXY_URL) {
    throw new Error("AI features aren't configured yet \u2014 set VITE_AI_PROXY_URL in your .env file (see README).");
  }
  const response = await fetch(AI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });
  if (!response.ok) throw new Error("Something went wrong. Try again.");
  const data = await response.json();
  return (data.text || "").trim();
}

function parseJSON(txt) {
  if (!txt) return null;
  try {
    let s = String(txt).trim().replace(/```json/gi, "").replace(/```/g, "").trim();
    const a = s.search(/[\[{]/);
    if (a > 0) s = s.slice(a);
    const last = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
    if (last >= 0) s = s.slice(0, last + 1);
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

function styleLine(style) {
  return COACH_STYLES[style] || COACH_STYLES["Socratic"];
}
function overviewContext(overview) {
  const o = (overview || "").trim();
  return o ? `Story overview the writer has given: """${o}"""\n\n` : "";
}

/* ======================================================================
   Small inline icons (paths copied from the handoff for exact fidelity)
   ====================================================================== */

const IconClapper = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 7.5h17M3.5 7.5 6 3.5h3l-2.4 4M10 7.5 12.5 3.5h3l-2.5 4M16.5 7.5 19 3.5h1.5"></path>
    <rect x="3.5" y="7.5" width="17" height="13" rx="2"></rect>
  </svg>
);
const IconCoach = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5"></circle><path d="M12 7v5l3 2"></path>
  </svg>
);
const IconScript = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M9 3h6v3H9zM8 12h8M8 16h5"/>
  </svg>
);
const IconBoard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18M9 5v14"></path>
  </svg>
);
const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v6m0 12v-6M12 3v10m0 8v-4M18 3v3m0 15v-9"></path><path d="M4 9h4m2 6h4m2-9h4"></path>
  </svg>
);
const IconFolder = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path>
  </svg>
);
const IconPen = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
  </svg>
);
const IconCheckSmall = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"></path>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"></path>
  </svg>
);
const IconOverview = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFE600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18M3 12h18M3 19h12"></path></svg>
);
const IconWrite = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h11M4 11h16M4 16h9"></path><path d="m17 19 4-4-2-2-4 4v2h2Z"></path>
  </svg>
);
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="7.5" height="7" rx="1"></rect><rect x="13.5" y="4" width="7.5" height="7" rx="1"></rect>
    <rect x="3" y="13" width="7.5" height="7" rx="1"></rect><rect x="13.5" y="13" width="7.5" height="7" rx="1"></rect>
  </svg>
);
const IconSpark = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3"></path><circle cx="12" cy="12" r="3.2"></circle>
  </svg>
);
const IconDoc = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3A3A42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12h6m-6 4h4M8 3h8l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"></path>
  </svg>
);
const IconSearch = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
  </svg>
);
const IconInfo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5E5E66" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5"></circle><path d="M12 16v-4m0-4h.01"></path>
  </svg>
);
const IconClose = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"></path>
  </svg>
);
const Spinner = ({ size = 14, border = 2 }) => (
  <span className="tl-spinner" style={{ width: size, height: size, borderWidth: border }} />
);

/* ======================================================================
   Main component
   ====================================================================== */

export default function App() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [renameDraftId, setRenameDraftId] = useState(null);
  const [renameDraftText, setRenameDraftText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [mode, setMode] = useState("coach");
  const [coachTab, setCoachTab] = useState("develop");
  const [focusIdx, setFocusIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  const [boardLoading, setBoardLoading] = useState(false);
  const [boardResults, setBoardResults] = useState([]);
  const [boardError, setBoardError] = useState("");

  const [justSaved, setJustSaved] = useState(false);
  const saveFlashTimeout = useRef(null);

  const blockRefs = useRef([]);
  const beatSectionRefs = useRef({});

  useEffect(() => {
    (async () => {
      const idx = await migrateLegacyIfNeeded();
      const sorted = [...idx].sort((a, b) => b.updatedAt - a.updatedAt);
      setProjects(sorted);
      const first = sorted[0];
      if (first) {
        const data = await loadProjectData(first.id);
        setState((s) => ({ ...s, ...(data || {}) }));
        setActiveProjectId(first.id);
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated || !activeProjectId) return;
    const data = {
      framework: state.framework, data: state.data, reviewInput: state.reviewInput,
      boardQuery: state.boardQuery, filters: state.filters, developView: state.developView,
      overview: state.overview, targetLength: state.targetLength, targetLengthCustom: state.targetLengthCustom,
      settings: state.settings, script: state.script,
    };
    saveProjectData(activeProjectId, data).then(() => {
      setJustSaved(true);
      clearTimeout(saveFlashTimeout.current);
      saveFlashTimeout.current = setTimeout(() => setJustSaved(false), 1600);
    });
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === activeProjectId ? { ...p, updatedAt: Date.now() } : p));
      saveIndex(next);
      return next;
    });
  }, [state, hydrated, activeProjectId]);

  const resetEphemeralUI = () => {
    setFocusIdx(0);
    setReviewResult(null);
    setBoardResults([]);
    setBoardError("");
  };

  const switchProject = async (id) => {
    if (id === activeProjectId) { setLibraryOpen(false); return; }
    const data = await loadProjectData(id);
    setState({ ...DEFAULT_STATE, ...(data || {}) });
    setActiveProjectId(id);
    resetEphemeralUI();
    setLibraryOpen(false);
  };

  const createProject = async () => {
    const id = newProjectId();
    const fresh = { ...DEFAULT_STATE };
    await saveProjectData(id, fresh);
    const entry = { id, title: "Untitled Project", updatedAt: Date.now() };
    const next = [entry, ...projects];
    setProjects(next);
    await saveIndex(next);
    setState(fresh);
    setActiveProjectId(id);
    resetEphemeralUI();
    setLibraryOpen(false);
  };

  const deleteProject = async (id) => {
    await deleteProjectData(id);
    const next = projects.filter((p) => p.id !== id);
    setProjects(next);
    await saveIndex(next);
    setConfirmDeleteId(null);
    if (id === activeProjectId) {
      if (next.length > 0) {
        await switchProject(next[0].id);
      } else {
        await createProject();
      }
    }
  };

  const startRename = (p) => { setRenameDraftId(p.id); setRenameDraftText(p.title); };
  const saveRename = async () => {
    if (!renameDraftId) return;
    const title = renameDraftText.trim() || "Untitled Project";
    const next = projects.map((p) => (p.id === renameDraftId ? { ...p, title } : p));
    setProjects(next);
    await saveIndex(next);
    setRenameDraftId(null);
  };

  const patch = useCallback((p) => setState((s) => ({ ...s, ...(typeof p === "function" ? p(s) : p) })), []);
  const activeProjectTitle = projects.find((p) => p.id === activeProjectId)?.title || "Untitled Project";

  const getBeat = (fw, i) => (state.data[fw] && state.data[fw][i]) || { answer: "", status: "empty" };
  const patchBeat = (fw, i, p) => {
    setState((s) => {
      const cur = (s.data[fw] && s.data[fw][i]) || { answer: "", status: "empty" };
      return { ...s, data: { ...s.data, [fw]: { ...(s.data[fw] || {}), [i]: { ...cur, ...p } } } };
    });
  };

  const fw = state.framework;
  const defs = useMemo(() => (fw ? defsFor(fw) : []), [fw]);
  const total = defs.length;
  const answeredCount = defs.reduce((c, _, i) => c + (getBeat(fw, i).answer?.trim() ? 1 : 0), 0);
  const progressPct = total ? Math.round((answeredCount / total) * 100) : 0;

  /* ---------------- Story Coach: develop ---------------- */

  const askBeat = async (i) => {
    const b = getBeat(fw, i);
    const def = defs[i];
    if (!b.answer || !b.answer.trim()) {
      patchBeat(fw, i, { status: "error", errorMsg: "Write something for this beat first, then ask." });
      return;
    }
    patchBeat(fw, i, { status: "thinking" });
    const meta = FRAMEWORKS.find((x) => x.key === fw) || { name: "story", count: 0, unit: "beats" };
    const fwName = `${meta.name} (${meta.count} ${meta.unit})`;
    try {
      const txt = await callClaude({
        system: `You are a sharp film story consultant helping a writer develop ${lengthPhrase(state)} using the ${fwName} framework. Calibrate your notes to that target length \u2014 a beat that would need a whole sequence in a feature may need to land in a single image or line in something shorter, and vice versa. ${styleLine(state.settings.coachStyle)} Respond ONLY as minified JSON: {"strength":"...","hole":"...","followup":"..."}. strength = one specific thing that is working in their beat (max 25 words). hole = the single biggest weakness, missing element, or unexamined assumption (max 30 words). followup = one pointed question that would strengthen this beat (max 25 words). Be specific to their actual text, never generic.`,
        messages: [{ role: "user", content: `${overviewContext(state.overview)}Framework beat: ${def.title}\nWhat this beat should accomplish: ${def.question}\nThe writer wrote:\n"""${b.answer}"""\n\nJudge this beat both on its own and against the overview — flag anything that contradicts or is unsupported by the premise.` }],
      });
      const j = parseJSON(txt);
      if (j && (j.hole || j.followup)) patchBeat(fw, i, { status: "ready", strength: j.strength || "—", hole: j.hole || "—", followup: j.followup || "—" });
      else patchBeat(fw, i, { status: "ready", strength: "Noted.", hole: txt || "Could not parse a response.", followup: "Try rephrasing this beat and ask again." });
    } catch (e) {
      patchBeat(fw, i, { status: "error", errorMsg: e.message || "Something went wrong. Try again." });
    }
  };

  const goCard = (i) => {
    patch({ developView: "write" });
    setTimeout(() => beatSectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  /* ---------------- Story Coach: review ---------------- */

  const loadFromBeats = () => {
    const parts = defs.map((d, i) => { const a = getBeat(fw || "clock", i).answer; return a && a.trim() ? `## ${d.title}\n${a.trim()}` : null; }).filter(Boolean);
    patch({ reviewInput: parts.join("\n\n") });
  };

  const runReview = async () => {
    const script = (state.reviewInput || "").trim();
    if (!script) { setReviewResult(null); return; }
    setReviewLoading(true);
    setReviewResult(null);
    try {
      const txt = await callClaude({
        system: `You are a development executive giving structural notes on a script or treatment for ${lengthPhrase(state)}. Calibrate your pacing and structure notes specifically to that target length. ${styleLine(state.settings.coachStyle)} Return ONLY minified JSON: {"score":<0-100 integer>,"summary":"one-sentence overall read","groups":[{"key":"structure|character|pacing|stakes","items":[{"title":"short label","severity":"high|medium|low","note":"specific, actionable note that references the actual script"}]}]}. Include all four groups (structure, character, pacing, stakes), 1 to 3 items each. Notes must reference real content, not be generic advice. Keep the whole response tight enough to fit comfortably in one short reply.`,
        messages: [{ role: "user", content: overviewContext(state.overview) + script.slice(0, 7000) }],
      });
      const j = parseJSON(txt);
      if (j && j.groups) setReviewResult(j);
      else setReviewResult({ score: 0, summary: "Could not parse the review — try again.", groups: [] });
    } catch (e) {
      setReviewResult({ score: 0, summary: e.message || "Something went wrong.", groups: [] });
    } finally {
      setReviewLoading(false);
    }
  };

  /* ---------------- Storyboard ---------------- */

  const runSearch = async (queryOverride) => {
    const q = (queryOverride ?? state.boardQuery ?? "").trim();
    if (!q) return;
    const n = Math.max(3, Math.min(9, state.settings.referenceCount || 6));
    const f = state.filters;
    setBoardLoading(true);
    setBoardError("");
    setBoardResults([]);
    try {
      const txt = await callClaude({
        system: `You are a cinematographer's reference assistant. Given a shot description, suggest ${n} real, recognizable film scenes whose framing and mood match. Return ONLY a minified JSON array: [{"film":"","year":<int>,"scene":"one-line scene description","shotSize":"e.g. Medium wide","angle":"e.g. Over-the-shoulder","lens":"e.g. 40mm","lighting":"short mood phrase","palette":["#hex","#hex","#hex"],"why":"one line on why it matches"}]. palette = 3 hex colors capturing the scene's real color grade. Vary the films across eras and genres unless the query names a specific one.`,
        messages: [{ role: "user", content: `Shot: ${q}\nPreferred shot size: ${f.size}\nPreferred angle: ${f.angle}\nPreferred mood: ${f.mood}` }],
      });
      const j = parseJSON(txt);
      if (Array.isArray(j) && j.length) setBoardResults(j);
      else setBoardError("Could not read the references — try rephrasing the shot.");
    } catch (e) {
      setBoardError(e.message || "Something went wrong. Try again.");
    } finally {
      setBoardLoading(false);
    }
  };

  const useExample = (t) => { patch({ boardQuery: t }); runSearch(t); };

  /* ---------------- Screenplay editor ---------------- */

  const blocks = state.script && state.script.length ? state.script : [{ type: "scene", text: "" }, { type: "action", text: "" }];

  const setBlocks = (arr, fIdx) => {
    patch({ script: arr });
    if (typeof fIdx === "number") setFocusIdx(fIdx);
  };

  useEffect(() => {
    if (mode !== "script") return;
    const el = blockRefs.current[focusIdx];
    if (el && document.activeElement !== el) {
      el.focus();
      const n = el.value.length;
      try { el.setSelectionRange(n, n); } catch (e) {}
    }
  }, [focusIdx, state.script, mode]);

  const elCols = (type) => (type === "dialogue" ? 33 : type === "paren" ? 24 : type === "character" ? 30 : 60);
  const rowsFor = (text, type) => {
    const cols = elCols(type);
    return String(text || "").split("\n").reduce((n, line) => n + Math.max(1, Math.ceil(line.length / cols)), 0) || 1;
  };
  const elStyle = (type) => {
    const base = { display: "block", width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", overflow: "hidden", fontFamily: "'Courier Prime', monospace", fontSize: 16, lineHeight: "24px", color: "#1A1712", padding: 0, margin: 0 };
    if (type === "scene") return { ...base, textTransform: "uppercase", fontWeight: 700, marginTop: 24 };
    if (type === "character") return { ...base, textTransform: "uppercase", marginTop: 24, marginLeft: 211, width: 365 };
    if (type === "paren") return { ...base, marginLeft: 154, width: 230 };
    if (type === "dialogue") return { ...base, marginLeft: 96, width: 317 };
    if (type === "transition") return { ...base, textTransform: "uppercase", textAlign: "right", marginTop: 24 };
    return { ...base, marginTop: 24 };
  };

  const blockInput = (i) => (e) => {
    const arr = blocks.slice();
    arr[i] = { ...arr[i], text: e.target.value };
    patch({ script: arr });
  };
  const blockFocus = (i) => () => setFocusIdx(i);
  const setElType = (key) => () => {
    const arr = blocks.slice();
    if (!arr[focusIdx]) return;
    arr[focusIdx] = { ...arr[focusIdx], type: key };
    setBlocks(arr, focusIdx);
  };
  const blockKeyDown = (i) => (e) => {
    const arr = blocks.slice();
    const cur = arr[i];
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const nextType = NEXT_EL[cur.type] || "action";
      arr.splice(i + 1, 0, { type: nextType, text: "" });
      setBlocks(arr, i + 1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const keys = ELS.map((x) => x.key);
      const dir = e.shiftKey ? -1 : 1;
      const ni = (keys.indexOf(cur.type) + dir + keys.length) % keys.length;
      arr[i] = { ...cur, type: keys[ni] };
      setBlocks(arr, i);
    } else if (e.key === "Backspace" && !cur.text && arr.length > 1) {
      e.preventDefault();
      arr.splice(i, 1);
      setBlocks(arr, Math.max(0, i - 1));
    } else if (e.key === "ArrowUp" && e.target.selectionStart === 0 && i > 0) {
      e.preventDefault(); setFocusIdx(i - 1);
    } else if (e.key === "ArrowDown" && e.target.selectionStart === e.target.value.length && i < arr.length - 1) {
      e.preventDefault(); setFocusIdx(i + 1);
    }
  };
  const quickInsert = (text, type, qmode) => () => {
    const arr = blocks.slice();
    const i = focusIdx;
    const cur = arr[i] || { type, text: "" };
    let next = text;
    if (qmode === "prefix") {
      const body = (cur.text || "").replace(/^(INT\.\/EXT\.|INT\.|EXT\.|I\/E\.)\s*/i, "").trim();
      next = text + " " + body;
    } else if (qmode === "suffix") {
      const body = (cur.text || "").replace(/\s*[—-]\s*(DAY|NIGHT|DUSK|DAWN|CONTINUOUS|LATER|MORNING|EVENING)\s*$/i, "").trim();
      next = (body || "INT. LOCATION") + " — " + text;
    }
    arr[i] = { ...cur, type, text: next.trim() };
    setBlocks(arr, i);
  };
  const jumpToBlock = (i) => () => setFocusIdx(i);

  const scriptText = () => blocks.map((b) => {
    const t = (b.text || "").trim();
    if (!t) return "";
    if (b.type === "scene") return t.toUpperCase();
    if (b.type === "character") return "\t\t\t" + t.toUpperCase();
    if (b.type === "paren") return "\t\t(" + t.replace(/^\(|\)$/g, "") + ")";
    if (b.type === "dialogue") return "\t" + t;
    if (b.type === "transition") return "> " + t.toUpperCase();
    return t;
  }).filter(Boolean).join("\n\n");

  const exportFountain = () => {
    const blob = new Blob([scriptText()], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "screenplay.fountain";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const escapeXML = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  const scriptToFDX = () => {
    const paragraphs = blocks
      .filter((b) => (b.text || "").trim())
      .map((b) => {
        const type = FDX_TYPE[b.type] || "Action";
        let text = (b.text || "").trim();
        if (b.type === "scene" || b.type === "character" || b.type === "transition") text = text.toUpperCase();
        if (b.type === "paren") text = "(" + text.replace(/^\(|\)$/g, "") + ")";
        return `    <Paragraph Type="${type}">\n      <Text>${escapeXML(text)}</Text>\n    </Paragraph>`;
      })
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<FinalDraft DocumentType="Script" Template="No" Version="1">\n  <Content>\n${paragraphs}\n  </Content>\n</FinalDraft>\n`;
  };

  const exportFDX = () => {
    const blob = new Blob([scriptToFDX()], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "screenplay.fdx";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const sendToReview = () => { patch({ reviewInput: scriptText() }); setMode("coach"); setCoachTab("review"); };
  const importBeats = () => {
    const useFw = fw || "clock";
    const useDefs = defsFor(useFw);
    const arr = [];
    useDefs.forEach((d, i) => {
      const a = (getBeat(useFw, i).answer || "").trim();
      if (!a) return;
      arr.push({ type: "scene", text: "INT. " + d.title.toUpperCase() + " — DAY" });
      arr.push({ type: "action", text: a });
    });
    if (!arr.length) return;
    const existing = blocks.filter((b) => (b.text || "").trim());
    setBlocks(existing.concat(arr), existing.length);
  };

  const curType = (blocks[focusIdx] || blocks[0] || { type: "action" }).type;
  const scriptLines = blocks.reduce((n, b) => n + rowsFor(b.text, b.type) + 1, 0);
  const scriptWords = blocks.reduce((n, b) => n + String(b.text || "").split(/\s+/).filter(Boolean).length, 0);
  const scriptPages = Math.max(1, Math.ceil(scriptLines / 55));

  const sidebar = useMemo(() => {
    if (curType === "character") {
      const seen = new Map();
      blocks.forEach((b) => {
        if (b.type !== "character") return;
        const name = (b.text || "").trim().toUpperCase();
        if (!name) return;
        if (!seen.has(name)) seen.set(name, 0);
        seen.set(name, seen.get(name) + 1);
      });
      return { title: "Characters", quick: [], quickLabel: "", items: [...seen.entries()].map(([name, count]) => ({ num: String(count).padStart(2, "0"), label: name, onClick: quickInsert(name, "character", "replace") })), emptyMsg: "No characters yet. Type a name in a Character line and it will collect here — click one to reuse it." };
    }
    if (curType === "transition") {
      const standard = ["CUT TO:", "DISSOLVE TO:", "SMASH CUT TO:", "MATCH CUT TO:", "FADE TO BLACK.", "FADE OUT."];
      const used = blocks.map((b, i) => ({ b, i })).filter((x) => x.b.type === "transition" && (x.b.text || "").trim());
      return {
        title: "Transitions", quickLabel: "Insert",
        quick: standard.map((t) => ({ label: t, onClick: quickInsert(t, "transition", "replace") })),
        items: used.map((x, n) => ({ num: String(n + 1).padStart(2, "0"), label: (x.b.text || "").trim().toUpperCase(), onClick: jumpToBlock(x.i), active: focusIdx === x.i })),
        emptyMsg: "No transitions used yet.",
      };
    }
    const scenes = blocks.map((b, i) => ({ b, i })).filter((x) => x.b.type === "scene");
    const quick = curType === "scene" ? [
      { label: "INT.", onClick: quickInsert("INT.", "scene", "prefix") },
      { label: "EXT.", onClick: quickInsert("EXT.", "scene", "prefix") },
      { label: "INT./EXT.", onClick: quickInsert("INT./EXT.", "scene", "prefix") },
      { label: "DAY", onClick: quickInsert("DAY", "scene", "suffix") },
      { label: "NIGHT", onClick: quickInsert("NIGHT", "scene", "suffix") },
      { label: "DUSK", onClick: quickInsert("DUSK", "scene", "suffix") },
      { label: "DAWN", onClick: quickInsert("DAWN", "scene", "suffix") },
      { label: "CONTINUOUS", onClick: quickInsert("CONTINUOUS", "scene", "suffix") },
      { label: "LATER", onClick: quickInsert("LATER", "scene", "suffix") },
      { label: "INT. LOCATION — DAY", onClick: quickInsert("INT. LOCATION — DAY", "scene", "replace") },
    ] : [];
    return {
      title: "Scenes", quickLabel: curType === "scene" ? "Scene heading" : "", quick,
      items: scenes.map((x, n) => ({ num: String(n + 1).padStart(2, "0"), label: (x.b.text || "").trim() || "Untitled scene", onClick: jumpToBlock(x.i), active: focusIdx === x.i })),
      emptyMsg: "No scene headings yet.",
    };
  }, [curType, blocks, focusIdx]);

  /* ---------------- derived: review groups / score ---------------- */

  const reviewGroups = reviewResult && reviewResult.groups ? reviewResult.groups.map((g) => {
    const meta = GROUP_META[g.key] || { label: g.key || "Notes", color: "#8B8B93" };
    const items = (g.items || []).map((it) => ({ title: it.title, note: it.note, severity: it.severity || "low" }));
    return { label: meta.label, color: meta.color, countLabel: items.length + (items.length === 1 ? " note" : " notes"), items };
  }) : [];
  const score = reviewResult ? (reviewResult.score || 0) : 0;
  const scoreColor = score >= 75 ? "#46D18A" : score >= 50 ? "#F5A623" : "#FF5A5A";

  /* ---------------- derived: storyboard chips ---------------- */

  const mkChips = (group, opts) => opts.map((o) => ({
    label: o, active: state.filters[group] === o,
    onClick: () => patch((s) => ({ filters: { ...s.filters, [group]: s.filters[group] === o ? "Any" : o } })),
  }));
  const sizeChips = mkChips("size", ["Any", "Wide", "Medium wide", "Medium", "Close-up", "Extreme close-up", "Over-the-shoulder"]);
  const angleChips = mkChips("angle", ["Any", "Eye level", "Low angle", "High angle", "Dutch", "Overhead", "POV"]);
  const moodChips = mkChips("mood", ["Any", "Noir", "Golden hour", "High-key", "Low-key", "Neon", "Naturalistic"]);

  const examples = [
    "Woman sitting on a couch, over-the-shoulder medium-wide shot of her watching TV in a dark room",
    "Lone figure walking away down an empty highway at golden hour, extreme wide shot",
    "Tense two-hander across a diner table, tight eye-level singles, warm practical light",
    "Low-angle hero shot of a character stepping through a doorway into blinding light",
  ];

  const coachOptions = [
    { label: "Gentle nudges", desc: "One kind nudge on the weakest point." },
    { label: "Socratic", desc: "Probing questions that make you think." },
    { label: "Blunt script-doctor", desc: "Direct, unsparing notes." },
  ];

  const renderLengthPicker = () => (
    <div className="tl-length-row">
      <span className="tl-length-label">Target length</span>
      <select className="tl-length-select" value={state.targetLength} onChange={(e) => patch({ targetLength: e.target.value })}>
        {LENGTH_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
      {state.targetLength === "other" && (
        <input className="tl-length-custom" value={state.targetLengthCustom} onChange={(e) => patch({ targetLengthCustom: e.target.value })} placeholder='e.g. "8 minutes" or "25 pages"' />
      )}
    </div>
  );

  const tRange = targetRange(state);
  const estMinutes = scriptPages; // ~1 screenplay page \u2248 1 minute of screen time
  const withinTarget = tRange ? estMinutes >= tRange[0] && estMinutes <= tRange[1] : null;

  /* ====================================================================
     Render
     ==================================================================== */

  return (
    <div className="tl-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Courier+Prime:wght@400;700&display=swap');

        @font-face { font-family: 'Cyber Brush'; src: url('/fonts/CyberBrush.otf') format('opentype'); font-display: swap; }

        .tl-root, .tl-root * { box-sizing: border-box; }
        .tl-root {
          --brush: 'Cyber Brush', 'Space Grotesk', sans-serif;
          display: flex; flex-direction: column; height: 100vh; max-height: 900px; background: #0A0A0B; color: #FAFAF9;
          font-family: 'Inter', system-ui, sans-serif; overflow: hidden; -webkit-font-smoothing: antialiased;
          border-radius: 12px; position: relative;
        }
        .tl-root ::selection { background: #FFE600; color: #0A0A0B; }
        .tl-root textarea, .tl-root input, .tl-root button { font-family: inherit; }
        .tl-root textarea::placeholder, .tl-root input::placeholder { color: #8A8A93; }
        .tl-root ::-webkit-scrollbar { width: 10px; height: 10px; }
        .tl-root ::-webkit-scrollbar-thumb { background: #2A2A30; border-radius: 8px; border: 2px solid #0A0A0B; }
        .tl-root ::-webkit-scrollbar-track { background: transparent; }
        .tl-root a { color: #FFE600; text-decoration: none; }
        .tl-root button { cursor: pointer; }
        @keyframes tl-spin { to { transform: rotate(360deg); } }
        @keyframes tl-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes tl-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
        .tl-spinner { border: 2px solid #2A2A30; border-top-color: #FFE600; border-radius: 999px; display: inline-block; animation: tl-spin .8s linear infinite; flex: none; }
        .tl-up { animation: tl-up .3s ease-out; }

        /* header */
        .tl-header { flex: none; height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 20px; border-bottom: 1px solid #1E1E22; background: rgba(10,10,11,.75); backdrop-filter: blur(10px); z-index: 20; }
        .tl-brand { display: flex; align-items: center; gap: 11px; }
        .tl-brand-mark { width: 30px; height: 30px; border-radius: 8px; background: #FFE600; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 1px rgba(255,230,0,.4), 0 6px 18px -6px rgba(255,230,0,.5); flex: none; }
        .tl-brand-text { display: flex; flex-direction: column; line-height: 1.05; }
        .tl-brand-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: -.01em; }
        .tl-brand-sub { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #6C6C74; font-weight: 500; }
        .tl-nav { display: flex; align-items: center; gap: 4px; background: #141416; border: 1px solid #1E1E22; border-radius: 11px; padding: 4px; }
        .tl-navtab { display: inline-flex; align-items: center; gap: 8px; border: none; border-radius: 2px; padding: 7px 15px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; line-height: 1.1; letter-spacing: 1.5px; text-transform: uppercase; white-space: nowrap; background: transparent; color: #9C9CA4; transition: background .12s, color .12s; }
        .tl-navtab.active { background: #26262B; color: #FFE600; }
        .tl-navtab:hover:not(.active) { background: #FFE600; color: #0A0A0B; }
        .tl-settingsbtn { display: inline-flex; align-items: center; gap: 7px; background: #141416; border: 1px solid #1E1E22; color: #C9C9CE; border-radius: 999px; padding: 6px 13px; font-size: 13px; font-weight: 500; }
        .tl-settingsbtn:hover { background: #17171A; border-color: #FFE600; color: #fff; }
        .tl-saved-flash { font-size: 12px; color: #46D18A; opacity: 0; transition: opacity .3s ease; }
        .tl-saved-flash.visible { opacity: 1; }

        .tl-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; }
        .tl-page-wrap { max-width: 1120px; margin: 0 auto; padding: 26px 24px 60px; }

        h1.tl-h1 { font-family: var(--brush); font-weight: 400; margin: 0 0 12px; letter-spacing: 2px; text-wrap: balance; }
        .tl-eyebrow { font-family: var(--brush); font-size: 22px; line-height: 1.15; letter-spacing: 1.5px; color: #FFE600; margin-bottom: 4px; }
        .tl-body-copy { margin: 0 0 22px; color: #8B8B93; font-size: 13px; max-width: 600px; line-height: 1.5; }

        /* framework picker */
        .tl-fw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; max-width: 1060px; }
        .tl-fw-length-wrap { background: #141416; border: 1px solid #26262B; border-radius: 12px; padding: 13px 16px; margin-bottom: 20px; max-width: 560px; }
        .tl-fw-fit-badge { display: inline-block; margin-top: 10px; font-size: 11px; font-weight: 600; color: #46D18A; background: rgba(70,209,138,.1); border: 1px solid rgba(70,209,138,.3); border-radius: 6px; padding: 3px 8px; align-self: flex-start; }
        .tl-fw-card { cursor: pointer; text-align: left; background: #141416; border: 1px solid #26262B; border-left: 3px solid #33333A; border-radius: 2px; padding: 20px; display: flex; flex-direction: column; transition: border-color .15s, transform .15s, background .15s; }
        .tl-fw-card:hover { background: #17171A; border-color: #33333A; border-left-color: #FFE600; transform: translateY(-2px); }
        .tl-fw-top { display: flex; align-items: baseline; gap: 9px; margin-bottom: 12px; }
        .tl-fw-count { font-family: 'Space Grotesk', sans-serif; font-size: 30px; font-weight: 700; line-height: 1; color: #FFE600; }
        .tl-fw-unit { font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #6C6C74; font-weight: 600; }
        .tl-fw-name { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 6px; letter-spacing: -.01em; }
        .tl-fw-blurb { margin: 0 0 12px; font-size: 13px; color: #8B8B93; line-height: 1.5; flex: 1; }
        .tl-fw-best { font-size: 12px; color: #5E5E66; letter-spacing: .04em; }

        /* develop header */
        .tl-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
        .tl-fw-title { font-family: var(--brush); font-size: 32px; line-height: 1.05; letter-spacing: 2px; color: #FFE600; margin-bottom: 4px; }
        .tl-fw-meta { display: flex; align-items: center; gap: 12px; }
        .tl-fw-meta span { font-size: 13px; color: #8B8B93; }
        .tl-change-fw { background: none; border: none; color: #6C6C74; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
        .tl-change-fw:hover { color: #FAFAF9; }
        .tl-progress-track { width: 120px; height: 6px; background: #1E1E22; border-radius: 999px; overflow: hidden; margin-top: 12px; }
        .tl-progress-fill { height: 100%; background: #FFE600; border-radius: 999px; transition: width .4s ease; }

        .tl-subtabs { display: flex; align-items: center; gap: 5px; background: #141416; border: 1px solid #1E1E22; border-radius: 2px; padding: 4px; width: fit-content; margin-bottom: 22px; }
        .tl-subtab { border: none; border-radius: 2px; padding: 7px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; line-height: 1.1; letter-spacing: 1.5px; text-transform: uppercase; white-space: nowrap; background: transparent; color: #9C9CA4; }
        .tl-subtab.active { background: #26262B; color: #FAFAF9; }
        .tl-subtab:hover:not(.active) { color: #FAFAF9; }

        .tl-overview-card { background: #141416; border: 1px solid #26262B; border-radius: 14px; padding: 15px 18px; margin-bottom: 16px; }
        .tl-overview-label { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
        .tl-overview-label span:first-of-type { font-size: 13px; font-weight: 600; color: #EDEDF0; }
        .tl-overview-label span:last-of-type { font-size: 13px; color: #9C9CA4; }
        .tl-length-row { display: flex; align-items: center; gap: 10px; margin-top: 11px; flex-wrap: wrap; }
        .tl-length-label { font-size: 12px; color: #8B8B93; font-weight: 600; white-space: nowrap; }
        .tl-length-select {
          background: none; border: none; color: #FAFAF9; font-family: 'Inter', sans-serif;
          font-size: 13px; padding: 2px 2px; outline: none; cursor: pointer;
        }
        .tl-length-select:focus { text-decoration: underline; text-underline-offset: 3px; }
        .tl-length-custom {
          flex: 1; min-width: 160px; background: #0E0E10; border: 1px solid #2A2A30; border-radius: 8px;
          color: #FAFAF9; font-family: 'Inter', sans-serif; font-size: 13px; padding: 7px 10px; outline: none;
        }
        .tl-length-custom:focus { border-color: #FFE600; box-shadow: 0 0 0 3px rgba(255,230,0,.14); }
        .tl-textarea { width: 100%; resize: vertical; background: #0E0E10; border: 1px solid #2A2A30; border-radius: 10px; color: #FAFAF9; font-size: 14px; line-height: 1.55; padding: 11px 13px; outline: none; font-family: 'Inter', sans-serif; }
        .tl-textarea:focus { border-color: #FFE600; box-shadow: 0 0 0 3px rgba(255,230,0,.14); }

        .tl-viewtoggle { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-bottom: 10px; }
        .tl-iconbtn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 30px; border: none; border-radius: 2px; background: transparent; color: #8B8B93; }
        .tl-iconbtn.active { background: #FFE600; color: #0A0A0B; }

        /* manuscript */
        .tl-manuscript { display: flex; flex-direction: column; gap: 14px; }
        .tl-beat-row { display: flex; gap: 16px; align-items: flex-start; }
        .tl-beat-page { flex: 1; min-width: 0; background: #F7F4E9; border-radius: 12px; padding: 22px 26px 18px; box-shadow: 0 12px 34px -20px rgba(0,0,0,.85); }
        .tl-beat-heading { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; line-height: 1.3; color: #3D3427; text-transform: uppercase; }
        .tl-beat-question { font-size: 13px; line-height: 1.5; color: #8A8266; margin: 7px 0 12px; font-family: 'Inter', sans-serif; }
        .tl-beat-answer { width: 100%; min-height: 92px; resize: vertical; background: transparent; border: none; outline: none; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.65; color: #26221B; }
        .tl-margin { width: 224px; flex: none; display: flex; flex-direction: column; gap: 9px; }
        .tl-poke-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; width: 100%; background: #2C2A16; color: #FFE600; border: 1px solid #55501F; border-radius: 2px; padding: 9px 12px; font-size: 13px; font-weight: 600; letter-spacing: .02em; }
        .tl-poke-btn:disabled { opacity: .55; pointer-events: none; }
        .tl-reading { display: flex; align-items: center; gap: 9px; color: #8B8B93; font-size: 13px; padding: 4px 2px; }
        .tl-notes { display: flex; flex-direction: column; gap: 7px; }
        .tl-note { border-radius: 9px; padding: 8px 10px; }
        .tl-note-title { font: 600 12px 'JetBrains Mono', monospace; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 3px; }
        .tl-note-body { font-size: 13px; line-height: 1.45; color: #C9C9CE; }
        .tl-note-working { background: rgba(70,209,138,.08); border: 1px solid rgba(70,209,138,.22); }
        .tl-note-working .tl-note-title { color: #46D18A; }
        .tl-note-hole { background: rgba(245,166,35,.08); border: 1px solid rgba(245,166,35,.24); }
        .tl-note-hole .tl-note-title { color: #F5A623; }
        .tl-note-push { background: rgba(255,230,0,.08); border: 1px solid rgba(255,230,0,.26); }
        .tl-note-push .tl-note-title { color: #FFE600; }
        .tl-note-error { font-size: 13px; color: #FF7A7A; background: rgba(255,90,90,.08); border: 1px solid rgba(255,90,90,.25); border-radius: 9px; padding: 8px 10px; }

        /* corkboard */
        .tl-corkboard { border-radius: 16px; padding: 24px; background: #131310; background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,.045) 1px, transparent 0); background-size: 17px 17px; border: 1px solid #26262B; }
        .tl-cork-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 22px; }
        .tl-cork-card { position: relative; text-align: left; background: #F7F4E9; border: 1px solid #E4DEC8; border-radius: 8px; padding: 16px 15px 14px; cursor: pointer; box-shadow: 0 12px 28px -14px rgba(0,0,0,.7); display: flex; flex-direction: column; min-height: 134px; border-width: 1px; }
        .tl-cork-pin { position: absolute; top: -7px; left: 50%; transform: translateX(-50%); width: 15px; height: 15px; border-radius: 999px; background: #FFE600; box-shadow: 0 2px 6px rgba(0,0,0,.5); }
        .tl-cork-heading { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; line-height: 1.3; color: #3D3427; text-transform: uppercase; display: block; }
        .tl-cork-rule { display: block; height: 1px; background: #E4DEC8; margin: 8px 0 9px; }
        .tl-cork-preview { font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.5; flex: 1; }
        .tl-cork-status { margin-top: 10px; font: 700 11px 'JetBrains Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }

        /* review */
        .tl-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: start; }
        @media (max-width: 820px) { .tl-review-grid { grid-template-columns: 1fr; } }
        .tl-review-left { background: #141416; border: 1px solid #26262B; border-radius: 18px; padding: 20px; }
        .tl-review-left-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .tl-review-left-head span { font-size: 13px; font-weight: 600; color: #C9C9CE; }
        .tl-pillbtn { background: none; border: 1px solid #2A2A30; color: #8B8B93; font-size: 12px; border-radius: 8px; padding: 5px 10px; }
        .tl-pillbtn:hover { background: #1A1A1D; border-color: #33333A; color: #fff; }
        .tl-review-textarea { min-height: 340px; }
        .tl-review-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; }
        .tl-review-footer span { font-size: 12px; color: #5E5E66; }
        .tl-primary-btn { display: inline-flex; align-items: center; gap: 8px; background: #FFE600; color: #0A0A0B; border: none; border-radius: 2px; padding: 11px 18px; font-size: 13px; font-weight: 600; }
        .tl-primary-btn:hover { background: #FFEC4D; }
        .tl-primary-btn:disabled { opacity: .5; pointer-events: none; }
        .tl-review-loading, .tl-review-empty { background: #141416; border: 1px solid #26262B; border-radius: 18px; padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 14px; color: #8B8B93; text-align: center; }
        .tl-review-empty { background: #0F0F11; border: 1px dashed #2A2A30; color: #5E5E66; }
        .tl-review-empty-title { font-size: 13px; color: #8B8B93; margin-bottom: 4px; }
        .tl-score-card { background: #141416; border: 1px solid #26262B; border-radius: 18px; padding: 20px; display: flex; align-items: center; gap: 18px; }
        .tl-score-ring { flex: none; width: 66px; height: 66px; border-radius: 999px; display: flex; align-items: center; justify-content: center; }
        .tl-score-inner { width: 58px; height: 58px; border-radius: 999px; background: #141416; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        .tl-score-num { font-family: 'Space Grotesk'; font-weight: 700; font-size: 19px; color: #FAFAF9; line-height: 1; }
        .tl-score-den { font-size: 10px; letter-spacing: .1em; color: #6C6C74; }
        .tl-overall-label { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #6C6C74; font-weight: 600; margin-bottom: 4px; }
        .tl-overall-text { font-size: 13px; color: #D6D6DB; line-height: 1.5; }
        .tl-group-card { background: #141416; border: 1px solid #1E1E22; border-radius: 16px; overflow: hidden; }
        .tl-group-head { display: flex; align-items: center; gap: 9px; padding: 13px 18px; border-bottom: 1px solid #1E1E22; }
        .tl-group-dot { width: 8px; height: 8px; border-radius: 999px; flex: none; }
        .tl-group-head span:nth-child(2) { font-size: 13px; font-weight: 600; }
        .tl-group-count { font-size: 12px; color: #5E5E66; margin-left: auto; }
        .tl-note-row { display: flex; gap: 12px; padding: 13px 18px; border-top: 1px solid #161619; }
        .tl-sev-chip { flex: none; align-self: flex-start; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; font-weight: 700; border-radius: 6px; padding: 3px 7px; min-width: 52px; text-align: center; }
        .tl-note-row-title { font-size: 13px; font-weight: 600; color: #EDEDF0; margin-bottom: 2px; }
        .tl-note-row-body { font-size: 13px; color: #9C9CA4; line-height: 1.5; }

        /* script editor */
        .tl-script-wrap { display: flex; height: 100%; min-height: 0; }
        .tl-sidebar { width: 250px; flex: none; border-right: 1px solid #1E1E22; display: flex; flex-direction: column; background: #0C0C0E; }
        .tl-sidebar-head { padding: 16px 16px 12px; border-bottom: 1px solid #1E1E22; }
        .tl-sidebar-title { font-family: var(--brush); font-size: 22px; line-height: 1.1; letter-spacing: 1.5px; color: #FFE600; margin-bottom: 10px; }
        .tl-sidebar-stats { display: flex; gap: 14px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8B8B93; }
        .tl-runtime-check { margin-top: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
        .tl-sidebar-body { flex: 1; overflow-y: auto; padding: 8px; }
        .tl-quick-block { padding: 4px 4px 12px; border-bottom: 1px solid #17171A; margin-bottom: 8px; }
        .tl-quick-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6C6C74; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .tl-quick-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .tl-chip-btn { background: #141416; border: 1px solid #26262B; color: #C9C9CE; border-radius: 2px; padding: 5px 9px; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
        .tl-chip-btn:hover { background: #FFE600; border-color: #FFE600; color: #0A0A0B; }
        .tl-sidebar-item { text-align: left; background: transparent; border: none; border-left: 2px solid transparent; border-radius: 0; padding: 8px 10px; display: flex; gap: 9px; align-items: flex-start; width: 100%; }
        .tl-sidebar-item.active { border-left-color: #FFE600; }
        .tl-sidebar-item-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #6C6C74; flex: none; }
        .tl-sidebar-item-label { font-size: 13px; color: #C9C9CE; text-align: left; line-height: 1.35; }
        .tl-sidebar-empty { padding: 12px 10px; font-size: 12px; color: #5E5E66; line-height: 1.5; }
        .tl-sidebar-footer { padding: 12px; border-top: 1px solid #1E1E22; display: flex; flex-direction: column; gap: 7px; }
        .tl-sb-btn { width: 100%; background: #1A1A1D; border: 1px solid #2A2A30; color: #C9C9CE; border-radius: 2px; padding: 9px 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .tl-sb-btn:hover { background: #212127; border-color: #FFE600; color: #fff; }
        .tl-sb-btn.primary { background: #FFE600; border: none; color: #0A0A0B; }
        .tl-sb-btn.primary:hover { background: #FFEC4D; }
        .tl-editor-pane { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .tl-el-toolbar { flex: none; display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-bottom: 1px solid #1E1E22; background: #0C0C0E; flex-wrap: wrap; }
        .tl-el-chip { border-radius: 2px; padding: 6px 11px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background: #141416; color: #9C9CA4; border: 1px solid #26262B; }
        .tl-el-chip.active { background: #FFE600; color: #0A0A0B; border-color: #FFE600; }
        .tl-el-hint { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6C6C74; }
        .tl-scroller { flex: 1; overflow: auto; padding: 28px 20px 120px; display: flex; justify-content: safe center; }
        .tl-page { width: 816px; flex: none; background: #F7F4E9; border-radius: 2px; box-shadow: 0 20px 60px -24px rgba(0,0,0,.9); padding: 96px 96px 96px 144px; min-height: 1056px; }

        /* storyboard */
        .tl-query-card { background: #141416; border: 1px solid #26262B; border-radius: 18px; padding: 18px; }
        .tl-filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .tl-filter-label { font-size: 13px; color: #5E5E66; width: 66px; flex: none; }
        .tl-filter-chip { border-radius: 8px; padding: 6px 11px; font-size: 12.5px; background: #141416; border: 1px solid #26262B; color: #9C9CA4; }
        .tl-filter-chip.active { background: rgba(255,255,255,.09); border-color: #3A3A42; color: #FAFAF9; }
        .tl-board-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; gap: 12px; flex-wrap: wrap; }
        .tl-board-disclosure { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: #5E5E66; }
        .tl-examples { display: flex; flex-wrap: wrap; gap: 10px; }
        .tl-example-btn { text-align: left; max-width: 260px; background: #141416; border: 1px solid #26262B; border-radius: 12px; padding: 12px 14px; color: #C9C9CE; font-size: 13px; line-height: 1.45; }
        .tl-example-btn:hover { background: #17171A; border-color: rgba(255,230,0,.4); color: #fff; }
        .tl-skeleton-grid, .tl-results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
        .tl-skel-card { background: #141416; border: 1px solid #1E1E22; border-radius: 14px; overflow: hidden; }
        .tl-skel-frame { aspect-ratio: 2.39/1; background: linear-gradient(100deg, #161619, #1E1E22, #161619); animation: tl-pulse 1.4s ease-in-out infinite; }
        .tl-result-card { background: #141416; border: 1px solid #26262B; border-radius: 14px; overflow: hidden; }
        .tl-result-card:hover { border-color: rgba(255,230,0,.4); }
        .tl-result-frame { position: relative; aspect-ratio: 2.39/1; background: #000; }
        .tl-result-badge { position: absolute; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 6px; backdrop-filter: blur(4px); }
        .tl-result-body { padding: 14px 15px; }
        .tl-result-title-row { display: flex; align-items: baseline; gap: 7px; margin-bottom: 2px; }
        .tl-result-film { font-family: 'Space Grotesk'; font-size: 13px; font-weight: 600; color: #FAFAF9; }
        .tl-result-year { font-size: 12px; color: #6C6C74; }
        .tl-result-scene { font-size: 12.5px; color: #9C9CA4; line-height: 1.5; margin-bottom: 10px; }
        .tl-result-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; align-items: center; }
        .tl-lighting-chip { font-size: 11px; color: #8B8B93; background: #1A1A1D; border: 1px solid #26262B; padding: 3px 8px; border-radius: 6px; }
        .tl-swatch { width: 16px; height: 16px; border-radius: 5px; border: 1px solid rgba(255,255,255,.12); }
        .tl-result-why { font-size: 12px; color: #6C6C74; line-height: 1.5; padding-top: 9px; border-top: 1px solid #1E1E22; }
        .tl-result-why b { color: #FFE600; font-weight: 600; }

        .tl-error-box { font-size: 13px; color: #FF7A7A; background: rgba(255,90,90,.08); border: 1px solid rgba(255,90,90,.25); border-radius: 12px; padding: 13px 15px; margin-top: 22px; }

        /* settings drawer */
        .tl-drawer-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.5); z-index: 40; }
        .tl-drawer { position: absolute; top: 0; right: 0; bottom: 0; width: 300px; background: #0E0E10; border-left: 1px solid #26262B; z-index: 41; padding: 22px; overflow-y: auto; box-shadow: -24px 0 60px -20px rgba(0,0,0,.7); }
        .tl-drawer-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .tl-drawer-title { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; }
        .tl-drawer-close { background: #141416; border: 1px solid #26262B; color: #9C9CA4; border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .tl-drawer-close:hover { background: #1A1A1D; border-color: #33333A; color: #fff; }
        .tl-drawer-section-label { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #6C6C74; font-weight: 600; margin-bottom: 11px; }
        .tl-coach-opt { text-align: left; width: 100%; border-radius: 10px; padding: 11px 13px; background: #141416; border: 1px solid #26262B; margin-bottom: 9px; }
        .tl-coach-opt.selected { background: rgba(255,230,0,.1); border-color: rgba(255,230,0,.5); }
        .tl-coach-opt-title { font-size: 13px; font-weight: 600; color: #FAFAF9; }
        .tl-coach-opt.selected .tl-coach-opt-title { color: #FFE600; }
        .tl-coach-opt-desc { font-size: 12px; color: #8B8B93; line-height: 1.4; margin-top: 3px; }
        .tl-refcount-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .tl-stepper-btn { width: 36px; height: 36px; background: #141416; border: 1px solid #2A2A30; color: #FAFAF9; border-radius: 9px; font-size: 18px; }
        .tl-stepper-btn:hover { background: #1A1A1D; border-color: #FFE600; }
        .tl-refcount-num { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; min-width: 28px; text-align: center; }
        .tl-drawer-hint { font-size: 12px; color: #5E5E66; line-height: 1.5; }
        .tl-project-list { display: flex; flex-direction: column; gap: 6px; }
        .tl-project-row { display: flex; align-items: center; gap: 6px; background: #141416; border: 1px solid #26262B; border-radius: 10px; padding: 4px; }
        .tl-project-row.active { border-color: rgba(255,230,0,.5); background: rgba(255,230,0,.06); }
        .tl-project-open { flex: 1; min-width: 0; text-align: left; background: none; border: none; padding: 8px 9px; display: flex; flex-direction: column; gap: 2px; }
        .tl-project-title { font-size: 13px; font-weight: 600; color: #FAFAF9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tl-project-meta { font-size: 11px; color: #6C6C74; }
        .tl-project-actions { display: flex; gap: 2px; flex: none; }
        .tl-project-icon-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: none; border: none; border-radius: 7px; color: #6C6C74; }
        .tl-project-icon-btn:hover { background: #1E1E22; color: #FAFAF9; }
        .tl-project-icon-btn.danger { color: #FF7A7A; }
        .tl-project-icon-btn.danger:hover { background: rgba(255,90,90,.12); }
        .tl-project-rename-input { flex: 1; background: #0E0E10; border: 1px solid #FFE600; border-radius: 8px; color: #FAFAF9; font-size: 13px; padding: 8px 9px; outline: none; }
      `}</style>

      {/* ---------------- Header ---------------- */}
      <div className="tl-header">
        <div className="tl-brand">
          <div className="tl-brand-mark"><IconClapper /></div>
          <div className="tl-brand-text">
            <span className="tl-brand-name">Script Studio</span>
          </div>
        </div>
        <div className="tl-nav">
          <button className={`tl-navtab ${mode === "coach" ? "active" : ""}`} onClick={() => setMode("coach")}><IconCoach /> Story Coach</button>
          <button className={`tl-navtab ${mode === "script" ? "active" : ""}`} onClick={() => setMode("script")}><IconScript /> Script</button>
          <button className={`tl-navtab ${mode === "board" ? "active" : ""}`} onClick={() => setMode("board")}><IconBoard /> Storyboard</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`tl-saved-flash ${justSaved ? "visible" : ""}`}>Saved</span>
          <button className="tl-settingsbtn" onClick={() => setLibraryOpen(true)}><IconFolder /> <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeProjectTitle}</span></button>
          <button className="tl-settingsbtn" onClick={() => setSettingsOpen(true)}><IconSettings /> Settings</button>
        </div>
      </div>

      <div className="tl-scroll">
        {/* ================= STORY COACH ================= */}
        {mode === "coach" && (
          <div className="tl-page-wrap">
            {fw && (
              <div className="tl-title-row">
                <div>
                  <div className="tl-fw-title">{FRAMEWORKS.find((x) => x.key === fw)?.name}</div>
                  <div className="tl-fw-meta">
                    <span>{answeredCount} of {total} beats drafted</span>
                    <button className="tl-change-fw" onClick={() => patch({ framework: null })}>Change framework</button>
                  </div>
                  {coachTab === "develop" && (
                    <div className="tl-progress-track"><div className="tl-progress-fill" style={{ width: `${progressPct}%` }} /></div>
                  )}
                </div>
              </div>
            )}

            <div className="tl-subtabs">
              <button className={`tl-subtab ${coachTab === "develop" ? "active" : ""}`} onClick={() => setCoachTab("develop")}>Develop</button>
              <button className={`tl-subtab ${coachTab === "review" ? "active" : ""}`} onClick={() => setCoachTab("review")}>Review</button>
            </div>

            {coachTab === "develop" && (
              <>
                {!fw && (
                  <div className="tl-up">
                    <div className="tl-eyebrow">Choose a framework</div>
                    <h1 className="tl-h1" style={{ fontSize: 44 }}>Build your story's spine.</h1>
                    <p className="tl-body-copy">Pick a structure and I'll walk you through it beat by beat — asking questions, poking holes, and pushing you to strengthen each turn as you go.</p>
                    <div className="tl-fw-length-wrap">{renderLengthPicker()}</div>
                    <div className="tl-fw-grid">
                      {FRAMEWORKS.map((f) => {
                        const goodFit = f.fits.includes(state.targetLength);
                        return (
                          <button key={f.key} className="tl-fw-card" onClick={() => patch({ framework: f.key, developView: "write" })}>
                            <div className="tl-fw-top"><span className="tl-fw-count">{f.count}</span><span className="tl-fw-unit">{f.unit}</span></div>
                            <div className="tl-fw-name">{f.name}</div>
                            <p className="tl-fw-blurb">{f.blurb}</p>
                            <span className="tl-fw-best">{f.best}</span>
                            {goodFit && <span className="tl-fw-fit-badge">✓ Fits your target length</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {fw && (
                  <div className="tl-up">
                    <div className="tl-overview-card">
                      <div className="tl-overview-label">
                        <IconOverview /><span>Story overview</span><span>— the coach reads this before poking holes</span>
                      </div>
                      <textarea className="tl-textarea" style={{ minHeight: 60 }} value={state.overview} onChange={(e) => patch({ overview: e.target.value })} placeholder="Logline / premise: who wants what, and what stands in the way? Note the genre, tone, and the ending if you know it." />
                      {renderLengthPicker()}
                    </div>

                    <div className="tl-viewtoggle">
                      <button title="Write view" className={`tl-iconbtn ${state.developView === "write" ? "active" : ""}`} onClick={() => patch({ developView: "write" })}><IconWrite /></button>
                      <button title="Board view" className={`tl-iconbtn ${state.developView === "board" ? "active" : ""}`} onClick={() => patch({ developView: "board" })}><IconGrid /></button>
                    </div>

                    {state.developView === "write" && (
                      <div className="tl-manuscript">
                        {defs.map((d, i) => {
                          const b = getBeat(fw, i);
                          const thinking = b.status === "thinking", ready = b.status === "ready", errored = b.status === "error";
                          return (
                            <div className="tl-beat-row" key={i} ref={(el) => (beatSectionRefs.current[i] = el)}>
                              <div className="tl-beat-page">
                                <div className="tl-beat-heading">{i + 1} · {d.title}</div>
                                <div className="tl-beat-question">{d.question}</div>
                                <textarea className="tl-beat-answer" value={b.answer || ""} onChange={(e) => patchBeat(fw, i, { answer: e.target.value })} placeholder={d.hint} />
                              </div>
                              <div className="tl-margin">
                                <button className="tl-poke-btn" disabled={thinking} onClick={() => askBeat(i)}>
                                  <IconSpark /> {thinking ? "Reading…" : ready ? "Ask again" : "Poke holes"}
                                </button>
                                {thinking && <div className="tl-reading"><Spinner /> Reading…</div>}
                                {ready && (
                                  <div className="tl-notes tl-up">
                                    <div className="tl-note tl-note-working"><div className="tl-note-title">Working</div><div className="tl-note-body">{b.strength}</div></div>
                                    <div className="tl-note tl-note-hole"><div className="tl-note-title">The hole</div><div className="tl-note-body">{b.hole}</div></div>
                                    <div className="tl-note tl-note-push"><div className="tl-note-title">Push further</div><div className="tl-note-body">{b.followup}</div></div>
                                  </div>
                                )}
                                {errored && <div className="tl-note-error">{b.errorMsg}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {state.developView === "board" && (
                      <div className="tl-corkboard">
                        <div className="tl-cork-grid">
                          {defs.map((d, i) => {
                            const b = getBeat(fw, i);
                            const done = !!(b.answer && b.answer.trim());
                            const preview = done ? (b.answer.trim().length > 100 ? b.answer.trim().slice(0, 100) + "…" : b.answer.trim()) : "Not written yet.";
                            const rot = CORK_ROTATIONS[i % CORK_ROTATIONS.length];
                            return (
                              <button key={i} className="tl-cork-card" style={{ transform: `rotate(${rot}deg)` }} onClick={() => goCard(i)}>
                                <span className="tl-cork-pin" />
                                <span className="tl-cork-heading">{i + 1} · {d.title}</span>
                                <span className="tl-cork-rule" />
                                <span className="tl-cork-preview" style={{ color: done ? "#26221B" : "#A79E86", fontStyle: done ? "normal" : "italic" }}>{preview}</span>
                                <span className="tl-cork-status" style={{ color: done ? "#177A43" : "#7A7263" }}>{done ? "DRAFTED" : "EMPTY"}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {coachTab === "review" && (
              <div className="tl-up">
                <div className="tl-eyebrow">Script review</div>
                <h1 className="tl-h1" style={{ fontSize: 40 }}>Find the holes before your reader does.</h1>
                <p className="tl-body-copy">Paste your script or treatment. I'll map it against structure, character, pacing, and stakes — and flag what's missing or soft.</p>

                <div className="tl-review-grid">
                  <div className="tl-review-left">
                    <div className="tl-review-left-head">
                      <span>Your script</span>
                      <button className="tl-pillbtn" onClick={loadFromBeats}>Pull from my beats</button>
                    </div>
                    <textarea className="tl-textarea tl-review-textarea" value={state.reviewInput} onChange={(e) => patch({ reviewInput: e.target.value })} placeholder="Paste your short film script, scene, or treatment here…" />
                    <div className="tl-review-footer">
                      <span>Coaching style: {state.settings.coachStyle}</span>
                      <button className="tl-primary-btn" onClick={runReview} disabled={reviewLoading}><IconSearch size={15} /> Review script</button>
                    </div>
                  </div>

                  <div>
                    {reviewLoading && <div className="tl-review-loading"><Spinner size={24} border={3} /><span style={{ fontSize: 13 }}>Reading the whole thing, twice…</span></div>}
                    {!reviewLoading && !reviewResult && (
                      <div className="tl-review-empty">
                        <IconDoc />
                        <div className="tl-review-empty-title">No review yet</div>
                        <div style={{ fontSize: 13 }}>Paste a script and hit review to see structural notes.</div>
                      </div>
                    )}
                    {!reviewLoading && reviewResult && (
                      <div className="tl-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="tl-score-card">
                          <div className="tl-score-ring" style={{ background: `conic-gradient(${scoreColor} ${score * 3.6}deg, #232329 0)` }}>
                            <div className="tl-score-inner"><span className="tl-score-num">{reviewResult.score}</span><span className="tl-score-den">/ 100</span></div>
                          </div>
                          <div>
                            <div className="tl-overall-label">Overall read</div>
                            <div className="tl-overall-text">{reviewResult.summary}</div>
                          </div>
                        </div>
                        {reviewGroups.map((g, gi) => (
                          <div className="tl-group-card" key={gi}>
                            <div className="tl-group-head"><span className="tl-group-dot" style={{ background: g.color }} /><span>{g.label}</span><span className="tl-group-count">{g.countLabel}</span></div>
                            <div>
                              {g.items.map((it, ii) => (
                                <div className="tl-note-row" key={ii}>
                                  <span className="tl-sev-chip" style={{ color: SEV_COLOR[it.severity], background: SEV_COLOR[it.severity] + "1F", border: `1px solid ${SEV_COLOR[it.severity]}44` }}>{it.severity}</span>
                                  <div><div className="tl-note-row-title">{it.title}</div><div className="tl-note-row-body">{it.note}</div></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SCRIPT ================= */}
        {mode === "script" && (
          <div className="tl-script-wrap">
            <div className="tl-sidebar">
              <div className="tl-sidebar-head">
                <div className="tl-sidebar-title">{sidebar.title}</div>
                <div className="tl-sidebar-stats"><span>{scriptPages} pp</span><span>{blocks.filter((b) => b.type === "scene").length} sc</span><span>{scriptWords} w</span></div>
                <div className="tl-runtime-check" style={{ color: withinTarget === null ? "#6C6C74" : withinTarget ? "#46D18A" : "#F5A623" }}>
                  ~{estMinutes} min estimated
                  {tRange ? ` \u00b7 target ${Math.round(tRange[0])}\u2013${Math.round(tRange[1])}m` : ""}
                  {withinTarget === false && (estMinutes < tRange[0] ? " \u2014 running short" : " \u2014 running long")}
                </div>
              </div>
              <div className="tl-sidebar-body">
                {sidebar.quick.length > 0 && (
                  <div className="tl-quick-block">
                    <div className="tl-quick-label">{sidebar.quickLabel}</div>
                    <div className="tl-quick-chips">{sidebar.quick.map((q, qi) => <button key={qi} className="tl-chip-btn" onClick={q.onClick}>{q.label}</button>)}</div>
                  </div>
                )}
                {sidebar.items.map((it, ii) => (
                  <button key={ii} className={`tl-sidebar-item ${it.active ? "active" : ""}`} onClick={it.onClick}>
                    <span className="tl-sidebar-item-num">{it.num}</span><span className="tl-sidebar-item-label">{it.label}</span>
                  </button>
                ))}
                {sidebar.items.length === 0 && <div className="tl-sidebar-empty">{sidebar.emptyMsg}</div>}
              </div>
              <div className="tl-sidebar-footer">
                <button className="tl-sb-btn" onClick={importBeats}>Import beats</button>
                <button className="tl-sb-btn" onClick={sendToReview}>Send to review</button>
                <button className="tl-sb-btn" onClick={exportFDX}>Export .fdx</button>
                <button className="tl-sb-btn primary" onClick={exportFountain}>Export .fountain</button>
              </div>
            </div>

            <div className="tl-editor-pane">
              <div className="tl-el-toolbar">
                {ELS.map((el) => (
                  <button key={el.key} title={el.hint} className={`tl-el-chip ${curType === el.key ? "active" : ""}`} onClick={setElType(el.key)}>{el.label}</button>
                ))}
                <span className="tl-el-hint">Tab = change element · Enter = next</span>
              </div>
              <div className="tl-scroller">
                <div className="tl-page">
                  {blocks.map((bk, i) => (
                    <textarea
                      key={i}
                      ref={(el) => (blockRefs.current[i] = el)}
                      value={bk.text}
                      onChange={blockInput(i)}
                      onKeyDown={blockKeyDown(i)}
                      onFocus={blockFocus(i)}
                      placeholder={(focusIdx === i || !(bk.text || "").trim()) ? (EL_PLACEHOLDER[bk.type] || "") : ""}
                      rows={rowsFor(bk.text, bk.type)}
                      style={elStyle(bk.type)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STORYBOARD ================= */}
        {mode === "board" && (
          <div className="tl-page-wrap">
            <div className="tl-eyebrow">Storyboard search</div>
            <h1 className="tl-h1" style={{ fontSize: 40 }}>Find the shot.</h1>
            <p className="tl-body-copy" style={{ maxWidth: 620 }}>Describe a frame — subject, blocking, shot size, angle — and I'll surface cinematic references from real films to pull from.</p>

            <div className="tl-query-card">
              <textarea className="tl-textarea" style={{ minHeight: 64 }} value={state.boardQuery} onChange={(e) => patch({ boardQuery: e.target.value })} placeholder="e.g. woman sitting on a couch, over-the-shoulder medium-wide shot of her watching TV in a dark room" />
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
                <div className="tl-filter-row"><span className="tl-filter-label">Shot size</span>{sizeChips.map((c, ci) => <button key={ci} className={`tl-filter-chip ${c.active ? "active" : ""}`} onClick={c.onClick}>{c.label}</button>)}</div>
                <div className="tl-filter-row"><span className="tl-filter-label">Angle</span>{angleChips.map((c, ci) => <button key={ci} className={`tl-filter-chip ${c.active ? "active" : ""}`} onClick={c.onClick}>{c.label}</button>)}</div>
                <div className="tl-filter-row"><span className="tl-filter-label">Mood</span>{moodChips.map((c, ci) => <button key={ci} className={`tl-filter-chip ${c.active ? "active" : ""}`} onClick={c.onClick}>{c.label}</button>)}</div>
              </div>
              <div className="tl-board-footer">
                <span className="tl-board-disclosure"><IconInfo /> AI-matched references. Live still search is coming soon.</span>
                <button className="tl-primary-btn" onClick={() => runSearch()} disabled={boardLoading}><IconSearch /> Search references</button>
              </div>
            </div>

            {!boardLoading && boardResults.length === 0 && !boardError && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 12, color: "#5E5E66", marginBottom: 11 }}>Try one of these</div>
                <div className="tl-examples">{examples.map((ex, ei) => <button key={ei} className="tl-example-btn" onClick={() => useExample(ex)}>{ex}</button>)}</div>
              </div>
            )}

            {boardLoading && (
              <div className="tl-skeleton-grid" style={{ marginTop: 26 }}>
                {[0, 1, 2, 3, 4, 5].map((s) => (
                  <div className="tl-skel-card" key={s}>
                    <div className="tl-skel-frame" />
                    <div style={{ padding: 14 }}><div style={{ height: 12, width: "60%", background: "#1E1E22", borderRadius: 5, marginBottom: 8 }} /><div style={{ height: 10, width: "85%", background: "#18181B", borderRadius: 5 }} /></div>
                  </div>
                ))}
              </div>
            )}

            {boardError && <div className="tl-error-box">{boardError}</div>}

            {!boardLoading && boardResults.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, color: "#8B8B93", marginBottom: 14 }}>{boardResults.length} references matched to your shot</div>
                <div className="tl-results-grid">
                  {boardResults.map((r, ri) => {
                    const pal = Array.isArray(r.palette) && r.palette.length >= 2 ? r.palette : ["#2b2b33", "#4a4550", "#141416"];
                    const gradient = `linear-gradient(135deg, ${pal[0] || "#2b2b33"}, ${pal[1] || pal[0]} 55%, ${pal[2] || pal[1] || "#141416"})`;
                    return (
                      <div className="tl-result-card tl-up" key={ri}>
                        <div className="tl-result-frame">
                          <div style={{ position: "absolute", inset: 0, background: gradient }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35), transparent 30%, transparent 62%, rgba(0,0,0,.7))" }} />
                          <span className="tl-result-badge" style={{ top: 10, left: 10, background: "rgba(0,0,0,.55)", color: "#FFE600", border: "1px solid rgba(255,230,0,.4)" }}>{r.shotSize || "Shot"}</span>
                          <span className="tl-result-badge" style={{ bottom: 10, left: 10, background: "rgba(0,0,0,.5)", color: "#E6E6EA" }}>{r.angle || ""}</span>
                          <span className="tl-result-badge" style={{ bottom: 10, right: 10, background: "rgba(0,0,0,.5)", color: "#E6E6EA" }}>{r.lens || ""}</span>
                        </div>
                        <div className="tl-result-body">
                          <div className="tl-result-title-row"><span className="tl-result-film">{r.film}</span><span className="tl-result-year">{r.year}</span></div>
                          <div className="tl-result-scene">{r.scene}</div>
                          <div className="tl-result-tags">
                            <span className="tl-lighting-chip">{r.lighting}</span>
                            {pal.slice(0, 4).map((c, si) => <span key={si} className="tl-swatch" style={{ background: c }} />)}
                          </div>
                          <div className="tl-result-why"><b>Why:</b> {r.why}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {libraryOpen && (
        <>
          <div className="tl-drawer-backdrop" onClick={() => setLibraryOpen(false)} />
          <div className="tl-drawer">
            <div className="tl-drawer-head">
              <span className="tl-drawer-title">Your projects</span>
              <button className="tl-drawer-close" onClick={() => setLibraryOpen(false)}><IconClose /></button>
            </div>

            <button className="tl-primary-btn" style={{ width: "100%", justifyContent: "center", marginBottom: 16 }} onClick={createProject}>
              + New project
            </button>

            <div className="tl-drawer-section-label">Saved</div>
            <div className="tl-project-list">
              {projects.map((p) => (
                <div key={p.id} className={`tl-project-row ${p.id === activeProjectId ? "active" : ""}`}>
                  {renameDraftId === p.id ? (
                    <input
                      className="tl-project-rename-input"
                      value={renameDraftText}
                      autoFocus
                      onChange={(e) => setRenameDraftText(e.target.value)}
                      onBlur={saveRename}
                      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                    />
                  ) : (
                    <button className="tl-project-open" onClick={() => switchProject(p.id)}>
                      <span className="tl-project-title">{p.title}</span>
                      <span className="tl-project-meta">Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                    </button>
                  )}
                  <div className="tl-project-actions">
                    <button className="tl-project-icon-btn" title="Rename" onClick={() => startRename(p)}><IconPen /></button>
                    {confirmDeleteId === p.id ? (
                      <button className="tl-project-icon-btn danger" title="Confirm delete" onClick={() => deleteProject(p.id)}><IconCheckSmall /></button>
                    ) : (
                      <button className="tl-project-icon-btn" title="Delete" onClick={() => setConfirmDeleteId(p.id)}><IconTrash /></button>
                    )}
                  </div>
                </div>
              ))}
              {projects.length === 0 && <div className="tl-drawer-hint">No projects yet — create one above.</div>}
            </div>
          </div>
        </>
      )}

      {settingsOpen && (
        <>
          <div className="tl-drawer-backdrop" onClick={() => setSettingsOpen(false)} />
          <div className="tl-drawer">
            <div className="tl-drawer-head">
              <span className="tl-drawer-title">Settings</span>
              <button className="tl-drawer-close" onClick={() => setSettingsOpen(false)}><IconClose /></button>
            </div>

            <div className="tl-drawer-section-label">Coaching style</div>
            {coachOptions.map((o) => (
              <button key={o.label} className={`tl-coach-opt ${state.settings.coachStyle === o.label ? "selected" : ""}`} onClick={() => patch((s) => ({ settings: { ...s.settings, coachStyle: o.label } }))}>
                <div className="tl-coach-opt-title">{o.label}</div>
                <div className="tl-coach-opt-desc">{o.desc}</div>
              </button>
            ))}

            <div className="tl-drawer-section-label" style={{ marginTop: 18 }}>Storyboard references per search</div>
            <div className="tl-refcount-row">
              <button className="tl-stepper-btn" onClick={() => patch((s) => ({ settings: { ...s.settings, referenceCount: Math.max(3, s.settings.referenceCount - 1) } }))}>−</button>
              <span className="tl-refcount-num">{state.settings.referenceCount}</span>
              <button className="tl-stepper-btn" onClick={() => patch((s) => ({ settings: { ...s.settings, referenceCount: Math.min(9, s.settings.referenceCount + 1) } }))}>+</button>
            </div>
            <div className="tl-drawer-hint">Applies to your next storyboard search.</div>
          </div>
        </>
      )}
    </div>
  );
}
