'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { DesktopSkin } from '@/components/skins/desktop-skin';
import { MobileSkin } from '@/components/skins/mobile-skin';
import { Monitor, Smartphone, LayoutGrid } from 'lucide-react';

type SkinView = 'both' | 'desktop' | 'mobile';

const SAMPLE_CONTENT = (
  <div className="p-6 space-y-4">
    <div className="space-y-1">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <p className="text-sm text-muted-foreground">Welcome back, Demo User</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Users', value: '1,284', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400' },
        { label: 'Active', value: '892', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
        { label: 'Todos', value: '3,461', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
        { label: 'Uptime', value: '99.9%', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-400' },
      ].map((stat) => (
        <div key={stat.label} className={`rounded-lg p-3 ${stat.color}`}>
          <div className="text-[10px] uppercase tracking-wider opacity-70">{stat.label}</div>
          <div className="text-lg font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
    <div className="space-y-2">
      {['Review RBAC configuration', 'Configure user management', 'Explore the dashboard'].map((item) => (
        <div key={item} className="flex items-center gap-2 rounded-md border border-border/50 px-3 py-2 text-sm">
          <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/40" />
          {item}
        </div>
      ))}
    </div>
  </div>
);

export default function SkinsPage() {
  const [view, setView] = useState<SkinView>('both');

  const viewButtons: { id: SkinView; label: string; Icon: typeof Monitor }[] = [
    { id: 'both', label: 'Both', Icon: LayoutGrid },
    { id: 'desktop', label: 'Desktop', Icon: Monitor },
    { id: 'mobile', label: 'Mobile', Icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Platform Skins</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Preview how the application renders across desktop and mobile shells
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
            {viewButtons.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={`flex flex-wrap items-start justify-center gap-8 ${
          view === 'both' ? 'lg:gap-12' : ''
        }`}>
          {(view === 'both' || view === 'desktop') && (
            <div className="w-full max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="h-4 w-4" />
                Desktop (Tauri)
              </div>
              <DesktopSkin title="nApp - Dashboard">
                <div className="min-h-[400px]">{SAMPLE_CONTENT}</div>
              </DesktopSkin>
            </div>
          )}

          {(view === 'both' || view === 'mobile') && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                Mobile (PWA)
              </div>
              <MobileSkin>
                {SAMPLE_CONTENT}
              </MobileSkin>
            </div>
          )}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-3">How Skins Work</h2>
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Desktop Shell</span>
              <p className="mt-1">Wraps content in a native window chrome with title bar, traffic lights, sidebar dock, and status bar. Designed for Tauri v2 integration.</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Mobile Shell</span>
              <p className="mt-1">Renders inside an iPhone-style frame with status bar, notch, bottom tab navigation, and home indicator. For PWA deployments.</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Web (Default)</span>
              <p className="mt-1">No shell wrapper. Uses the standard responsive layout with header, sidebar, and footer. Auto-detected via the platform config.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
