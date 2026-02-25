 const API_URL = 'http://localhost:8080/api/tasks';
    let allTasks = [];

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
        const title = document.getElementById('titleInput').value;
        const description = document.getElementById('descInput').value;
        const category = document.getElementById('categoryInput').value;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                completed: false,
                timeInterval,
                category
            })
        });

        if (response.ok) {
            document.getElementById('timeInput').value = '';
            document.getElementById('titleInput').value = '';
            document.getElementById('descInput').value = '';
            document.getElementById('categoryInput').value = '';
            fetchTasks();
        }
    }

    async function deleteTask(id) {
        if(confirm("Are you sure?")) {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchTasks();
        }
    }

    async function toggleTask(id, title, description, timeInterval, category, currentStatus) {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                timeInterval,
                category,
                completed: !currentStatus
            })
        });
        fetchTasks();
    }

    function filterTasks(status, element) {
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active-filter'));
        element.classList.add('active-filter');

        if (status === 'active') {
            renderTasks(allTasks.filter(t => !t.completed));
        } else if (status === 'completed') {
            renderTasks(allTasks.filter(t => t.completed));
        } else {
            renderTasks(allTasks);
        }
    }

    function getCategoryStyle(category) {
    const cat = (category || '').toUpperCase();
    const styles = {
        'DEEP WORK': { bg: '#d1edda', text: '#155724' }, // Verde
        'BREAK':     { bg: '#fff3cd', text: '#856404' }, // Galben
        'SPORT':     { bg: '#f8d7da', text: '#721c24' }, // Roșu
        'SQL PRACTICE': { bg: '#e8daff', text: '#4527a0' }, // Mov
        'DOCUMENTATION': { bg: '#e1f5fe', text: '#0288d1' } // Albastru
    };

    return styles[cat] || { bg: '#f1f2f6', text: '#2f3542' }; // Default gri dacă nu găsește
}

    function searchTasks() {
        const query = document.getElementById('searchInput').value.toLowerCase();

        // Filtrăm lista existentă în memorie
        const filtered = allTasks.filter(task => {
            const titleMatch = task.title.toLowerCase().includes(query);
            const descMatch = (task.description || "").toLowerCase().includes(query);
            return titleMatch || descMatch;
        });

        // Re-randăm lista doar cu elementele găsite
        renderTasks(filtered);
    }

    function updateCategoryStats() {
        const statsContainer = document.getElementById('categoryStats');
        if (!statsContainer) return;

        const counts = {};
        allTasks.forEach(task => {
            const cat = task.category || 'General';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        let html = '<h4 style="margin-top: 0;">Time Distribution</h4>';
        for (const [category, count] of Object.entries(counts)) {
            const style = getCategoryStyle(category);
            html += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; align-items: center;">
                    <span style="background: ${style.bg}; color: ${style.text}; padding: 2px 8px; border-radius: 10px; font-weight: bold;">
                        ${category}
                    </span>
                    <span style="font-weight: bold;">${count}</span>
                </div>
            `;
        }

        statsContainer.innerHTML = html;
    }

    function renderTasks(tasksToDisplay) {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const stats = document.getElementById('stats');
    if (stats) {
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

    tasksToDisplay.sort((a, b) => {
        if (!a.timeInterval) return 1;
        if (!b.timeInterval) return -1;
        return a.timeInterval.localeCompare(b.timeInterval);
    });

    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasksToDisplay.forEach((task, index) => {
        const style = getCategoryStyle(task.category);

        const div = document.createElement('div');
        div.className = `card ${task.completed ? 'is-completed' : ''}`;
        div.style.position = 'relative';

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
                    <p style="margin: 8px 0 0 32px; color: #636e72;">${task.description || 'No description'}</p>
                </div>
                <div style="position: absolute; top: 20px; right: 20px; font-size: 0.8rem; font-weight: bold; color: #b2bec3;">
                    ${task.timeInterval || '--:--'}
                </div>
            </div>
            <div class="actions" style="margin-top: 15px; padding-left: 32px;">
                <button class="btn ${task.completed ? 'btn-undo' : 'btn-complete'}"
                        onclick="toggleTask(${task.id}, '${task.title}', '${task.description}', '${task.timeInterval}', '${task.category}', ${task.completed})">
                    ${task.completed ? 'Undo' : 'Done'}
                </button>
                <button class="btn btn-delete" onclick="deleteTask(${task.id})">Remove</button>
            </div>
        `;
        list.appendChild(div);
    });
    updateCategoryStats();
}

    fetchTasks();