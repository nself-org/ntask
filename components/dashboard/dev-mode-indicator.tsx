'use client';

import { useEffect, useState } from 'react';
import { env, getEnvironmentName, getEnvironmentColor } from '@/lib/env';
import { useOffline, type ConnectivityStatus } from '@/lib/providers/offline-provider';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';

const STATUS_CONFIG: Record<ConnectivityStatus, { label: string; color: string; Icon: typeof Wifi }> = {
  online: { label: 'Online', color: '#10b981', Icon: Wifi },
  offline: { label: 'Offline', color: '#ef4444', Icon: WifiOff },
  reconnecting: { label: 'Reconnecting', color: '#f59e0b', Icon: RefreshCw },
  syncing: { label: 'Syncing', color: '#3b82f6', Icon: Loader2 },
};

export function DevModeIndicator() {
  const [mounted, setMounted] = useState(false);
  const { status, pendingActions } = useOffline();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const showEnvBadge = env.enableDevTools;
  const showConnectivity = status !== 'online' || pendingActions > 0;

  if (!showEnvBadge && !showConnectivity) return null;

  const envName = getEnvironmentName();
  const envColor = getEnvironmentColor();
  const { label, color, Icon } = STATUS_CONFIG[status];
  const isAnimating = status === 'reconnecting' || status === 'syncing';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {showConnectivity && (
        <Badge
          variant="outline"
          className="shadow-lg backdrop-blur-sm border-2 transition-all duration-300 animate-in fade-in slide-in-from-right-2"
          style={{
            backgroundColor: `${color}15`,
            borderColor: color,
            color: color,
          }}
        >
          <Icon
            className={`h-3 w-3 mr-1.5 ${isAnimating ? 'animate-spin' : ''}`}
          />
          {label}
          {pendingActions > 0 && status !== 'syncing' && (
            <span
              className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {pendingActions}
            </span>
          )}
        </Badge>
      )}

      {showEnvBadge && (
        <Badge
          variant="outline"
          className="shadow-lg backdrop-blur-sm border-2"
          style={{
            backgroundColor: `${envColor}15`,
            borderColor: envColor,
            color: envColor,
          }}
        >
          <span className="relative flex h-2 w-2 mr-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: envColor }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: envColor }}
            />
          </span>
          {envName}
        </Badge>
      )}
    </div>
  );
}
