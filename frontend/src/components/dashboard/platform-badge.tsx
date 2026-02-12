'use client';

import { Monitor, Smartphone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformBadgeProps {
  platform: string;
  active?: boolean;
}

const platformIcons = {
  web: Globe,
  desktop: Monitor,
  mobile: Smartphone,
};

export function PlatformBadge({ platform, active }: PlatformBadgeProps) {
  const Icon = platformIcons[platform as keyof typeof platformIcons] || Globe;

  return (
    <div className={cn(
      'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200',
      active
        ? 'border-primary/30 bg-primary/5 text-primary'
        : 'border-border/40 bg-muted/50 text-muted-foreground'
    )}>
      <Icon className="h-4 w-4" />
      <span className="font-medium capitalize">{platform}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
    </div>
  );
}
