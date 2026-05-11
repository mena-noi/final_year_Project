// src/types/index.ts

export interface User {
  id: string;
  name: string;
  role: 'student' | 'lecturer' | 'department_head' | 'admin';
  department: string;
  email?: string;
  avatar?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isVoice?: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  isCompleted?: boolean;
  category?: string;
  priority?: string;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  voiceTrigger: string;
  action: () => void;
  category: 'navigation' | 'academic' | 'accessibility';
}

export interface AcademicContext {
  studentId: string;
  courses: Course[];
  currentSemester: string;
  department: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  credits: number;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  screenReader: boolean;
  voiceSpeed: number;
  autoSpeak: boolean;
  voiceNavigation: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  voiceEnabled: boolean;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number;
  courseId: string;
}

export interface ClassSchedule {
  id: string;
  courseId: string;
  day: string;
  time: string;
  location: string;
}

export interface ExamBlockSchedule {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  courseId: string;
}

/** Lecturer-posted notice for an exam period; shown to students on Home. Stored in localStorage. */
export interface LecturerExamBlockAnnouncement {
  id: string;
  title: string;
  messageToStudents: string;
  startDate: string;
  endDate: string;
  attachmentFileName?: string;
  postedBy: string;
  postedAt: string;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedAt: Date;
  category: 'general' | 'exam' | 'module';
}