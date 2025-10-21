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