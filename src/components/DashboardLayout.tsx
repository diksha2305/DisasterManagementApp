"use client";

import { useAppStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity, Shield, Users, HeartHandshake, LogOut,
  Database, Bell, X, LayoutDashboard, Map, Menu,
  AlertTriangle, Settings
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

const ROLE_CONFIG: Record<string, {
  color: string;
  icon: React.ElementType;
  label: string;
  navItems: { href: string; icon: React.ElementType; label: string }[];
}> = {
  victim: {
    color: '#ff4d4f',
    icon: AlertTriangle,
    label: 'Citizen Portal',
    navItems: [{ href: '/dashboard/victim', icon: LayoutDashboard, label: 'My Dashboard' }],
  },
  volunteer: {
    color: '#22c55e',
    icon: HeartHandshake,
    label: 'Volunteer Hub',
    navItems: [{ href: '/dashboard/volunteer', icon: LayoutDashboard, label: 'My Missions' }],
  },
  ngo: {
    color: '#eab308',
    icon: Users,
    label: 'NGO Command',
    navItems: [
      { href: '/dashboard/ngo', icon: LayoutDashboard, label: 'Overview' },
      { href: '/dashboard/ngo', icon: Database, label: 'Inventory' },
    ],
  },
  government: {
    color: '#1677ff',
    icon: Shield,
    label: 'Gov Authority',
    navItems: [
      { href: '/dashboard/government', icon: LayoutDashboard, label: 'Command Center' },
      { href: '/scenarios', icon: Map, label: 'Scenarios & Risk' },
    ],
  },
};

export default function DashboardLayout({ children, role }: { children: React.ReactNode; role: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, setCurrentUser, announcements, installMockData } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    setMounted(true);
    installMockData();
  }, [installMockData]);

  if (!mounted) return null;

  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.government;
  const RoleIcon = cfg.icon;
  const unread = announcements.filter(a => a.urgency === 'critical').length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}44` }}>
          <RoleIcon size={18} style={{ color: cfg.color }} />
        </div>
        <div>
          <p className="font-black text-sm tracking-tight text-white">AURA HQ</p>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest px-3 mb-2">Navigation</p>
        {cfg.navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={() => setMobileSidebar(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                active
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
              style={active ? { backgroundColor: `${cfg.color}18`, color: cfg.color } : {}}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User block */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/3 mb-2">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-sm border border-white/10 shrink-0">
            {currentUser?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{currentUser?.name ?? 'Guest'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role ?? role}</p>
          </div>
        </div>
        <button
          onClick={() => { setCurrentUser(null); router.push('/'); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-bold"
        >
          <LogOut size={14} />
          Exit System
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1220]">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 h-full shrink-0 border-r border-white/5 bg-[#080e1a]">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
          <aside className="relative z-10 w-64 h-full bg-[#080e1a] border-r border-white/10 flex flex-col">
            <button onClick={() => setMobileSidebar(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#080e1a]/60 backdrop-blur-xl z-40 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileSidebar(true)}>
              <Menu size={22} />
            </button>
            <div>
              <p className="text-sm font-bold text-white hidden md:block">{cfg.label}</p>
              <p className="text-[11px] text-slate-400 hidden md:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Alerts bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(v => !v)}
                className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {showAlerts && (
                <div className="absolute top-12 right-0 w-80 z-50 rounded-2xl border border-white/10 bg-[#0b1220]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Live Broadcasts</p>
                    <button onClick={() => setShowAlerts(false)}><X size={14} className="text-slate-400" /></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                    {announcements.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-500">No broadcasts yet.</p>
                    ) : announcements.map(a => (
                      <div key={a.id} className={clsx('px-5 py-4 text-sm',
                        a.urgency === 'critical' ? 'bg-red-500/5' :
                        a.urgency === 'warning' ? 'bg-yellow-500/5' : 'bg-blue-500/5'
                      )}>
                        <div className="flex gap-2 items-start">
                          <span className={clsx('mt-0.5 flex-shrink-0 w-2 h-2 rounded-full',
                            a.urgency === 'critical' ? 'bg-red-500' :
                            a.urgency === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          )} />
                          <div>
                            <p className="text-white font-semibold">{a.message}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{new Date(a.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border"
              style={{ color: cfg.color, backgroundColor: `${cfg.color}12`, borderColor: `${cfg.color}30` }}>
              <RoleIcon size={13} />
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
