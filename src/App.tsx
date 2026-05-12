/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import StudyPlanner from "./components/StudyPlanner";
import Pomodoro from "./components/Pomodoro";
import Notes from "./components/Notes";
import Settings from "./components/Settings";
import Analytics from "./components/Analytics";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import { Bell, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-indigo-600"
        >
          <Sparkles className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "planner": return <StudyPlanner />;
      case "pomodoro": return <Pomodoro />;
      case "notes": return <Notes />;
      case "analytics": return <Analytics />;
      case "admin": return <AdminPanel />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 min-h-screen bg-radial-at-tr from-[#161618] to-[#0A0A0B]">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search items, tasks, notes..." 
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:bg-white/10 transition">
              <Bell className="w-6 h-6" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-indigo-500 border-2 border-[#0A0A0B] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold border border-white/10">
                {user.displayName?.charAt(0)}
              </div>
              <span className="text-sm font-bold text-white tracking-tight">{user.displayName}</span>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
