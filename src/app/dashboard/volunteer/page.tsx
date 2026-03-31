"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Need, Volunteer } from '@/lib/types';
import { MapPin, Navigation, CheckCircle2, Award, Clock, HeartHandshake } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { LiveMap } from '@/components/Map';

export default function VolunteerDashboard() {
  const { currentUser, needs, updateNeed, volunteers } = useAppStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'map'>('tasks');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const me = volunteers.find(v => v.id === currentUser?.id) as Volunteer | undefined;

  // For MVP demo, all pending requests are "suggested", accepted requests are "my tasks"
  const pendingRequests = needs.filter(n => n.status === 'pending').sort((a,b) => b.triage_score! - a.triage_score!);
  const myTasks = needs.filter(n => ['accepted', 'in_progress'].includes(n.status) && n.assigned_to === currentUser?.id);
  const completedTasks = needs.filter(n => n.status === 'completed' && n.assigned_to === currentUser?.id);

  const handleStatusChange = (needId: string, currentStatus: string) => {
    let next: Need['status'] = 'accepted';
    if (currentStatus === 'pending') next = 'accepted';
    else if (currentStatus === 'accepted') next = 'in_progress';
    else if (currentStatus === 'in_progress') next = 'completed';
    
    updateNeed(needId, { 
      status: next, 
      assigned_to: currentUser?.id,
      ...(next === 'completed' ? { completed_at: new Date().toISOString() } : {})
    });
  };

  return (
    <DashboardLayout role="volunteer">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full">
        
        {/* STATS HEADER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-[var(--color-brand-success)]/30">
            <Award className="w-8 h-8 text-[var(--color-brand-success)]" />
            <div>
              <p className="text-xl font-bold">{me?.tasks_completed || completedTasks.length}</p>
              <p className="text-[10px] text-slate-400 uppercase">Tasks Done</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-[var(--color-brand-primary)]/30">
            <HeartHandshake className="text-[#E24B4A] w-8 h-8" />
            <div>
              <p className="text-xl font-bold">{me?.people_helped || completedTasks.reduce((acc, n)=>acc+n.people_affected, 0)}</p>
              <p className="text-[10px] text-slate-400 uppercase">People Helped</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
            <Clock className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-xl font-bold">12m</p>
              <p className="text-[10px] text-slate-400 uppercase">Avg Response</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/50">
               {me?.rating || 5.0}
             </div>
             <div>
               <p className="text-xl font-bold">Excellence</p>
               <p className="text-[10px] text-slate-400 uppercase">Badge Rating</p>
             </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'tasks' ? 'bg-[#10B981] text-white shadow-lg' : 'text-slate-400 hover:text-white')}
          >
            Mission Tasks
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'map' ? 'bg-[#10B981] text-white shadow-lg' : 'text-slate-400 hover:text-white')}
          >
            Live Map View
          </button>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 relative">
          {activeTab === 'map' ? (
             <div className="absolute inset-0 rounded-2xl overflow-hidden glass-panel border-white/10 border p-2">
               <LiveMap needs={needs} volunteers={volunteers} ngos={[]} center={me?.location} />
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
              
              {/* PENDING / MATCHED */}
              <div className="glass-panel border-white/10 rounded-2xl p-6 flex flex-col h-[600px]">
                <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                   <span>AI Matched Tasks <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full ml-2">{pendingRequests.length} pending</span></span>
                </h2>
                
                <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                  {pendingRequests.map(need => (
                    <div key={need.id} className="bg-white/5 p-4 rounded-xl border-l-4 font-sans hover:bg-white/10 transition-colors"
                      style={{ borderLeftColor: need.urgency_label === 'critical' ? '#E24B4A' : need.urgency_label==='high'? '#EF9F27' : '#3b82f6' }}
                    >
                       <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white">Match: {Math.max(60, need.triage_score! - 5)}%</span>
                         <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(need.created_at))} ago</span>
                       </div>
                       
                       <h3 className="font-bold text-lg mb-1 capitalize flex items-center gap-2">
                         {need.need_type} Emergency
                         <span className={clsx("text-xs px-2 rounded-full font-bold uppercase",
                            need.urgency_label === 'critical' ? 'text-red-400 bg-red-400/20' :
                            need.urgency_label === 'high' ? 'text-orange-400 bg-orange-400/20' :
                            'text-blue-400 bg-blue-400/20'
                         )}>{need.urgency_label}</span>
                       </h3>
                       
                       <p className="text-sm text-slate-300 mb-2 leading-relaxed">Affected: {need.people_affected} people. {need.description}</p>
                       
                       <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 bg-black/20 p-2 rounded-lg">
                         <MapPin size={12} className="text-[#10B981]" />
                         <span className="font-mono">Lat: {need.location.lat.toFixed(4)}, Lng: {need.location.lng.toFixed(4)}</span>
                         <span className="ml-auto text-white font-bold">~2.4 km</span>
                       </div>

                       <div className="flex gap-2">
                         <button onClick={() => handleStatusChange(need.id, 'pending')} className="flex-1 bg-white text-black font-bold py-2 rounded-lg hover:bg-slate-200 transition-colors active:scale-95 text-sm">
                           Accept Task
                         </button>
                         <button className="flex-1 bg-white/5 text-white font-bold py-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors active:scale-95 text-sm">
                           Reject
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MY ACTIVE TASKS */}
              <div className="glass-panel border-white/10 rounded-2xl p-6 flex flex-col h-[600px] border-t-4 border-t-[#10B981]">
                <h2 className="text-lg font-bold mb-4 text-[#10B981]">Active Missions ({myTasks.length})</h2>
                
                <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                  {myTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic text-sm">
                      <CheckCircle2 size={48} className="text-slate-700 mb-4 opacity-50" />
                      Ready for deployment. Accept a task to begin.
                    </div>
                  ) : (
                    myTasks.map(task => (
                      <div key={task.id} className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 font-sans">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                             {task.status.replace('_', ' ')}
                           </span>
                           <span className="text-[10px] text-emerald-400/50">ID: {task.id.slice(0,8)}</span>
                        </div>
                        
                        <h3 className="font-bold text-lg mb-1 capitalize text-emerald-50">
                          {task.need_type} Emergency
                        </h3>
                        
                        <p className="text-sm text-emerald-100/70 mb-4 leading-relaxed line-clamp-2">
                          {task.description || `${task.people_affected} people affected require immediate assistance.`}
                        </p>
                        
                        <div className="flex gap-2">
                          <button className="flex-none bg-black/30 p-3 rounded-xl hover:bg-white text-white hover:text-black transition-colors">
                            <Navigation size={18} />
                          </button>
                          
                          {task.status === 'accepted' ? (
                            <button onClick={() => handleStatusChange(task.id, 'accepted')} className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                              Mark &quot;In Progress&quot;
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(task.id, 'in_progress')} className="flex-1 bg-[#10B981] text-white font-bold py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                              Mark &quot;Completed&quot;
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
