const API_URL = '/api/tasks';
let allTasks = [];

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allTasks = data;
        renderTasks(allTasks);
    } catch (e) {
        console.error("Error at downloading tasks: ", e);
    }
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

function isTaskActive(timeRange) {
    if (!timeRange) return false;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parts = timeRange.split(' - ');
    const startParts = parts[0].split(':');
    const endParts = parts[1].split(':');

    const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    return currentTime >= startMin && currentTime <= endMin;
}

function formatDescription(text) {
    if (!text) return 'No description...';

    const lines = text.split('\n');
    let hasList = false;

    const formattedLines = lines.map(line => {
        const trimmed = line.trim();

        if (/^[-*>•➔]/.test(trimmed) || /^\d+\./.test(trimmed)) {
            hasList = true;
            const cleanContent = trimmed.replace(/^[-*>•➔]\s*|^\d+\.\s*/, '');
            return `<li>${cleanContent}</li>`;
        }
        return line;
    });

    return hasList ? `<ul class="task-desc-list">${formattedLines.join('')}</ul>` : text;
}

function renderTasks(tasks) {
    tasks.sort((a, b) => a.completed - b.completed);

    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (tasks.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #636e72;">
                    <p style="font-size: 1.2rem;">☕ No tasks here.</p>
                    <p style="font-size: 0.9rem;">Enjoy your break or add a new goal above!</p>
                </div>
            `;
            updateStats();
            return;
     }

    tasks.forEach(t => {
        const activeClass = isTaskActive(t.timeInterval) ? 'task-active' : '';
        const prioClass = t.priority === 'HIGH' ? 'bg-high' : (t.priority === 'MEDIUM' ? 'bg-medium' : 'bg-low');

        const catClass = t.category ? t.category.replace(/\s+/g, '_') : 'GENERAL';

        const div = document.createElement('div');
        div.className = `task-item ${catClass} ${activeClass}`;

        const doneBtnClass = t.completed ? 'btn-undo' : 'btn-done';

        const fullDesc = t.description || '';
        const formattedFullDesc = formatDescription(fullDesc);
        const isLong = fullDesc.length > 120; // Ajustăm limita pentru liste
        const shortDesc = isLong ? formatDescription(fullDesc.substring(0, 120)) + '...' : formattedFullDesc;

        const isDoneClass = t.completed ? 'completed-style' : '';
        div.className = `task-item ${catClass} ${activeClass} ${isDoneClass}`;

        div.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <h3 contenteditable="true"
                        onblur="saveEdit(${t.id}, 'title', this.innerText)"
                        style="margin: 0; font-size: 1.1rem; outline: none; cursor: text;">
                        ${t.title}
                    </h3>

                    <span class="category-highlight badge-${catClass}">${t.category}</span>
                </div>

                <div class="prio-label ${prioClass}">${t.priority}</div>

                <div id="desc-${t.id}"
                     contenteditable="true"
                     onblur="saveEdit(${t.id}, 'description', this.innerText)"
                     style="color: #636e72; margin: 10px 0; font-size: 0.9rem; outline: none; cursor: text; transition: all 0.3s;">
                    ${shortDesc}
                </div>

                ${isLong ? `
                    <button onclick="toggleReadMore(${t.id}, \`${fullDesc.replace(/`/g, '\\`').replace(/\n/g, '\\n')}\`)"
                            class="read-more-btn"
                            style="background:none; border:none; color:#2d6a4f; cursor:pointer; font-size:0.75rem; padding:0; font-weight:bold;">
                        Read More
                    </button>` : ''}
                <div style="font-size: 0.7rem; color: #b2bec3; margin-top: 5px;">
                    ${t.updatedAt ? `Last update: ${new Date(t.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
                </div>
            </div>

            <div style="text-align: right; min-width: 140px;">
                <div style="font-weight: bold; color: #2d6a4f; font-size: 0.9rem;">
                    ${t.timeInterval || ''}
                    <span class="task-date-sub" style="display: block;">${t.dueDate || 'No date'}</span>
                </div>
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 15px;">
                        <button onclick="toggleTask(${t.id}, ${t.completed})" class="btn-action ${doneBtnClass}">
                            ${t.completed ? 'Undo' : 'Done'}
                        </button>
                        <button onclick="deleteTask(${t.id})" class="btn-action btn-remove">
                            Remove
                        </button>
                </div>
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
    allTasks.forEach(t => {
        if(t.category) {
            catStats[t.category] = (catStats[t.category] || 0) + 1;
        }
    });

    const container = document.getElementById('categoryStatsList').parentElement;
    container.style.backgroundColor = "white";
    container.style.borderRadius = "15px";
    container.style.padding = "20px";
    container.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";

    document.getElementById('categoryStatsList').innerHTML = Object.entries(catStats)
        .map(([cat, count]) => {
            const cssClass = cat.replace(/\s+/g, '_');
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span class="category-highlight badge-${cssClass}" style="padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 0.75rem;">
                        ${cat}
                    </span>
                    <b style="color: #2d6a4f; font-size: 0.85rem;">${count} tasks</b>
                </div>
            `;
        }).join('');

    if(perc === 100 && total > 0) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

function filterTasks(status, element) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');

    localStorage.setItem('activeFilter', status);

    const buttons = document.querySelectorAll('.sidebar-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (!allTasks) return;

    let filtered;
    if (status === 'all') {
        filtered = allTasks;
    } else if (status === 'pending') {
        filtered = allTasks.filter(t => !t.completed);
    } else if (status === 'finished') {
        filtered = allTasks.filter(t => t.completed);
    }

    renderTasks(filtered || []);
}

function searchTasks() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    localStorage.setItem('lastSearch', q);
    renderTasks(allTasks.filter(t => t.title.toLowerCase().includes(q)));
}

function toggleReadMore(id, fullText) {
    const p = document.getElementById(`desc-${id}`);
    const btn = p.nextElementSibling;

    if (btn.innerText === "Read More") {
        // Folosim innerHTML și formatăm textul lung
        p.innerHTML = formatDescription(fullText);
        btn.innerText = "Show Less";
    } else {
        // Revenim la varianta scurtă formatată
        p.innerHTML = formatDescription(fullText.substring(0, 120)) + "...";
        btn.innerText = "Read More";
    }
}

async function resetToAll() {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const allBtn = document.querySelector('[onclick*="all"]');
    if(allBtn) allBtn.classList.add('active');

    await fetchTasks();

    const search = document.getElementById('searchInput');
    if(search) search.value = '';
}

async function clearCompleted() {
    if(!confirm("Are you sure you want to remove all finished tasks?")) return;

    await fetch(`${API_URL}/completed`, { method: 'DELETE' });

    fetchTasks();
}

async function saveEdit(id, field, value) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    const newValue = value.trim();
    if (task[field] === newValue) return;

    task[field] = newValue;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error("Server rejected the update");
        }

        console.log(`✅ Succes: ${field} actualizat pentru task-ul ${id}`);
    } catch (e) {
        console.error("❌ Error while saving:", e);
        alert("Could not save changes. Please check server connection.");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
        await fetchTasks();

        const savedFilter = localStorage.getItem('activeFilter') || 'all';

        const targetBtn = document.querySelector(`[onclick*="'${savedFilter}'"]`);
        filterTasks(savedFilter, targetBtn);

        const lastSearch = localStorage.getItem('lastSearch') || '';
        document.getElementById('searchInput').value = lastSearch;
        if(lastSearch) searchTasks();

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

document.addEventListener('keydown', (e) => {
    const el = e.target;
    if (!el.id || !el.id.startsWith('desc-')) return;

    if (e.key === 'Enter') {
        // Verificăm dacă linia curentă începe cu simbolul nostru
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const textInLine = range.startContainer.textContent || "";

        if (textInLine.includes('➔')) {
            e.preventDefault();
            // Inserăm un rând nou care începe direct cu simbolul
            document.execCommand('insertHTML', false, '<br>➔&nbsp;');
        }
    }
});