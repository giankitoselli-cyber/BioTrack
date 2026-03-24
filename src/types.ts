export interface Task {
  id: string;
  title: string;
  time: string; // HH:mm
  completed: boolean;
}

export interface WellnessData {
  energy: number; // 1-10
  sleep: number; // hours
}

export interface DayData {
  tasks: Task[];
  wellness: {
    morning: WellnessData;
    afternoon: WellnessData;
    evening: WellnessData;
  };
}

export type WellnessSlot = 'morning' | 'afternoon' | 'evening';
