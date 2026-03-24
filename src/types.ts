export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening';

export interface EnergyCheckIn {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  slot: TimeSlot;
  level: number; // 1-10
}

export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
}

export interface TaskTemplate {
  id: string;
  title: string;
  timeSlot: TimeSlot;
}

export interface TaskCompletion {
  date: string;
  taskId: string;
  completed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
