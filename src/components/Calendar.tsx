import React from 'react';
import { format, addDays, subDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface CalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ currentDate, onDateChange }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  const handlePrevWeek = () => onDateChange(subDays(currentDate, 7));
  const handleNextWeek = () => onDateChange(addDays(currentDate, 7));

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="date"
            value={format(currentDate, 'yyyy-MM-dd')}
            onChange={(e) => onDateChange(new Date(e.target.value))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            min={format(subDays(new Date(), 365), 'yyyy-MM-dd')}
            max={format(addDays(new Date(), 365), 'yyyy-MM-dd')}
          />
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toString()}
              onClick={() => onDateChange(day)}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl transition-all duration-200",
                isSelected
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                  : "hover:bg-white/10 text-white/60",
                isToday && !isSelected && "border border-purple-500/50"
              )}
            >
              <span className="text-xs uppercase font-medium mb-1">
                {format(day, 'EEE', { locale: it })}
              </span>
              <span className="text-lg font-bold">
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
