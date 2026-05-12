import React from "react";
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Zap,
  ChevronRight,
  Plus,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const data = [
  { name: "Mon", hours: 4, tasks: 3 },
  { name: "Tue", hours: 6, tasks: 5 },
  { name: "Wed", hours: 3, tasks: 2 },
  { name: "Thu", hours: 7, tasks: 8 },
  { name: "Fri", hours: 5, tasks: 4 },
  { name: "Sat", hours: 8, tasks: 6 },
  { name: "Sun", hours: 5, tasks: 4 },
];

export default function Dashboard() {
  const { tasks, sessions, subjects } = useAppContext();
  const { user } = useAuth();

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status !== "completed").length;
  const totalStudyTime = sessions.reduce((acc, s) => acc + s.duration, 0);

  const [aiTips, setAiTips] = React.useState<string[]>([
    "Take a 15 min break now to boost retention.",
    "You're falling behind in Mathematics.",
    "Study period today: 4 PM - 6 PM is ideal."
  ]);
  const [suggestedPlan, setSuggestedPlan] = React.useState<any[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [newTask, setNewTask] = React.useState({
    title: "",
    priority: "Medium" as any,
    dueDate: new Date().toISOString().split("T")[0]
  });
  const { addTask } = useAppContext();

  const generateAIPlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks, sessions, subjects })
      });
      const data = await response.json();
      if (data.recommendations) {
        setAiTips(data.recommendations.map((r: any) => r.content));
      }
      if (data.plan) {
        setSuggestedPlan(data.plan);
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyPlan = async () => {
    for (const task of suggestedPlan) {
      await addTask({
        title: task.title,
        description: task.description,
        subjectId: task.subjectId,
        priority: task.priority,
        dueDate: task.dueDate,
        deadline: new Date().toISOString().split("T")[0],
        status: "backlog"
      });
    }
    setSuggestedPlan([]);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user?.displayName}!</h2>
          <p className="text-slate-400 mt-1">You've completed {completedTasks}/{tasks.length} goals today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              // We'll navigate to planner and open adding modal if possible, 
              // but since they are different tabs, I'll just add a simple task creation modal here too
              setIsAddingTask(true);
            }}
            className="hidden md:flex items-center gap-2 bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20"
          >
            <Zap className="w-4 h-4" />
            Quick Add Task
          </button>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-sm font-medium h-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>AI Active Insights</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Study Hours", value: `${Math.round(totalStudyTime / 60)}h`, sub: "+12% from last week", color: "text-indigo-400" },
          { label: "Tasks Finished", value: `${completedTasks}/${tasks.length}`, sub: `${pendingTasks} remaining today`, color: "text-white" },
          { label: "Productivity", value: `${user?.productivityScore || 0}%`, sub: "Daily target progress", color: "text-white", bar: true },
          { label: "Next Milestone", value: "3 Days", sub: "Exam preparation", color: "text-orange-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm"
          >
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</h3>
            {stat.bar ? (
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${user?.productivityScore || 0}%` }}></div>
              </div>
            ) : (
              <p className={cn("text-xs mt-3 font-medium", stat.color.includes("indigo") ? "text-indigo-400" : "text-slate-500")}>
                {stat.sub}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0">
        {/* Weekly Chart */}
        <div className="lg:col-span-8 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-bold text-white tracking-tight">Weekly Progress</h3>
            <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs rounded-lg bg-white/10 text-white font-bold">Week</button>
              <button className="px-3 py-1 text-xs rounded-lg text-slate-400 font-bold hover:text-white">Month</button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: "#64748b", fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: "#64748b", fontSize: 10, fontWeight: 700}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#161618", 
                    borderRadius: "16px", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)",
                    color: "#fff"
                  }} 
                  itemStyle={{ color: "#818cf8" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden flex-1 shadow-lg">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 blur-3xl" />
            <div className="flex items-center gap-2 mb-6 uppercase tracking-widest text-[10px] font-black text-indigo-400">
              <Sparkles className="w-4 h-4" />
              Smart Suggestion
            </div>
            
            <div className="space-y-6">
              {suggestedPlan.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-white text-sm font-bold border-b border-white/10 pb-2">Suggested Plan:</h4>
                  {suggestedPlan.map((task, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-white text-xs font-bold">{task.title}</p>
                      <p className="text-slate-400 text-[10px] mt-1 line-clamp-1">{task.description}</p>
                    </div>
                  ))}
                  <button 
                    onClick={applyPlan}
                    className="w-full py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                  >
                    Add Plan to Tasks
                  </button>
                </div>
              ) : (
                aiTips.slice(0, 2).map((tip, i) => (
                  <p key={i} className="text-white font-medium leading-relaxed">
                    {tip}
                  </p>
                ))
              )}
            </div>

            <button 
              onClick={generateAIPlan}
              disabled={isGenerating}
              className="mt-8 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transition-colors disabled:opacity-50"
            >
              {isGenerating ? "Analyzing..." : "Generate Plan"}
              {!isGenerating && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase leading-none">Up Next</div>
              <p className="text-sm text-slate-300">Study <span className="text-white font-semibold">Physics</span> (8 PM)</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setIsAddingTask(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#161618] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">Quick Add Task</h3>
                  <p className="text-slate-400 text-xs mt-1">Easily add tasks to your study planner.</p>
                </div>
                <button 
                  onClick={() => setIsAddingTask(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Complete assignment..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm appearance-none"
                    >
                      <option value="High" className="bg-[#161618]">High</option>
                      <option value="Medium" className="bg-[#161618]">Medium</option>
                      <option value="Low" className="bg-[#161618]">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!newTask.title) return;
                  await addTask({
                    ...newTask,
                    status: "backlog",
                    deadline: new Date().toISOString().split("T")[0]
                  });
                  setNewTask({
                    title: "",
                    priority: "Medium",
                    dueDate: new Date().toISOString().split("T")[0]
                  });
                  setIsAddingTask(false);
                }}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                Add to Planner
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
