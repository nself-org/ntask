'use client';

import { useState, type ReactNode } from 'react';
import { Minus, Square, X, Copy, Maximize2, Settings, Terminal } from 'lucide-react';

interface DesktopSkinProps {
  children: ReactNode;
  title?: string;
}

export function DesktopSkin({ children, title = 'nSelf App' }: DesktopSkinProps) {
  const [maximized, setMaximized] = useState(false);

  return (
    <div className={`flex flex-col overflow-hidden bg-background ${maximized ? '' : 'rounded-xl border border-border/60 shadow-2xl'}`}>
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/40 bg-card px-3 select-none"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <WindowDot color="bg-red-500 hover:bg-red-600" />
            <WindowDot color="bg-amber-500 hover:bg-amber-600" />
            <WindowDot color="bg-emerald-500 hover:bg-emerald-600" />
          </div>
          <span className="ml-2 text-xs font-medium text-muted-foreground">{title}</span>
        </div>

        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <TitleBarButton icon={Minus} label="Minimize" />
          <TitleBarButton icon={maximized ? Copy : Square} label="Maximize" onClick={() => setMaximized(!maximized)} />
          <TitleBarButton icon={X} label="Close" className="hover:bg-red-500 hover:text-white" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <nav className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border/40 bg-card/50 py-2">
          <DockIcon icon={Terminal} active label="Dashboard" />
          <DockIcon icon={Settings} label="Settings" />
        </nav>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <div className="flex h-6 shrink-0 items-center justify-between border-t border-border/40 bg-card px-3">
        <span className="text-[10px] text-muted-foreground">Ready</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Tauri v2</span>
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function WindowDot({ color }: { color: string }) {
  return <div className={`h-3 w-3 rounded-full transition-colors ${color} cursor-pointer`} />;
}

function TitleBarButton({ icon: Icon, label, onClick, className = '' }: { icon: typeof Minus; label: string; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function DockIcon({ icon: Icon, active, label }: { icon: typeof Terminal; active?: boolean; label: string }) {
  return (
    <button
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
