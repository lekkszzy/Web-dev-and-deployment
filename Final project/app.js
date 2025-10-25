// Wellbeing tracking functionality
const wellbeingData = {
    water: [],
    sleep: []
};

// Water tracking (stepper buttons may appear later — safe to attach if present)
document.querySelectorAll('.stepper button').forEach(button => {
    button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const waterCount = document.getElementById('waterCount');
        if (!waterCount) return;
        let count = parseInt(waterCount.textContent) || 0;

        if (action === 'inc' && count < 20) {
            count++;
        } else if (action === 'dec' && count > 0) {
            count--;
        }
        waterCount.textContent = count;
    });
});

// Sleep tracking (guard element existence)
(function attachSleepHandler() {
    const sleepInput = document.getElementById('sleepInput');
    if (!sleepInput) return;
    sleepInput.addEventListener('change', () => {
        const value = parseFloat(sleepInput.value);
        if (Number.isNaN(value)) {
            sleepInput.value = '';
            return;
        }
        if (value < 0) sleepInput.value = 0;
        if (value > 24) sleepInput.value = 24;
    });
})();

// Save wellbeing data (guard buttons/inputs)
(function attachWellbeingSaveReset() {
    const saveBtn = document.getElementById('saveWellbeing');
    const resetBtn = document.getElementById('resetWellbeing');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const daySelect = document.getElementById('daySelect');
            const waterCountEl = document.getElementById('waterCount');
            const sleepInputEl = document.getElementById('sleepInput');
            if (!daySelect || !waterCountEl || !sleepInputEl) return;

            const today = new Date().toISOString().split('T')[0];
            const waterCount = parseInt(waterCountEl.textContent) || 0;
            const sleepHours = parseFloat(sleepInputEl.value) || 0;

            // Save to local storage
            const savedData = JSON.parse(localStorage.getItem('wellbeingData') || '{"water":[], "sleep":[]}');

            // Add today's data
            savedData.water.push({ date: today, value: waterCount });
            savedData.sleep.push({ date: today, value: sleepHours });

            // Keep only last 7 days
            savedData.water = savedData.water.slice(-7);
            savedData.sleep = savedData.sleep.slice(-7);

            localStorage.setItem('wellbeingData', JSON.stringify(savedData));
            if (typeof updateWeeklySummary === 'function') updateWeeklySummary();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const waterCountEl = document.getElementById('waterCount');
            const sleepInputEl = document.getElementById('sleepInput');
            if (waterCountEl) waterCountEl.textContent = '0';
            if (sleepInputEl) sleepInputEl.value = '';
        });
    }
})();

// Update weekly summary (guard target elements)
function updateWeeklySummary() {
    const savedData = JSON.parse(localStorage.getItem('wellbeingData') || '{"water":[], "sleep":[]}');

    // Calculate averages
    const avgWater = savedData.water.reduce((sum, day) => sum + (day.value || 0), 0) /
                     (savedData.water.length || 1);
    const avgSleep = savedData.sleep.reduce((sum, day) => sum + (day.value || 0), 0) /
                     (savedData.sleep.length || 1);

    const avgWaterEl = document.getElementById('avgWater');
    const avgSleepEl = document.getElementById('avgSleep');
    if (avgWaterEl) avgWaterEl.textContent = avgWater.toFixed(1);
    if (avgSleepEl) avgSleepEl.textContent = avgSleep.toFixed(1);

    // Display last 7 days data
    const waterChart = document.getElementById('waterChart');
    const sleepChart = document.getElementById('sleepChart');

    if (waterChart) {
        waterChart.innerHTML = `<strong>Last 7 days:</strong> ${savedData.water.map(day =>
            `<span title="${day.date}: ${day.value} glasses">${day.value}</span>`).join(' | ')}`;
    }
    if (sleepChart) {
        sleepChart.innerHTML = `<strong>Last 7 days:</strong> ${savedData.sleep.map(day =>
            `<span title="${day.date}: ${day.value} hours">${day.value}</span>`).join(' | ')}`;
    }
}

// Load summary on page load (guard presence)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('weeklyByDay') || document.getElementById('avgWater') || document.getElementById('waterChart')) {
        updateWeeklySummary();
    }
});

// Minimal interactivity: habits, workout logging, water stepper, mood, sleep, save/reset, and summary.

document.addEventListener('DOMContentLoaded', () => {
  // --- Helpers ---
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const todayKey = () => new Date().toISOString().slice(0, 10);

  // --- Elements ---
  const addHabitForm = qs('#addHabitForm');
  const habitNameInput = qs('#habitName');
  const habitsList = qs('#habitsList');
  const clearHabitsBtn = qs('#clearHabits');

  const workoutForm = qs('#workoutForm');
  const exerciseName = qs('#exerciseName');
  const setsInput = qs('#sets');
  const repsInput = qs('#reps');
  const restInput = qs('#restTime');
  const exerciseList = qs('#exerciseList');

  const waterCountEl = qs('#waterCount');
  const stepperButtons = qsa('.stepper [data-action]');
  const sleepInput = qs('#sleepInput');
  const moodButtons = qsa('.mood');
  const saveWellbeingBtn = qs('#saveWellbeing');
  const resetWellbeingBtn = qs('#resetWellbeing');
  const summaryEl = qs('#summary');

  // --- Storage helpers ---
  const load = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // --- Habits ---
  let habits = load('habits', []);
  function renderHabits() {
    habitsList.innerHTML = '';
    habits.forEach((h, idx) => {
      const li = document.createElement('li');
      li.className = 'habit-item';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = !!h.done;
      chk.addEventListener('change', () => {
        habits[idx].done = chk.checked;
        save('habits', habits);
        updateSummary();
      });
      const span = document.createElement('span');
      span.textContent = h.name;
      span.style.margin = '0 8px';
      const del = document.createElement('button');
      del.className = 'btn ghost small';
      del.textContent = 'Remove';
      del.addEventListener('click', () => {
        habits.splice(idx, 1);
        save('habits', habits);
        renderHabits();
        updateSummary();
      });
      li.appendChild(chk);
      li.appendChild(span);
      li.appendChild(del);
      habitsList.appendChild(li);
    });
  }
  addHabitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = habitNameInput.value.trim();
    if (!name) return;
    habits.push({ name, done: false, date: todayKey() });
    save('habits', habits);
    habitNameInput.value = '';
    renderHabits();
    updateSummary();
  });
  clearHabitsBtn.addEventListener('click', () => {
    habits = [];
    save('habits', habits);
    renderHabits();
    updateSummary();
  });
  renderHabits();

  // --- Workout logging ---
  let workouts = load('workouts', []);
  function renderWorkouts() {
    exerciseList.innerHTML = '';
    workouts.slice().reverse().forEach((w, idx) => {
      const li = document.createElement('li');
      li.textContent = `${w.name} — ${w.sets} sets x ${w.reps} reps (rest ${w.rest}s)`;
      const del = document.createElement('button');
      del.className = 'btn ghost small';
      del.textContent = 'Remove';
      del.style.marginLeft = '8px';
      del.addEventListener('click', () => {
        const realIndex = workouts.length - 1 - idx;
        workouts.splice(realIndex, 1);
        save('workouts', workouts);
        renderWorkouts();
        updateSummary();
      });
      li.appendChild(del);
      exerciseList.appendChild(li);
    });
  }
  workoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = exerciseName.value.trim();
    const sets = Number(setsInput.value) || 0;
    const reps = Number(repsInput.value) || 0;
    const rest = Number(restInput.value) || 0;
    if (!name || sets < 1 || reps < 1) return;
    workouts.push({ name, sets, reps, rest, date: todayKey() });
    save('workouts', workouts);
    exerciseName.value = '';
    setsInput.value = '';
    repsInput.value = '';
    restInput.value = '';
    renderWorkouts();
    updateSummary();
  });
  renderWorkouts();

  // --- Water stepper ---
  let water = load('water', 0);
  function renderWater() {
    waterCountEl.textContent = String(water);
  }
  stepperButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'inc') water = Math.min(50, water + 1);
      if (action === 'dec') water = Math.max(0, water - 1);
      save('water', water);
      renderWater();
    });
  });
  renderWater();

  // --- Mood selection ---
  let mood = load('mood', null);
  function renderMood() {
    moodButtons.forEach(b => {
      b.dataset.selected = (b.dataset.mood === String(mood)) ? 'true' : 'false';
    });
  }
  moodButtons.forEach(b => {
    b.addEventListener('click', () => {
      mood = Number(b.dataset.mood);
      save('mood', mood);
      renderMood();
    });
  });
  renderMood();

  // --- Sleep ---
  let sleep = load('sleep', '');
  sleepInput.value = sleep;

  // --- Save / Reset wellbeing ---
  function saveTodayWellbeing() {
    sleep = sleepInput.value ? Number(sleepInput.value) : 0;
    save('sleep', sleep);
    save('water', water);
    save('mood', mood);
    // store history
    const log = load('wellbeingLog', []);
    log.push({ date: todayKey(), water, sleep, mood });
    // keep 30 entries max
    save('wellbeingLog', log.slice(-30));
    updateSummary();
  }
  function resetWellbeing() {
    water = 0;
    sleep = '';
    mood = null;
    save('water', water);
    save('sleep', sleep);
    save('mood', mood);
    sleepInput.value = '';
    renderWater();
    renderMood();
    updateSummary();
  }
  saveWellbeingBtn.addEventListener('click', saveTodayWellbeing);
  resetWellbeingBtn.addEventListener('click', resetWellbeing);

  // --- Comments ---
  // Comment handling functions
function handleCommentSave() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText) return;

    // Get existing comments or initialize empty array
    const comments = JSON.parse(localStorage.getItem('dailyComments') || '[]');
    
    // Add new comment
    const newComment = {
        date: new Date().toLocaleString(),
        text: commentText
    };
    
    comments.unshift(newComment); // Add to beginning of array
    localStorage.setItem('dailyComments', JSON.stringify(comments));
    
    // Clear input
    commentInput.value = '';
    
    // Update display
    displayComments();
}

function handleCommentReset() {
    document.getElementById('commentInput').value = '';
}

function displayComments() {
    const commentsContainer = document.getElementById('pastComments');
    const comments = JSON.parse(localStorage.getItem('dailyComments') || '[]');

    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">No previous comments yet.</p>';
        return;
    }

    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment-entry">
            <div class="comment-date">${comment.date}</div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const saveCommentBtn = document.getElementById('saveComment');
    const resetCommentBtn = document.getElementById('resetComment');

    saveCommentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCommentSave();
    });

    resetCommentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCommentReset();
    });

    // Display existing comments on page load
    displayComments();
});

  // --- Summary (simple weekly summary) ---
  function updateSummary() {
    // Weekly summary from wellbeingLog
    const log = load('wellbeingLog', []);
    if (!log.length) {
      summaryEl.innerHTML = `<p>No data yet. Save today's wellbeing and complete habits to see progress.</p>`;
      return;
    }
    // take last 7 entries
    const last7 = log.slice(-7);
    const avgWater = (last7.reduce((s, r) => s + (r.water || 0), 0) / last7.length).toFixed(1);
    const avgSleep = (last7.reduce((s, r) => s + (r.sleep || 0), 0) / last7.length).toFixed(1);
    const avgMood = (last7.reduce((s, r) => s + (r.mood || 0), 0) / last7.length);
    const moodText = isNaN(avgMood) ? '—' : ['😞','😐','🙂','😄'][Math.max(0, Math.min(3, Math.round(avgMood) - 1))] ?? '—';

    const completedHabits = habits.filter(h => h.done && h.date === todayKey()).length;
    const totalHabits = habits.length;

    summaryEl.innerHTML = `
      <p><strong>Last ${last7.length} days (avg)</strong></p>
      <p>Water: ${avgWater} glasses · Sleep: ${avgSleep} hrs · Mood: ${moodText}</p>
      <p>Workouts logged: ${workouts.filter(w=> w.date === todayKey()).length} today</p>
      <p>Habits completed today: ${completedHabits} / ${totalHabits}</p>
    `;
  }

  // Initial summary render
  updateSummary();
  displayComments();
});

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => section.classList.remove('active'));
        
        // Remove active class from all buttons
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        // Show selected section
        const targetSection = sectionId === 'home' ? 
            document.getElementById('home') : 
            document.getElementById(`${sectionId}-section`);
        targetSection.classList.add('active');
        
        // Add active class to clicked button
        const activeButton = document.querySelector(`[data-section="${sectionId}"]`);
        activeButton.classList.add('active');
    }

    // Add click handlers to nav buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Show home section by default
    showSection('home');
});

document.addEventListener('DOMContentLoaded', () => {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('.section');

    // Function to show active section
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to clicked nav link
        const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Add click handlers to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Show home section by default
    showSection('home');
});

document.addEventListener('DOMContentLoaded', () => {
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const KEY = 'wellbeingLog';

  const daySelect = document.getElementById('daySelect');
  const waterCountEl = document.getElementById('waterCount');
  const sleepInput = document.getElementById('sleepInput');
  const logBtn = document.getElementById('logWellbeing');
  const resetBtn = document.getElementById('resetWellbeing');
  const weeklyContainer = document.getElementById('weeklyByDay');
  const moodBtns = Array.from(document.querySelectorAll('.mood-options .mood'));
  const stepperBtns = Array.from(document.querySelectorAll('.stepper button'));

  if (!weeklyContainer) return; // guard if section not present

  // storage helpers
  function loadLog() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function saveLog(log) { localStorage.setItem(KEY, JSON.stringify(log)); }

  // stepper handling
  stepperBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      let n = parseInt(waterCountEl?.textContent || '0', 10);
      if (btn.dataset.action === 'inc') n = Math.min(50, n + 1);
      if (btn.dataset.action === 'dec') n = Math.max(0, n - 1);
      if (waterCountEl) waterCountEl.textContent = String(n);
    });
  });

  // mood selection
  let selectedMood = null;
  moodBtns.forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      moodBtns.forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      selectedMood = b.dataset.mood;
    });
  });

  function moodEmoji(val) {
    switch (String(val)) {
      case '1': return '😞';
      case '2': return '😐';
      case '3': return '🙂';
      case '4': return '😄';
      default: return 'Not set';
    }
  }

  function getLatestForDay(log, day) {
    for (let i = log.length - 1; i >= 0; i--) if (log[i].day === day) return log[i];
    return null;
  }

  function renderWeeklyFromLog() {
    const log = loadLog();
    weeklyContainer.innerHTML = DAYS.map(day => {
      const entry = getLatestForDay(log, day);
      if (!entry) {
        return `<div class="day-entry" data-day="${day}">
          <h4>${day}</h4>
          <p>Water: <strong>Not set</strong></p>
          <p>Sleep: <strong>Not set</strong></p>
          <p>Mood: <strong>Not set</strong></p>
        </div>`;
      }
      const w = (typeof entry.water !== 'undefined') ? `${entry.water} glasses` : 'Not set';
      const s = (entry.sleep === null || typeof entry.sleep === 'undefined') ? 'Not set' : `${entry.sleep} hours`;
      const m = entry.mood ? moodEmoji(entry.mood) : 'Not set';
      return `<div class="day-entry" data-day="${day}">
        <h4>${day}</h4>
        <p>Water: <strong>${w}</strong></p>
        <p>Sleep: <strong>${s}</strong></p>
        <p>Mood: <strong>${m}</strong></p>
        <p class="entry-meta"><small>Logged: ${new Date(entry.loggedAt).toLocaleString()}</small></p>
      </div>`;
    }).join('');
  }

  // log button
  if (logBtn) {
    logBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const day = daySelect?.value;
      if (!day) { alert('Please select a day before logging.'); return; }

      // read typed values first (new inputs), fallback to previous counters if present
      const waterTyped = document.getElementById('waterInput')?.value;
      const water = (typeof waterTyped !== 'undefined' && waterTyped !== '') ? Math.max(0, Math.min(50, parseInt(waterTyped, 10) || 0)) :
                    (parseInt(waterCountEl?.textContent || '0', 10) || 0);
      const sleepTyped = document.getElementById('sleepInput')?.value;
      const sleep = (typeof sleepTyped !== 'undefined' && sleepTyped !== '') ? Math.max(0, Math.min(24, parseFloat(sleepTyped))) :
                    ((sleepInput?.value === '' || sleepInput?.value === undefined) ? null : Math.max(0, Math.min(24, parseFloat(sleepInput.value))));
      const mood = selectedMood || null;

      const log = loadLog();
      log.push({ day, water, sleep, mood, loggedAt: new Date().toISOString() });
      saveLog(log);

      renderWeeklyFromLog();

      // brief UI feedback
      const orig = logBtn.textContent;
      logBtn.textContent = 'Logged';
      logBtn.disabled = true;
      setTimeout(() => { logBtn.textContent = orig; logBtn.disabled = false; }, 700);
    });
  }

  // reset inputs
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // clear inputs and stored wellbeing logs
      if (daySelect) daySelect.value = '';
      const waterInput = document.getElementById('waterInput');
      if (waterInput) waterInput.value = '';
      if (waterCountEl) waterCountEl.textContent = '0';
      const sleepInputEl = document.getElementById('sleepInput');
      if (sleepInputEl) sleepInputEl.value = '';
      if (typeof selectedMood !== 'undefined') selectedMood = null;
      moodBtns.forEach(b => b.classList.remove('selected'));
      // remove persisted wellbeing log and re-render weekly display
      try { localStorage.removeItem('wellbeingLog'); } catch (err) { /* ignore */ }
      renderWeeklyFromLog();
    });
  }
  // initial render
  renderWeeklyFromLog();
});

// clear weekly summary (remove stored wellbeingData and re-render)
(function attachClearWeeklySummary() {
  const btn = document.getElementById('clearWeeklySummary');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!confirm('Clear all weekly summary data? This cannot be undone.')) return;
    localStorage.removeItem('wellbeingData');
    // If you also track other keys (e.g. past comments) clear them here as needed:
    // localStorage.removeItem('dailyComments');

    // re-render summary (assumes updateWeeklySummary exists in this file)
    if (typeof updateWeeklySummary === 'function') {
      updateWeeklySummary();
    } else {
      // fallback: clear UI container if updateWeeklySummary is not available
      const container = document.getElementById('weeklyByDay');
      if (container) container.innerHTML = '';
    }

    // clear wellbeing input fields
    const daySelect = document.getElementById('daySelect');
    const waterCount = document.getElementById('waterCount');
    const sleepInput = document.getElementById('sleepInput');
    if (daySelect) daySelect.value = '';
    if (waterCount) waterCount.textContent = '0';
    if (sleepInput) sleepInput.value = '';
  });
})();

// Past notes (save/display)
(function () {
  const STORAGE_KEY = 'pastNotes';

  function loadNotes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function createNoteElement(note) {
    const wrapper = document.createElement('div');
    wrapper.className = 'comment-entry';

    const meta = document.createElement('div');
    meta.className = 'comment-date';
    meta.textContent = note.date;

    const text = document.createElement('p');
    text.className = 'comment-text';
    text.textContent = note.text;

    wrapper.appendChild(meta);
    wrapper.appendChild(text);
    return wrapper;
  }

  function displayNotes() {
    const container = document.getElementById('pastComments');
    if (!container) return;
    const notes = loadNotes();
    container.innerHTML = '';
    if (!notes.length) {
      const p = document.createElement('p');
      p.className = 'no-comments';
      p.textContent = 'No previous comments yet.';
      container.appendChild(p);
      return;
    }
    // newest first
    notes.slice().reverse().forEach(n => container.appendChild(createNoteElement(n)));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveNote');
    const resetBtn = document.getElementById('resetNote');
    const clearAllBtn = document.getElementById('clearAllNotes');
    const noteInput = document.getElementById('noteInput');

    if (saveBtn && noteInput) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const text = noteInput.value.trim();
        if (!text) return;
        const notes = loadNotes();
        notes.push({
          date: new Date().toLocaleString(),
          text
        });
        saveNotes(notes);
        noteInput.value = '';
        displayNotes();
      });
    }

    if (resetBtn && noteInput) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        noteInput.value = '';
      });
    }

    // Clear ALL saved notes
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!confirm('Clear all saved notes? This cannot be undone.')) return;
        localStorage.removeItem(STORAGE_KEY);
        displayNotes();
      });
    }

    // initial render
    displayNotes();
  });
})();

// Navigation: make main-nav links show/hide sections and use hash without page jump
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
  const sections = Array.from(document.querySelectorAll('main .section'));

  function showSection(id) {
    sections.forEach(s => s.classList.toggle('active', s.id === id));
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    // update URL hash without scrolling
    try { history.replaceState(null, '', `#${id}`); } catch (e) { location.hash = `#${id}`; }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = (link.getAttribute('href') || '').replace('#', '') || 'home';
      if (!document.getElementById(target)) return;
      showSection(target);
    });
  });

  // On load, show section from hash (or default to home)
  const initial = (location.hash || '#home').replace('#', '');
  if (document.getElementById(initial)) showSection(initial);
  else showSection('home');
});

// universal stepper handler for counters (water, sleep, etc.)
(function attachUniversalStepper() {
  const buttons = Array.from(document.querySelectorAll('.stepper button[data-target]'));
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      const targetId = btn.dataset.target;
      const step = parseFloat(btn.dataset.step || '1');
      const el = document.getElementById(targetId);
      if (!el) return;

      // current value may be integer or float
      let current = parseFloat(el.textContent) || 0;
      if (action === 'inc') current += step;
      if (action === 'dec') current -= step;

      // clamp per target
      if (targetId === 'waterCount') {
        current = Math.max(0, Math.min(50, Math.round(current))); // keep water as integer
      } else if (targetId === 'sleepCount') {
        current = Math.max(0, Math.min(24, Math.round(current * 2) / 2)); // half-hour steps
      } else {
        // default clamp
        current = Math.max(0, current);
      }

      // display integer for water, show .5 for sleep when needed
      el.textContent = (targetId === 'waterCount') ? String(parseInt(current, 10)) : String(current);
    });
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  // Ensure wellbeing inputs/counters show 0 by default before any logging
  const _waterInput = document.getElementById('waterInput');
  const _waterCount = document.getElementById('waterCount');
  const _sleepInput = document.getElementById('sleepInput');
  const _sleepCount = document.getElementById('sleepCount'); // if using a counter span

  if (_waterInput && (_waterInput.value === '' || _waterInput.value === null)) _waterInput.value = '0';
  if (_waterCount && (!_waterCount.textContent || _waterCount.textContent.trim() === '')) _waterCount.textContent = '0';
  if (_sleepInput && (_sleepInput.value === '' || _sleepInput.value === null)) _sleepInput.value = '0';
  if (_sleepCount && (!_sleepCount.textContent || _sleepCount.textContent.trim() === '')) _sleepCount.textContent = '0';

  // --- Helpers ---
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const todayKey = () => new Date().toISOString().slice(0, 10);

  // --- Elements ---
  const addHabitForm = qs('#addHabitForm');
  const habitNameInput = qs('#habitName');
  const habitsList = qs('#habitsList');
  const clearHabitsBtn = qs('#clearHabits');

  const workoutForm = qs('#workoutForm');
  const exerciseName = qs('#exerciseName');
  const setsInput = qs('#sets');
  const repsInput = qs('#reps');
  const restInput = qs('#restTime');
  const exerciseList = qs('#exerciseList');

  const waterCountEl = qs('#waterCount');
  const stepperButtons = qsa('.stepper [data-action]');
  const sleepInput = qs('#sleepInput');
  const moodButtons = qsa('.mood');
  const saveWellbeingBtn = qs('#saveWellbeing');
  const resetWellbeingBtn = qs('#resetWellbeing');
  const summaryEl = qs('#summary');

  // --- Storage helpers ---
  const load = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // --- Habits ---
  let habits = load('habits', []);
  function renderHabits() {
    habitsList.innerHTML = '';
    habits.forEach((h, idx) => {
      const li = document.createElement('li');
      li.className = 'habit-item';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = !!h.done;
      chk.addEventListener('change', () => {
        habits[idx].done = chk.checked;
        save('habits', habits);
        updateSummary();
      });
      const span = document.createElement('span');
      span.textContent = h.name;
      span.style.margin = '0 8px';
      const del = document.createElement('button');
      del.className = 'btn ghost small';
      del.textContent = 'Remove';
      del.addEventListener('click', () => {
        habits.splice(idx, 1);
        save('habits', habits);
        renderHabits();
        updateSummary();
      });
      li.appendChild(chk);
      li.appendChild(span);
      li.appendChild(del);
      habitsList.appendChild(li);
    });
  }
  addHabitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = habitNameInput.value.trim();
    if (!name) return;
    habits.push({ name, done: false, date: todayKey() });
    save('habits', habits);
    habitNameInput.value = '';
    renderHabits();
    updateSummary();
  });
  clearHabitsBtn.addEventListener('click', () => {
    habits = [];
    save('habits', habits);
    renderHabits();
    updateSummary();
  });
  renderHabits();

  // --- Workout logging ---
  let workouts = load('workouts', []);
  function renderWorkouts() {
    exerciseList.innerHTML = '';
    workouts.slice().reverse().forEach((w, idx) => {
      const li = document.createElement('li');
      li.textContent = `${w.name} — ${w.sets} sets x ${w.reps} reps (rest ${w.rest}s)`;
      const del = document.createElement('button');
      del.className = 'btn ghost small';
      del.textContent = 'Remove';
      del.style.marginLeft = '8px';
      del.addEventListener('click', () => {
        const realIndex = workouts.length - 1 - idx;
        workouts.splice(realIndex, 1);
        save('workouts', workouts);
        renderWorkouts();
        updateSummary();
      });
      li.appendChild(del);
      exerciseList.appendChild(li);
    });
  }
  workoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = exerciseName.value.trim();
    const sets = Number(setsInput.value) || 0;
    const reps = Number(repsInput.value) || 0;
    const rest = Number(restInput.value) || 0;
    if (!name || sets < 1 || reps < 1) return;
    workouts.push({ name, sets, reps, rest, date: todayKey() });
    save('workouts', workouts);
    exerciseName.value = '';
    setsInput.value = '';
    repsInput.value = '';
    restInput.value = '';
    renderWorkouts();
    updateSummary();
  });
  renderWorkouts();

  // --- Water stepper ---
  let water = load('water', 0);
  function renderWater() {
    waterCountEl.textContent = String(water);
  }
  stepperButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'inc') water = Math.min(50, water + 1);
      if (action === 'dec') water = Math.max(0, water - 1);
      save('water', water);
      renderWater();
    });
  });
  renderWater();

  // --- Mood selection ---
  let mood = load('mood', null);
  function renderMood() {
    moodButtons.forEach(b => {
      b.dataset.selected = (b.dataset.mood === String(mood)) ? 'true' : 'false';
    });
  }
  moodButtons.forEach(b => {
    b.addEventListener('click', () => {
      mood = Number(b.dataset.mood);
      save('mood', mood);
      renderMood();
    });
  });
  renderMood();

  // --- Sleep ---
  let sleep = load('sleep', '');
  sleepInput.value = sleep;

  // --- Save / Reset wellbeing ---
  function saveTodayWellbeing() {
    sleep = sleepInput.value ? Number(sleepInput.value) : 0;
    save('sleep', sleep);
    save('water', water);
    save('mood', mood);
    // store history
    const log = load('wellbeingLog', []);
    log.push({ date: todayKey(), water, sleep, mood });
    // keep 30 entries max
    save('wellbeingLog', log.slice(-30));
    updateSummary();
  }
  function resetWellbeing() {
    water = 0;
    sleep = '';
    mood = null;
    save('water', water);
    save('sleep', sleep);
    save('mood', mood);
    sleepInput.value = '';
    renderWater();
    renderMood();
    updateSummary();
  }
  saveWellbeingBtn.addEventListener('click', saveTodayWellbeing);
  resetWellbeingBtn.addEventListener('click', resetWellbeing);

  // --- Comments ---
  // Comment handling functions
function handleCommentSave() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText) return;

    // Get existing comments or initialize empty array
    const comments = JSON.parse(localStorage.getItem('dailyComments') || '[]');
    
    // Add new comment
    const newComment = {
        date: new Date().toLocaleString(),
        text: commentText
    };
    
    comments.unshift(newComment); // Add to beginning of array
    localStorage.setItem('dailyComments', JSON.stringify(comments));
    
    // Clear input
    commentInput.value = '';
    
    // Update display
    displayComments();
}

function handleCommentReset() {
    document.getElementById('commentInput').value = '';
}

function displayComments() {
    const commentsContainer = document.getElementById('pastComments');
    const comments = JSON.parse(localStorage.getItem('dailyComments') || '[]');

    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">No previous comments yet.</p>';
        return;
    }

    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment-entry">
            <div class="comment-date">${comment.date}</div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const saveCommentBtn = document.getElementById('saveComment');
    const resetCommentBtn = document.getElementById('resetComment');

    saveCommentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCommentSave();
    });

    resetCommentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCommentReset();
    });

    // Display existing comments on page load
    displayComments();
});

  // --- Summary (simple weekly summary) ---
  function updateSummary() {
    // Weekly summary from wellbeingLog
    const log = load('wellbeingLog', []);
    if (!log.length) {
      summaryEl.innerHTML = `<p>No data yet. Save today's wellbeing and complete habits to see progress.</p>`;
      return;
    }
    // take last 7 entries
    const last7 = log.slice(-7);
    const avgWater = (last7.reduce((s, r) => s + (r.water || 0), 0) / last7.length).toFixed(1);
    const avgSleep = (last7.reduce((s, r) => s + (r.sleep || 0), 0) / last7.length).toFixed(1);
    const avgMood = (last7.reduce((s, r) => s + (r.mood || 0), 0) / last7.length);
    const moodText = isNaN(avgMood) ? '—' : ['😞','😐','🙂','😄'][Math.max(0, Math.min(3, Math.round(avgMood) - 1))] ?? '—';

    const completedHabits = habits.filter(h => h.done && h.date === todayKey()).length;
    const totalHabits = habits.length;

    summaryEl.innerHTML = `
      <p><strong>Last ${last7.length} days (avg)</strong></p>
      <p>Water: ${avgWater} glasses · Sleep: ${avgSleep} hrs · Mood: ${moodText}</p>
      <p>Workouts logged: ${workouts.filter(w=> w.date === todayKey()).length} today</p>
      <p>Habits completed today: ${completedHabits} / ${totalHabits}</p>
    `;
  }

  // Initial summary render
  updateSummary();
  displayComments();
});

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => section.classList.remove('active'));
        
        // Remove active class from all buttons
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        // Show selected section
        const targetSection = sectionId === 'home' ? 
            document.getElementById('home') : 
            document.getElementById(`${sectionId}-section`);
        targetSection.classList.add('active');
        
        // Add active class to clicked button
        const activeButton = document.querySelector(`[data-section="${sectionId}"]`);
        activeButton.classList.add('active');
    }

    // Add click handlers to nav buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Show home section by default
    showSection('home');
});

document.addEventListener('DOMContentLoaded', () => {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('.section');

    // Function to show active section
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to clicked nav link
        const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Add click handlers to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Show home section by default
    showSection('home');
});

document.addEventListener('DOMContentLoaded', () => {
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const KEY = 'wellbeingLog';

  const daySelect = document.getElementById('daySelect');
  const waterCountEl = document.getElementById('waterCount');
  const sleepInput = document.getElementById('sleepInput');
  const logBtn = document.getElementById('logWellbeing');
  const resetBtn = document.getElementById('resetWellbeing');
  const weeklyContainer = document.getElementById('weeklyByDay');
  const moodBtns = Array.from(document.querySelectorAll('.mood-options .mood'));
  const stepperBtns = Array.from(document.querySelectorAll('.stepper button'));

  if (!weeklyContainer) return; // guard if section not present

  // storage helpers
  function loadLog() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function saveLog(log) { localStorage.setItem(KEY, JSON.stringify(log)); }

  // stepper handling
  stepperBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      let n = parseInt(waterCountEl?.textContent || '0', 10);
      if (btn.dataset.action === 'inc') n = Math.min(50, n + 1);
      if (btn.dataset.action === 'dec') n = Math.max(0, n - 1);
      if (waterCountEl) waterCountEl.textContent = String(n);
    });
  });

  // mood selection
  let selectedMood = null;
  moodBtns.forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      moodBtns.forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      selectedMood = b.dataset.mood;
    });
  });

  function moodEmoji(val) {
    switch (String(val)) {
      case '1': return '😞';
      case '2': return '😐';
      case '3': return '🙂';
      case '4': return '😄';
      default: return 'Not set';
    }
  }

  function getLatestForDay(log, day) {
    for (let i = log.length - 1; i >= 0; i--) if (log[i].day === day) return log[i];
    return null;
  }

  function renderWeeklyFromLog() {
    const log = loadLog();
    weeklyContainer.innerHTML = DAYS.map(day => {
      const entry = getLatestForDay(log, day);
      if (!entry) {
        return `<div class="day-entry" data-day="${day}">
          <h4>${day}</h4>
          <p>Water: <strong>Not set</strong></p>
          <p>Sleep: <strong>Not set</strong></p>
          <p>Mood: <strong>Not set</strong></p>
        </div>`;
      }
      const w = (typeof entry.water !== 'undefined') ? `${entry.water} glasses` : 'Not set';
      const s = (entry.sleep === null || typeof entry.sleep === 'undefined') ? 'Not set' : `${entry.sleep} hours`;
      const m = entry.mood ? moodEmoji(entry.mood) : 'Not set';
      return `<div class="day-entry" data-day="${day}">
        <h4>${day}</h4>
        <p>Water: <strong>${w}</strong></p>
        <p>Sleep: <strong>${s}</strong></p>
        <p>Mood: <strong>${m}</strong></p>
        <p class="entry-meta"><small>Logged: ${new Date(entry.loggedAt).toLocaleString()}</small></p>
      </div>`;
    }).join('');
  }

  // log button
  if (logBtn) {
    logBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const day = daySelect?.value;
      if (!day) { alert('Please select a day before logging.'); return; }

      // read typed values first (new inputs), fallback to previous counters if present
      const waterTyped = document.getElementById('waterInput')?.value;
      const water = (typeof waterTyped !== 'undefined' && waterTyped !== '') ? Math.max(0, Math.min(50, parseInt(waterTyped, 10) || 0)) :
                    (parseInt(waterCountEl?.textContent || '0', 10) || 0);
      const sleepTyped = document.getElementById('sleepInput')?.value;
      const sleep = (typeof sleepTyped !== 'undefined' && sleepTyped !== '') ? Math.max(0, Math.min(24, parseFloat(sleepTyped))) :
                    ((sleepInput?.value === '' || sleepInput?.value === undefined) ? null : Math.max(0, Math.min(24, parseFloat(sleepInput.value))));
      const mood = selectedMood || null;

      const log = loadLog();
      log.push({ day, water, sleep, mood, loggedAt: new Date().toISOString() });
      saveLog(log);

      renderWeeklyFromLog();

      // brief UI feedback
      const orig = logBtn.textContent;
      logBtn.textContent = 'Logged';
      logBtn.disabled = true;
      setTimeout(() => { logBtn.textContent = orig; logBtn.disabled = false; }, 700);
    });
  }

  // reset inputs
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // clear inputs and stored wellbeing logs
      if (daySelect) daySelect.value = '';
      const waterInput = document.getElementById('waterInput');
      if (waterInput) waterInput.value = '';
      if (waterCountEl) waterCountEl.textContent = '0';
      const sleepInputEl = document.getElementById('sleepInput');
      if (sleepInputEl) sleepInputEl.value = '';
      if (typeof selectedMood !== 'undefined') selectedMood = null;
      moodBtns.forEach(b => b.classList.remove('selected'));
      // remove persisted wellbeing log and re-render weekly display
      try { localStorage.removeItem('wellbeingLog'); } catch (err) { /* ignore */ }
      renderWeeklyFromLog();
    });
  }
  // initial render
  renderWeeklyFromLog();
});

// clear weekly summary (remove stored wellbeingData and re-render)
(function attachClearWeeklySummary() {
  const btn = document.getElementById('clearWeeklySummary');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!confirm('Clear all weekly summary data? This cannot be undone.')) return;
    localStorage.removeItem('wellbeingData');
    // If you also track other keys (e.g. past comments) clear them here as needed:
    // localStorage.removeItem('dailyComments');

    // re-render summary (assumes updateWeeklySummary exists in this file)
    if (typeof updateWeeklySummary === 'function') {
      updateWeeklySummary();
    } else {
      // fallback: clear UI container if updateWeeklySummary is not available
      const container = document.getElementById('weeklyByDay');
      if (container) container.innerHTML = '';
    }

    // clear wellbeing input fields
    const daySelect = document.getElementById('daySelect');
    const waterCount = document.getElementById('waterCount');
    const sleepInput = document.getElementById('sleepInput');
    if (daySelect) daySelect.value = '';
    if (waterCount) waterCount.textContent = '0';
    if (sleepInput) sleepInput.value = '';
  });
})();

// Past notes (save/display)
(function () {
  const STORAGE_KEY = 'pastNotes';

  function loadNotes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function createNoteElement(note) {
    const wrapper = document.createElement('div');
    wrapper.className = 'comment-entry';

    const meta = document.createElement('div');
    meta.className = 'comment-date';
    meta.textContent = note.date;

    const text = document.createElement('p');
    text.className = 'comment-text';
    text.textContent = note.text;

    wrapper.appendChild(meta);
    wrapper.appendChild(text);
    return wrapper;
  }

  function displayNotes() {
    const container = document.getElementById('pastComments');
    if (!container) return;
    const notes = loadNotes();
    container.innerHTML = '';
    if (!notes.length) {
      const p = document.createElement('p');
      p.className = 'no-comments';
      p.textContent = 'No previous comments yet.';
      container.appendChild(p);
      return;
    }
    // newest first
    notes.slice().reverse().forEach(n => container.appendChild(createNoteElement(n)));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveNote');
    const resetBtn = document.getElementById('resetNote');
    const clearAllBtn = document.getElementById('clearAllNotes');
    const noteInput = document.getElementById('noteInput');

    if (saveBtn && noteInput) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const text = noteInput.value.trim();
        if (!text) return;
        const notes = loadNotes();
        notes.push({
          date: new Date().toLocaleString(),
          text
        });
        saveNotes(notes);
        noteInput.value = '';
        displayNotes();
      });
    }

    if (resetBtn && noteInput) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        noteInput.value = '';
      });
    }

    // Clear ALL saved notes
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!confirm('Clear all saved notes? This cannot be undone.')) return;
        localStorage.removeItem(STORAGE_KEY);
        displayNotes();
      });
    }

    // initial render
    displayNotes();
  });
})();

// Navigation: make main-nav links show/hide sections and use hash without page jump
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
  const sections = Array.from(document.querySelectorAll('main .section'));

  function showSection(id) {
    sections.forEach(s => s.classList.toggle('active', s.id === id));
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    // update URL hash without scrolling
    try { history.replaceState(null, '', `#${id}`); } catch (e) { location.hash = `#${id}`; }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = (link.getAttribute('href') || '').replace('#', '') || 'home';
      if (!document.getElementById(target)) return;
      showSection(target);
    });
  });

  // On load, show section from hash (or default to home)
  const initial = (location.hash || '#home').replace('#', '');
  if (document.getElementById(initial)) showSection(initial);
  else showSection('home');
});

// universal stepper handler for counters (water, sleep, etc.)
(function attachUniversalStepper() {
  const buttons = Array.from(document.querySelectorAll('.stepper button[data-target]'));
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      const targetId = btn.dataset.target;
      const step = parseFloat(btn.dataset.step || '1');
      const el = document.getElementById(targetId);
      if (!el) return;

      // current value may be integer or float
      let current = parseFloat(el.textContent) || 0;
      if (action === 'inc') current += step;
      if (action === 'dec') current -= step;

      // clamp per target
      if (targetId === 'waterCount') {
        current = Math.max(0, Math.min(50, Math.round(current))); // keep water as integer
      } else if (targetId === 'sleepCount') {
        current = Math.max(0, Math.min(24, Math.round(current * 2) / 2)); // half-hour steps
      } else {
        // default clamp
        current = Math.max(0, current);
      }

      // display integer for water, show .5 for sleep when needed
      el.textContent = (targetId === 'waterCount') ? String(parseInt(current, 10)) : String(current);
    });
  });
})();