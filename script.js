// Task Manager Script

document.addEventListener('DOMContentLoaded', function () {
  // Set background to pink
  document.body.style.backgroundColor = 'pink';
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const filterAll = document.getElementById('filter-all');
  const filterCompleted = document.getElementById('filter-completed');
  const filterPending = document.getElementById('filter-pending');

  let filter = 'all';

  // Add Task
  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText.length === 0) {
      taskInput.value = '';
      taskInput.focus();
      return;
    }
    addTask(taskText);
    taskInput.value = '';
    taskInput.focus();
    renderTasks();
  });

  // Task List Clicks (Delete/Complete)
  taskList.addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-btn')) {
      e.target.closest('li').remove();
      renderTasks();
    } else if (e.target.classList.contains('complete-btn')) {
      const li = e.target.closest('li');
      li.classList.toggle('completed');
      e.target.setAttribute('aria-pressed', li.classList.contains('completed'));
      renderTasks();
    }
  });

  // Filter Buttons
  [filterAll, filterCompleted, filterPending].forEach(btn => {
    btn.addEventListener('click', function () {
      [filterAll, filterCompleted, filterPending].forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      if (this === filterAll) filter = 'all';
      else if (this === filterCompleted) filter = 'completed';
      else filter = 'pending';
      renderTasks();
    });
  });

  function addTask(text) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span class="task-text">${escapeHtml(text)}</span>
      <span>
        <button type="button" class="btn complete-btn btn-sm" aria-pressed="false" aria-label="Mark as completed">✓</button>
        <button type="button" class="btn delete-btn btn-sm" aria-label="Delete task">✗</button>
      </span>
    `;
    li.style.backgroundColor = '#fff9e3';
    li.style.borderColor = '#ffe066';
    const btns = li.querySelectorAll('.complete-btn, .delete-btn');
    btns.forEach(btn => {
      btn.style.backgroundColor = 'yellow';
      btn.style.borderColor = 'yellow';
      btn.style.color = '#333';
    });
    taskList.appendChild(li);
  }

  function renderTasks() {
    const items = Array.from(taskList.children);
    items.forEach(li => {
      if (filter === 'all') {
        li.style.display = '';
      } else if (filter === 'completed') {
        li.style.display = li.classList.contains('completed') ? '' : 'none';
      } else {
        li.style.display = !li.classList.contains('completed') ? '' : 'none';
      }
    });
  }

  // Simple HTML escape
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initial render
  renderTasks();
});
