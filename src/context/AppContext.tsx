import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { Task, Subject, Note, StudySession, Notification } from "../types";

interface AppContextType {
  tasks: Task[];
  subjects: Subject[];
  notes: Note[];
  sessions: StudySession[];
  notifications: Notification[];
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSubject: (name: string, color: string) => Promise<void>;
  addSession: (session: Partial<StudySession>) => Promise<void>;
  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setSubjects([]);
      setNotes([]);
      setSessions([]);
      setNotifications([]);
      return;
    }

    const qTasks = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    const qSubjects = query(collection(db, "subjects"), where("userId", "==", user.uid));
    const unsubSubjects = onSnapshot(qSubjects, (snap) => {
      setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    });

    const qNotes = query(collection(db, "notes"), where("userId", "==", user.uid));
    const unsubNotes = onSnapshot(qNotes, (snap) => {
      setNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
    });

    const qSessions = query(collection(db, "sessions"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
    const unsubSessions = onSnapshot(qSessions, (snap) => {
      setSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudySession)));
    });

    const qNotifications = query(collection(db, "notifications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubNotifications = onSnapshot(qNotifications, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    });

    return () => {
      unsubTasks();
      unsubSubjects();
      unsubNotes();
      unsubSessions();
      unsubNotifications();
    };
  }, [user]);

  const addTask = async (task: Partial<Task>) => {
    if (!user) return;
    await addDoc(collection(db, "tasks"), {
      ...task,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { ...updates, updatedAt: new Date().toISOString() });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const addSubject = async (name: string, color: string) => {
    if (!user) return;
    await addDoc(collection(db, "subjects"), {
      userId: user.uid,
      name,
      color,
      createdAt: new Date().toISOString(),
    });
  };

  const addSession = async (session: Partial<StudySession>) => {
    if (!user) return;
    await addDoc(collection(db, "sessions"), {
      ...session,
      userId: user.uid,
      timestamp: new Date().toISOString(),
    });
  };

  const addNote = async (note: Partial<Note>) => {
    if (!user) return;
    await addDoc(collection(db, "notes"), {
      ...note,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const noteRef = doc(db, "notes", id);
    await updateDoc(noteRef, { ...updates, updatedAt: new Date().toISOString() });
  };

  const deleteNote = async (id: string) => {
    await deleteDoc(doc(db, "notes", id));
  };

  return (
    <AppContext.Provider value={{ 
      tasks, subjects, notes, sessions, notifications,
      addTask, updateTask, deleteTask, 
      addSubject, addSession,
      addNote, updateNote, deleteNote
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
