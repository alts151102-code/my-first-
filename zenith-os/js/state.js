/* =======================================================
   CENTRAL STATE PERSISTENCE & TRANSIENT STORAGE
   ======================================================= */
const STORAGE_KEY = 'ZENITH_STORAGE_V12';

// Temporary runtime memory for Train Ur Brain (never saved in localStorage)
let sessionTransientBrainData = {};

const defaultState = {
  isLoggedIn: false,
  userEmail: '',
  isFounderUser: false,
  isDarkMode: false,
  dashboardView: 'student',
  proCustomerCount: 850,
  user: {
    name: 'Candidate',
    age: 17,
    cohortClass: 'Class 12',
    goal: 'National Top Rank',
    weakness: 'Calculation Speed',
    exp: 0,
    level: 1,
    isPro: false
  },
  regainShieldActive: false,
  feedbacks: [],
  customSections: [...APP_CONFIG.DEFAULT_SECTIONS],
  activeNotebookId: null,
  notebooks: [],
  marksTrackFilter: 'Milestone',
  marks: [],
  trackedExams: [
    { id: 'ex-1', name: 'Target Exam Mock #1', date: '2026-01-23', color: '#0B7A53' }
  ],
  gatekeeper: { notesRevised: false, dppCompleted: false },
  calendarEvents: {}
};

let state = loadState();

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultState;
  try { return { ...defaultState, ...JSON.parse(stored) }; }
  catch (e) { return defaultState; }
}

function saveState() {
  try {
    const copy = JSON.parse(JSON.stringify(state));
    // Completely strips transient Train Ur Brain from persistent local storage
    copy.notebooks.forEach(nb => {
      if (nb.chapters) {
        nb.chapters.forEach(chap => {
          if (chap.sectionsData && chap.sectionsData['train_brain']) {
            delete chap.sectionsData['train_brain'];
          }
        });
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  } catch (e) { console.warn('Storage failed', e); }
  renderAll();
}