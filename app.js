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
    completedExercises: [],
    settings: {
        restBetweenSets: 60,
        restBetweenExercises: 90,
        autoStartTimer: true,
        soundEnabled: true,
        voiceCountdownEnabled: true
    }
};

// Timer State
let timerState = {
    intervalId: null,
    remainingTime: 0,
    totalTime: 0,
    isPaused: false,
    type: 'sets', // 'sets', 'exercises', or 'tabata'
    countdownSpoken: new Set(), // Track which countdown numbers have been spoken
    tabata: {
        isTabata: false,
        currentRound: 1,
        totalRounds: 8,
        workTime: 20,
        restTime: 10,
        isWorkPhase: true,
        currentExerciseIndex: 0,
        exercises: []
    }
};

// Edit State
let editState = {
    isEditing: false,
    routineId: null
};

// Guided Workout State
let guidedState = {
    isActive: false,
    currentExerciseIndex: 0,
    currentSet: 1,
    exercises: []
};

// Initialize App
function initApp() {
    loadFromStorage();
    setupEventListeners();
    loadSettings();
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
            <div class="routine-name">
                ${routine.name}
                ${routine.tabata ? '<span class="tabata-badge">TABATA</span>' : ''}
            </div>
            <div class="routine-info">
                <span>${routine.exercises.length} ejercicios</span>
                ${routine.tabata ? `<span> | ${routine.tabata.workTime}s/${routine.tabata.restTime}s × ${routine.tabata.rounds} rondas</span>` : ''}
            </div>
            <div class="routine-actions">
                <button class="action-btn use" onclick="useRoutineForToday(${routine.id})">
                    Usar Hoy
                </button>
                <button class="action-btn edit" onclick="openEditRoutineModal(${routine.id})">
                    ✏️ Editar
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

    // Reset edit state
    editState.isEditing = false;
    editState.routineId = null;

    // Update modal title
    document.querySelector('#routineModal .modal-header h3').textContent = 'Nueva Rutina';

    // Reset form
    document.getElementById('routineName').value = '';
    document.getElementById('tabataMode').checked = false;
    document.getElementById('tabataSettings').style.display = 'none';
    document.getElementById('tabataWork').value = 20;
    document.getElementById('tabataRest').value = 10;
    document.getElementById('tabataRounds').value = 8;

    // Populate exercise checkboxes
    selector.innerHTML = state.exercises.map(exercise => `
        <div class="exercise-checkbox-item">
            <input type="checkbox" id="ex-${exercise.id}" value="${exercise.id}">
            <label for="ex-${exercise.id}">${exercise.name} (${getCategoryLabel(exercise.category)})</label>
        </div>
    `).join('');

    // Setup Tabata mode toggle
    const tabataCheckbox = document.getElementById('tabataMode');
    const tabataSettings = document.getElementById('tabataSettings');

    tabataCheckbox.addEventListener('change', function() {
        tabataSettings.style.display = this.checked ? 'block' : 'none';
    });

    modal.classList.add('active');
}

// Edit Routine Modal
function openEditRoutineModal(routineId) {
    const routine = state.routines.find(r => r.id === routineId);
    if (!routine) return;

    const modal = document.getElementById('routineModal');
    const selector = document.getElementById('exerciseSelector');

    // Set edit state
    editState.isEditing = true;
    editState.routineId = routineId;

    // Update modal title
    document.querySelector('#routineModal .modal-header h3').textContent = 'Editar Rutina';

    // Load routine data
    document.getElementById('routineName').value = routine.name;

    // Load Tabata configuration
    if (routine.tabata) {
        document.getElementById('tabataMode').checked = true;
        document.getElementById('tabataSettings').style.display = 'block';
        document.getElementById('tabataWork').value = routine.tabata.workTime;
        document.getElementById('tabataRest').value = routine.tabata.restTime;
        document.getElementById('tabataRounds').value = routine.tabata.rounds;
    } else {
        document.getElementById('tabataMode').checked = false;
        document.getElementById('tabataSettings').style.display = 'none';
    }

    // Populate exercise checkboxes
    selector.innerHTML = state.exercises.map(exercise => {
        const isSelected = routine.exercises.includes(exercise.id);
        return `
            <div class="exercise-checkbox-item">
                <input type="checkbox" id="ex-${exercise.id}" value="${exercise.id}" ${isSelected ? 'checked' : ''}>
                <label for="ex-${exercise.id}">${exercise.name} (${getCategoryLabel(exercise.category)})</label>
            </div>
        `;
    }).join('');

    // Setup Tabata mode toggle
    const tabataCheckbox = document.getElementById('tabataMode');
    const tabataSettings = document.getElementById('tabataSettings');

    tabataCheckbox.addEventListener('change', function() {
        tabataSettings.style.display = this.checked ? 'block' : 'none';
    });

    modal.classList.add('active');
}

function closeCreateRoutineModal() {
    document.getElementById('routineModal').classList.remove('active');
    document.getElementById('routineName').value = '';
    document.getElementById('tabataMode').checked = false;
    document.getElementById('tabataSettings').style.display = 'none';
    document.querySelectorAll('#exerciseSelector input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
}

function saveRoutine() {
    const name = document.getElementById('routineName').value.trim();
    const selectedExercises = Array.from(
        document.querySelectorAll('#exerciseSelector input[type="checkbox"]:checked')
    ).map(cb => parseInt(cb.value));

    const isTabata = document.getElementById('tabataMode').checked;

    if (!name) {
        alert('Por favor ingresa un nombre para la rutina');
        return;
    }

    if (selectedExercises.length === 0) {
        alert('Por favor selecciona al menos un ejercicio');
        return;
    }

    if (editState.isEditing) {
        // Edit existing routine
        const routineIndex = state.routines.findIndex(r => r.id === editState.routineId);
        if (routineIndex !== -1) {
            const routine = {
                id: editState.routineId, // Keep the same ID
                name: name,
                exercises: selectedExercises
            };

            // Add Tabata configuration if enabled
            if (isTabata) {
                routine.tabata = {
                    enabled: true,
                    workTime: parseInt(document.getElementById('tabataWork').value) || 20,
                    restTime: parseInt(document.getElementById('tabataRest').value) || 10,
                    rounds: parseInt(document.getElementById('tabataRounds').value) || 8
                };
            }

            state.routines[routineIndex] = routine;

            // Update today's workout if it's the same routine
            if (state.todayWorkout && state.todayWorkout.id === editState.routineId) {
                state.todayWorkout = routine;
            }
        }
    } else {
        // Create new routine
        const routine = {
            id: Date.now(),
            name: name,
            exercises: selectedExercises
        };

        // Add Tabata configuration if enabled
        if (isTabata) {
            routine.tabata = {
                enabled: true,
                workTime: parseInt(document.getElementById('tabataWork').value) || 20,
                restTime: parseInt(document.getElementById('tabataRest').value) || 10,
                rounds: parseInt(document.getElementById('tabataRounds').value) || 8
            };
        }

        state.routines.push(routine);
    }

    saveToStorage();
    renderRoutines();
    renderTodayWorkout(); // Re-render in case we edited today's workout
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

    // Show Tabata start button if it's a Tabata workout
    if (state.todayWorkout.tabata) {
        const tabata = state.todayWorkout.tabata;
        container.innerHTML = `
            <div class="tabata-workout-card">
                <div class="tabata-workout-header">
                    <h3>🔥 Entrenamiento Tabata</h3>
                    <span class="tabata-badge">HIIT</span>
                </div>
                <div class="tabata-workout-info">
                    <div class="tabata-detail">
                        <strong>${tabata.workTime}s</strong> Trabajo
                    </div>
                    <div class="tabata-detail">
                        <strong>${tabata.restTime}s</strong> Descanso
                    </div>
                    <div class="tabata-detail">
                        <strong>${tabata.rounds}</strong> Rondas
                    </div>
                </div>
                <div class="tabata-exercises-list">
                    <h4>Ejercicios:</h4>
                    ${workoutExercises.map(ex => `<div class="tabata-exercise-item">• ${ex.name}</div>`).join('')}
                </div>
                <button class="btn-primary start-tabata-btn" onclick="startTabataWorkout()" style="width: 100%; margin-top: 1rem; padding: 1.5rem;">
                    🔥 Iniciar Entrenamiento Tabata
                </button>
            </div>
        `;
        statsContainer.style.display = 'grid';
        updateStats(workoutExercises.length);
        return;
    }

    // If in guided mode, show current exercise
    if (guidedState.isActive) {
        const currentExercise = workoutExercises[guidedState.currentExerciseIndex];
        const totalSets = parseInt(currentExercise.sets) || 1;
        const isLastExercise = guidedState.currentExerciseIndex === workoutExercises.length - 1;
        const isLastSet = guidedState.currentSet >= totalSets;

        container.innerHTML = `
            <div class="guided-workout-container">
                <div class="guided-header">
                    <h2>▶️ Modo Guiado</h2>
                    <button class="btn-secondary" onclick="stopGuidedWorkout()" style="padding: 0.5rem 1rem;">
                        ⏹️ Detener
                    </button>
                </div>
                <div class="guided-progress">
                    Ejercicio ${guidedState.currentExerciseIndex + 1}/${workoutExercises.length}
                </div>
                <div class="guided-exercise-card">
                    <div class="guided-exercise-name">${currentExercise.name}</div>
                    <div class="guided-set-info">
                        <span class="guided-set-current">Serie ${guidedState.currentSet}</span>
                        <span class="guided-set-total">de ${totalSets}</span>
                    </div>
                    <div class="guided-exercise-details">
                        <div class="guided-detail-item">
                            <span class="guided-detail-icon">🔢</span>
                            <span class="guided-detail-text">${currentExercise.reps} repeticiones</span>
                        </div>
                        <div class="guided-detail-item">
                            <span class="guided-detail-icon">⏱️</span>
                            <span class="guided-detail-text">Descanso: ${currentExercise.rest}</span>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="completeCurrentSet()"
                            style="width: 100%; padding: 1.5rem; margin-top: 2rem; font-size: 1.2rem;">
                        ${isLastSet && isLastExercise ? '🎉 Finalizar Rutina' : isLastSet ? '➡️ Siguiente Ejercicio' : '✓ Serie Completada'}
                    </button>
                </div>
            </div>
        `;
        statsContainer.style.display = 'grid';
        updateStats(workoutExercises.length);
        return;
    }

    // Show start button and exercise list for normal workouts
    const startButtonHtml = `
        <button class="btn-primary" onclick="startGuidedWorkout()"
                style="width: 100%; margin-bottom: 1.5rem; padding: 1.5rem; font-size: 1.1rem;">
            ▶️ Iniciar Rutina Guiada
        </button>
    `;

    container.innerHTML = startButtonHtml + workoutExercises.map((exercise, index) => {
        const isCompleted = state.completedExercises.includes(exercise.id);
        const isLast = index === workoutExercises.length - 1;
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
                <div class="exercise-timer-controls">
                    <button class="start-timer-btn" onclick="startRestTimer('sets')">
                        ⏱️ Timer Series
                    </button>
                    ${!isLast ? `<button class="start-timer-btn" onclick="startRestTimer('exercises')">
                        ⏱️ Timer Ejercicio
                    </button>` : ''}
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

// ===== TIMER FUNCTIONS =====

function startTimer(duration, type = 'sets') {
    // Stop any existing timer
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
    }

    timerState.totalTime = duration;
    timerState.remainingTime = duration;
    timerState.type = type;
    timerState.isPaused = false;
    timerState.countdownSpoken = new Set(); // Reset countdown tracking

    // Update modal title
    const title = type === 'sets' ? 'Descanso entre Series' : 'Descanso entre Ejercicios';
    document.getElementById('timerTitle').textContent = title;

    // Show timer modal
    document.getElementById('timerModal').classList.add('active');

    // Start countdown
    updateTimerDisplay();
    timerState.intervalId = setInterval(() => {
        if (!timerState.isPaused) {
            timerState.remainingTime--;

            if (timerState.remainingTime <= 0) {
                finishTimer();
            } else {
                updateTimerDisplay();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerState.remainingTime / 60);
    const seconds = timerState.remainingTime % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    document.getElementById('timerDisplay').textContent = display;

    // Update progress ring
    const progressBar = document.getElementById('timerProgressBar');
    const progress = (timerState.remainingTime / timerState.totalTime) * 565.48;
    progressBar.style.strokeDashoffset = 565.48 - progress;

    // Change color based on time remaining
    progressBar.classList.remove('warning', 'danger');
    const percentRemaining = (timerState.remainingTime / timerState.totalTime) * 100;
    if (percentRemaining <= 20) {
        progressBar.classList.add('danger');
    } else if (percentRemaining <= 50) {
        progressBar.classList.add('warning');
    }

    // Voice countdown for last 5 seconds
    if (state.settings.voiceCountdownEnabled && timerState.remainingTime > 0 && timerState.remainingTime <= 5) {
        speakCountdown(timerState.remainingTime);
    }
}

function pauseTimer() {
    timerState.isPaused = !timerState.isPaused;
    const pauseIcon = document.getElementById('pauseIcon');
    pauseIcon.textContent = timerState.isPaused ? '▶️' : '⏸️';
}

function skipTimer() {
    stopTimer();
}

function stopTimer() {
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    document.getElementById('timerModal').classList.remove('active');
    timerState.isPaused = false;
    document.getElementById('pauseIcon').textContent = '⏸️';
}

function finishTimer() {
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }

    // Play sound or vibrate if enabled
    if (state.settings.soundEnabled) {
        playTimerSound();
        vibrateDevice();
    }

    // Update display to show 00:00
    document.getElementById('timerDisplay').textContent = '00:00';

    // Close modal after a short delay
    setTimeout(() => {
        stopTimer();
        // Execute callback if exists (for guided workout)
        if (typeof window.finishTimerCallback === 'function') {
            window.finishTimerCallback();
        }
    }, 1500);
}

function playTimerSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function vibrateDevice() {
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
}

// Voice Countdown Function
function speakCountdown(number) {
    // Only speak if not already spoken for this countdown
    if (timerState.countdownSpoken.has(number)) {
        return;
    }

    // Mark as spoken
    timerState.countdownSpoken.add(number);

    // Use Web Speech API
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(number.toString());
        utterance.lang = 'es-ES'; // Spanish
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 1.0; // Maximum volume

        // Cancel any ongoing speech to ensure countdown is heard
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
}

function startRestTimer(type = 'sets') {
    const duration = type === 'sets' ?
        state.settings.restBetweenSets :
        state.settings.restBetweenExercises;
    startTimer(duration, type);
}

// ===== TABATA FUNCTIONS =====

function startTabataWorkout() {
    if (!state.todayWorkout || !state.todayWorkout.tabata) {
        alert('Esta rutina no está configurada en modo Tabata');
        return;
    }

    const tabataConfig = state.todayWorkout.tabata;
    const workoutExercises = state.todayWorkout.exercises.map(exId =>
        state.exercises.find(ex => ex.id === exId)
    ).filter(ex => ex !== undefined);

    // Reset tabata state
    timerState.tabata = {
        isTabata: true,
        currentRound: 1,
        totalRounds: tabataConfig.rounds,
        workTime: tabataConfig.workTime,
        restTime: tabataConfig.restTime,
        isWorkPhase: true,
        currentExerciseIndex: 0,
        exercises: workoutExercises
    };

    startTabataInterval();
}

function startTabataInterval() {
    const tabata = timerState.tabata;
    const currentExercise = tabata.exercises[tabata.currentExerciseIndex];

    if (!currentExercise) {
        // Finished all exercises
        finishTabataWorkout();
        return;
    }

    // Set timer duration based on phase
    const duration = tabata.isWorkPhase ? tabata.workTime : tabata.restTime;
    const title = tabata.isWorkPhase ? '💪 ¡TRABAJA!' : '😮‍💨 Descansa';

    // Update timer state
    timerState.type = 'tabata';
    timerState.totalTime = duration;
    timerState.remainingTime = duration;
    timerState.isPaused = false;
    timerState.countdownSpoken = new Set(); // Reset countdown tracking

    // Show tabata info
    document.getElementById('tabataInfo').style.display = 'block';
    document.getElementById('currentRound').textContent = tabata.currentRound;
    document.getElementById('totalRounds').textContent = tabata.totalRounds;
    document.getElementById('tabataExerciseName').textContent = currentExercise.name;
    document.getElementById('timerTitle').textContent = title;

    // Apply phase styling
    const modalContent = document.querySelector('.timer-modal-content');
    modalContent.classList.remove('work-phase', 'rest-phase');
    modalContent.classList.add(tabata.isWorkPhase ? 'work-phase' : 'rest-phase');

    // Show modal
    document.getElementById('timerModal').classList.add('active');

    // Start countdown
    updateTimerDisplay();
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
    }

    timerState.intervalId = setInterval(() => {
        if (!timerState.isPaused) {
            timerState.remainingTime--;

            if (timerState.remainingTime <= 0) {
                advanceTabataPhase();
            } else {
                updateTimerDisplay();
            }
        }
    }, 1000);
}

function advanceTabataPhase() {
    const tabata = timerState.tabata;

    // Play sound
    if (state.settings.soundEnabled) {
        playTabataSound(tabata.isWorkPhase);
        vibrateDevice();
    }

    if (tabata.isWorkPhase) {
        // Just finished work, go to rest
        tabata.isWorkPhase = false;
    } else {
        // Just finished rest, go to next round or exercise
        tabata.isWorkPhase = true;
        tabata.currentRound++;

        // Check if we've completed all rounds for this exercise
        if (tabata.currentRound > tabata.totalRounds) {
            // Move to next exercise
            tabata.currentExerciseIndex++;
            tabata.currentRound = 1;

            if (tabata.currentExerciseIndex >= tabata.exercises.length) {
                // Finished all exercises
                finishTabataWorkout();
                return;
            }
        }
    }

    // Continue to next interval
    startTabataInterval();
}

function playTabataSound(isWorkPhase) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different sounds for work vs rest
        oscillator.frequency.value = isWorkPhase ? 600 : 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function finishTabataWorkout() {
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }

    // Show completion message
    document.getElementById('timerTitle').textContent = '🎉 ¡Entrenamiento Completado!';
    document.getElementById('timerDisplay').textContent = '✓';

    if (state.settings.soundEnabled) {
        // Victory sound
        playVictorySound();
        navigator.vibrate && navigator.vibrate([100, 50, 100, 50, 100]);
    }

    // Auto close after delay
    setTimeout(() => {
        stopTimer();
        timerState.tabata.isTabata = false;

        // Mark all exercises as completed
        state.todayWorkout.exercises.forEach(exId => {
            if (!state.completedExercises.includes(exId)) {
                state.completedExercises.push(exId);
            }
        });
        saveToStorage();
        renderTodayWorkout();
    }, 3000);
}

function playVictorySound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        [800, 1000, 1200].forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = audioContext.currentTime + (i * 0.2);
            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ===== GUIDED WORKOUT FUNCTIONS =====

function startGuidedWorkout() {
    if (!state.todayWorkout) {
        alert('No hay rutina seleccionada');
        return;
    }

    const workoutExercises = state.todayWorkout.exercises.map(exId =>
        state.exercises.find(ex => ex.id === exId)
    ).filter(ex => ex !== undefined);

    guidedState.isActive = true;
    guidedState.currentExerciseIndex = 0;
    guidedState.currentSet = 1;
    guidedState.exercises = workoutExercises;

    renderTodayWorkout();
}

function stopGuidedWorkout() {
    if (confirm('¿Seguro que quieres detener la rutina guiada?')) {
        guidedState.isActive = false;
        guidedState.currentExerciseIndex = 0;
        guidedState.currentSet = 1;
        guidedState.exercises = [];
        renderTodayWorkout();
    }
}

function completeCurrentSet() {
    const currentExercise = guidedState.exercises[guidedState.currentExerciseIndex];
    const totalSets = parseInt(currentExercise.sets) || 1;
    const isLastExercise = guidedState.currentExerciseIndex === guidedState.exercises.length - 1;
    const isLastSet = guidedState.currentSet >= totalSets;

    if (isLastSet && isLastExercise) {
        // Finish workout
        finishGuidedWorkout();
        return;
    }

    if (isLastSet) {
        // Move to next exercise
        // Mark current exercise as completed
        if (!state.completedExercises.includes(currentExercise.id)) {
            state.completedExercises.push(currentExercise.id);
        }
        saveToStorage();

        // Start rest timer between exercises
        guidedState.currentExerciseIndex++;
        guidedState.currentSet = 1;

        // Show rest timer, then continue
        startGuidedRestTimer('exercises');
    } else {
        // Move to next set
        guidedState.currentSet++;

        // Show rest timer between sets, then continue
        startGuidedRestTimer('sets');
    }
}

function startGuidedRestTimer(type) {
    const duration = type === 'sets' ?
        state.settings.restBetweenSets :
        state.settings.restBetweenExercises;

    // Store the original finishTimer function
    const originalFinishTimer = window.finishTimerCallback;

    // Set callback to continue guided workout after timer
    window.finishTimerCallback = () => {
        renderTodayWorkout();
        window.finishTimerCallback = originalFinishTimer;
    };

    startTimer(duration, type);
}

function finishGuidedWorkout() {
    // Mark all exercises as completed
    guidedState.exercises.forEach(exercise => {
        if (!state.completedExercises.includes(exercise.id)) {
            state.completedExercises.push(exercise.id);
        }
    });
    saveToStorage();

    // Reset guided state
    guidedState.isActive = false;
    guidedState.currentExerciseIndex = 0;
    guidedState.currentSet = 1;
    guidedState.exercises = [];

    // Show completion message
    if (state.settings.soundEnabled) {
        playVictorySound();
        navigator.vibrate && navigator.vibrate([100, 50, 100, 50, 100]);
    }

    alert('🎉 ¡Felicitaciones! Has completado tu rutina');
    renderTodayWorkout();
}

// ===== SETTINGS FUNCTIONS =====

function adjustTimer(inputId, amount) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) || 0;
    value = Math.max(0, Math.min(300, value + amount));
    input.value = value;

    // Update state
    if (inputId === 'restBetweenSets') {
        state.settings.restBetweenSets = value;
    } else if (inputId === 'restBetweenExercises') {
        state.settings.restBetweenExercises = value;
    }

    saveToStorage();
}

function loadSettings() {
    document.getElementById('restBetweenSets').value = state.settings.restBetweenSets;
    document.getElementById('restBetweenExercises').value = state.settings.restBetweenExercises;
    document.getElementById('autoStartTimer').checked = state.settings.autoStartTimer;
    document.getElementById('soundEnabled').checked = state.settings.soundEnabled;
    document.getElementById('voiceCountdownEnabled').checked = state.settings.voiceCountdownEnabled;

    // Add event listeners for settings
    document.getElementById('restBetweenSets').addEventListener('change', (e) => {
        state.settings.restBetweenSets = parseInt(e.target.value) || 60;
        saveToStorage();
    });

    document.getElementById('restBetweenExercises').addEventListener('change', (e) => {
        state.settings.restBetweenExercises = parseInt(e.target.value) || 90;
        saveToStorage();
    });

    document.getElementById('autoStartTimer').addEventListener('change', (e) => {
        state.settings.autoStartTimer = e.target.checked;
        saveToStorage();
    });

    document.getElementById('soundEnabled').addEventListener('change', (e) => {
        state.settings.soundEnabled = e.target.checked;
        saveToStorage();
    });

    document.getElementById('voiceCountdownEnabled').addEventListener('change', (e) => {
        state.settings.voiceCountdownEnabled = e.target.checked;
        saveToStorage();
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
