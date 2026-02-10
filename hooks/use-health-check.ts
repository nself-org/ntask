'use client';

import { useEffect, useState, useCallback } from 'react';
import { checkBackendHealth, onHealthChange, startHealthMonitor, stopHealthMonitor, type HealthStatus } from '@/lib/health-check';

export function useHealthCheck(autoMonitor = false, intervalMs = 30000): {
  status: HealthStatus | null;
  check: () => Promise<HealthStatus>;
  monitoring: boolean;
} {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  const check = useCallback(async () => {
    const result = await checkBackendHealth();
    setStatus(result);
    return result;
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    if (!autoMonitor) return;
    startHealthMonitor(intervalMs);
    setMonitoring(true);
    const unsub = onHealthChange(setStatus);
    return () => {
      unsub();
      stopHealthMonitor();
      setMonitoring(false);
    };
  }, [autoMonitor, intervalMs]);

  return { status, check, monitoring };
}
