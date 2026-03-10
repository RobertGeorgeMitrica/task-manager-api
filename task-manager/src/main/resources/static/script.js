const API_URL = '/api/tasks';
let allTasks = [];

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allTasks = data; // Salvăm în variabila globală
        renderTasks(allTasks); // Afișăm totul inițial
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

    // Extragem orele (ex: "08:00 - 09:30")
    const parts = timeRange.split(' - ');
    const startParts = parts[0].split(':');
    const endParts = parts[1].split(':');

    const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    return currentTime >= startMin && currentTime <= endMin;
}

function renderTasks(tasks) {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach(t => {
        const activeClass = isTaskActive(t.timeInterval) ? 'task-active' : '';
        const prioClass = t.priority === 'HIGH' ? 'bg-high' : (t.priority === 'MEDIUM' ? 'bg-medium' : 'bg-low');

        // 1. Pregătim clasa pentru badge și border-ul lateral bazat pe categorie
        // Transformăm "DEEP WORK" în "DEEP_WORK" pentru a se potrivi cu CSS-ul
        const catClass = t.category ? t.category.replace(/\s+/g, '_') : 'GENERAL';

        const div = document.createElement('div');
        // Adăugăm catClass direct pe div-ul principal pentru dunga laterală
        div.className = `task-item ${catClass} ${activeClass}`;

        const doneBtnClass = t.completed ? 'btn-undo' : 'btn-done';

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

                <p contenteditable="true"
                   onblur="saveEdit(${t.id}, 'description', this.innerText)"
                   style="color: #636e72; margin: 10px 0; font-size: 0.9rem; outline: none; cursor: text;">
                    ${t.description || 'Add description...'}
                </p>
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

    // 1. Actualizăm Progresul (Bara de sus)
    document.getElementById('progBar').style.width = perc + '%';
    document.getElementById('percText').innerText = perc + '%';
    document.getElementById('countText').innerText = `${total - done} Tasks left`;

    // 2. Calculăm statisticile pe categorii
    const catStats = {};
    allTasks.forEach(t => {
        if(t.category) {
            catStats[t.category] = (catStats[t.category] || 0) + 1;
        }
    });

    // 3. REPARAȚIA VIZUALĂ: Aplicăm stilul de card pe containerul părinte
    const container = document.getElementById('categoryStatsList').parentElement;
    container.style.backgroundColor = "white";
    container.style.borderRadius = "15px";
    container.style.padding = "20px";
    container.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";

    // 4. Generăm lista de badge-uri (Highlited Text)
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

    // 5. Confetti
    if(perc === 100 && total > 0) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

function filterTasks(status, element) {
    // 1. Schimbăm starea vizuală a butoanelor
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');

    // 2. Siguranță: dacă allTasks nu e încărcat, nu facem nimic
    if (!allTasks) return;

    // 3. Aplicăm filtrarea logică
    let filtered;
    if (status === 'all') {
        filtered = allTasks;
    } else if (status === 'pending') {
        filtered = allTasks.filter(t => !t.completed);
    } else if (status === 'finished') {
        filtered = allTasks.filter(t => t.completed);
    }

    // 4. Randăm lista (trimitem un array gol dacă, prin absurd, filtered e null)
    renderTasks(filtered || []);
}

function searchTasks() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    renderTasks(allTasks.filter(t => t.title.toLowerCase().includes(q)));
}

async function resetToAll() {
    // 1. Resetăm vizual butoanele din stânga (le scoatem clasa 'active' și o punem pe 'All')
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const allBtn = document.querySelector('[onclick*="all"]');
    if(allBtn) allBtn.classList.add('active');

    // 2. Aduce toate task-urile de la server
    await fetchTasks();

    // 3. Opțional: Dacă vrei să resetezi și căutarea
    const search = document.getElementById('searchInput');
    if(search) search.value = '';
}

async function clearCompleted() {
    if(!confirm("Are you sure you want to remove all finished tasks?")) return;

    // Trimitem o cerere către backend pentru a șterge task-urile cu statusul completed=true
    await fetch(`${API_URL}/completed`, { method: 'DELETE' });

    // Reîmprospătăm lista de pe ecran
    fetchTasks();
}

async function saveEdit(id, field, value) {
    // 1. Găsim task-ul original în lista noastră globală
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    // 2. Verificăm dacă s-a schimbat ceva (curățăm de spații inutile)
    const newValue = value.trim();
    if (task[field] === newValue) return;

    // 3. Actualizăm local obiectul
    task[field] = newValue;

    try {
        // 4. Trimitem cererea PUT către backend (TaskController - updateTask)
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task) // Trimitem obiectul COMPLET (titlu, desc, cat, prio, etc.)
        });

        if (!response.ok) {
            throw new Error("Server rejected the update");
        }

        console.log(`✅ Succes: ${field} actualizat pentru task-ul ${id}`);
        // Nu apelăm fetchTasks() aici pentru a nu reseta focusul sau cursorul utilizatorului
    } catch (e) {
        console.error("❌ Error while saving:", e);
        alert("Could not save changes. Please check server connection.");
    }
}

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