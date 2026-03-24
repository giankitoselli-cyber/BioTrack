import React, { useRef, useEffect } from 'react';
import { format, addDays, subDays, isSameDay, startOfToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface CalendarBarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  completions: { [date: string]: boolean };
}

export function CalendarBar({ selectedDate, onDateSelect, completions }: CalendarBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Generate a range of dates (e.g., 14 days back, 7 days forward)
  const dates = Array.from({ length: 21 }, (_, i) => addDays(subDays(new Date(), 14), i));

  useEffect(() => {
    // Scroll to the selected date on mount
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  return (
    <div className="relative bg-card-dark border border-white/5 rounded-2xl p-4 mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          {format(selectedDate, 'MMMM yyyy', { locale: it })}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => onDateSelect(subDays(selectedDate, 1))}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => onDateSelect(addDays(selectedDate, 1))}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x"
      >
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const dateKey = format(date, 'yyyy-MM-dd');
          const isCompleted = completions[dateKey];

          return (
            <button
              key={dateKey}
              data-selected={isSelected}
              onClick={() => onDateSelect(date)}
              className={cn(
                "flex-shrink-0 w-14 py-3 rounded-xl flex flex-col items-center gap-1 transition-all snap-center relative",
                isSelected 
                  ? "bg-purple-electric text-white purple-glow scale-105" 
                  : "bg-white/5 text-slate-400 hover:bg-white/10",
                isToday && !isSelected && "border border-purple-electric/30"
              )}
            >
              <span className="text-[10px] uppercase font-bold opacity-60">
                {format(date, 'EEE', { locale: it })}
              </span>
              <span className="text-lg font-bold">
                {format(date, 'd')}
              </span>
              
              {isCompleted && (
                <div className={cn(
                  "absolute -top-1 -right-1 p-0.5 rounded-full bg-bg-dark border border-white/10",
                  isSelected ? "text-white" : "text-purple-electric"
                )}>
                  <CheckCircle2 size={12} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
