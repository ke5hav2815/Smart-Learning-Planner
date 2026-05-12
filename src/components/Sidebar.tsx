import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  BookOpen, 
  BarChart2, 
  Settings, 
  LogOut,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "planner", icon: Calendar, label: "Study Planner" },
  { id: "pomodoro", icon: Clock, label: "Pomodoro" },
  { id: "notes", icon: BookOpen, label: "Notes" },
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "admin", icon: ShieldCheck, label: "Admin Panel" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const ADMIN_EMAIL = "keshavjhaofficial28@gmail.com";

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { logout, user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const filteredItems = menuItems.filter(item => 
    item.id !== "admin" || isAdmin
  );

  return (
    <div id="sidebar" className="fixed left-0 top-0 h-full w-64 bg-[#0D0D0E] border-r border-white/5 flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Planner AI
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === item.id 
                ? "bg-white/5 text-white font-medium" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="w-5 h-5 opacity-70" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-white/10">
          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">Daily Streak</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white tracking-tighter">{user?.streak || 0}</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
              <div className="w-1.5 h-5 bg-white/10 rounded-full"></div>
              <div className="w-1.5 h-4 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
