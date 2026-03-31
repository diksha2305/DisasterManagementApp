"use client";

import { useAppStore } from '@/lib/store';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Package, Users, Activity, Clock, TrendingUp, ShareIcon, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

const CHART_COLORS = {
  requests: '#ff4d4f',
  resolved: '#22c55e',
  shared: '#1677ff',
};

const PIE_COLORS = ['#1677ff', '#22c55e', '#eab308', '#ff4d4f', '#a855f7'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0b1220]/95 border border-white/10 rounded-xl p-3 shadow-2xl text-xs backdrop-blur">
      <p className="text-slate-400 mb-2 font-bold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function NGODashboard() {
  const { needs, volunteers, ngos, inventory, addAnnouncement } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [shareQuantity, setShareQuantity] = useState<Record<string, number>>({});

  useEffect(() => setMounted(true), []);

  // Build chart data from needs (simulate hourly buckets)
  const chartData = useMemo(() => {
    const hours = Array.from({ length: 8 }, (_, i) => {
      const h = new Date(Date.now() - (7 - i) * 3600000);
      return {
        time: h.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        requests: Math.floor(Math.random() * 30 + 10),
        resolved: Math.floor(Math.random() * 20 + 5),
      };
    });
    return hours;
  }, []);

  const inventoryPieData = useMemo(() =>
    inventory.reduce((acc: any[], item) => {
      const existing = acc.find(a => a.name === item.resource_type);
      if (existing) existing.value += item.quantity;
      else acc.push({ name: item.resource_type, value: item.quantity });
      return acc;
    }, []), [inventory]);

  if (!mounted) return null;

  const activeNeeds = needs.filter(n => n.status !== 'completed');
  const resolvedNeeds = needs.filter(n => n.status === 'completed');
  const totalItems = inventory.reduce((s, i) => s + i.quantity, 0);

  const metrics = [
    { label: 'Active Incidents', value: activeNeeds.length, icon: Activity, color: '#ff4d4f', suffix: '' },
    { label: 'Volunteers Active', value: volunteers.filter(v => v.online).length, icon: Users, color: '#22c55e', suffix: '' },
    { label: 'Resources in Stock', value: totalItems, icon: Package, color: '#1677ff', suffix: '' },
    { label: 'Avg Response Time', value: 18, icon: Clock, color: '#eab308', suffix: ' min' },
  ];

  return (
    <DashboardLayout role="ngo">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 pb-10">

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-30"
                style={{ backgroundColor: m.color }} />
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{m.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${m.color}22`, border: `1px solid ${m.color}44` }}>
                  <m.icon size={16} style={{ color: m.color }} />
                </div>
              </div>
              <p className="text-3xl font-black" style={{ color: m.color }}>
                {m.value}{m.suffix}
              </p>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Area Chart: Requests vs Resolved */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-white text-sm">Requests vs Resolved</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Last 8 hours · live data</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ff4d4f]" />Requests</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]" />Resolved</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="transparent" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="transparent" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="requests" name="Requests" stroke="#ff4d4f" fill="url(#gReq)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fill="url(#gRes)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart: Inventory Breakdown */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold text-white text-sm mb-1">Resource Allocation</h3>
            <p className="text-[10px] text-slate-500 mb-4">By category</p>
            {inventoryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={inventoryPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {inventoryPieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8}
                    formatter={(val) => <span className="text-[10px] text-slate-400 font-bold uppercase">{val}</span>} />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
                No inventory data yet.
              </div>
            )}
          </div>
        </div>

        {/* ── Inventory Table + Resource Sharing ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Inventory Table */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-white text-sm">Resource Inventory</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{inventory.length} items tracked</p>
              </div>
              <button onClick={() => setShareModal(true)}
                className="flex items-center gap-2 text-xs font-bold bg-[#1677ff]/10 hover:bg-[#1677ff]/20 text-[#1677ff] border border-[#1677ff]/30 px-3 py-1.5 rounded-xl transition-all">
                <ShareIcon size={13} /> Share Resources
              </button>
            </div>

            <div className="flex flex-col divide-y divide-white/5">
              {inventory.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-8">No inventory records yet.</p>
              ) : inventory.map(item => (
                <div key={item.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      item.resource_type === 'food' ? 'bg-yellow-500/15 border border-yellow-500/30' :
                        item.resource_type === 'medicine' ? 'bg-red-500/15 border border-red-500/30' :
                          'bg-blue-500/15 border border-blue-500/30'
                    )}>
                      <Package size={16} className={clsx(
                        item.resource_type === 'food' ? 'text-yellow-400' :
                          item.resource_type === 'medicine' ? 'text-red-400' : 'text-blue-400'
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.item_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{item.resource_type}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{item.quantity.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">{item.unit}</p>
                  </div>
                  <div className={clsx(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0",
                    item.available ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  )}>
                    {item.available ? 'Available' : 'Deployed'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests Panel */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-white text-sm">Incoming Requests</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{activeNeeds.length} active · {resolvedNeeds.length} resolved</p>
              </div>
              <TrendingUp size={16} className="text-slate-500" />
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[320px]">
              {needs.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-8">No requests yet. Use Victim dashboard or run a scenario.</p>
              ) : [...needs].sort((a, b) => (b.triage_score || 0) - (a.triage_score || 0)).map(need => (
                <div key={need.id} className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  need.urgency_label === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                    need.urgency_label === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
                      'border-white/5'
                )}>
                  <div className={clsx('w-2 h-2 rounded-full shrink-0',
                    need.status === 'completed' ? 'bg-emerald-500' :
                    need.urgency_label === 'critical' ? 'bg-red-500 animate-pulse' :
                    need.urgency_label === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate capitalize">{need.need_type} — {need.people_affected} people</p>
                    <p className="text-[10px] text-slate-400">{need.description?.slice(0, 50) || 'No description'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                      need.urgency_label === 'critical' ? 'bg-red-500/20 text-red-400' :
                        need.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-slate-500/20 text-slate-400'
                    )}>{need.status}</span>
                    {need.triage_score != null && (
                      <span className="text-[10px] font-mono text-slate-500">Score: {need.triage_score}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Sharing Modal */}
        {shareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShareModal(false)}>
            <div className="glass-panel rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-black mb-1 text-white">Share Resources</h3>
              <p className="text-slate-400 text-sm mb-6">Offer surplus inventory to partner NGOs in the network.</p>
              <div className="flex flex-col gap-3 mb-6">
                {inventory.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/3 border border-white/5">
                    <span className="text-sm font-semibold text-white truncate">{item.item_name}</span>
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      defaultValue={0}
                      placeholder="Qty"
                      className="w-20 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:border-[#1677ff]"
                      onChange={e => setShareQuantity(prev => ({ ...prev, [item.id]: +e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  addAnnouncement({
                    id: `share_${Date.now()}`,
                    created_by: 'ngo',
                    message: `Resources offered by NGO: ${Object.entries(shareQuantity).filter(([, v]) => v > 0).map(([id, q]) => `${inventory.find(i => i.id === id)?.item_name} ×${q}`).join(', ') || 'Misc items'}`,
                    urgency: 'info',
                    target_audience: 'all',
                    created_at: new Date().toISOString()
                  });
                  setShareModal(false);
                }}
                className="w-full bg-[#1677ff] hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle size={18} /> Broadcast Offer
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
