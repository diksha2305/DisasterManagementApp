"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Activity, HeartHandshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";

export default function LandingPage() {
  const router = useRouter();
  const { setCurrentUser, installMockData } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize mock data on first load if empty
    installMockData();
  }, [installMockData]);

  const loginAs = (role: string) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      router.push(`/dashboard/${role}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--color-brand-bg)] relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-brand-primary)]/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-brand-warning)]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 text-center max-w-3xl mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Disaster Relief Coordination
        </h1>
        <p className="text-lg text-slate-400">
          Real-time AI-powered disaster response platform. Select your role to enter the dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
        {/* Victim Card */}
        <button
          onClick={() => loginAs("victim")}
          className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-2 group"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-brand-primary)]/20 flex items-center justify-center mb-6 border border-[var(--color-brand-primary)]/30 group-hover:scale-110 transition-transform">
            <Activity className="w-8 h-8 text-[#E24B4A]" />
          </div>
          <h2 className="text-xl font-bold mb-2">Affected Community</h2>
          <p className="text-slate-400 text-sm">
            Report needs, request emergency rescue, and activate the universal panic button to alert authorities.
          </p>
        </button>

        {/* Volunteer Card */}
        <button
          onClick={() => loginAs("volunteer")}
          className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-2 group"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-brand-success)]/20 flex items-center justify-center mb-6 border border-[var(--color-brand-success)]/30 group-hover:scale-110 transition-transform">
            <HeartHandshake className="w-8 h-8 text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold mb-2">Volunteer</h2>
          <p className="text-slate-400 text-sm">
            Receive matched tasks based on skills, update statuses, and navigate to those in need.
          </p>
        </button>

        {/* NGO Card */}
        <button
          onClick={() => loginAs("ngo")}
          className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-2 group"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-brand-warning)]/20 flex items-center justify-center mb-6 border border-[var(--color-brand-warning)]/30 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8 text-[#EF9F27]" />
          </div>
          <h2 className="text-xl font-bold mb-2">NGO / Organization</h2>
          <p className="text-slate-400 text-sm">
            Manage resources, distribute assets, coordinate cross-organization efforts seamlessly.
          </p>
        </button>

        {/* Government Card */}
        <button
          onClick={() => loginAs("government")}
          className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-2 group"
        >
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Government Authority</h2>
          <p className="text-slate-400 text-sm">
            Central oversight, global alerts, AI triage management, risk map view and pre-deployment.
          </p>
        </button>
      </div>
      
      <div className="absolute bottom-8 text-xs text-slate-600">
        MVP Built for Hack-a-Sprint • Real-time Sync Enabled
      </div>
    </div>
  );
}
