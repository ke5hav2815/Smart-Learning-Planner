import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Circle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { Priority, TaskStatus } from "../types";
import { cn } from "../lib/utils";

export default function StudyPlanner() {
  const { tasks, subjects, addTask, updateTask, deleteTask } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all" | "overdue">("all");
  const [sortBy, setSortBy] = useState<"asc" | "desc">("asc");

  const [newTask, setNewTask] = useState({
    title: "",
    subjectId: "",
    priority: "Medium" as Priority,
    deadline: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    await addTask({
      ...newTask,
      status: "backlog"
    });
    setNewTask({
      title: "",
      subjectId: "",
      priority: "Medium",
      deadline: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
    });
    setIsAdding(false);
  };

  const filteredTasks = tasks
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      let matchesFilter = filter === "all" || t.status === filter;
      
      if (filter === "overdue") {
        const isOverdue = new Date(t.dueDate || t.deadline) < new Date() && t.status !== "completed";
        matchesFilter = isOverdue;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate || a.deadline).getTime();
      const dateB = new Date(b.dueDate || b.deadline).getTime();
      return sortBy === "asc" ? dateA - dateB : dateB - dateA;
    });

  const statusColumns: { label: string; status: TaskStatus }[] = [
    { label: "Backlog", status: "backlog" },
    { label: "In Progress", status: "in-progress" },
    { label: "Completed", status: "completed" }
  ];

  const getTaskForStatus = (status: TaskStatus) => {
    return filteredTasks.filter(t => t.status === status);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Focus Board</h2>
          <p className="text-slate-400 mt-1">Organize your academic workflow by status and priority.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setSortBy(sortBy === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
          >
            <ArrowUpDown className="w-3 h-3" />
            Sort: {sortBy === "asc" ? "Earliest" : "Latest"}
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch bg-white/[0.02] p-2 rounded-2xl border border-white/5">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search focus items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition text-white placeholder:text-slate-600 h-[48px] text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1 p-1">
          {["all", "overdue"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                filter === f 
                  ? "bg-white/10 text-white shadow-lg" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
        {statusColumns.map((col) => {
          const colTasks = getTaskForStatus(col.status);
          return (
            <div key={col.status} className="space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                    col.status === "backlog" ? "bg-slate-400" :
                    col.status === "in-progress" ? "bg-indigo-400" : "bg-emerald-400"
                  )} />
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{col.label}</h3>
                </div>
                <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>

              <div className="flex flex-col gap-4 min-h-[500px] p-2 rounded-2xl bg-black/10 border border-white/[0.02]">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task) => {
                    const subject = subjects.find(s => s.id === task.subjectId);
                    const isOverdue = new Date(task.dueDate || task.deadline) < new Date() && task.status !== "completed";
                    
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/5 shadow-sm group hover:border-white/10 transition-all relative overflow-hidden"
                      >
                        {isOverdue && (
                          <div className="absolute top-0 right-0 left-0 h-1 bg-red-500/50" />
                        )}

                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-wrap gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border",
                              task.priority === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                              task.priority === "Medium" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : 
                              "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            )}>
                              {task.priority}
                            </span>
                            {subject && (
                              <span 
                                className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-white/10"
                                style={{ backgroundColor: `${subject.color}10`, color: subject.color }}
                              >
                                {subject.name}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                // Cycle status
                                const statuses: TaskStatus[] = ["backlog", "in-progress", "completed"];
                                const currentIndex = statuses.indexOf(task.status);
                                const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                updateTask(task.id, { status: nextStatus });
                              }}
                              className="p-1.5 text-slate-500 hover:text-indigo-400 rounded-lg hover:bg-white/5"
                            >
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className={cn(
                          "text-sm font-bold text-white mb-2 leading-snug",
                          task.status === "completed" && "line-through opacity-50"
                        )}>{task.title}</h4>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                            isOverdue ? "text-red-400" : "text-slate-500"
                          )}>
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(task.dueDate || task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                          
                          <button 
                            onClick={() => updateTask(task.id, { 
                              status: task.status === "completed" ? "backlog" : "completed" 
                            })}
                            className={cn(
                              "p-1 rounded-full transition-all",
                              task.status === "completed" ? "text-emerald-400 scale-110" : "text-slate-700 hover:text-slate-400"
                            )}
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 fill-emerald-400/5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-20">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-500 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Empty Section</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding task */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAdding(false)} />
          <motion.form 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onSubmit={handleAddTask}
            className="relative bg-[#161618] border border-white/10 rounded-[2rem] p-10 w-full max-w-lg shadow-2xl space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white">New Study Task</h3>
              <p className="text-slate-400 text-sm mt-1">Fill in the details to schedule your next session.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve Calculus derivatives"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Link Subject</label>
                  <select
                    value={newTask.subjectId}
                    onChange={(e) => setNewTask({...newTask, subjectId: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white appearance-none"
                  >
                    <option value="" className="bg-[#161618]">General / No Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#161618]">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as Priority})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white appearance-none"
                  >
                    <option value="High" className="bg-[#161618]">High Priority</option>
                    <option value="Medium" className="bg-[#161618]">Medium Priority</option>
                    <option value="Low" className="bg-[#161618]">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-6 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20"
              >
                Create Task
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
