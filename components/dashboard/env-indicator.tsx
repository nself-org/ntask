'use client';

import { config, getProviderLabel, getEnvironmentLabel } from '@/lib/config';
import type { BackendProvider, Environment } from '@/lib/config';

const providerColors: Record<BackendProvider, string> = {
  bolt: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  supabase: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  nhost: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
  nself: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

const envColors: Record<Environment, string> = {
  local: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  staging: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  production: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
};

export function EnvIndicator() {
  const provider = config.backend;
  const environment = config.environment;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${providerColors[provider]}`}>
        {getProviderLabel()}
      </span>
      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${envColors[environment]}`}>
        {getEnvironmentLabel()}
      </span>
    </div>
  );
}

export function ProviderDot() {
  const provider = config.backend;
  const dotColor: Record<BackendProvider, string> = {
    bolt: 'bg-sky-500',
    supabase: 'bg-emerald-500',
    nhost: 'bg-teal-500',
    nself: 'bg-amber-500',
  };

  return <div className={`h-2.5 w-2.5 rounded-full ${dotColor[provider]}`} />;
}
