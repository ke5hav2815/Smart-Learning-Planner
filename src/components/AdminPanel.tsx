import React, { useEffect, useState } from "react";
import { Users as UsersIcon, Activity, Trash2, ShieldCheck, Mail, Database, Search } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { User } from "../types";

export default function AdminPanel() {
  const { tasks, sessions, subjects, notes } = useAppContext();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("uid"), limit(50));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAllUsers(snap.docs.map(doc => doc.data() as User));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "users", uid));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Admin Control Center</h2>
          <p className="text-slate-400 mt-1">Global platform monitoring and management.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-sm font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Root Access Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <UsersIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Platform Users</h3>
          </div>
          <p className="text-3xl font-black text-white">{loading ? "..." : allUsers.length}</p>
          <div className="flex items-center gap-2 mt-2 text-indigo-400 text-sm font-bold">
            <Activity className="w-4 h-4" />
            Live Database Sync
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Active Resources</h3>
          </div>
          <p className="text-3xl font-black text-white">
            {tasks.length + notes.length + subjects.length + sessions.length}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Documents in your workspace</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 blur-2xl rounded-full" />
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-indigo-200" />
            <h3 className="font-bold">System Integrity</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: "Auth Service", status: "Online" },
              { name: "Firestore (EU)", status: "Active" },
              { name: "AI Inference", status: "Ready" },
            ].map(s => (
              <div key={s.name} className="flex justify-between text-sm">
                <span className="opacity-70">{s.name}</span>
                <span className="font-bold text-indigo-200">{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h3 className="font-bold text-white">User Management</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-black/20 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading user database...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No users found.</div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.uid} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                    {u.displayName?.charAt(0) || u.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{u.displayName || "Anonymous User"}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="w-3 h-3" />
                      {u.email}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400">Score: {u.productivityScore || 0}%</p>
                    <p className="text-[10px] text-slate-500">Streak: {u.streak || 0} days</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteUser(u.uid)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
