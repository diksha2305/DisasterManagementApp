"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { NGO, ResourceInventory } from '@/lib/types';
import { Package, Truck, Database, ActivitySquare, Plus, Check } from 'lucide-react';
import clsx from 'clsx';
import { LiveMap } from '@/components/Map';

export default function NGODashboard() {
  const { currentUser, inventory, ngos, needs, riskZones } = useAppStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'map'>('inventory');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const me = ngos.find(n => n.id === currentUser?.id) as NGO | undefined;
  const myInventory = inventory.filter(i => i.ngo_id === currentUser?.id);
  const otherInventory = inventory.filter(i => i.ngo_id !== currentUser?.id);

  return (
    <DashboardLayout role="ngo">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full">
        
        {/* STATS HEADER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-[var(--color-brand-warning)]/30">
             <Package className="w-8 h-8 text-[#EF9F27]" />
             <div>
               <p className="text-xl font-bold">{myInventory.length}</p>
               <p className="text-[10px] text-slate-400 uppercase">Resource Types</p>
             </div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
             <Truck className="w-8 h-8 text-blue-400" />
             <div>
               <p className="text-xl font-bold">12</p>
               <p className="text-[10px] text-slate-400 uppercase">Vehicles Active</p>
             </div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
             <ActivitySquare className="w-8 h-8 text-emerald-400" />
             <div>
               <p className="text-xl font-bold">3</p>
               <p className="text-[10px] text-slate-400 uppercase">Active Missions</p>
             </div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-r-4 border-r-[#EF9F27]">
             <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold border border-orange-500/50">
               {me?.staff_count || 50}
             </div>
             <div>
               <p className="text-xl font-bold">Staff</p>
               <p className="text-[10px] text-slate-400 uppercase">Available</p>
             </div>
          </div>
        </div>

        {/* HEAD */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
              <button 
                onClick={() => setActiveTab('inventory')}
                className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'inventory' ? 'bg-[#EF9F27] text-white shadow-lg' : 'text-slate-400 hover:text-white')}
              >
                Resource Inventory
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'map' ? 'bg-[#EF9F27] text-white shadow-lg' : 'text-slate-400 hover:text-white')}
              >
                Region Map View
              </button>
            </div>
            
            {activeTab === 'inventory' && (
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                 <Plus size={16} /> Add Item
              </button>
            )}
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 relative">
          {activeTab === 'map' ? (
             <div className="absolute inset-0 rounded-2xl overflow-hidden glass-panel border-white/10 border p-2">
               <LiveMap needs={needs} volunteers={[]} ngos={ngos} riskZones={riskZones} center={me?.hq_location} />
             </div>
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
               
               {/* MY INVENTORY */}
               <div className="glass-panel border-white/10 rounded-2xl p-6 flex flex-col h-full">
                  <h2 className="text-lg font-bold mb-4 flex justify-between items-center text-[#EF9F27]">
                     My Inventory
                  </h2>
                  
                  <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                    {myInventory.length === 0 ? (
                      <p className="text-sm text-slate-500 italic text-center py-10">No resources available in inventory.</p>
                    ) : (
                      myInventory.map(item => (
                        <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors">
                           <div>
                             <h3 className="font-bold uppercase text-sm mb-1">{item.item_name}</h3>
                             <p className="text-xs text-slate-400 capitalize">{item.resource_type} • Expiry: {item.expiry_date || 'N/A'}</p>
                           </div>
                           <div className="text-right">
                             <div className="font-mono text-xl text-[#EF9F27] font-bold">{item.quantity} {item.unit}</div>
                             <span className={clsx("text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded", item.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500')}>
                               {item.available ? 'Available' : 'Depleted'}
                             </span>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>
               
               {/* INTER-NGO RESOURCE SHARING */}
               <div className="glass-panel border-white/10 rounded-2xl p-6 flex flex-col h-full opacity-90 border-t-2 border-t-blue-500">
                  <h2 className="text-lg font-bold mb-4 flex justify-between items-center text-blue-400">
                     Global Resource Sharing
                  </h2>
                  
                  <p className="text-xs text-slate-400 mb-4 px-1">
                    Request excess supplies from other NGOs operating in nearby regions.
                  </p>
                  
                  <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                    {otherInventory.map(item => {
                       const org = ngos.find(n => n.id === item.ngo_id);
                       return (
                        <div key={item.id} className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold text-blue-400">{org?.org_name || 'Partner NGO'}</span>
                             <span className="text-[10px] text-blue-200/50">~4.5 km</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <div>
                               <h3 className="font-bold uppercase text-sm mb-1 text-blue-50">{item.item_name}</h3>
                               <p className="font-mono text-lg text-blue-300 font-bold">{item.quantity} {item.unit}</p>
                             </div>
                             {(item.id !== 'requested') ? (
                               <button className="bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors text-xs shadow-lg shadow-blue-500/20">
                                 Request Units
                               </button>
                             ) : (
                               <span className="flex gap-1 items-center bg-emerald-500/20 px-2 py-1 rounded text-emerald-400 text-xs font-bold">
                                 <Check size={14} /> Requested
                               </span>
                             )}
                           </div>
                        </div>
                       );
                    })}
                  </div>
               </div>

             </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
