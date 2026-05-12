import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Volume2, 
  VolumeX,
  History,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatTime, cn } from "../lib/utils";
import { useAppContext } from "../context/AppContext";

export default function Pomodoro() {
  const { addSession, sessions } = useAppContext();
  const [mode, setMode] = useState<"focus" | "short-break" | "long-break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [muted, setMuted] = useState(false);

  const settings = {
    focus: 25 * 60,
    "short-break": 5 * 60,
    "long-break": 15 * 60,
  };

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    if (!muted) {
      new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play();
    }
    
    await addSession({
      duration: settings[mode] / 60,
      type: mode,
    });

    if (mode === "focus") {
      setMode("short-break");
      setTimeLeft(settings["short-break"]);
    } else {
      setMode("focus");
      setTimeLeft(settings.focus);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode]);
  };

  const switchMode = (newMode: typeof mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(settings[newMode]);
  };

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Focus Lab</h2>
        <p className="text-slate-400 mt-1">Deep work sessions with the Pomodoro technique.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div 
              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${(timeLeft / settings[mode]) * 100}%` }}
            />
          </div>

          {/* Mode Selector */}
          <div className="flex bg-white/5 p-1 rounded-2xl mb-12 border border-white/10">
            {[
              { id: "focus", label: "Focus", icon: Brain },
              { id: "short-break", label: "Break", icon: Coffee },
              { id: "long-break", label: "Deep Rest", icon: History },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  mode === m.id 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="w-64 h-64 rounded-full border-8 border-white/5 flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="100 100"
                  className="text-indigo-500/10"
                />
              </svg>
              <div className="text-center">
                <span className="text-7xl font-black text-white tracking-tighter tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
                  {mode.replace("-", " ")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-12">
            <button
              onClick={resetTimer}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={toggleTimer}
              className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center text-white transition-all shadow-xl",
                isActive 
                  ? "bg-slate-800 hover:bg-slate-700 shadow-slate-900/50" 
                  : "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30"
              )}
            >
              {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button
              onClick={() => setMuted(!muted)}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden flex-1 shadow-lg">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 blur-3xl"></div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentSessions.length > 0 ? (
                recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        s.type === "focus" ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {s.type === "focus" ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white capitalize">{s.type.replace("-", " ")}</p>
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                          {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 font-black">
                      <span className="text-sm">{s.duration}m</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8 text-sm">No recent sessions found.</p>
              )}
            </div>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Focus Score</h3>
            <div className="flex items-center justify-between text-white font-bold mb-2">
              <span>Goal Progress</span>
              <span>2/8 Sessions</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-1/4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
