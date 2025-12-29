// Default Exercise Library
const defaultExercises = [
    // Cardio
    { id: 1, name: 'Saltos de tijera', category: 'cardio', sets: '3', reps: '30', rest: '30s' },
    { id: 2, name: 'Burpees', category: 'cardio', sets: '3', reps: '10', rest: '45s' },
    { id: 3, name: 'Mountain Climbers', category: 'cardio', sets: '3', reps: '20', rest: '30s' },
    { id: 4, name: 'Rodillas altas', category: 'cardio', sets: '3', reps: '30', rest: '30s' },
    { id: 5, name: 'Correr en el lugar', category: 'cardio', sets: '1', reps: '5 min', rest: '-' },

    // Fuerza
    { id: 6, name: 'Flexiones', category: 'fuerza', sets: '3', reps: '12', rest: '60s' },
    { id: 7, name: 'Sentadillas', category: 'fuerza', sets: '4', reps: '15', rest: '60s' },
    { id: 8, name: 'Plancha', category: 'fuerza', sets: '3', reps: '45s', rest: '30s' },
    { id: 9, name: 'Zancadas', category: 'fuerza', sets: '3', reps: '12', rest: '45s' },
    { id: 10, name: 'Fondos de tríceps', category: 'fuerza', sets: '3', reps: '12', rest: '45s' },
    { id: 11, name: 'Abdominales', category: 'fuerza', sets: '3', reps: '20', rest: '30s' },
    { id: 12, name: 'Puente de glúteos', category: 'fuerza', sets: '3', reps: '15', rest: '45s' },
    { id: 13, name: 'Plancha lateral', category: 'fuerza', sets: '3', reps: '30s', rest: '30s' },

    // Flexibilidad
    { id: 14, name: 'Estiramiento de cuádriceps', category: 'flexibilidad', sets: '2', reps: '30s', rest: '-' },
    { id: 15, name: 'Estiramiento de isquiotibiales', category: 'flexibilidad', sets: '2', reps: '30s', rest: '-' },
    { id: 16, name: 'Estiramiento de hombros', category: 'flexibilidad', sets: '2', reps: '30s', rest: '-' },
    { id: 17, name: 'Rotación de tronco', category: 'flexibilidad', sets: '2', reps: '10', rest: '-' },
    { id: 18, name: 'Gato-Vaca (yoga)', category: 'flexibilidad', sets: '2', reps: '10', rest: '-' },
];

// App State
let state = {
    exercises: [],
    routines: [],
    todayWorkout: null,
    currentTab: 'today',
    currentFilter: 'all',
    completedExercises: []
};

// Initialize App
function initApp() {
    loadFromStorage();
    setupEventListeners();
    displayCurrentDate();
    renderExercises();
    renderRoutines();
    renderTodayWorkout();
}

// Local Storage Functions
function saveToStorage() {
    localStorage.setItem('workoutApp', JSON.stringify(state));
}

function loadFromStorage() {
    const saved = localStorage.getItem('workoutApp');
    if (saved) {
        state = JSON.parse(saved);
    } else {
        state.exercises = [...defaultExercises];
    }
}

// Display Current Date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('es-ES', options);
    dateElement.textContent = today;
}

// Event Listeners Setup
function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => filterExercises(button.dataset.filter));
    });

    // Create Routine Modal
    document.getElementById('createRoutineBtn').addEventListener('click', openCreateRoutineModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeCreateRoutineModal);
    document.getElementById('cancelRoutineBtn').addEventListener('click', closeCreateRoutineModal);
    document.getElementById('saveRoutineBtn').addEventListener('click', saveRoutine);

    // Select Routine Modal
    document.getElementById('selectRoutineBtn').addEventListener('click', openSelectRoutineModal);
    document.getElementById('closeSelectModalBtn').addEventListener('click', closeSelectRoutineModal);
    document.getElementById('cancelSelectBtn').addEventListener('click', closeSelectRoutineModal);

    // Close modals when clicking outside
    document.getElementById('routineModal').addEventListener('click', (e) => {
        if (e.target.id === 'routineModal') closeCreateRoutineModal();
    });
    document.getElementById('selectRoutineModal').addEventListener('click', (e) => {
        if (e.target.id === 'selectRoutineModal') closeSelectRoutineModal();
    });
}

// Tab Navigation
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    state.currentTab = tabName;
}

// Filter Exercises
function filterExercises(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    state.currentFilter = filter;
    renderExercises();
}

// Render Exercises
function renderExercises() {
    const container = document.getElementById('exercisesList');
    const filtered = state.currentFilter === 'all'
        ? state.exercises
        : state.exercises.filter(ex => ex.category === state.currentFilter);

    container.innerHTML = filtered.map(exercise => `
        <div class="exercise-card">
            <div class="exercise-card-header">
                <div class="exercise-card-name">${exercise.name}</div>
                <span class="exercise-category">${getCategoryLabel(exercise.category)}</span>
            </div>
            <div class="exercise-card-details">
                ${exercise.sets} series × ${exercise.reps} reps | Descanso: ${exercise.rest}
            </div>
        </div>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        'cardio': 'Cardio',
        'fuerza': 'Fuerza',
        'flexibilidad': 'Flexibilidad'
    };
    return labels[category] || category;
}

// Render Routines
function renderRoutines() {
    const container = document.getElementById('routinesList');

    if (state.routines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📝 No tienes rutinas creadas</p>
                <p class="empty-state-hint">Crea tu primera rutina para comenzar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.routines.map(routine => `
        <div class="routine-card">
            <div class="routine-name">${routine.name}</div>
            <div class="routine-info">
                <span>${routine.exercises.length} ejercicios</span>
            </div>
            <div class="routine-actions">
                <button class="action-btn use" onclick="useRoutineForToday(${routine.id})">
                    Usar Hoy
                </button>
                <button class="action-btn delete" onclick="deleteRoutine(${routine.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Create Routine Modal
function openCreateRoutineModal() {
    const modal = document.getElementById('routineModal');
    const selector = document.getElementById('exerciseSelector');

    // Populate exercise checkboxes
    selector.innerHTML = state.exercises.map(exercise => `
        <div class="exercise-checkbox-item">
            <input type="checkbox" id="ex-${exercise.id}" value="${exercise.id}">
            <label for="ex-${exercise.id}">${exercise.name} (${getCategoryLabel(exercise.category)})</label>
        </div>
    `).join('');

    modal.classList.add('active');
}

function closeCreateRoutineModal() {
    document.getElementById('routineModal').classList.remove('active');
    document.getElementById('routineName').value = '';
    document.querySelectorAll('#exerciseSelector input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
}

function saveRoutine() {
    const name = document.getElementById('routineName').value.trim();
    const selectedExercises = Array.from(
        document.querySelectorAll('#exerciseSelector input[type="checkbox"]:checked')
    ).map(cb => parseInt(cb.value));

    if (!name) {
        alert('Por favor ingresa un nombre para la rutina');
        return;
    }

    if (selectedExercises.length === 0) {
        alert('Por favor selecciona al menos un ejercicio');
        return;
    }

    const routine = {
        id: Date.now(),
        name: name,
        exercises: selectedExercises
    };

    state.routines.push(routine);
    saveToStorage();
    renderRoutines();
    closeCreateRoutineModal();
}

function deleteRoutine(id) {
    if (confirm('¿Estás seguro de eliminar esta rutina?')) {
        state.routines = state.routines.filter(r => r.id !== id);

        // Clear today's workout if it was this routine
        if (state.todayWorkout && state.todayWorkout.id === id) {
            state.todayWorkout = null;
            state.completedExercises = [];
        }

        saveToStorage();
        renderRoutines();
        renderTodayWorkout();
    }
}

// Select Routine for Today Modal
function openSelectRoutineModal() {
    const modal = document.getElementById('selectRoutineModal');
    const selector = document.getElementById('routineSelector');

    if (state.routines.length === 0) {
        alert('Primero debes crear una rutina');
        return;
    }

    selector.innerHTML = state.routines.map(routine => `
        <div class="routine-select-item" onclick="selectRoutineForToday(${routine.id})">
            <div class="routine-select-name">${routine.name}</div>
            <div class="routine-select-count">${routine.exercises.length} ejercicios</div>
        </div>
    `).join('');

    modal.classList.add('active');
}

function closeSelectRoutineModal() {
    document.getElementById('selectRoutineModal').classList.remove('active');
}

function selectRoutineForToday(routineId) {
    const routine = state.routines.find(r => r.id === routineId);
    if (routine) {
        state.todayWorkout = routine;
        state.completedExercises = [];
        saveToStorage();
        renderTodayWorkout();
        closeSelectRoutineModal();

        // Switch to today tab
        document.querySelector('[data-tab="today"]').click();
    }
}

function useRoutineForToday(routineId) {
    selectRoutineForToday(routineId);
}

// Render Today's Workout
function renderTodayWorkout() {
    const container = document.getElementById('todayWorkout');
    const statsContainer = document.getElementById('statsContainer');

    if (!state.todayWorkout) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📋 No hay rutina seleccionada para hoy</p>
                <p class="empty-state-hint">Selecciona una rutina para comenzar</p>
            </div>
        `;
        statsContainer.style.display = 'none';
        return;
    }

    const workoutExercises = state.todayWorkout.exercises.map(exId =>
        state.exercises.find(ex => ex.id === exId)
    ).filter(ex => ex !== undefined);

    container.innerHTML = workoutExercises.map(exercise => {
        const isCompleted = state.completedExercises.includes(exercise.id);
        return `
            <div class="exercise-item ${isCompleted ? 'completed' : ''}">
                <div class="exercise-header">
                    <div class="exercise-name">${exercise.name}</div>
                </div>
                <div class="exercise-details">
                    <div class="exercise-detail">
                        <span>📊</span>
                        <span>${exercise.sets} series</span>
                    </div>
                    <div class="exercise-detail">
                        <span>🔢</span>
                        <span>${exercise.reps} reps</span>
                    </div>
                    <div class="exercise-detail">
                        <span>⏱️</span>
                        <span>${exercise.rest}</span>
                    </div>
                </div>
                <button class="complete-btn ${isCompleted ? 'completed' : ''}"
                        onclick="toggleExerciseComplete(${exercise.id})">
                    ${isCompleted ? '✓ Completado' : 'Marcar como Completado'}
                </button>
            </div>
        `;
    }).join('');

    // Update stats
    updateStats(workoutExercises.length);
    statsContainer.style.display = 'grid';
}

function toggleExerciseComplete(exerciseId) {
    const index = state.completedExercises.indexOf(exerciseId);

    if (index === -1) {
        state.completedExercises.push(exerciseId);
    } else {
        state.completedExercises.splice(index, 1);
    }

    saveToStorage();
    renderTodayWorkout();
}

function updateStats(totalExercises) {
    const completed = state.completedExercises.length;
    const remaining = totalExercises - completed;

    document.getElementById('completedCount').textContent = completed;
    document.getElementById('remainingCount').textContent = remaining;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
