import React, { useState } from "react";
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Palette,
  Mail,
  UserCircle,
  Plus,
  Trash2,
  Tag
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { cn } from "../lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Settings() {
  const { user } = useAuth();
  const { subjects, addSubject, updateNote } = useAppContext(); // Note: updateNote isn't needed here, just checking what's available
  const [newSubject, setNewSubject] = useState({ name: "", color: "#6366f1" });
  const [activeSection, setActiveSection] = useState("profile");

  const [isUpdating, setIsUpdating] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        updatedAt: new Date().toISOString()
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#a855f7"];

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name) return;
    await addSubject(newSubject.name, newSubject.color);
    setNewSubject({ name: "", color: "#6366f1" });
  };

  const handleUpdateTheme = async (theme: "light" | "dark") => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      theme,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Settings</h2>
          <p className="text-slate-400 mt-1">Personalize your learning environment and account.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1 space-y-2">
          {[
            { id: "profile", label: "Profile", icon: UserCircle },
            { id: "subjects", label: "Subjects", icon: Tag },
            { id: "theme", label: "Appearance", icon: Palette },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Security", icon: Shield },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all text-sm",
                activeSection === item.id 
                  ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-8">
          {activeSection === "profile" && (
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm backdrop-blur-sm space-y-8">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                  {user?.displayName?.charAt(0) || "U"}
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white leading-none">Avatar & Profile</h4>
                  <p className="text-sm text-slate-400">Your visual identity across the platform.</p>
                  <button className="bg-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/10">
                    Update Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition text-white font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-black/20 border border-white/5 rounded-2xl text-slate-500 font-medium">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Update Account"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "subjects" && (
            <div className="space-y-8">
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                <h3 className="text-xl font-bold text-white">Add New Subject</h3>
                <form onSubmit={handleAddSubject} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Advanced Physics"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Color Accent</label>
                      <div className="flex flex-wrap gap-2">
                        {colors.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewSubject({...newSubject, color: c})}
                            className={cn(
                              "w-8 h-8 rounded-full transition-transform active:scale-90",
                              newSubject.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : "opacity-60 hover:opacity-100"
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="w-full md:w-auto px-10 py-3.5 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20">
                    Save Subject
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map(s => (
                  <div key={s.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center justify-between group text-xs uppercase tracking-widest font-black">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-white">{s.name}</span>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "theme" && (
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Visual Experience</h3>
                <p className="text-sm text-slate-400">Customize how the platform looks on your device.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => handleUpdateTheme("light")}
                  className={cn(
                    "flex flex-col gap-4 p-6 rounded-3xl border-2 transition-all",
                    user?.theme === "light" ? "border-indigo-500 bg-white/10" : "border-white/5 hover:border-white/10 bg-white/[0.02]"
                  )}
                >
                  <div className="h-20 w-full bg-white rounded-2xl flex items-center justify-center">
                    <Sun className="w-8 h-8 text-orange-400" />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-white">Cloudy Light</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Default White</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleUpdateTheme("dark")}
                  className={cn(
                    "flex flex-col gap-4 p-6 rounded-3xl border-2 transition-all",
                    user?.theme === "dark" ? "border-indigo-500 bg-white/10" : "border-white/5 hover:border-white/10 bg-white/[0.02]"
                  )}
                >
                  <div className="h-20 w-full bg-[#0D0D0E] border border-white/5 rounded-2xl flex items-center justify-center">
                    <Moon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-white">Midnight OLED</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Modern Dark</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
