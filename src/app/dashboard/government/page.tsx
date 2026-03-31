"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Need, Announcement } from '@/lib/types';
import { Activity, Shield, Users, Map, AlertTriangle, Send, MoreVertical, X, Settings2 } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { LiveMap } from '@/components/Map';
import { TriageVolumeChart } from '@/components/dashboard/TriageVolumeChart';

export default function GovernmentDashboard() {
  const { currentUser, needs, volunteers, ngos, inventory, addAnnouncement, updateNeed } = useAppStore();
  const [activeTab, setActiveTab] = useState<'requests' | 'map'>('requests');
  const [mounted, setMounted] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastUrgency, setBroadcastUrgency] = useState<'info' | 'warning' | 'critical'>('info');

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const criticalNeeds = needs.filter(n => n.urgency_label === 'critical');
  const activeVolunteers = volunteers.filter(v => v.online);
  const fulfilledRequests = needs.filter(n => n.status === 'completed');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    
    addAnnouncement({
      id: `alert_${Date.now()}`,
      created_by: currentUser?.id || 'govt',
      message: broadcastMessage,
      urgency: broadcastUrgency,
      target_audience: 'all',
      created_at: new Date().toISOString()
    });
    setBroadcastMessage('');
  };

  const handleForceComplete = (id: string) => {
    updateNeed(id, { status: 'completed', completed_at: new Date().toISOString() });
  };

  return (
    <DashboardLayout role="government">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto h-full">
        
        {/* TOP METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between col-span-2 md:col-span-1 border-b-4 border-blue-500">
             <div>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Active Response</p>
               <p className="text-2xl font-bold flex items-center gap-2">
                 {activeVolunteers.length}
                 <span className="text-xs font-normal text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">vols</span>
               </p>
             </div>
             <Shield className="w-8 h-8 text-blue-500/50" />
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center justify-between col-span-2 md:col-span-1 border-b-4 border-[#EF9F27]">
             <div>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">NGO Partners</p>
               <p className="text-2xl font-bold flex items-center gap-2">
                 {ngos.length}
                 <span className="text-xs font-normal text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">orgs</span>
               </p>
             </div>
             <Users className="w-8 h-8 text-[#EF9F27]/50" />
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center justify-between col-span-2 md:col-span-1 border-b-4 border-emerald-500">
             <div>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Fulfilled Needs</p>
               <p className="text-2xl font-bold flex items-center gap-2 text-emerald-400">
                 {fulfilledRequests.length}
               </p>
             </div>
             <Activity className="w-8 h-8 text-emerald-500/50" />
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center justify-between col-span-2 md:col-span-1 border-b-4 border-red-500">
             <div>
               <p className="text-[10px] text-red-300 uppercase tracking-widest mb-1">Critical Unmet</p>
               <p className="text-2xl font-bold flex items-center gap-2 text-red-500">
                 {criticalNeeds.filter(n => n.status !== 'completed').length}
               </p>
             </div>
             <AlertTriangle className="w-8 h-8 text-red-500/50" />
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center justify-between col-span-4 md:col-span-1 bg-gradient-to-br from-blue-900/40 to-[#0F1117]">
             <div>
               <p className="text-[10px] text-blue-300 uppercase tracking-widest mb-1">Impact Score</p>
               <p className="text-2xl font-bold font-mono tracking-tight flex items-center gap-1">
                 8,734
                 <span className="text-[10px] text-slate-400">lives</span>
               </p>
             </div>
          </div>
        </div>

        {/* MAIN SPLIT */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
           
           {/* LEFT COLUMN: Map & Alerts */}
           <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* BROADCAST BOX */}
              <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-slate-200">
                   <AlertTriangle size={16} className="text-red-400" /> System Broadcast
                </h3>
                
                <form onSubmit={handleBroadcast} className="flex gap-2">
                   <select 
                     value={broadcastUrgency} 
                     onChange={(e) => setBroadcastUrgency(e.target.value as any)}
                     className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-32 text-center"
                   >
                     <option value="info">Info</option>
                     <option value="warning">Warn</option>
                     <option value="critical">Critical</option>
                   </select>

                   <input 
                     type="text" 
                     placeholder="Type official alert message (max 280 chars)..." 
                     className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                     value={broadcastMessage}
                     onChange={(e) => setBroadcastMessage(e.target.value)}
                     maxLength={280}
                   />
                   
                   <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl px-6 py-2 transition-colors active:scale-95 flex items-center gap-2 text-sm whitespace-nowrap">
                     <Send size={16} /> Broadcast
                   </button>
                </form>
              </div>

              {/* COMMAND MAP */}
              <div className="glass-panel border-white/10 rounded-2xl p-2 flex-1 relative min-h-[400px]">
                {/* Overlayer control to toggle layers */}
                <div className="absolute top-4 left-4 z-10 glass-panel border border-white/20 rounded-xl p-2 flex flex-col gap-1 text-[10px] font-bold uppercase tracking-widest bg-[#0F1117]/90 text-slate-400 shadow-2xl backdrop-blur-3xl">
                   <div className="px-2 py-1 flex items-center justify-between gap-4">
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Needs</span>
                     <span className="text-white bg-red-500/30 px-1 rounded">{needs.filter(n=>n.status!=='closed').length}</span>
                   </div>
                   <div className="px-2 py-1 flex items-center justify-between gap-4">
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Vols</span>
                     <span className="text-white bg-emerald-500/30 px-1 rounded">{volunteers.length}</span>
                   </div>
                   <div className="px-2 py-1 flex items-center justify-between gap-4">
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /> NGOs</span>
                     <span className="text-white bg-orange-500/30 px-1 rounded">{ngos.length}</span>
                   </div>
                </div>

                <LiveMap needs={needs} volunteers={volunteers} ngos={ngos} />
              </div>

           </div>

           {/* RIGHT COLUMN: Triage List & Tables */}
           <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="glass-panel rounded-2xl p-5 border border-white/10 flex-1 flex flex-col max-h-[700px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#E24B4A]">Live Triage Queue</h3>
                  <button className="text-slate-400 hover:text-white"><Settings2 size={16} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  {[...needs].sort((a,b) => (b.triage_score || 0) - (a.triage_score || 0)).map(need => (
                    <div key={need.id} className={clsx(
                      "p-3 rounded-xl border flex flex-col relative overflow-hidden group hover:bg-white/5 transition-colors cursor-default",
                      need.status === 'completed' ? 'border-emerald-500/20 opacity-60' :
                      need.urgency_label === 'critical' ? 'bg-red-900/20 border-red-500/40' :
                      need.urgency_label === 'high' ? 'bg-orange-950/20 border-orange-500/20' :
                      'border-white/5'
                    )}>
                       {/* Priority strip */}
                       <div className={clsx("absolute top-0 bottom-0 left-0 w-1",
                          need.urgency_label === 'critical' ? 'bg-red-500' :
                          need.urgency_label === 'high' ? 'bg-orange-500' :
                          'bg-blue-500'
                       )} />
                       
                       <div className="flex justify-between items-start pl-2">
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold uppercase truncate max-w-[120px]">{need.need_type} Need</span>
                             <span className="text-[10px] text-slate-400 border border-slate-700 px-1 rounded uppercase tracking-wider">{need.status.replace('_',' ')}</span>
                           </div>
                           <p className="text-sm text-slate-300 font-medium truncate max-w-[200px]">{need.people_affected} affected at loc {need.location.lat.toFixed(2)}</p>
                         </div>
                         
                         <div className="text-right flex flex-col items-end gap-1">
                           <span className={clsx("font-mono font-bold text-sm bg-black/40 px-2 rounded",
                             need.triage_score && need.triage_score >= 80 ? 'text-red-400' : 'text-slate-300'
                           )}>
                             {need.triage_score || 50}/100
                           </span>
                           <span className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(need.created_at))}</span>
                         </div>
                       </div>
                       
                       {/* Government Actions */}
                       <div className="mt-3 pt-3 border-t border-white/5 pl-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {need.status !== 'completed' && (
                           <button onClick={() => handleForceComplete(need.id)} className="flex-1 bg-white/10 hover:bg-[#10B981] hover:text-white rounded py-1.5 text-xs font-bold transition-colors">
                             Force Resolve
                           </button>
                         )}
                         <button className="flex-1 bg-white/10 hover:bg-red-500 rounded py-1.5 text-xs font-bold transition-colors">
                           Re-route / Escal.
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[350px]">
                 <TriageVolumeChart />
              </div>

           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
