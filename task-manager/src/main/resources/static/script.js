const API_URL = '/api/tasks';
let allTasks = [];

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        allTasks = await response.json();
        renderTasks(allTasks);
    } catch (e) { console.error(e); }
}

async function createTask() {
    const task = {
        title: document.getElementById('titleInput').value,
        description: document.getElementById('descInput').value,
        timeInterval: document.getElementById('timeInput').value,
        category: document.getElementById('categoryInput').value,
        priority: document.getElementById('priorityInput').value,
        dueDate: document.getElementById('dateInput').value,
        completed: false
    };
    if(!task.title) return alert("Please enter a title");

    await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(task)
    });

    document.getElementById('titleInput').value = '';
    document.getElementById('descInput').value = '';
    fetchTasks();
}

async function toggleTask(id, currentStatus) {
    const task = allTasks.find(t => t.id === id);
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...task, completed: !currentStatus})
    });
    fetchTasks();
}

async function deleteTask(id) {
    if(confirm("Delete this task?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTasks();
    }
}

function renderTasks(tasks) {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach(t => {
        const div = document.createElement('div');
        div.className = `task-card priority-${t.priority} ${t.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <div style="flex: 1;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <h3 style="margin:0; font-size:1.1rem;">${t.title}</h3>
                    <span style="background:#f0f7f4; color:#2d6a4f; padding:2px 8px; border-radius:5px; font-size:0.7em; font-weight:bold;">${t.category}</span>
                </div>
                <p style="color: #666; margin: 10px 0; font-size:0.9rem;">${t.description || ''}</p>
            </div>
            <div style="text-align: right; min-width: 130px;">
                <div style="font-weight: bold; color: var(--primary); margin-bottom:10px;">${t.timeInterval || ''}</div>
                <button onclick="toggleTask(${t.id}, ${t.completed})" style="background:${t.completed ? '#bdc3c7' : '#52b788'}; color:white; border:none; padding:8px 15px; border-radius:12px; cursor:pointer; font-weight:bold;">${t.completed ? 'Undo' : 'Done'}</button>
                <button onclick="deleteTask(${t.id})" style="background:#e63946; color:white; border:none; padding:8px 12px; border-radius:12px; cursor:pointer; margin-left:5px;">Remove</button>
            </div>
        `;
        list.appendChild(div);
    });
    updateStats();
}

function updateStats() {
    const total = allTasks.length;
    const done = allTasks.filter(t => t.completed).length;
    const perc = total > 0 ? Math.round((done / total) * 100) : 0;

    document.getElementById('progBar').style.width = perc + '%';
    document.getElementById('percText').innerText = perc + '%';
    document.getElementById('countText').innerText = `${total - done} Tasks left`;

    const catStats = {};
    allTasks.forEach(t => catStats[t.category] = (catStats[t.category] || 0) + 1);
    document.getElementById('categoryStatsList').innerHTML = Object.entries(catStats)
        .map(([cat, count]) => `<div style="display:flex; justify-content:space-between; font-size:0.9em; margin-bottom:5px;"><span>${cat}</span> <b>${count}</b></div>`)
        .join('');

    if(perc === 100 && total > 0) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

function filterTasks(type, btn) {
    document.querySelectorAll('.btn-side').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(type === 'active') renderTasks(allTasks.filter(t => !t.completed));
    else if(type === 'completed') renderTasks(allTasks.filter(t => t.completed));
    else renderTasks(allTasks);
}

function searchTasks() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    renderTasks(allTasks.filter(t => t.title.toLowerCase().includes(q)));
}

async function resetToAll() { fetchTasks(); }

document.addEventListener('DOMContentLoaded', () => {
    flatpickr("#inlineCalendar", {
        inline: true,
        onChange: async (dates, dateStr) => {
            const resp = await fetch(`${API_URL}/date?date=${dateStr}`);
            renderTasks(await resp.json());
        }
    });

    const reportBtn = document.getElementById('openReportBtn');
    if(reportBtn) {
        reportBtn.onclick = async () => {
            const resp = await fetch(`${API_URL}/report`);
            const data = await resp.json();
            console.table(data);
            alert("Report generated in console (F12)!");
        };
    }
    fetchTasks();
});