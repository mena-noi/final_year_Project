// src/types/dashboard.ts

export interface Reminder {
  id: number;
  text: string;
  time: string;
  completed: boolean;
}

export interface Module {
  id: number;
  name: string;
  progress: number;
  nextClass: string;
}

export interface QuickStat {
  value: number;
  label: string;
}