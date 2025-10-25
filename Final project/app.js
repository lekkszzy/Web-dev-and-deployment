// Wellbeing tracking functionality
const wellbeingData = {
    water: [],
    sleep: []
};

// Water tracking
document.querySelectorAll('.stepper button').forEach(button => {
    button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const waterCount = document.getElementById('waterCount');
        let count = parseInt(waterCount.textContent);

        if (action === 'inc' && count < 20) {
            count++;
        } else if (action === 'dec' && count > 0) {
            count--;
        }
        waterCount.textContent = count;
    });
});

// Sleep tracking
const sleepInput = document.getElementById('sleepInput');
sleepInput.addEventListener('change', () => {
    const value = parseFloat(sleepInput.value);
    if (value < 0) sleepInput.value = 0;
    if (value > 24) sleepInput.value = 24;
});

// Save wellbeing data
document.getElementById('saveWellbeing').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    const waterCount = parseInt(document.getElementById('waterCount').textContent);
    const sleepHours = parseFloat(document.getElementById('sleepInput').value) || 0;

    // Save to local storage
    const savedData = JSON.parse(localStorage.getItem('wellbeingData') || '{"water":[], "sleep":[]}');
    
    // Add today's data
    savedData.water.push({ date: today, value: waterCount });
    savedData.sleep.push({ date: today, value: sleepHours });
    
    // Keep only last 7 days
    savedData.water = savedData.water.slice(-7);
    savedData.sleep = savedData.sleep.slice(-7);
    
    localStorage.setItem('wellbeingData', JSON.stringify(savedData));
    updateWeeklySummary();
});

// Reset wellbeing data
document.getElementById('resetWellbeing').addEventListener('click', () => {
    document.getElementById('waterCount').textContent = '0';
    document.getElementById('sleepInput').value = '';
});

// Update weekly summary
function updateWeeklySummary() {
    const savedData = JSON.parse(localStorage.getItem('wellbeingData') || '{"water":[], "sleep":[]}');
    
    // Calculate averages
    const avgWater = savedData.water.reduce((sum, day) => sum + day.value, 0) / 
                     (savedData.water.length || 1);
    const avgSleep = savedData.sleep.reduce((sum, day) => sum + day.value, 0) / 
                     (savedData.sleep.length || 1);
    
    // Update summary display
    document.getElementById('avgWater').textContent = avgWater.toFixed(1);
    document.getElementById('avgSleep').textContent = avgSleep.toFixed(1);
    
    // Display last 7 days data
    const waterChart = document.getElementById('waterChart');
    const sleepChart = document.getElementById('sleepChart');
    
    waterChart.innerHTML = `<strong>Last 7 days:</strong> ${savedData.water.map(day => 
        `<span title="${day.date}: ${day.value} glasses">${day.value}</span>`).join(' | ')}`;
    
    sleepChart.innerHTML = `<strong>Last 7 days:</strong> ${savedData.sleep.map(day => 
        `<span title="${day.date}: ${day.value} hours">${day.value}</span>`).join(' | ')}`;
}

// Load summary on page load
document.addEventListener('DOMContentLoaded', updateWeeklySummary);

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
  const STORAGE_KEY = 'wellbeingData';
  const DEFAULT = { water: {}, sleep: {}, mood: {} };

  // Elements
  const daySelect = document.getElementById('daySelect');
  const waterCountEl = document.getElementById('waterCount');
  const sleepInputEl = document.getElementById('sleepInput');
  const saveBtn = document.getElementById('saveWellbeing');
  const resetBtn = document.getElementById('resetWellbeing');
  const savedContainer = document.getElementById('savedByDay');
  const moodBtns = document.querySelectorAll('.mood-options .mood');
  const stepperBtns = document.querySelectorAll('.stepper button');

  // Local state
  let selectedMood = null;

  // Helpers
  function loadData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(DEFAULT));
    } catch (err) {
      console.error('loadData error', err);
      return JSON.parse(JSON.stringify(DEFAULT));
    }
  }
  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Stepper handlers (water)
  if (stepperBtns && waterCountEl) {
    stepperBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        let n = parseInt(waterCountEl.textContent || '0', 10);
        if (action === 'inc') n = Math.min(50, n + 1);
        if (action === 'dec') n = Math.max(0, n - 1);
        waterCountEl.textContent = String(n);
      });
    });
  }

  // Mood selection
  if (moodBtns) {
    moodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMood = btn.dataset.mood || null;
      });
    });
  }

  // Validate sleep input
  if (sleepInputEl) {
    sleepInputEl.addEventListener('change', () => {
      const v = parseFloat(sleepInputEl.value);
      if (Number.isNaN(v)) { sleepInputEl.value = ''; return; }
      sleepInputEl.value = String(Math.max(0, Math.min(24, v)));
    });
  }

  // Update Saved UI
  function moodEmoji(val) {
    switch (String(val)) {
      case '1': return '😞';
      case '2': return '😐';
      case '3': return '🙂';
      case '4': return '😄';
      default: return 'Not set';
    }
  }

  function updateSavedSection() {
    const data = loadData();
    if (!savedContainer) return;
    DAYS.forEach(day => {
      const entry = savedContainer.querySelector(`.day-entry[data-day="${day}"]`);
      if (!entry) return;
      const wEl = entry.querySelector('.saved-water');
      const sEl = entry.querySelector('.saved-sleep');
      const mEl = entry.querySelector('.saved-mood');

      const wText = (data.water && typeof data.water[day] !== 'undefined') ? `${data.water[day]} glasses` : 'Not set';
      const sText = (data.sleep && typeof data.sleep[day] !== 'undefined' && data.sleep[day] !== null) ? `${data.sleep[day]} hours` : 'Not set';
      const mText = (data.mood && typeof data.mood[day] !== 'undefined' && data.mood[day] !== null) ? moodEmoji(data.mood[day]) : 'Not set';

      if (wEl) wEl.textContent = wText;
      if (sEl) sEl.textContent = sText;
      if (mEl) mEl.textContent = mText;
    });
  }

  // Save handler
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const day = daySelect?.value;
      if (!day) { alert('Please select a day before saving.'); return; }

      const water = parseInt(waterCountEl?.textContent || '0', 10) || 0;
      const sleepRaw = sleepInputEl?.value;
      const sleep = (sleepRaw === '' || sleepRaw === undefined) ? null : Math.max(0, Math.min(24, parseFloat(sleepRaw)));

      const data = loadData();
      data.water = data.water || {};
      data.sleep = data.sleep || {};
      data.mood = data.mood || {};

      data.water[day] = water;
      data.sleep[day] = (sleep === null ? null : sleep);
      data.mood[day] = selectedMood !== null ? selectedMood : null;

      saveData(data);

      // update UI immediately
      updateSavedSection();

      // feedback
      const orig = saveBtn.textContent;
      saveBtn.textContent = 'Saved';
      saveBtn.disabled = true;
      setTimeout(() => { saveBtn.textContent = orig; saveBtn.disabled = false; }, 800);
    });
  }

  // Reset inputs
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (daySelect) daySelect.value = '';
      if (waterCountEl) waterCountEl.textContent = '0';
      if (sleepInputEl) sleepInputEl.value = '';
      selectedMood = null;
      if (moodBtns) moodBtns.forEach(b => b.classList.remove('selected'));
    });
  }

  // Clear stored weekly summary (button optional)
  const clearBtn = document.getElementById('clearWeeklySummary');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!confirm('Clear all saved wellbeing entries? This cannot be undone.')) return;
      localStorage.removeItem(STORAGE_KEY);
      updateSavedSection();
    });
  }

  // Initial render
  updateSavedSection();
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
    // Initialize wellbeing data structure
    const defaultData = {
        water: {},
        sleep: {}
    };

    // Save wellbeing data
    document.getElementById('saveWellbeing').addEventListener('click', () => {
        const selectedDay = document.getElementById('daySelect').value;
        
        if (!selectedDay) {
            alert('Please select a day of the week');
            return;
        }

        const waterCount = parseInt(document.getElementById('waterCount').textContent);
        const sleepHours = parseFloat(document.getElementById('sleepInput').value) || 0;

        // Get existing data
        const savedData = JSON.parse(localStorage.getItem('wellbeingData') || JSON.stringify(defaultData));
        
        // Update data for selected day
        savedData.water[selectedDay] = waterCount;
        savedData.sleep[selectedDay] = sleepHours;
        
        // Save to localStorage
        localStorage.setItem('wellbeingData', JSON.stringify(savedData));
        updateWeeklySummary();
    });

    // Update weekly summary
    function updateWeeklySummary() {
        const savedData = JSON.parse(localStorage.getItem('wellbeingData') || JSON.stringify(defaultData));
        
        // Update water summary
        const waterData = savedData.water;
        const waterValues = Object.values(waterData);
        const avgWater = waterValues.length ? 
            waterValues.reduce((sum, val) => sum + val, 0) / waterValues.length : 0;
        
        document.getElementById('avgWater').textContent = avgWater.toFixed(1);
        
        // Update sleep summary
        const sleepData = savedData.sleep;
        const sleepValues = Object.values(sleepData);
        const avgSleep = sleepValues.length ? 
            sleepValues.reduce((sum, val) => sum + val, 0) / sleepValues.length : 0;
        
        document.getElementById('avgSleep').textContent = avgSleep.toFixed(1);

        // Update daily breakdown tables
        updateDailyBreakdown('waterByDay', waterData, 'glasses');
        updateDailyBreakdown('sleepByDay', sleepData, 'hours');
    }

    function updateDailyBreakdown(tableId, data, unit) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        tbody.innerHTML = days.map(day => `
            <tr>
                <td>${day}</td>
                <td>${data[day] ? `${data[day]} ${unit}` : '-'}</td>
            </tr>
        `).join('');
    }

    // Reset wellbeing data
    document.getElementById('resetWellbeing').addEventListener('click', () => {
        document.getElementById('daySelect').value = '';
        document.getElementById('waterCount').textContent = '0';
        document.getElementById('sleepInput').value = '';
    });

    // Initial load of summary
    updateWeeklySummary();
});

document.addEventListener('DOMContentLoaded', () => {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // Elements
  const waterCountEl = document.getElementById('waterCount');
  const sleepInputEl = document.getElementById('sleepInput');
  const daySelectEl = document.getElementById('daySelect');
  const saveBtn = document.getElementById('saveWellbeing');
  const resetBtn = document.getElementById('resetWellbeing');
  const weeklyContainer = document.getElementById('weeklyByDay');

  // Utility: load / save
  const defaultData = { water: {}, sleep: {} };
  function getSaved() {
    return JSON.parse(localStorage.getItem('wellbeingData') || JSON.stringify(defaultData));
  }
  function persist(data) {
    localStorage.setItem('wellbeingData', JSON.stringify(data));
  }

  // Stepper handlers (water)
  document.querySelectorAll('.stepper button').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      let count = parseInt(waterCountEl.textContent, 10) || 0;
      if (action === 'inc' && count < 50) count++;
      if (action === 'dec' && count > 0) count--;
      waterCountEl.textContent = count;
    });
  });

  // Validate sleep input range
  if (sleepInputEl) {
    sleepInputEl.addEventListener('change', () => {
      let v = parseFloat(sleepInputEl.value);
      if (Number.isNaN(v)) { sleepInputEl.value = ''; return; }
      if (v < 0) v = 0;
      if (v > 24) v = 24;
      sleepInputEl.value = v;
    });
  }

  // Save for selected day
  function saveForSelectedDay() {
    const day = daySelectEl.value;
    if (!day) { alert('Please select a day of the week before saving.'); return; }

    const water = parseInt(waterCountEl.textContent, 10) || 0;
    const sleep = sleepInputEl.value === '' ? null : Math.max(0, Math.min(24, parseFloat(sleepInputEl.value)));

    const data = getSaved();
    data.water = data.water || {};
    data.sleep = data.sleep || {};
    data.water[day] = water;
    data.sleep[day] = (sleep === null ? null : sleep);

    persist(data);
    updateWeeklySummary();
  }

  // Reset inputs (does not clear saved weekly summary)
  function resetInputs() {
    if (daySelectEl) daySelectEl.value = '';
    if (waterCountEl) waterCountEl.textContent = '0';
    if (sleepInputEl) sleepInputEl.value = '';
  }

  // Render weekly summary: one block per day
  function updateWeeklySummary() {
    const data = getSaved();
    if (!weeklyContainer) return;

    weeklyContainer.innerHTML = days.map(day => {
      const w = (data.water && typeof data.water[day] !== 'undefined') ? `${data.water[day]} glasses` : 'Not set';
      const s = (data.sleep && typeof data.sleep[day] !== 'undefined' && data.sleep[day] !== null) ? `${data.sleep[day]} hours` : 'Not set';
      return `
        <div class="day-entry" data-day="${day}">
          <h4>${day}</h4>
          <p>Water: <strong>${w}</strong></p>
          <p>Sleep: <strong>${s}</strong></p>
        </div>
      `;
    }).join('');
  }

  // Wire buttons
  if (saveBtn) saveBtn.addEventListener('click', (e) => { e.preventDefault(); saveForSelectedDay(); });
  if (resetBtn) resetBtn.addEventListener('click', (e) => { e.preventDefault(); resetInputs(); });

  // Initial render
  updateWeeklySummary();
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