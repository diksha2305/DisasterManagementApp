"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { NeedType, UrgencyLevel, Need } from '@/lib/types';
import { AlertCircle, Activity, ShieldAlert, Navigation } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { EmergencyReportFlow } from '@/components/forms/EmergencyReportFlow';

export default function VictimDashboard() {
  const { currentUser, needs, addNeed, volunteers } = useAppStore();
  
  const [panicActive, setPanicActive] = useState(false);
  const [panicCountdown, setPanicCountdown] = useState(5);
  
  // My Needs
  const myNeeds = needs.filter(n => n.reported_by === currentUser?.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Handle Panic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (panicActive && panicCountdown > 0) {
       timer = setTimeout(() => setPanicCountdown(p => p - 1), 1000);
       // Audio feedback
       if (typeof window !== 'undefined') {
         const audio = new Audio('/alarm.mp3'); // Mock audio file exist
         audio.volume = 0.2;
         audio.play().catch(e => console.log('Audio restricted by browser policy'));
       }
    } else if (panicActive && panicCountdown === 0) {
      // Trigger critical request
      const panicNeed: Need = {
        id: `need_${Date.now()}`,
        reported_by: currentUser?.id || 'vic1',
        need_type: 'rescue',
        urgency_level: 99,
        urgency_label: 'critical',
        people_affected: 1,
        description: 'PANIC BUTTON PRESSED. IMMEDIATE HELP REQUIRED.',
        location: currentUser?.location || { lat: 26.90, lng: 75.78 },
        status: 'pending',
        triage_score: 99,
        created_at: new Date().toISOString()
      };
      addNeed(panicNeed);
      setPanicActive(false);
      setPanicCountdown(5);
    }
    return () => clearTimeout(timer);
  }, [panicActive, panicCountdown]);

  return (
    <DashboardLayout role="victim">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto">
        
        {/* LEFT COL: PANIC & NEW REQUEST form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* PANIC BUTTON */}
          <div className="glass-panel p-6 rounded-3xl border-2 border-[var(--color-brand-primary)]/40 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
            {panicActive && (
               <div className="absolute inset-0 bg-red-600/30 animate-pulse" />
            )}
            
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#E24B4A] mb-4">Emergency</h2>
            
            <button 
              onMouseDown={() => setPanicActive(true)}
              onMouseUp={() => { if(panicCountdown > 0) { setPanicActive(false); setPanicCountdown(5); }}}
              onMouseLeave={() => { if(panicCountdown > 0) { setPanicActive(false); setPanicCountdown(5); }}}
              onTouchStart={() => setPanicActive(true)}
              onTouchEnd={() => { if(panicCountdown > 0) { setPanicActive(false); setPanicCountdown(5); }}}
              className={clsx(
                "w-32 h-32 rounded-full shadow-[0_0_50px_rgba(226,75,74,0.6)] flex items-center justify-center transition-all duration-100",
                panicActive ? "bg-red-700 scale-95" : "bg-[#E24B4A] hover:bg-red-500 hover:scale-105"
              )}
            >
              <ShieldAlert className="w-16 h-16 text-white" />
            </button>
            
            <div className="mt-6 font-bold text-sm h-6">
              {panicActive 
                ? <span className="text-red-400 animate-pulse">HOLD TO CONFIRM: {panicCountdown}s</span>
                : <span className="text-slate-400">Hold for 5 seconds to trigger global alert</span>
              }
            </div>
          </div>

          {/* REPORT NEED FORM */}
          {/* MULTI-STEP EMERGENCY FORM */}
          <EmergencyReportFlow onSuccess={() => {}} />
          
        </div>

        {/* RIGHT COL: MY STATUS & NEARBY HELP */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-[#10B981]" />
              Status of Your Requests
            </h2>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-[300px]">
              {myNeeds.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
                  No requests submitted yet. Stay safe.
                </div>
              ) : (
                myNeeds.map(need => (
                  <div key={need.id} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 items-center">
                        <span className={clsx(
                          "px-2 py-0.5 rounded-full text-xs font-bold uppercase",
                          need.urgency_label === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                          need.urgency_label === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        )}>
                          {need.urgency_label}
                        </span>
                        <span className="font-bold text-sm uppercase">{need.need_type}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(need.created_at))} ago</span>
                    </div>
                    
                    <p className="text-sm text-slate-300 font-medium mb-4">{need.people_affected} people affected</p>
                    
                    {/* Status Tracker */}
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2 relative">
                      <div 
                        className={clsx(
                          "h-full rounded-full transition-all duration-1000",
                          need.status === 'pending' ? 'w-1/4 bg-orange-400' :
                          need.status === 'accepted' ? 'w-1/2 bg-blue-400' :
                          need.status === 'in_progress' ? 'w-3/4 bg-[#10B981]' :
                          'w-full bg-emerald-500'
                        )}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className={need.status === 'pending' ? 'text-orange-400' : ''}>Pending</span>
                      <span className={need.status === 'accepted' ? 'text-blue-400' : ''}>Help Dispatched</span>
                      <span className={need.status === 'in_progress' ? 'text-[#10B981]' : ''}>Arriving</span>
                      <span className={need.status === 'completed' ? 'text-emerald-500' : ''}>Resolved</span>
                    </div>

                    {need.status === 'accepted' || need.status === 'in_progress' ? (
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                         <div className="text-xs">
                           <p className="text-slate-400 font-semibold mb-0.5">Assigned Volunteer</p>
                           <p className="font-bold text-[#10B981]">Rajesh Kumar (Medical)</p>
                         </div>
                         <div className="text-xs text-right">
                           <p className="text-slate-400 font-semibold mb-0.5">ETA</p>
                           <p className="font-bold text-white">8 minutes away</p>
                         </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
