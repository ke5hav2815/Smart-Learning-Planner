import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Trash2, 
  FileText,
  Clock,
  ChevronRight,
  MoreVertical,
  BookOpen,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { useAppContext } from "../context/AppContext";
import { Note } from "../types";
import { cn } from "../lib/utils";

export default function Notes() {
  const { notes, subjects, addNote, updateNote, deleteNote } = useAppContext();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");

  const activeNote = notes.find(n => n.id === selectedNoteId);

  const handleCreateNote = async () => {
    const newNote = {
      title: "New Note",
      content: "",
      subjectId: subjects[0]?.id || ""
    };
    await addNote(newNote);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Sidebar - Note List */}
      <div className="w-80 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder:text-slate-500"
          />
        </div>
        
        <button 
          onClick={handleCreateNote}
          className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className={cn(
                "w-full text-left p-5 rounded-2xl border transition-all duration-200",
                selectedNoteId === note.id 
                  ? "bg-white/10 border-white/10 shadow-sm ring-1 ring-white/10" 
                  : "bg-transparent border-transparent hover:bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className={cn("w-4 h-4", selectedNoteId === note.id ? "text-indigo-400" : "text-slate-500")} />
                <h4 className={cn("font-bold truncate text-sm", selectedNoteId === note.id ? "text-white" : "text-slate-300")}>
                  {note.title || "Untitled"}
                </h4>
              </div>
              <p className="text-xs truncate opacity-40 mb-4">{note.content || "Empty content..."}</p>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-black opacity-30">
                <Clock className="w-3 h-3" />
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Viewer */}
      <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-sm backdrop-blur-sm relative">
        {activeNote ? (
          <>
            <div className="px-8 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    className="text-2xl font-bold text-white w-full bg-transparent outline-none border-b border-indigo-500/50 pb-1"
                    onBlur={() => setIsEditing(false)}
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="text-2xl font-bold text-white tracking-tight cursor-pointer hover:text-indigo-300 transition"
                    onClick={() => setIsEditing(true)}
                  >
                    {activeNote.title || "Untitled Note"}
                  </h3>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Clock className="w-3 h-3" />
                    Edited {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-indigo-400 font-black bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                    <BookOpen className="w-3 h-3" />
                    {subjects.find(s => s.id === activeNote.subjectId)?.name || "General"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 prose prose-invert prose-indigo max-w-none prose-lg">
              {isEditing ? (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                  placeholder="Start writing here... (Markdown supported)"
                  className="w-full h-full outline-none resize-none bg-transparent text-slate-300 leading-relaxed custom-scrollbar placeholder:text-slate-800"
                />
              ) : (
                <div 
                  className="cursor-text min-h-full text-slate-300 leading-loose" 
                  onClick={() => setIsEditing(true)}
                >
                  {activeNote.content ? (
                    <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-700 italic py-20 border-2 border-dashed border-white/5 rounded-3xl">
                      <Sparkles className="w-10 h-10 mb-4 opacity-10" />
                      Click to start writing content...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-600">
              <div className="flex gap-6">
                <span>Chars: {activeNote.content.length}</span>
                <span>Words: {activeNote.content.split(/\s+/).filter(Boolean).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Synced to Cloud
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-6 p-12 text-center">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-inner">
              <FileText className="w-10 h-10 opacity-30" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Note</h3>
              <p className="max-w-xs text-slate-400">Choose a note from the library or create a fresh one to begin your study session.</p>
            </div>
            <button 
              onClick={handleCreateNote}
              className="mt-4 px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition"
            >
              Start New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
