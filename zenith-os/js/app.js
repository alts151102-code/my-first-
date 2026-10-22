/* =======================================================
   ZENITH OS CORE APPLICATION LOGIC & PWA CONTROLLER
   ======================================================= */

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Authentication
function authenticateUser(email) {
  state.userEmail = email;
  state.isLoggedIn = true;
  state.isFounderUser = (email.toLowerCase().trim() === APP_CONFIG.FOUNDER_GOOGLE_EMAIL.toLowerCase().trim());
  
  if (state.isFounderUser) {
    state.user.name = APP_CONFIG.FOUNDER_NAME;
    state.user.isPro = true;
    alert(`👑 Founder Mode: Welcome ${APP_CONFIG.FOUNDER_NAME}. Escrow Vault and Founder Desk unlocked.`);
  } else {
    state.user.name = state.user.name || 'Candidate';
    state.dashboardView = 'student';
  }

  closeModal('modal-login');
  document.getElementById('landing-intro-screen').style.display = 'none';
  saveState();
}

function logOutToLanding() {
  state.isLoggedIn = false;
  saveState();
  document.getElementById('landing-intro-screen').style.display = 'flex';
  closeModal('modal-login');
  closeModal('modal-onboarding');
}

function configureFounderPrivileges() {
  const toggle = document.getElementById('founder-toggle-container');
  const badge = document.getElementById('role-status-badge');
  const fndNav = document.getElementById('founder-tab-nav-btn');
  if (state.isFounderUser) {
    toggle?.classList.remove('hidden');
    if (badge) badge.innerText = '👑 OWNER VIP';
    if (state.dashboardView === 'founder') fndNav?.classList.remove('hidden');
  } else {
    toggle?.classList.add('hidden');
    if (badge) badge.innerText = 'Candidate';
    fndNav?.classList.add('hidden');
  }
}

// Onboarding Steps
let currentWizardStep = 1;
let wizardSelectedClass = 'Class 12';

function startOnboardingWizard() {
  currentWizardStep = 1;
  showWizardStep(1);
  openModal('modal-onboarding');
}

function selectWizardClass(cls, btn) {
  wizardSelectedClass = cls;
  document.querySelectorAll('.wizard-class-btn').forEach(b => {
    b.className = 'wizard-class-btn p-3 rounded-xl border bordercol dark:border-darkborder font-bold';
  });
  btn.className = 'wizard-class-btn p-3 rounded-xl border-2 border-mint-700 bg-mint-50/40 dark:bg-mint-950/20 font-bold';
}

function showWizardStep(step) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`step-content-${i}`);
    if (el) el.classList.add('hidden');
  }
  const cur = document.getElementById(`step-content-${step}`);
  if (cur) cur.classList.remove('hidden');

  const pill = document.getElementById('onboard-step-pill');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');

  if (pill) pill.innerText = `STEP ${step} OF 5`;
  if (step === 1) prevBtn?.classList.add('hidden');
  else prevBtn?.classList.remove('hidden');

  if (step === 5 && nextBtn) nextBtn.innerText = 'Start Clean Workspace ⚡';
  else if (nextBtn) nextBtn.innerText = 'Continue →';
}

function wizardNextStep() {
  if (currentWizardStep === 1) {
    const val = document.getElementById('wizard-name').value.trim();
    if (!val) { alert('Please enter your name'); return; }
    state.user.name = val;
  }
  if (currentWizardStep === 2) {
    state.user.age = parseInt(document.getElementById('wizard-age').value) || 17;
  }
  if (currentWizardStep === 3) {
    state.user.cohortClass = wizardSelectedClass;
  }
  if (currentWizardStep === 4) {
    state.user.goal = document.getElementById('wizard-goal').value.trim() || 'Top Rank';
  }
  if (currentWizardStep === 5) {
    state.user.weakness = document.getElementById('wizard-weakness').value.trim() || 'Calculation Speed';
    state.isLoggedIn = true;
    state.notebooks = [];
    state.marks = [];
    closeModal('modal-onboarding');
    document.getElementById('landing-intro-screen').style.display = 'none';
    saveState();
    return;
  }
  currentWizardStep++;
  showWizardStep(currentWizardStep);
}

function wizardPrevStep() {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    showWizardStep(currentWizardStep);
  }
}

// 3D Canvas
function init3DCanvas() {
  const canvas = document.getElementById('threeDCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth * 2);
  let height = (canvas.height = canvas.offsetHeight * 2);
  let rotX = 0.6, rotY = 0.8, isDragging = false, lastX, lastY;

  const nodes = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
    [0, -1.8, 0], [0, 1.8, 0]
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    [8, 0], [8, 1], [8, 4], [8, 5],
    [9, 2], [9, 3], [9, 6], [9, 7]
  ];

  function project(x, y, z) {
    let x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
    let z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
    let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
    const zoom = Math.min(width, height) * 0.22;
    const perspective = 4 / (z2 + 4);
    return [width / 2 + x1 * zoom * perspective, height / 2 + y2 * zoom * perspective];
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (!isDragging) { rotY += 0.008; rotX += 0.004; }
    const projected = nodes.map(n => project(n[0], n[1], n[2]));

    ctx.strokeStyle = state.isDarkMode ? '#10B981' : '#0B7A53';
    ctx.lineWidth = 2.5;

    edges.forEach(e => {
      ctx.beginPath();
      ctx.moveTo(projected[e[0]][0], projected[e[0]][1]);
      ctx.lineTo(projected[e[1]][0], projected[e[1]][1]);
      ctx.stroke();
    });

    projected.forEach((p, idx) => {
      ctx.fillStyle = idx >= 8 ? '#C92A2A' : '#10B981';
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
  window.addEventListener('mouseup', () => (isDragging = false));
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    rotY += (e.clientX - lastX) * 0.01;
    rotX += (e.clientY - lastY) * 0.01;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  draw();
}

// PWA Install Trigger
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('pwa-install-btn-landing')?.classList.remove('hidden');
  document.getElementById('pwa-install-btn-nav')?.classList.remove('hidden');
});

function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        document.getElementById('pwa-install-btn-landing')?.classList.add('hidden');
        document.getElementById('pwa-install-btn-nav')?.classList.add('hidden');
      }
      deferredPrompt = null;
    });
  } else {
    alert('App install prompt: You can bookmark or select "Add to Home Screen" from your browser settings.');
  }
}

// Render Master
function renderAll() {
  configureFounderPrivileges();
  renderNotebookOverview();
  renderBacklog();
  renderCalendar();
  updatePaywallLockDisplay();

  const landing = document.getElementById('landing-intro-screen');
  if (state.isLoggedIn) {
    landing.style.display = 'none';
  } else {
    landing.style.display = 'flex';
  }
}

// Lifecycle Init
window.addEventListener('DOMContentLoaded', () => {
  // Service Worker Registration for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration skipped', err));
  }

  document.documentElement.classList.toggle('dark', state.isDarkMode);
  init3DCanvas();
  renderAll();

  // Keyboard shortcut for Cave
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'f' || e.key === 'F') {
      const cave = document.getElementById('study-cave-modal');
      if (cave.classList.contains('hidden')) openCave();
      else closeCave();
    }
    if (e.key === 'Escape') closeCave();
  });

  // Form Submissions
  document.getElementById('new-notebook-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nb-input-name').value.trim();
    const subject = document.getElementById('nb-input-subject').value;
    const id = 'nb_' + Date.now();
    state.notebooks.push({ id, name, subject, chapters: [] });
    state.activeNotebookId = id;
    closeModal('modal-new-notebook');
    saveState();
  });

  document.getElementById('add-chapter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nb = getActiveNotebook();
    const name = document.getElementById('chap-input-name').value.trim();
    const isBlocker = document.getElementById('chap-input-blocker').checked;
    if (!nb || !name) return;
    if (!nb.chapters) nb.chapters = [];
    nb.chapters.push({ id: 'chap_' + Date.now(), name, isBlocker, sectionsData: {} });
    closeModal('modal-add-chapter');
    saveState();
  });

  document.getElementById('marks-entry-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const cor = parseInt(document.getElementById('m-correct-qs').value) || 0;
    const incor = parseInt(document.getElementById('m-incorrect-qs').value) || 0;
    const net = parseInt(document.getElementById('m-net-score').value) || (cor * 4 - incor);
    const tot = parseInt(document.getElementById('m-total-marks').value) || 300;
    const att = cor + incor;
    const acc = att > 0 ? parseFloat(((cor / att) * 100).toFixed(1)) : 0;

    state.marks.unshift({
      name: document.getElementById('m-test-name').value.trim(),
      track: document.getElementById('m-test-track').value,
      date: document.getElementById('m-test-date').value,
      scored: net,
      total: tot,
      correctQs: cor,
      incorrectQs: incor,
      correctMarks: cor * 4,
      negatives: incor,
      accuracy: acc
    });
    saveState();
    renderAllLineCharts();
  });

  document.getElementById('feedback-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    state.feedbacks.unshift({
      author: document.getElementById('fb-author').value.trim(),
      type: document.getElementById('fb-type').value,
      message: document.getElementById('fb-message').value.trim()
    });
    alert('Feedback delivered to Founder Desk.');
    closeModal('modal-feedback');
    saveState();
  });
});