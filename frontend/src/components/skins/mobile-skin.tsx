'use client';

import { useState, type ReactNode } from 'react';
import { Home, LayoutDashboard, User, Settings, Wifi, Battery } from 'lucide-react';

interface MobileSkinProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function MobileSkin({ children, activeTab = 'home', onTabChange }: MobileSkinProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  function handleTab(tab: string) {
    setCurrentTab(tab);
    onTabChange?.(tab);
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mx-auto flex h-[700px] w-[375px] flex-col overflow-hidden rounded-[2.5rem] border-[3px] border-border/80 bg-background shadow-2xl">
      <div className="relative flex h-12 shrink-0 items-center justify-between px-6">
        <span className="text-xs font-semibold">{timeStr}</span>
        <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground/10" />
        <div className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-foreground" />
          <Battery className="h-3 w-3 text-foreground" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>

      <nav className="shrink-0 border-t border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="flex items-stretch">
          {TABS.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab.id)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mx-auto mb-1.5 mt-1 h-1 w-32 rounded-full bg-foreground/20" />
      </nav>
    </div>
  );
}
