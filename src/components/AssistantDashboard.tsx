import React, { useMemo } from 'react';
import { Sparkles, AlertTriangle, Info, Clock } from 'lucide-react';
import { Task, DayData } from '../types';
import { format, differenceInMinutes, parse, isAfter } from 'date-fns';

interface AssistantDashboardProps {
  dayData: DayData;
  yesterdayData?: DayData;
}

export const AssistantDashboard: React.FC<AssistantDashboardProps> = ({ dayData, yesterdayData }) => {
  const now = new Date();
  const currentTimeStr = format(now, 'HH:mm');

  // 1. Next Task Analysis
  const nextTask = useMemo(() => {
    const sortedTasks = [...dayData.tasks]
      .filter(t => !t.completed)
      .sort((a, b) => a.time.localeCompare(b.time));
    
    return sortedTasks.find(t => t.time > currentTimeStr);
  }, [dayData.tasks, currentTimeStr]);

  const timeToNextTask = useMemo(() => {
    if (!nextTask) return null;
    const taskTime = parse(nextTask.time, 'HH:mm', now);
    const diff = differenceInMinutes(taskTime, now);
    
    if (diff < 0) return null;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [nextTask, now]);

  // 2. Overlap Detection (Grouped by hour)
  const overlaps = useMemo(() => {
    const hourMap: { [hour: string]: string[] } = {};
    dayData.tasks.forEach(task => {
      const hour = task.time.split(':')[0];
      if (!hourMap[hour]) hourMap[hour] = [];
      hourMap[hour].push(task.title);
    });
    
    return Object.entries(hourMap)
      .filter(([_, titles]) => titles.length >= 3) // "Troppe" tasks in one hour (3 or more)
      .map(([hour, titles]) => ({ hour, count: titles.length }));
  }, [dayData.tasks]);

  // 3. Sleep/Energy Correlation (Specific to user request example)
  const suggestion = useMemo(() => {
    if (!yesterdayData) return "Inizia a tracciare i dati per ricevere suggerimenti basati sulla tua cronologia.";
    
    // Check for the specific pattern mentioned by the user
    // "Ieri hai dormito 6h e l'energia pomeridiana era 3, oggi prova a riposare di più"
    const yMorningSleep = yesterdayData.wellness.morning.sleep;
    const yAfternoonEnergy = yesterdayData.wellness.afternoon.energy;

    if (yMorningSleep > 0 && yMorningSleep <= 6 && yAfternoonEnergy <= 4) {
      return `Ieri hai dormito ${yMorningSleep}h e l'energia pomeridiana era ${yAfternoonEnergy}, oggi prova a riposare di più per evitare cali di performance.`;
    }

    const yTotalSleep = yesterdayData.wellness.morning.sleep + yesterdayData.wellness.afternoon.sleep + yesterdayData.wellness.evening.sleep;
    const yAvgEnergy = (yesterdayData.wellness.morning.energy + yesterdayData.wellness.afternoon.energy + yesterdayData.wellness.evening.energy) / 3;

    if (yTotalSleep >= 8 && yAvgEnergy > 7) {
      return `Ottimo bilancio! Le ${yTotalSleep}h di riposo di ieri hanno sostenuto un'energia media di ${yAvgEnergy.toFixed(1)}.`;
    }

    return "Mantieni la regolarità tra sonno ed energia per massimizzare la tua precisione organizzativa.";
  }, [yesterdayData]);

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Dashboard Assistente</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Task */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Prossima Task</span>
          </div>
          {nextTask ? (
            <div>
              <p className="text-white font-semibold truncate">{nextTask.title}</p>
              <p className="text-white/50 text-sm mt-1">
                Tra <span className="text-purple-300 font-mono">{timeToNextTask}</span> alle {nextTask.time}
              </p>
            </div>
          ) : (
            <p className="text-white/40 text-sm italic">Nessuna task imminente</p>
          )}
        </div>

        {/* Overlaps */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Sovrapposizioni</span>
          </div>
          {overlaps.length > 0 ? (
            <div className="space-y-1">
              {overlaps.map(({ hour, count }) => (
                <p key={hour} className="text-sm text-white/80">
                  <span className="font-mono text-amber-300">{hour}:00</span>: {count} task concentrate
                </p>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm italic">Organizzazione ottimale</p>
          )}
        </div>

        {/* Suggestion */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Info className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Suggerimento</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            {suggestion}
          </p>
        </div>
      </div>
    </div>
  );
};
