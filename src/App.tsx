import React, { useState, useEffect, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { Plus, Layout, ListTodo, Activity } from 'lucide-react';
import { Calendar } from './components/Calendar';
import { ProgressBar } from './components/ProgressBar';
import { TaskItem } from './components/TaskItem';
import { WellnessCheck } from './components/WellnessCheck';
import { AssistantDashboard } from './components/AssistantDashboard';
import { Task, DayData, WellnessSlot, WellnessData } from './types';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_PREFIX = 'data-';

const getDefaultDayData = (): DayData => ({
  tasks: [],
  wellness: {
    morning: { energy: 5, sleep: 0 },
    afternoon: { energy: 5, sleep: 0 },
    evening: { energy: 5, sleep: 0 }
  }
});

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayData, setDayData] = useState<DayData>(getDefaultDayData());
  const [yesterdayData, setYesterdayData] = useState<DayData | undefined>();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', time: '08:00' });

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const storageKey = `${STORAGE_PREFIX}${dateKey}`;

  // Load data for current date
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setDayData(JSON.parse(saved));
    } else {
      setDayData(getDefaultDayData());
    }

    // Load yesterday's data for assistant analysis
    const yesterdayKey = `${STORAGE_PREFIX}${format(subDays(currentDate, 1), 'yyyy-MM-dd')}`;
    const yesterdaySaved = localStorage.getItem(yesterdayKey);
    if (yesterdaySaved) {
      setYesterdayData(JSON.parse(yesterdaySaved));
    } else {
      setYesterdayData(undefined);
    }
  }, [storageKey, currentDate]);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(dayData));
  }, [dayData, storageKey]);

  const sortedTasks = useMemo(() => {
    return [...dayData.tasks].sort((a, b) => a.time.localeCompare(b.time));
  }, [dayData.tasks]);

  const progress = useMemo(() => {
    if (dayData.tasks.length === 0) return 0;
    const completed = dayData.tasks.filter(t => t.completed).length;
    return (completed / dayData.tasks.length) * 100;
  }, [dayData.tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.title,
      time: newTask.time,
      completed: false
    };

    setDayData(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
    setNewTask({ title: '', time: '08:00' });
    setShowAddTask(false);
  };

  const toggleTask = (id: string) => {
    setDayData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setDayData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const updateWellness = (slot: WellnessSlot, field: keyof WellnessData, value: number) => {
    setDayData(prev => ({
      ...prev,
      wellness: {
        ...prev.wellness,
        [slot]: {
          ...prev.wellness[slot],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <Activity className="w-8 h-8 text-purple-500" />
            BioTrack <span className="text-purple-500">Pro</span>
          </h1>
          <p className="text-white/40 text-sm font-medium">Performance e Precisione Organizzativa</p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/60 uppercase tracking-widest">
          {format(new Date(), 'EEEE d MMMM', { locale: undefined })}
        </div>
      </header>

      {/* Navigation & Progress */}
      <Calendar currentDate={currentDate} onDateChange={setCurrentDate} />
      <ProgressBar percentage={progress} />

      {/* Assistant Dashboard */}
      <AssistantDashboard dayData={dayData} yesterdayData={yesterdayData} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tasks Section */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Routine Giornaliera</h2>
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              className="p-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showAddTask && (
              <motion.form
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleAddTask}
                className="bg-white/5 border border-purple-500/30 rounded-2xl p-4 mb-6"
              >
                <div className="flex flex-col gap-4">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Cosa devi fare?"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-transparent border-b border-white/10 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex items-center justify-between">
                    <input
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask(prev => ({ ...prev, time: e.target.value }))}
                      className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddTask(false)}
                        className="px-4 py-1.5 text-sm text-white/40 hover:text-white transition-colors"
                      >
                        Annulla
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-500 transition-colors"
                      >
                        Aggiungi
                      </button>
                    </div>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {sortedTasks.length > 0 ? (
              sortedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-white/20 italic">Nessuna task per oggi</p>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="mt-4 text-purple-400 text-sm font-bold hover:underline"
                >
                  Inizia ora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Wellness Section */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 mb-6">
            <Layout className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Check-in Benessere</h2>
          </div>
          <div className="space-y-4">
            <WellnessCheck
              slot="morning"
              data={dayData.wellness.morning}
              onChange={updateWellness}
            />
            <WellnessCheck
              slot="afternoon"
              data={dayData.wellness.afternoon}
              onChange={updateWellness}
            />
            <WellnessCheck
              slot="evening"
              data={dayData.wellness.evening}
              onChange={updateWellness}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
