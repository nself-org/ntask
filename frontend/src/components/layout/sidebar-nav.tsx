'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  active?: boolean;
  children?: SidebarNavItem[];
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  title?: string;
  onNavigate?: (href: string) => void;
}

export function SidebarNav({ items, title, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {title && (
        <h4 className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      )}
      {items.map((item) => (
        <SidebarNavLink key={item.href} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function SidebarNavLink({ item, onNavigate }: { item: SidebarNavItem; onNavigate?: (href: string) => void }) {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onNavigate?.(item.href)}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
        item.active
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          {item.badge}
        </span>
      )}
    </button>
  );
}
