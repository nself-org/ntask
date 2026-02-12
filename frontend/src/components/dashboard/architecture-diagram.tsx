'use client';

import { ArrowDown, ArrowRight } from 'lucide-react';

const BACKEND_LABELS: Record<string, { label: string; sublabel: string }> = {
  bolt: { label: 'Supabase (Bolt)', sublabel: 'PostgREST / Auth / Storage' },
  supabase: { label: 'Supabase', sublabel: 'PostgREST / Auth / Storage' },
  nhost: { label: 'Nhost', sublabel: 'Hasura / Auth / Storage' },
  nself: { label: 'nSelf', sublabel: 'Hasura / Postgres / MinIO' },
};

export function ArchitectureDiagram({ provider }: { provider: string }) {
  const backend = BACKEND_LABELS[provider] || BACKEND_LABELS.bolt;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h3 className="mb-4 text-sm font-semibold tracking-tight">Architecture Flow</h3>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <DiagramBox label="Frontend" sublabel="Next.js / React" color="bg-sky-500/10 text-sky-600 border-sky-500/20" />
        <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
        <ArrowDown className="block h-4 w-4 text-muted-foreground sm:hidden" />
        <DiagramBox label="Abstraction Layer" sublabel="Hooks & Providers" color="bg-amber-500/10 text-amber-600 border-amber-500/20" />
        <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
        <ArrowDown className="block h-4 w-4 text-muted-foreground sm:hidden" />
        <DiagramBox label={backend.label} sublabel={backend.sublabel} color="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" />
      </div>
    </div>
  );
}

function DiagramBox({ label, sublabel, color }: { label: string; sublabel: string; color: string }) {
  return (
    <div className={`rounded-lg border px-4 py-2.5 text-center ${color}`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-[10px] opacity-70">{sublabel}</div>
    </div>
  );
}
