"use client";

import { useEffect, useState, useRef } from "react";
import { Shield, Users, Activity, HeartHandshake, AlertTriangle, Globe, Zap, Brain, ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";

function CountUp({ target, duration = 2000, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const inc = target / steps;
        let curr = 0;
        const timer = setInterval(() => {
          curr += inc;
          if (curr >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(curr));
        }, duration / steps);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const router = useRouter();
  const { setCurrentUser, installMockData } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    installMockData();
  }, [installMockData]);

  const loginAs = (role: string) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) { setCurrentUser(user); router.push(`/dashboard/${role}`); }
  };

  if (!mounted) return null;

  const roles = [
    {
      id: "victim",
      label: "Report Emergency",
      sublabel: "Affected Community",
      icon: AlertTriangle,
      color: "#ff4d4f",
      bg: "from-red-950/60 to-transparent",
      border: "border-red-500/30 hover:border-red-500/70",
      glow: "shadow-red-500/20",
      desc: "Report your needs, trigger panic alerts, and track help in real-time.",
    },
    {
      id: "volunteer",
      label: "Join as Volunteer",
      sublabel: "Respond & Help",
      icon: HeartHandshake,
      color: "#22c55e",
      bg: "from-green-950/60 to-transparent",
      border: "border-green-500/30 hover:border-green-500/70",
      glow: "shadow-green-500/20",
      desc: "Receive AI-matched tasks, navigate to victims, and track your impact.",
    },
    {
      id: "ngo",
      label: "NGO Login",
      sublabel: "Organization Dashboard",
      icon: Users,
      color: "#eab308",
      bg: "from-yellow-950/60 to-transparent",
      border: "border-yellow-500/30 hover:border-yellow-500/70",
      glow: "shadow-yellow-500/20",
      desc: "Manage inventory, coordinate resources, and share across organizations.",
    },
    {
      id: "government",
      label: "Authority Login",
      sublabel: "Command Center",
      icon: Shield,
      color: "#1677ff",
      bg: "from-blue-950/60 to-transparent",
      border: "border-blue-500/30 hover:border-blue-500/70",
      glow: "shadow-blue-500/20",
      desc: "Central oversight, broadcast alerts, and run disaster simulations.",
    },
  ];

  const features = [
    { icon: Brain, title: "AI Triage Engine", desc: "Automatically scores and prioritizes incoming requests using severity, affected count, and resource proximity.", color: "#1677ff" },
    { icon: Globe, title: "Real-Time Sync", desc: "BroadcastChannel-powered live updates across all roles — no page reload required.", color: "#22c55e" },
    { icon: Zap, title: "Panic Button", desc: "Instant one-touch SOS with 5-second confirm, GPS tagging, and multi-channel alerting.", color: "#ff4d4f" },
    { icon: AlertTriangle, title: "Risk Prediction", desc: "Pre-built scenario engine simulating 50+ real-world flood, earthquake, and drought events.", color: "#eab308" },
  ];

  return (
    <div className="min-h-screen bg-[#0b1220] text-white overflow-x-hidden relative">
      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-emerald-600/8 rounded-full blur-[100px]" />
      </div>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 border-b border-white/5 bg-[#0b1220]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">AURA</span>
          <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">Relief HQ</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#roles" className="hover:text-white transition-colors">Dashboards</a>
          <a href="#stats" className="hover:text-white transition-colors">Live Stats</a>
        </div>
        <button onClick={() => loginAs("government")} className="text-sm font-bold bg-[#1677ff] hover:bg-blue-500 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          Enter System
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 px-6">
        {/* Grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Disaster Response Active
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
            <span className="bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent">Coordinate Relief.</span>
            <br />
            <span className="bg-gradient-to-r from-[#1677ff] via-blue-400 to-emerald-400 bg-clip-text text-transparent">Save Lives.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            An AI-powered emergency coordination platform connecting victims, volunteers, NGOs, and government authorities in real-time during disasters.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button onClick={() => loginAs("victim")} className="group flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-red-500/30 active:scale-95">
              <AlertTriangle size={18} />
              Report Emergency
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => loginAs("volunteer")} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all backdrop-blur active:scale-95">
              <HeartHandshake size={18} className="text-emerald-400" />
              Join as Volunteer
            </button>
          </div>
        </div>

        <a href="#stats" className="absolute bottom-10 animate-bounce text-slate-500 hover:text-white transition-colors">
          <ChevronDown size={28} />
        </a>
      </section>

      {/* ─── LIVE STATS ─── */}
      <section id="stats" className="py-20 px-6 relative">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Disasters", value: 12, suffix: "", color: "#ff4d4f" },
            { label: "Volunteers Online", value: 3847, suffix: "+", color: "#22c55e" },
            { label: "Resources Deployed", value: 2104, suffix: "", color: "#1677ff" },
            { label: "Lives Impacted", value: 48200, suffix: "+", color: "#eab308" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel glass-panel-hover rounded-2xl p-6 text-center border border-white/10 transition-all">
              <div className="text-4xl font-black mb-1" style={{ color: stat.color }}>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-4">Platform Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-black">Built for speed. Designed for crisis.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10 flex flex-col gap-4 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${f.color}18`, border: `1px solid ${f.color}40` }}>
                  <f.icon size={24} style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLE SELECTION ─── */}
      <section id="roles" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-4">Select Your Role</p>
            <h2 className="text-3xl md:text-4xl font-black">One platform, four dashboards.</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Each role gets a purpose-built interface with the exact tools they need — no more, no less.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => loginAs(r.id)}
                className={`group text-left glass-panel rounded-2xl p-8 border ${r.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${r.glow} relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${r.bg} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10 flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${r.color}20`, border: `1px solid ${r.color}40` }}>
                        <r.icon size={24} style={{ color: r.color }} />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-white">{r.label}</h3>
                        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: r.color }}>{r.sublabel}</p>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{r.desc}</p>
                  </div>
                  <ArrowRight size={20} className="mt-2 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-10 text-center text-xs text-slate-600">
        <p>AURA Disaster Relief Platform · Built for <span className="text-blue-400 font-bold">Hack-a-Sprint 2025</span> · Real-time sync enabled</p>
      </footer>
    </div>
  );
}
