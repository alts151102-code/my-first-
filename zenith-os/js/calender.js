/* =======================================================
   MULTI-EXAM PREDICTIVE CALENDAR & 5-YEAR SHIFTS
   ======================================================= */
let calDate = new Date();

function renderCalendar() {
  const titleEl = document.getElementById('cal-month-title');
  const grid = document.getElementById('cal-days-grid');
  if (!titleEl || !grid) return;

  const y = calDate.getFullYear();
  const m = calDate.getMonth();
  titleEl.innerText = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  grid.innerHTML = '';

  const first = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 0; i < first; i++) grid.innerHTML += `<div class="p-2"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dStr === todayStr;
    const matchingExams = state.trackedExams.filter(e => e.date === dStr);

    grid.innerHTML += `
      <div class="p-1.5 rounded-lg border ${isToday ? 'border-mint-600 bg-mint-50/50 dark:bg-mint-950/20' : 'border-transparent'} text-center min-h-[44px] flex flex-col justify-between">
        <span class="text-xs ${isToday ? 'text-mint-800 dark:text-mint-300 font-bold' : ''}">${d}</span>
        <div class="flex items-center justify-center gap-1 flex-wrap">
          ${matchingExams.map(ex => `<span class="w-2 h-2 rounded-full" style="background-color: ${ex.color || '#C92A2A'}"></span>`).join('')}
        </div>
      </div>
    `;
  }
}

function changeCalMonth(d) { calDate.setMonth(calDate.getMonth() + d); renderCalendar(); }
function resetCalMonth() { calDate = new Date(); renderCalendar(); }

function populateCalendarPresets() {
  const sel = document.getElementById('cal-exam-preset');
  if (!sel || sel.children.length > 0) return;
  sel.innerHTML = Object.keys(HISTORICAL_ENGINE_DB).map(k => `
    <option value="${k}">${HISTORICAL_ENGINE_DB[k].name}</option>
  `).join('') + `<option value="custom">-- Custom Exam Name --</option>`;
  onPresetExamSelected();
}

function onPresetExamSelected() {
  const sel = document.getElementById('cal-exam-preset');
  const nameInput = document.getElementById('cal-exam-name');
  const year = document.getElementById('cal-exam-year').value;
  if (!sel || !nameInput) return;
  if (sel.value !== 'custom' && HISTORICAL_ENGINE_DB[sel.value]) {
    nameInput.value = `${HISTORICAL_ENGINE_DB[sel.value].name} ${year}`;
  } else {
    nameInput.value = '';
  }
}

function autoProjectSelectedExamDate() {
  const sel = document.getElementById('cal-exam-preset');
  const year = parseInt(document.getElementById('cal-exam-year').value) || 2026;
  const dateInput = document.getElementById('cal-exam-date');
  if (sel.value === 'custom') { alert('Enter date manually for custom exams.'); return; }
  const item = HISTORICAL_ENGINE_DB[sel.value];
  const mStr = String(item.targetMonth + 1).padStart(2, '0');
  const dStr = String(item.targetDay).padStart(2, '0');
  dateInput.value = `${year}-${mStr}-${dStr}`;
  alert(`⚡ Projected ${item.name} (${year}): ${year}-${mStr}-${dStr}`);
}