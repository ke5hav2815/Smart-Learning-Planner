import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col md:flex-row overflow-hidden">
      {/* Brand Side */}
      <div className="md:w-1/2 bg-[#0D0D0E] p-8 md:p-24 flex flex-col justify-between relative overflow-hidden border-r border-white/5">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Planner AI</h1>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-[0.9] tracking-tighter mb-8">
              Smarter focus. <br />
              <span className="text-indigo-400">Better results.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-sm leading-relaxed">
              Your intelligent companion for organized study sessions, focus tracking, and personalized growth.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0D0D0E] bg-slate-800" />
            ))}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Joined by 10k+ scholars</p>
        </div>
      </div>

      {/* Auth Side */}
      <div className="md:w-1/2 bg-radial-at-tr from-[#161618] to-[#0A0A0B] flex items-center justify-center p-8 md:p-24 relative">
        <div className="w-full max-w-md space-y-12 relative z-10">
          <div className="space-y-4">
            <h3 className="text-4xl font-bold text-white tracking-tight">Enter Planner</h3>
            <p className="text-slate-400 leading-relaxed">Sign in with your educational account to sync your progress and unlock AI insights.</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-4 bg-white text-black px-6 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/5"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Connect via Google
            </button>
            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
              By connecting, you accept our <br />
              <span className="text-slate-400 underline decoration-slate-600">Privacy Protocols</span> & <span className="text-slate-400 underline decoration-slate-600">Terms of Use</span>
            </p>
          </div>

          {/* Featured Quote */}
          <div className="pt-12 border-t border-white/5">
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all" />
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                "The focus scores and AI recommendations helped me manage my finals week without burnout. Truly an essential tool."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">
                  SJ
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">UCLA Medical Scholar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
