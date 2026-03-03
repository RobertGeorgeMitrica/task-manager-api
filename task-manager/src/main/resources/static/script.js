/* ==========================================
   1. CONFIGURATION & STATE
   ========================================== */
const API_URL = 'http://localhost:8080/api/tasks';
let allTasks = [];

/* ==========================================
   2. API SERVICES (Communication with Server)
   ========================================== */
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        allTasks = await response.json();
        renderTasks(allTasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

async function createTask() {
    const timeInterval = document.getElementById('timeInput').value;
    const title = document.getElementById('titleInput').value.trim();

    if (title.length < 3) {
        alert("Title must be at least 3 characters long!");
        return;
    }

    const description = document.getElementById('descInput').value;
    const priority = document.getElementById('priorityInput').value;
    const category = document.getElementById('categoryInput').value;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title, description, completed: false, timeInterval, category, priority
        })
    });

    if (response.ok) {
        resetForm();
        fetchTasks();
    }
}

async function toggleTask(id, currentStatus) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...task, completed: !currentStatus })
        });
        fetchTasks();
    } catch (error) {
        console.error("Toggle error:", error);
    }
}

async function deleteTask(id) {
    showModal(async () => {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTasks();
    });
}

async function clearCompleted() {
    const completedTasks = allTasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;

    showModal(async () => {
        await Promise.all(completedTasks.map(task =>
            fetch(`${API_URL}/${task.id}`, { method: 'DELETE' })
        ));
        fetchTasks();
    });
}

/* ==========================================
   3. UI RENDERING (DOM Manipulation)
   ========================================== */
function renderTasks(tasksToDisplay) {
    renderStats();

    tasksToDisplay.sort((a, b) => (a.timeInterval || "").localeCompare(b.timeInterval || ""));

    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasksToDisplay.forEach((task, index) => {
        const style = getCategoryStyle(task.category);
        const isCurrent = (task.timeInterval && isTaskCurrent(task.timeInterval)) ? 'current-task' : '';

        const descriptionLines = (task.description || '').split('\n').filter(line => line.trim() !== '');
        const formattedDescription = descriptionLines.map(line => `• ${line}`).join('<br>');
        const hasMore = descriptionLines.length > 3;

        const priorityColors = { 'HIGH': '#ff7675', 'MEDIUM': '#fdcb6e', 'LOW': '#55efc4' };

        const div = document.createElement('div');
        div.className = `card ${task.completed ? 'is-completed' : ''} ${isCurrent}`;
        div.style.borderLeft = `6px solid ${priorityColors[task.priority] || '#55efc4'}`;

        div.innerHTML = `
            <div class="task-header">
                <div style="width: 100%;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--primary); font-weight: bold;">#${index + 1}</span>
                        <h3 class="${task.completed ? 'completed' : ''}" style="margin: 0;">${task.title}</h3>
                        <span style="background: ${style.bg}; color: ${style.text}; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">
                            ${task.category || 'General'}
                        </span>
                    </div>
                    <div style="margin: 12px 0 0 32px; display: flex; flex-direction: column;">
                        <div id="desc-${task.id}" class="task-description collapsed">
                            ${formattedDescription || 'No description provided.'}
                        </div>
                        ${hasMore ? `<button class="btn-read-more" onclick="toggleDescription(${task.id})">Read More</button>` : ''}
                    </div>
                </div>
                <div style="text-align: right; min-width: 100px;">
                    <div style="font-size: 0.8rem; font-weight: bold; color: #b2bec3;">
                        ${task.timeInterval || '--:--'}
                    </div>
                    ${getTimeUntil(task.timeInterval)}
                </div>
            </div>
            <div class="actions" style="margin-top: 15px; padding-left: 32px;">
                <button class="btn ${task.completed ? 'btn-undo' : 'btn-complete'}" onclick="toggleTask(${task.id}, ${task.completed})">
                    ${task.completed ? 'Undo' : 'Done'}
                </button>
                <button class="btn btn-delete" onclick="deleteTask(${task.id})">Remove</button>
            </div>
        `;
        list.appendChild(div);
    });
    updateCategoryStats();
}

function renderStats() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const remaining = total - completed;

    const stats = document.getElementById('stats');
    if (!stats) return;

    // Confetti trigger
    if (percent === 100 && total > 0) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00b894', '#55efc4', '#00cec9'] });
    }

    stats.innerHTML = `
        <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9rem;">
                <span>Progress: ${percent}%</span>
                <span style="color: var(--primary);">${completed}/${total} Tasks</span>
            </div>
            <p style="margin: 5px 0 10px 0; font-size: 0.8rem; color: #636e72;">
                ${remaining === 0 && total > 0 ? "🎉 All done!" : `<b>${remaining}</b> tasks left.`}
            </p>
            <div style="background: #e9ecef; border-radius: 10px; height: 8px; overflow: hidden;">
                <div style="background: var(--success); width: ${percent}%; height: 100%; transition: width 0.5s;"></div>
            </div>
        </div>
    `;
}

function updateCategoryStats() {
    const statsContainer = document.getElementById('categoryStats');
    if (!statsContainer) return;
    const counts = {};
    allTasks.forEach(task => {
        const cat = task.category || 'General';
        counts[cat] = (counts[cat] || 0) + 1;
    });
    let html = '<h4 style="margin-top: 0; margin-bottom: 15px; font-size: 0.9rem; color: #2d3436;">Time Distribution</h4>';
    for (const [category, count] of Object.entries(counts)) {
        const style = getCategoryStyle(category);
        html += `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                <span style="background: ${style.bg}; color: ${style.text}; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">${category}</span>
                <span style="font-weight: bold; color: #636e72; font-size: 0.85rem;">${count}</span>
            </div>`;
    }
    statsContainer.innerHTML = html;
}

/* ==========================================
   4. HELPERS & UTILITIES
   ========================================== */
function getCategoryStyle(category) {
    const cat = (category || '').toUpperCase();
    const styles = {
        'DEEP WORK': { bg: '#d1edda', text: '#155724' },
        'BREAK':     { bg: '#fff3cd', text: '#856404' },
        'SPORT':     { bg: '#f8d7da', text: '#721c24' },
        'SQL PRACTICE': { bg: '#e8daff', text: '#4527a0' },
        'DOCUMENTATION': { bg: '#e1f5fe', text: '#0288d1' }
    };
    return styles[cat] || { bg: '#f1f2f6', text: '#2f3542' };
}

function isTaskCurrent(timeInterval) {
    if (!timeInterval || !timeInterval.includes('-')) return false;
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const parts = timeInterval.split('-');
    const [startH, startM] = parts[0].trim().split(':').map(Number);
    const [endH, endM] = parts[1].trim().split(':').map(Number);
    return current >= (startH * 60 + startM) && current <= (endH * 60 + endM);
}

function getTimeUntil(timeInterval) {
    if (!timeInterval || !timeInterval.includes('-')) return "";
    try {
        const startTimeStr = timeInterval.split('-')[0].trim();
        const [targetH, targetM] = startTimeStr.split(':').map(Number);
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const targetMins = targetH * 60 + targetM;
        const diff = targetMins - currentMins;
        if (diff > 0 && diff <= 120) {
            return `<span class="countdown-badge">starts in ${diff} min</span>`;
        }
    } catch (e) { return ""; }
    return "";
}

function resetForm() {
    ['timeInput', 'titleInput', 'descInput', 'categoryInput', 'priorityInput'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
}

/* ==========================================
   5. EVENT HANDLERS & INITIALIZATION
   ========================================= */
function searchTasks() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (query === "") return renderTasks(allTasks);
    const filtered = allTasks.filter(t => (t.title || "").toLowerCase().includes(query) || (t.description || "").toLowerCase().includes(query));
    renderTasks(filtered);
}

function filterTasks(status, element) {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active-filter'));
    element.classList.add('active-filter');
    if (status === 'active') renderTasks(allTasks.filter(t => !t.completed));
    else if (status === 'completed') renderTasks(allTasks.filter(t => t.completed));
    else renderTasks(allTasks);
}

function toggleDescription(taskId) {
    const desc = document.getElementById(`desc-${taskId}`);
    const btn = desc.nextElementSibling;
    const isCollapsed = desc.classList.contains('collapsed');
    desc.classList.toggle('collapsed', !isCollapsed);
    desc.classList.toggle('expanded', isCollapsed);
    btn.innerText = isCollapsed ? 'Show Less' : 'Read More';
}

let actionToConfirm = null;
function showModal(cb) { actionToConfirm = cb; document.getElementById('customModal').style.display = 'flex'; }
function closeModal() { document.getElementById('customModal').style.display = 'none'; }
document.getElementById('confirmBtn').onclick = async () => { if (actionToConfirm) await actionToConfirm(); closeModal(); };

fetchTasks();
setInterval(() => renderTasks(allTasks), 60000);
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });