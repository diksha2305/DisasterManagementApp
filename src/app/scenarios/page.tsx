"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Play, Square, Timer, Activity, Users, CloudRainWind, Thermometer, Wind } from 'lucide-react';
import { MOCK_SCENARIOS } from '@/lib/mock-data';
import clsx from 'clsx';
import { LiveMap } from '@/components/Map';

export default function ScenarioDashboard() {
  const { needs, addNeed, setScenarios, scenarios } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [simulationTime, setSimulationTime] = useState(0); // minutes
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setMounted(true);
    setScenarios(MOCK_SCENARIOS);
  }, []);

  // Simulation Loop MVP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && activeScenario) {
      // Run simulation fast-forward 1 min every 1 second
      timer = setInterval(() => {
        setSimulationTime(prev => {
          const newTime = prev + 1;
          const scenario = scenarios.find(s => s.id === activeScenario);
          if (scenario) {
             // Inject requests based on timeline
             const timelineEvent = scenario.timeline.find(t => t.minute === newTime);
             if (timelineEvent) {
               // Inject random request from templates
               const template = scenario.requestTemplates[Math.floor(Math.random() * scenario.requestTemplates.length)];
               
               // Offset loc slightly for realism
               const offsetLat = (Math.random() - 0.5) * 0.05;
               const offsetLng = (Math.random() - 0.5) * 0.05;

               addNeed({
                 id: `scen_${Date.now()}`,
                 reported_by: 'system',
                 need_type: template.need,
                 urgency_label: template.urgency,
                 urgency_level: template.urgency === 'critical' ? 95 : 70,
                 people_affected: template.people,
                 description: `[SCENARIO EVENT: ${timelineEvent.event}] Automated distress call.`,
                 location: { lat: template.location[0] + offsetLat, lng: template.location[1] + offsetLng },
                 status: 'pending',
                 triage_score: template.urgency === 'critical' ? 92 : 65,
                 created_at: new Date().toISOString()
               });
             }
          }
          return newTime;
        });
      }, 1000); 
    }
    return () => clearInterval(timer);
  }, [isRunning, activeScenario, addNeed, scenarios]);

  if (!mounted) return null;

  const handleStart = (id: string) => {
    setActiveScenario(id);
    setSimulationTime(0);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setActiveScenario(null);
    setSimulationTime(0);
  };

  const currentScenario = scenarios.find(s => s.id === activeScenario);

  return (
    <DashboardLayout role="government">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full pb-10">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Scenario Simulation Engine
            </h1>
            <p className="text-slate-400">Inject 50+ real-world disaster conditions to evaluate system readiness</p>
          </div>
          
          {isRunning && (
            <div className="glass-panel border-red-500/50 bg-red-500/10 px-6 py-3 rounded-full flex items-center gap-4">
               <div className="flex items-center gap-2 text-red-400 animate-pulse">
                 <div className="w-3 h-3 bg-red-500 rounded-full" />
                 <span className="font-bold tracking-widest uppercase text-sm">Live Sim</span>
               </div>
               <div className="font-mono text-xl font-bold">
                 T+ {String(Math.floor(simulationTime/60)).padStart(2,'0')}:{String(simulationTime%60).padStart(2,'0')} min
               </div>
               <button onClick={handleStop} className="ml-4 bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-colors">
                 <Square fill="currentColor" size={16} />
               </button>
            </div>
          )}
        </div>

        {/* SCENARIO GRID */}
        {!isRunning ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {scenarios.map(s => (
               <div key={s.id} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-start border border-white/10 relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/40 transition-colors" />
                 
                 <div className="flex items-center justify-between w-full mb-4 z-10">
                   <span className={clsx("px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-widest",
                     s.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-400'
                   )}>
                     Level: {s.severity}
                   </span>
                   <span className="bg-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                     {s.disasterType}
                   </span>
                 </div>
                 
                 <h2 className="text-xl font-bold mb-2 z-10">{s.name}</h2>
                 <p className="text-slate-400 text-sm mb-6 z-10 h-10">{s.description}</p>
                 
                 <div className="flex gap-4 mb-6 z-10">
                   <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold bg-black/20 px-2 py-1 rounded">
                     <Users size={14} className="text-[#10B981]" /> {s.affectedPeople.toLocaleString()} Impacted
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold bg-black/20 px-2 py-1 rounded">
                     <Timer size={14} className="text-blue-400" /> 60m Duration
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => handleStart(s.id)}
                   className="w-full bg-[#10B981] hover:bg-emerald-500 text-white font-bold py-3 text-sm rounded-xl flex items-center justify-center gap-2 transition-all z-10 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                 >
                   <Play size={16} fill="currentColor" /> Initialize Scenario
                 </button>
               </div>
             ))}

             {/* Placeholder for 50+ */}
             <div className="glass-panel rounded-2xl p-6 border border-dashed border-white/20 flex flex-col items-center justify-center opacity-50 min-h-[300px]">
                <Activity size={32} className="text-slate-500 mb-2" />
                <p className="text-slate-400 font-bold text-sm">49+ More Scenarios</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest text-center">Unlock Pro Tier</p>
             </div>
          </div>
        ) : (
          /* ACTIVE SIMULATION VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
             {/* LEFT: Live Map */}
             <div className="lg:col-span-8 glass-panel border border-red-500/30 shadow-[0_0_30px_rgba(226,75,74,0.1)] rounded-2xl relative overflow-hidden p-2">
                <LiveMap needs={needs.filter(n=>n.reported_by==='system')} volunteers={[]} ngos={[]} center={currentScenario?.location} zoom={13} />
             </div>
             
             {/* RIGHT: Diagnostics */}
             <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="glass-panel p-5 rounded-xl border border-white/10">
                  <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-4">Simulated Weather Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <CloudRainWind size={20} className="text-blue-400 mb-1" />
                      <span className="text-xl font-bold text-white">{currentScenario?.weatherCondition.rainfall}mm/h</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Rainfall Rate</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Wind size={20} className="text-slate-300 mb-1" />
                      <span className="text-xl font-bold text-white">{currentScenario?.weatherCondition.windSpeed} km/h</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Wind Speed</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl border border-white/10 flex-1 flex flex-col">
                  <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-4 flex justify-between">
                     <span>Event Timeline</span>
                     <span className="text-[#10B981]">Real-time injection</span>
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
                    {currentScenario?.timeline.map((evt, idx) => (
                      <div key={idx} className={clsx(
                         "flex gap-4 p-3 rounded-lg border-l-2 transition-all",
                         simulationTime >= evt.minute ? "bg-white/10 border-[#10B981] opacity-100" : "bg-white/5 border-slate-700 opacity-40"
                      )}>
                         <div className={clsx("font-mono font-bold text-sm min-w-[40px]", simulationTime >= evt.minute ? "text-[#10B981]" : "text-slate-500")}>
                           T+{evt.minute}
                         </div>
                         <div>
                           <p className="font-bold text-sm text-slate-200">{evt.event}</p>
                           <p className="text-[10px] text-slate-400 mt-1 uppercase">Load: {evt.requestCount} simulated requests</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
