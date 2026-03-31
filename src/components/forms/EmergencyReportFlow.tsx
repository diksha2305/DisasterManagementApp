"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShieldAlert, Navigation, Upload, Mic, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Need } from '@/lib/types';
import clsx from 'clsx';

export function EmergencyReportFlow({ onSuccess }: { onSuccess: () => void }) {
  const { currentUser, addNeed } = useAppStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [needType, setNeedType] = useState('medical');
  const [urgencySlider, setUrgencySlider] = useState(80);
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [description, setDescription] = useState('');

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate AI parsing delay
    await new Promise(r => setTimeout(r, 1500));
    
    let urgencyLabel: 'low'|'medium'|'high'|'critical' = 'high';
    if (urgencySlider >= 85) urgencyLabel = 'critical';
    else if (urgencySlider < 50) urgencyLabel = 'medium';
    else if (urgencySlider < 25) urgencyLabel = 'low';

    const newNeed: Need = {
      id: `report_${Date.now()}`,
      reported_by: currentUser?.id || 'vic_guest',
      need_type: needType as any,
      urgency_level: urgencySlider,
      urgency_label: urgencyLabel,
      people_affected: peopleAffected,
      description,
      location: currentUser?.location || { lat: 26.90, lng: 75.78 },
      status: 'pending',
      triage_score: Math.min(urgencySlider + 5, 100),
      created_at: new Date().toISOString()
    };

    addNeed(newNeed);
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-panel rounded-2xl relative overflow-hidden text-slate-100 flex flex-col min-h-[500px]">
      {/* Progress Bar Header */}
      <div className="bg-[#060913] p-6 border-b border-white/10 relative">
        <div className="h-1 w-full bg-white/10 absolute bottom-0 left-0">
          <div 
            className="h-full bg-[var(--color-brand-danger)] transition-all duration-500 rounded-r-full shadow-[0_0_10px_#ff4d4f]" 
            style={{ width: `${(step / 3) * 100}%` }} 
          />
        </div>
        <h2 className="text-xl font-poppins font-bold flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-full border border-red-500/50">
            <ShieldAlert className="w-5 h-5 text-[#ff4d4f]" />
          </div>
          Report Emergency
        </h2>
        <p className="text-slate-400 text-sm mt-2 font-inter tracking-wide">
          Step {step} of 3 • {step===1 ? 'Location & Context' : step===2 ? 'Urgency Assessment' : 'Final Details'}
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CONTEXT & LOCATION */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 h-full font-inter"
            >
              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-widest uppercase text-slate-400">Emergency Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['medical', 'rescue', 'food', 'shelter'].map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => setNeedType(type)}
                      className={clsx(
                        "p-4 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all",
                        needType === type 
                          ? "bg-[var(--color-brand-primary)]/20 border-[var(--color-brand-primary)] text-white shadow-[0_0_15px_rgba(22,119,255,0.2)]"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                <label className="text-sm font-semibold tracking-widest uppercase text-slate-400 flex justify-between items-center">
                  Location 
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 rounded-full">Auto-Detected</span>
                </label>
                <div className="flex-1 rounded-xl bg-slate-900 border border-white/10 relative overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/5820/3474.png')] opacity-20 bg-center bg-cover" />
                   <div className="relative z-10 p-4 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 text-center flex flex-col items-center">
                     <Navigation size={24} className="text-[#1677ff] mb-2 animate-bounce" />
                     <p className="font-mono text-sm">Lat: 26.9124 • Lng: 75.7873</p>
                     <p className="text-xs text-slate-400 mt-1">Accuracy: ± 12 meters</p>
                   </div>
                </div>
              </div>

              <button 
                onClick={handleNext} 
                className="mt-auto bg-[#1677ff] hover:bg-blue-600 text-white font-bold h-14 rounded-xl transition-colors active:scale-95 shadow-lg shadow-blue-500/20"
              >
                Confirm Location & Proceed
              </button>
            </motion.div>
          )}

          {/* STEP 2: URGENCY & IMPACT */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 h-full font-inter"
            >
              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-widest uppercase text-slate-400 flex justify-between items-center">
                  Threat Urgency Level
                  <span className={clsx("px-2 rounded text-xs font-bold", 
                    urgencySlider >= 85 ? 'bg-red-500/20 text-red-500' : urgencySlider > 50 ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                  )}>
                    {urgencySlider}/100
                  </span>
                </label>
                
                <div className="h-32 flex flex-col justify-center bg-white/5 border border-white/10 rounded-xl p-6">
                  {/* Custom DIY slider since Shadcn isn't ready immediately */}
                  <input 
                    type="range" min="0" max="100" 
                    value={urgencySlider} 
                    onChange={e => setUrgencySlider(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer overflow-hidden bg-slate-800"
                    style={{
                       background: `linear-gradient(to right, ${urgencySlider >= 85 ? '#ff4d4f' : urgencySlider > 50 ? '#eab308' : '#1677ff'} ${urgencySlider}%, #1e293b ${urgencySlider}%)`
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest">
                    <span>Non-Critical</span>
                    <span>Severe</span>
                    <span>Life-Threatening</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-widest uppercase text-slate-400">People Affected (Approx)</label>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-2">
                  <button type="button" onClick={() => setPeopleAffected(Math.max(1, peopleAffected - 1))} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-xl font-bold">-</button>
                  <div className="flex-1 text-center text-3xl font-mono font-bold">{peopleAffected}</div>
                  <button type="button" onClick={() => setPeopleAffected(peopleAffected + 1)} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-xl font-bold">+</button>
                </div>
              </div>

              <div className="mt-auto flex gap-4">
                 <button onClick={handleBack} className="w-24 border border-white/20 text-slate-300 font-bold h-14 rounded-xl hover:bg-white/5 transition-colors">Back</button>
                 <button onClick={handleNext} className="flex-1 bg-[#ff4d4f] hover:bg-red-600 text-white font-bold h-14 rounded-xl transition-colors active:scale-95 shadow-lg shadow-red-500/20">Next: Final Details</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DETAILS & UPLOAD */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 h-full font-inter"
            >
              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-widest uppercase text-slate-400">Description or Voice Note</label>
                <div className="relative">
                  <textarea 
                    rows={4} 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide specific details..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#1677ff] resize-none custom-scrollbar"
                  />
                  <button className="absolute right-4 bottom-4 p-2 bg-[#1677ff]/20 text-[#1677ff] rounded-full hover:bg-[#1677ff] hover:text-white transition-colors">
                     <Mic size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-widest uppercase text-slate-400">Upload Image / Video Proof</label>
                <div className="w-full h-24 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 hover:border-[var(--color-brand-primary)] cursor-pointer transition-colors group">
                   <div className="flex flex-col items-center gap-2">
                     <Upload size={24} className="group-hover:animate-bounce" />
                     <span className="text-xs uppercase tracking-widest font-bold">Tap to Browse</span>
                   </div>
                </div>
              </div>

              <div className="mt-auto flex gap-4">
                 <button onClick={handleBack} className="w-24 border border-white/20 text-slate-300 font-bold h-14 rounded-xl hover:bg-white/5 transition-colors" disabled={loading}>Back</button>
                 <button 
                   onClick={handleSubmit} 
                   disabled={loading}
                   className="flex-1 bg-white text-black font-bold h-14 rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-200"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : 'Finalize & Dispatch Alert'}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
