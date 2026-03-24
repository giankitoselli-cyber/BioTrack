/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, ListTodo, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameDay } from 'date-fns';

import { Dashboard } from './components/Dashboard';
import { Routine } from './components/Routine';
import { Statistics } from './components/Statistics';
import { Chatbot } from './components/Chatbot';
import { CalendarBar } from './components/CalendarBar';
import { EnergyCheckIn, SleepEntry, TaskTemplate, TaskCompletion, TimeSlot } from './types';
import { DEFAULT_TEMPLATES } from './constants';
import { cn } from './lib/utils';

type Page = 'dashboard' | 'routine' | 'statistics';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State Persistence
  const [energyData, setEnergyData] = useState<EnergyCheckIn[]>(() => {
    const saved = localStorage.getItem('biotrack_energy_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [sleepData, setSleepData] = useState<SleepEntry[]>(() => {
    const saved = localStorage.getItem('biotrack_sleep_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    const saved = localStorage.getItem('biotrack_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [completions, setCompletions] = useState<TaskCompletion[]>(() => {
    const saved = localStorage.getItem('biotrack_completions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('biotrack_energy_v2', JSON.stringify(energyData));
  }, [energyData]);

  useEffect(() => {
    localStorage.setItem('biotrack_sleep_v2', JSON.stringify(sleepData));
  }, [sleepData]);

  useEffect(() => {
    localStorage.setItem('biotrack_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('biotrack_completions', JSON.stringify(completions));
  }, [completions]);

  // Handlers
  const handleAddEnergy = (date: string, slot: TimeSlot, level: number) => {
    setEnergyData(prev => {
      const filtered = prev.filter(e => !(e.date === date && e.slot === slot));
      return [...filtered, { id: Math.random().toString(36).substr(2, 9), date, slot, level }];
    });
  };

  const handleAddSleep = (date: string, hours: number) => {
    setSleepData(prev => {
      const filtered = prev.filter(s => s.date !== date);
      return [...filtered, { id: Math.random().toString(36).substr(2, 9), date, hours }];
    });
  };

  const handleToggleTask = (date: string, taskId: string) => {
    setCompletions(prev => {
      const exists = prev.find(c => c.date === date && c.taskId === taskId);
      if (exists) {
        return prev.map(c => (c.date === date && c.taskId === taskId) ? { ...c, completed: !c.completed } : c);
      }
      return [...prev, { date, taskId, completed: true }];
    });
  };

  const handleAddTemplate = (title: string, timeSlot: TimeSlot) => {
    setTemplates(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), title, timeSlot }]);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setCompletions(prev => prev.filter(c => c.taskId !== id));
  };

  const handleUpdateTemplate = (id: string, title: string, timeSlot: TimeSlot) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, title, timeSlot } : t));
  };

  // Calculate daily completion status for calendar
  const dailyCompletions = useMemo(() => {
    const status: { [date: string]: boolean } = {};
    
    // Get all unique dates from completions
    const dates = Array.from(new Set(completions.map(c => c.date))) as string[];
    
    dates.forEach(date => {
      const dayCompletions = completions.filter(c => c.date === date && c.completed);
      // A day is "completed" if there's at least one template and all templates are completed
      // Or more simply, if the number of completed tasks matches the number of templates
      if (templates.length > 0 && dayCompletions.length >= templates.length) {
        status[date] = true;
      }
    });
    
    return status;
  }, [completions, templates]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routine', label: 'Routine', icon: ListTodo },
    { id: 'statistics', label: 'Statistiche', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-bg-dark">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-card-dark p-6">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-purple-electric rounded-xl flex items-center justify-center purple-glow">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="font-bold text-xl tracking-tight">BioTrack</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-purple-electric/10 text-purple-electric" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
            <Settings size={20} />
            Impostazioni
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/70 hover:bg-red-400/10 hover:text-red-400 transition-all">
            <LogOut size={20} />
            Esci
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card-dark border-b border-white/5 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-electric rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <span className="font-bold">BioTrack</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-card-dark z-50 p-6 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-electric rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">B</span>
                  </div>
                  <span className="font-bold text-xl">BioTrack</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id as Page);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive 
                          ? "bg-purple-electric/10 text-purple-electric" 
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-24 lg:pt-12 px-6 lg:px-12 pb-12 max-w-6xl mx-auto w-full">
        {/* Weekly Calendar Bar */}
        <CalendarBar 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
          completions={dailyCompletions}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activePage === 'dashboard' && (
              <Dashboard 
                selectedDate={selectedDate}
                energyData={energyData} 
                sleepData={sleepData} 
                onAddEnergy={handleAddEnergy} 
                onAddSleep={handleAddSleep} 
              />
            )}
            {activePage === 'routine' && (
              <Routine 
                selectedDate={selectedDate}
                templates={templates} 
                completions={completions}
                onToggleTask={handleToggleTask} 
                onAddTemplate={handleAddTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onUpdateTemplate={handleUpdateTemplate}
              />
            )}
            {activePage === 'statistics' && (
              <Statistics 
                energyData={energyData} 
                sleepData={sleepData} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}
