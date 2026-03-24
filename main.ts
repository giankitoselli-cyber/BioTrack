import { GoogleGenAI, Type } from "@google/genai";

// --- Types & Interfaces ---
interface Task {
    id: string;
    name: string;
    time: string;
    completed: boolean;
}

interface DayData {
    tasks: Task[];
    sleepHours: number;
    sleepQuality: number;
    energy: number;
    wellBeing: number;
    diary: string;
}

// --- State Management ---
let currentDate = new Date();
let calendarViewDate = new Date();
let appData: Record<string, DayData> = JSON.parse(localStorage.getItem('minimal_routine_v2_2') || '{}');
let currentTab = 'routine';
let currentMode = localStorage.getItem('app_mode') || 'system'; // 'light', 'dark', 'system'
let currentTheme = localStorage.getItem('app_theme') || 'default';

const getDayKey = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const getCurrentDayData = (): DayData => {
    const key = getDayKey(currentDate);
    if (!appData[key]) {
        appData[key] = {
            tasks: [],
            sleepHours: 0,
            sleepQuality: 5,
            energy: 5,
            wellBeing: 5,
            diary: ''
        };
    } else {
        // Migration: ensure all properties exist for existing data from older versions
        if (appData[key].tasks === undefined) appData[key].tasks = [];
        if (appData[key].sleepHours === undefined) appData[key].sleepHours = 0;
        if (appData[key].sleepQuality === undefined) appData[key].sleepQuality = 5;
        if (appData[key].energy === undefined) appData[key].energy = 5;
        if (appData[key].wellBeing === undefined) appData[key].wellBeing = 5;
        if (appData[key].diary === undefined) appData[key].diary = '';
    }
    return appData[key];
};

const saveData = () => {
    localStorage.setItem('minimal_routine_v2_2', JSON.stringify(appData));
    updateUI();
};

// --- AI Chatbot Integration ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const addTaskTool = {
    name: "addTask",
    description: "Aggiunge una nuova task alla routine dell'utente",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Nome della task (es: Allenamento)" },
            time: { type: Type.STRING, description: "Orario in formato HH:mm (es: 18:30)" }
        },
        required: ["name", "time"]
    }
};

const handleAIChat = async (message: string) => {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    // Add user message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'text-right opacity-80 animate-fade-in';
    userMsgDiv.innerHTML = `<span class="bg-smoke/10 px-3 py-2 rounded inline-block uppercase text-[10px] tracking-tighter">${message}</span>`;
    chatMessages.appendChild(userMsgDiv);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-left animate-fade-in';
        errorDiv.innerHTML = `<span class="bg-red-500/10 text-red-500 px-3 py-2 rounded inline-block uppercase text-[10px] tracking-tighter">ERRORE: CHIAVE API NON CONFIGURATA.</span>`;
        chatMessages.appendChild(errorDiv);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: message,
            config: {
                systemInstruction: "Sei un assistente minimale e formale. Se l'utente chiede di aggiungere una task, usa il tool addTask. Sii estremamente conciso e professionale. Usa un tono da segretario d'altri tempi.",
                tools: [{ functionDeclarations: [addTaskTool] }]
            }
        });

        const functionCalls = response.functionCalls;
        if (functionCalls) {
            for (const call of functionCalls) {
                if (call.name === 'addTask') {
                    const { name, time } = call.args as { name: string, time: string };
                    addTask(name, time);
                    const botMsgDiv = document.createElement('div');
                    botMsgDiv.className = 'text-left animate-fade-in';
                    botMsgDiv.innerHTML = `<span class="bg-ink text-paper px-3 py-2 rounded inline-block uppercase text-[10px] tracking-tighter">REGISTRATO: "${name}" ORE ${time}.</span>`;
                    chatMessages.appendChild(botMsgDiv);
                }
            }
        } else {
            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'text-left animate-fade-in';
            botMsgDiv.innerHTML = `<span class="bg-smoke/10 px-3 py-2 rounded inline-block uppercase text-[10px] tracking-tighter">${response.text}</span>`;
            chatMessages.appendChild(botMsgDiv);
        }
    } catch (error) {
        console.error("AI Error:", error);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// --- UI Logic ---
const populateDropdowns = () => {
    const sleepSelect = document.getElementById('sleep-hours') as HTMLSelectElement;
    const timeSelect = document.getElementById('new-task-time') as HTMLSelectElement;

    if (sleepSelect) {
        sleepSelect.innerHTML = '';
        for (let i = 0; i <= 24; i += 0.5) {
            const opt = document.createElement('option');
            opt.value = i.toString();
            opt.innerText = `${i} ORE`;
            sleepSelect.appendChild(opt);
        }
    }

    if (timeSelect) {
        timeSelect.innerHTML = '';
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hh = h.toString().padStart(2, '0');
                const mm = m.toString().padStart(2, '0');
                const opt = document.createElement('option');
                opt.value = `${hh}:${mm}`;
                opt.innerText = `${hh}:${mm}`;
                timeSelect.appendChild(opt);
            }
        }
    }
};

const applyThemeAndMode = () => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    if (currentMode === 'light') document.documentElement.classList.add('light-mode');
    if (currentMode === 'dark') document.documentElement.classList.add('dark-mode');
    
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
    if (themeSelect) themeSelect.value = currentTheme;

    const modeIcon = document.getElementById('mode-icon');
    if (modeIcon) {
        if (currentMode === 'dark') {
            modeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        } else if (currentMode === 'light') {
            modeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        } else {
            modeIcon.innerHTML = '<path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path><circle cx="12" cy="12" r="4"></circle>';
        }
    }
};

const updateUI = () => {
    const data = getCurrentDayData();
    
    // Update Date Display
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        dateDisplay.innerText = currentDate.toLocaleDateString('it-IT', options).toUpperCase();
    }

    // Update Progress
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.completed).length;
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-percentage');
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.innerText = `PROGRESSO: ${percentage}%`;

    // Render Tasks
    const taskList = document.getElementById('task-list');
    if (taskList) {
        taskList.innerHTML = '';
        data.tasks.sort((a, b) => a.time.localeCompare(b.time)).forEach(task => {
            const div = document.createElement('div');
            div.className = `flex items-center justify-between p-3 border border-smoke/10 transition-all ${task.completed ? 'opacity-30' : ''}`;
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <button onclick="toggleTask('${task.id}')" class="w-5 h-5 border border-ink flex items-center justify-center text-[10px]">
                        ${task.completed ? 'X' : ''}
                    </button>
                    <div>
                        <p class="text-xs font-bold uppercase ${task.completed ? 'line-through' : ''}">${task.name}</p>
                        <p class="text-[10px] opacity-50 font-mono">ORE ${task.time}</p>
                    </div>
                </div>
                <button onclick="deleteTask('${task.id}')" class="text-[10px] opacity-30 hover:opacity-100 uppercase tracking-tighter">ELIMINA</button>
            `;
            taskList.appendChild(div);
        });
    }

    // Update Inputs
    const sleepInput = document.getElementById('sleep-hours') as HTMLSelectElement;
    const qualityInput = document.getElementById('sleep-quality') as HTMLInputElement;
    const qualityVal = document.getElementById('sleep-quality-val');
    const wellbeingInput = document.getElementById('wellbeing-input') as HTMLInputElement;
    const wellbeingVal = document.getElementById('wellbeing-val');
    const diaryInput = document.getElementById('diary-input') as HTMLTextAreaElement;
    
    if (sleepInput) sleepInput.value = (data.sleepHours ?? 0).toString();
    if (qualityInput) {
        qualityInput.value = (data.sleepQuality ?? 5).toString();
        if (qualityVal) qualityVal.innerText = (data.sleepQuality ?? 5).toString();
    }
    if (wellbeingInput) {
        wellbeingInput.value = (data.wellBeing ?? 5).toString();
        if (wellbeingVal) wellbeingVal.innerText = (data.wellBeing ?? 5).toString();
    }
    if (diaryInput) diaryInput.value = data.diary;

    // Ideal Sleep Calculation
    calculateIdealSleep(data);
    updateStats();

    // Energy Selector
    const energySelector = document.getElementById('energy-selector');
    if (energySelector) {
        energySelector.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.className = `flex-1 h-8 border border-smoke/20 text-[10px] transition-all ${data.energy === i ? 'bg-ink text-paper border-ink font-bold' : 'hover:border-ink opacity-40'}`;
            btn.innerText = i.toString();
            btn.onclick = () => {
                data.energy = i;
                saveData();
            };
            energySelector.appendChild(btn);
        }
    }
};

// --- Event Handlers ---
const addTask = (name: string, time: string) => {
    if (!name || !time) return;
    const data = getCurrentDayData();
    data.tasks.push({
        id: Math.random().toString(36).substr(2, 9),
        name,
        time,
        completed: false
    });
    saveData();
};

(window as any).toggleTask = (id: string) => {
    const data = getCurrentDayData();
    const task = data.tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveData();
};

(window as any).deleteTask = (id: string) => {
    const data = getCurrentDayData();
    data.tasks = data.tasks.filter(t => t.id !== id);
    saveData();
};

// --- Calendar Logic ---
const renderCalendar = () => {
    const grid = document.getElementById('calendar-grid');
    const monthSelect = document.getElementById('calendar-month-select') as HTMLSelectElement;
    const yearSelect = document.getElementById('calendar-year-select') as HTMLSelectElement;
    
    if (!grid || !monthSelect || !yearSelect) return;

    grid.innerHTML = '';
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    
    monthSelect.value = month.toString();
    yearSelect.value = year.toString();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startOffset; i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dayDiv = document.createElement('div');
        const dateObj = new Date(year, month, d);
        const isToday = new Date().toDateString() === dateObj.toDateString();
        const isActive = currentDate.toDateString() === dateObj.toDateString();
        
        dayDiv.innerText = d.toString().padStart(2, '0');
        dayDiv.className = `text-[10px] font-bold p-2 cursor-pointer transition-all border border-transparent hover:border-ink flex items-center justify-center ${isToday ? 'bg-ink text-paper' : ''} ${isActive ? 'border-ink' : 'opacity-60'}`;
        dayDiv.onclick = () => {
            currentDate = dateObj;
            document.getElementById('calendar-overlay')?.classList.add('hidden');
            updateUI();
        };
        grid.appendChild(dayDiv);
    }
};

const calculateIdealSleep = (data: DayData) => {
    const display = document.getElementById('ideal-sleep-display');
    const reason = document.getElementById('ideal-sleep-reason');
    if (!display || !reason) return;

    let ideal = 8.0;
    let message = "";

    if (data.wellBeing <= 3) {
        ideal = 9.5;
        message = "Il tuo stato di benessere è basso. Il corpo ha bisogno di un recupero profondo e prolungato per rigenerarsi.";
    } else if (data.wellBeing <= 6) {
        ideal = 8.5;
        message = "Ti senti mediamente stanco. Un leggero surplus di sonno aiuterà a riportare l'energia a livelli ottimali.";
    } else if (data.wellBeing <= 8) {
        ideal = 8.0;
        message = "Stato di benessere buono. 8 ore sono lo standard ideale per mantenere questo equilibrio.";
    } else {
        ideal = 7.5;
        message = "Ti senti eccellente! Il tuo corpo è ben riposato, 7.5 ore potrebbero essere sufficienti per svegliarti attivo.";
    }

    // Adjust based on previous quality
    if (data.sleepQuality < 5) {
        ideal += 0.5;
        message += " Nota: La bassa qualità del riposo precedente suggerisce la necessità di più tempo a letto.";
    }

    display.innerText = ideal.toFixed(1);
    reason.innerText = message;
};

const updateStats = () => {
    const avgSleepEl = document.getElementById('avg-sleep');
    const avgQualityEl = document.getElementById('avg-quality');
    if (!avgSleepEl || !avgQualityEl) return;

    const keys = Object.keys(appData);
    if (keys.length === 0) return;

    const last7Days = keys.sort().slice(-7);
    const totalSleep = last7Days.reduce((acc, key) => acc + (appData[key].sleepHours ?? 0), 0);
    const totalQuality = last7Days.reduce((acc, key) => acc + (appData[key].sleepQuality ?? 0), 0);

    avgSleepEl.innerText = `${(totalSleep / last7Days.length).toFixed(1)} ORE`;
    avgQualityEl.innerText = `${(totalQuality / last7Days.length).toFixed(1)} / 10`;
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    applyThemeAndMode();
    updateUI();

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (!tab) return;
            
            currentTab = tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            document.getElementById(`tab-${tab}`)?.classList.remove('hidden');
        });
    });

    // Theme & Mode
    document.getElementById('theme-select')?.addEventListener('change', (e) => {
        currentTheme = (e.target as HTMLSelectElement).value;
        localStorage.setItem('app_theme', currentTheme);
        applyThemeAndMode();
    });

    document.getElementById('mode-toggle')?.addEventListener('click', () => {
        if (currentMode === 'system') currentMode = 'light';
        else if (currentMode === 'light') currentMode = 'dark';
        else currentMode = 'system';
        
        localStorage.setItem('app_mode', currentMode);
        applyThemeAndMode();
    });

    // Event Listeners
    document.getElementById('add-task-btn')?.addEventListener('click', () => {
        const nameInput = document.getElementById('new-task-name') as HTMLInputElement;
        const timeInput = document.getElementById('new-task-time') as HTMLSelectElement;
        addTask(nameInput.value, timeInput.value);
        nameInput.value = '';
    });

    document.getElementById('sleep-hours')?.addEventListener('change', (e) => {
        const data = getCurrentDayData();
        data.sleepHours = parseFloat((e.target as HTMLSelectElement).value);
        saveData();
    });

    document.getElementById('sleep-quality')?.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value;
        const display = document.getElementById('sleep-quality-val');
        if (display) display.innerText = val;
        
        const data = getCurrentDayData();
        data.sleepQuality = parseInt(val);
        saveData();
    });

    document.getElementById('wellbeing-input')?.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value;
        const display = document.getElementById('wellbeing-val');
        if (display) display.innerText = val;
        
        const data = getCurrentDayData();
        data.wellBeing = parseInt(val);
        saveData();
    });

    document.getElementById('diary-input')?.addEventListener('input', (e) => {
        const data = getCurrentDayData();
        data.diary = (e.target as HTMLTextAreaElement).value;
        saveData();
    });

    // Calendar
    document.getElementById('open-calendar')?.addEventListener('click', () => {
        calendarViewDate = new Date(currentDate);
        renderCalendar();
        document.getElementById('calendar-overlay')?.classList.remove('hidden');
    });
    document.getElementById('close-calendar')?.addEventListener('click', () => {
        document.getElementById('calendar-overlay')?.classList.add('hidden');
    });

    document.getElementById('calendar-month-select')?.addEventListener('change', (e) => {
        calendarViewDate.setMonth(parseInt((e.target as HTMLSelectElement).value));
        renderCalendar();
    });

    document.getElementById('calendar-year-select')?.addEventListener('change', (e) => {
        calendarViewDate.setFullYear(parseInt((e.target as HTMLSelectElement).value));
        renderCalendar();
    });

    document.getElementById('calendar-today-btn')?.addEventListener('click', () => {
        calendarViewDate = new Date();
        renderCalendar();
    });

    // Day Navigation
    document.getElementById('prev-day')?.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateUI();
    });
    document.getElementById('next-day')?.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateUI();
    });

    // Chat
    document.getElementById('send-chat')?.addEventListener('click', () => {
        const input = document.getElementById('chat-input') as HTMLInputElement;
        if (input.value) {
            handleAIChat(input.value);
            input.value = '';
        }
    });
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const input = e.target as HTMLInputElement;
            if (input.value) {
                handleAIChat(input.value);
                input.value = '';
            }
        }
    });
});
