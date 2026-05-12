export type Priority = "High" | "Medium" | "Low";
export type TaskStatus = "backlog" | "in-progress" | "completed";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  theme: "light" | "dark";
  productivityScore: number;
  streak: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  subjectId: string;
  priority: Priority;
  deadline: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  duration: number;
  type: "focus" | "short-break" | "long-break";
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "reminder" | "motivation" | "system";
  read: boolean;
  createdAt: string;
}
