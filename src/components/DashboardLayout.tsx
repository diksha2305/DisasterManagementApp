"use client";

import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, Shield, Users, HeartHandshake, LogOut, Map as MapIcon, Database, Bell } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function DashboardLayout({ children, role }: { children: React.ReactNode, role: string }) {
  const router = useRouter();
  const { currentUser, setCurrentUser, announcements } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!currentUser || currentUser.role !== role) {
      // For demo ease, if they go to a wrong dashboard, just redirect to home
      // Or auto-login them as the role they connected to
      // Here we'll redirect if not matching to prevent bugs.
    }
  }, [currentUser, role, router]);

  if (!mounted) return null;

  const NavItem = ({ href, icon: Icon, label, active = false }: any) => (
    <Link 
      href={href} 
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        active 
          ? "bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/50" 
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={20} />
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );

  const getRoleIcon = () => {
    switch (role) {
      case 'victim': return <Activity className="text-[var(--color-brand-primary)]" />;
      case 'volunteer': return <HeartHandshake className="text-[var(--color-brand-success)]" />;
      case 'ngo': return <Users className="text-[var(--color-brand-warning)]" />;
      case 'government': return <Shield className="text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-brand-bg)]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-full border-r border-white/10 glass-panel">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg border border-white/20 shadow-lg">
             {getRoleIcon()}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white uppercase">AURA</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">{role} Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <NavItem href={`/dashboard/${role}`} icon={Activity} label="Overview" active={true} />
          {role === 'government' && (
            <NavItem href={`/scenarios`} icon={Database} label="Scenarios & Risk" />
          )}
          {role === 'ngo' && (
             <NavItem href={`/dashboard/${role}/inventory`} icon={Database} label="Inventory" />
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-white/20">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold truncate max-w-[120px]">{currentUser?.name || 'Guest'}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser?.role || ''}</p>
            </div>
          </div>
          <button 
            onClick={() => { setCurrentUser(null); router.push('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-semibold"
          >
            <LogOut size={16} />
            Exit System
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 glass-panel z-50">
           <div className="flex items-center gap-2">
             {getRoleIcon()}
             <span className="font-bold text-lg uppercase">Aura</span>
           </div>
           <button onClick={() => { setCurrentUser(null); router.push('/'); }}>
             <LogOut size={20} className="text-slate-400" />
           </button>
        </header>

        {/* Top bar for Global Alerts */}
        <div className="w-full relative z-40 bg-gradient-to-b from-[#0F1117]/80 to-transparent">
          <div className="p-4 md:px-8 flex justify-end items-center">
            
            <div className="relative">
              <button 
                onClick={() => setShowAnnouncements(!showAnnouncements)}
                className="relative p-2 rounded-full glass-panel-hover text-slate-300 transition-all hover:text-white"
              >
                <Bell size={20} />
                {announcements.length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[var(--color-brand-bg)] animate-pulse" />
                )}
              </button>

              {/* Announcement Dropdown */}
              {showAnnouncements && (
                <div className="absolute top-12 right-0 w-80 glass-panel rounded-2xl border border-white/20 shadow-2xl p-4 overflow-hidden z-50 animate-in slide-in-from-top-2">
                  <h3 className="font-bold text-sm mb-3 px-2 text-slate-300 uppercase tracking-widest">Global Broadcasts</h3>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-slate-500 indent-2 py-4">No active broadcasts.</p>
                    ) : announcements.map(a => (
                      <div key={a.id} className={clsx(
                        "p-3 rounded-xl border text-sm",
                        a.urgency === 'critical' ? 'bg-red-500/10 border-red-500/30' : 
                        a.urgency === 'warning' ? 'bg-orange-500/10 border-orange-500/30' : 
                        'bg-blue-500/10 border-blue-500/30'
                      )}>
                        <p className="font-semibold text-white mb-1">{a.message}</p>
                        <p className="text-[10px] text-slate-400">{new Date(a.created_at).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:px-8 pb-20 md:pb-8 relative z-10 w-full">
           {children}
        </div>
      </main>
    </div>
  );
}
