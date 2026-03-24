import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { TaskTemplate, TaskCompletion, TimeSlot } from '../types';
import { cn } from '../lib/utils';

interface RoutineProps {
  selectedDate: Date;
  templates: TaskTemplate[];
  completions: TaskCompletion[];
  onToggleTask: (date: string, taskId: string) => void;
  onAddTemplate: (title: string, slot: TimeSlot) => void;
  onDeleteTemplate: (id: string) => void;
  onUpdateTemplate: (id: string, title: string, slot: TimeSlot) => void;
}

interface TaskItemProps {
  template: TaskTemplate;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const TaskItem = ({ template, completed, onToggle, onDelete, onEdit }: TaskItemProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "flex items-center gap-4 p-4 rounded-xl border transition-all group",
      completed 
        ? "bg-purple-electric/5 border-purple-electric/20 opacity-60" 
        : "bg-white/5 border-white/5 hover:border-white/10"
    )}
  >
    <button 
      onClick={onToggle}
      className={cn(
        "transition-colors active:scale-90",
        completed ? "text-purple-electric" : "text-slate-500 hover:text-slate-300"
      )}
    >
      {completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
    </button>
    
    <div className="flex-1 min-w-0" onClick={onToggle}>
      <h4 className={cn(
        "font-bold truncate transition-all",
        completed ? "line-through text-slate-500" : "text-slate-200"
      )}>
        {template.title}
      </h4>
    </div>

    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg"
      >
        <Edit2 size={16} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </motion.div>
);

export function Routine({ 
  selectedDate, 
  templates, 
  completions, 
  onToggleTask, 
  onAddTemplate, 
  onDeleteTemplate,
  onUpdateTemplate
}: RoutineProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSlot, setNewSlot] = useState<TimeSlot>('Morning');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  const isTaskCompleted = (taskId: string) => {
    return completions.some(c => c.date === dateKey && c.taskId === taskId && c.completed);
  };

  const handleSave = () => {
    if (!newTitle.trim()) return;
    if (editingId) {
      onUpdateTemplate(editingId, newTitle, newSlot);
    } else {
      onAddTemplate(newTitle, newSlot);
    }
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewSlot('Morning');
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (template: TaskTemplate) => {
    setNewTitle(template.title);
    setNewSlot(template.timeSlot);
    setEditingId(template.id);
    setIsAdding(true);
  };

  const Section = ({ title, slot }: { title: string; slot: TimeSlot }) => {
    const slotTemplates = templates.filter(t => t.timeSlot === slot);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{title}</h3>
          <span className="text-[10px] text-slate-600 font-bold">{slotTemplates.length} TASK</span>
        </div>
        <div className="space-y-3">
          {slotTemplates.length > 0 ? (
            slotTemplates.map(template => (
              <div key={template.id}>
                <TaskItem 
                  template={template} 
                  completed={isTaskCompleted(template.id)} 
                  onToggle={() => onToggleTask(dateKey, template.id)} 
                  onDelete={() => onDeleteTemplate(template.id)}
                  onEdit={() => startEdit(template)}
                />
              </div>
            ))
          ) : (
            <div className="p-8 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
              <p className="text-sm text-slate-600 italic">Nessuna attività.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-black tracking-tighter">Routine</h1>
          <p className="text-slate-400 mt-1">Personalizza e completa i tuoi obiettivi.</p>
        </header>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-electric text-white font-bold rounded-2xl purple-glow hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          <span>Aggiungi</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card-dark border border-purple-electric/20 p-6 rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-purple-electric">{editingId ? 'Modifica Attività' : 'Nuova Attività'}</h3>
              <button onClick={resetForm} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Cosa devi fare?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-electric outline-none transition-colors"
            />

            <div className="grid grid-cols-3 gap-2">
              {(['Morning', 'Afternoon', 'Evening'] as TimeSlot[]).map(slot => (
                <button
                  key={slot}
                  onClick={() => setNewSlot(slot)}
                  className={cn(
                    "py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                    newSlot === slot 
                      ? "bg-purple-electric/20 border-purple-electric text-purple-electric" 
                      : "bg-white/5 border-white/5 text-slate-500"
                  )}
                >
                  {slot === 'Morning' ? 'Mattina' : slot === 'Afternoon' ? 'Pomeriggio' : 'Sera'}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-purple-electric text-white font-bold rounded-xl purple-glow"
              >
                {editingId ? 'Aggiorna' : 'Salva'}
              </button>
              <button 
                onClick={resetForm}
                className="px-6 py-3 bg-white/5 text-slate-400 font-bold rounded-xl"
              >
                Annulla
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Section title="Mattina" slot="Morning" />
        <Section title="Pomeriggio" slot="Afternoon" />
        <Section title="Sera" slot="Evening" />
      </div>
    </div>
  );
}
