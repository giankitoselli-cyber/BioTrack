import React from 'react';
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div className={cn(
      "group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
      task.completed
        ? "bg-purple-900/20 border-purple-500/30 text-white/50"
        : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
    )}>
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "flex-shrink-0 transition-transform duration-200 hover:scale-110",
          task.completed ? "text-purple-400" : "text-white/30"
        )}
      >
        {task.completed ? (
          <CheckCircle2 className="w-6 h-6" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>

      <div className="flex-grow min-w-0">
        <h4 className={cn(
          "text-base font-medium truncate",
          task.completed && "line-through"
        )}>
          {task.title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-white/40 mt-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{task.time}</span>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all text-white/30"
      >
        <Trash2 className="w-4.5 h-4.5" />
      </button>
    </div>
  );
};
