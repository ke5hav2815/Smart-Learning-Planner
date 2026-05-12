import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { useAppContext } from "../context/AppContext";
import { 
  Activity, 
  Target, 
  Clock, 
  TrendingUp, 
  Zap 
} from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function Analytics() {
  const { tasks, sessions, subjects } = useAppContext();

  const totalStudyTime = sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const taskStats = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: tasks.length - completedTasks },
  ];

  const subjectData = subjects.map(s => ({
    name: s.name,
    sessions: sessions.filter(sess => sess.subjectId === s.id).length
  })).filter(d => d.sessions > 0);

  // Group sessions by day for the line chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const activityData = last7Days.map(date => {
    const daySessions = sessions.filter(s => s.timestamp.startsWith(date));
    return {
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      minutes: daySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0)
    };
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Learning Analytics</h2>
          <p className="text-slate-400 mt-1">Deep dive into your study patterns and progress.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-sm font-medium">
          <Activity className="w-4 h-4 ml-1" />
          <span>Real-time Insights Active</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Clock, label: "Total Study Time", value: `${Math.round(totalStudyTime / 60)}h ${totalStudyTime % 60}m`, color: "text-indigo-400" },
          { icon: Target, label: "Completion Rate", value: `${taskCompletionRate}%`, color: "text-emerald-400" },
          { icon: Zap, label: "Current Streak", value: "5 Days", color: "text-orange-400" },
          { icon: TrendingUp, label: "Productivity", value: "84%", color: "text-violet-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm">
            <div className={`p-2 bg-white/5 rounded-lg w-fit mb-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Study Activity Over Time */}
        <div className="lg:col-span-2 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white">Study Activity</h3>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Last 7 Days</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e21', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject wise Distribution */}
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white mb-6">Subject Mix</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData.length > 0 ? subjectData : [{ name: "No Data", sessions: 1 }]}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="sessions"
                >
                  {subjectData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e1e21', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            {subjectData.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-bold text-slate-400 capitalize">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Completion Pattern */}
        <div className="lg:col-span-3 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-8">Task Progression</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskStats} barSize={100}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}}
                />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#1e1e21', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
