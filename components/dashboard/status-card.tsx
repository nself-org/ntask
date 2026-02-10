'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'active' | 'ready' | 'inactive';
  provider?: string;
}

const statusColors = {
  active: 'bg-emerald-500',
  ready: 'bg-amber-500',
  inactive: 'bg-zinc-400',
};

const statusLabels = {
  active: 'Active',
  ready: 'Ready',
  inactive: 'Inactive',
};

export function StatusCard({ title, description, icon: Icon, status, provider }: StatusCardProps) {
  return (
    <div className="group relative rounded-xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300',
          status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn('h-2 w-2 rounded-full', statusColors[status])} />
          <span className="text-xs font-medium text-muted-foreground">{statusLabels[status]}</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold leading-none tracking-tight">{title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {provider && (
        <div className="mt-3 inline-flex items-center rounded-md bg-muted px-2 py-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{provider}</span>
        </div>
      )}
    </div>
  );
}
