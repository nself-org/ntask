'use client';

import { useAuth, useOffline } from '@/lib/providers';
import { config, getProviderLabel, getEnvironmentLabel, isHasuraBased } from '@/lib/config';
import { detectPlatform } from '@/lib/platform';
import {
  Database,
  Shield,
  HardDrive,
  Radio,
  Zap,
  Layers,
  Globe,
  Heart,
  Keyboard,
  Copy,
  Clock,
  Flag,
  FileText,
  RefreshCw,
  AlertTriangle,
  Layout,
  Lock,
  Moon,
  ArrowRight,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { StatusCard } from '@/components/dashboard/status-card';
import { PlatformBadge } from '@/components/dashboard/platform-badge';
import { ArchitectureDiagram } from '@/components/dashboard/architecture-diagram';
import { AppHeader } from '@/components/layout/app-header';
import { useHealthCheck } from '@/hooks/use-health-check';

const SERVICE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  database: {
    bolt: 'PostgreSQL via Supabase PostgREST',
    supabase: 'PostgreSQL via Supabase PostgREST',
    nhost: 'PostgreSQL via Hasura GraphQL (Nhost)',
    nself: 'PostgreSQL via Hasura GraphQL (ɳSelf)',
  },
  auth: {
    bolt: 'Supabase Auth with email/password',
    supabase: 'Supabase Auth with email/password',
    nhost: 'Nhost Auth (Hasura Auth v1)',
    nself: 'Hasura Auth with JWT tokens (ɳSelf)',
  },
  storage: {
    bolt: 'Supabase Storage buckets',
    supabase: 'Supabase Storage buckets',
    nhost: 'Nhost Storage (HasuraStorage)',
    nself: 'MinIO S3-compatible object storage (ɳSelf)',
  },
  realtime: {
    bolt: 'Supabase Realtime broadcast channels',
    supabase: 'Supabase Realtime broadcast channels',
    nhost: 'Hasura GraphQL Subscriptions (Nhost)',
    nself: 'WebSocket channels (ɳSelf)',
  },
  functions: {
    bolt: 'Supabase Edge Functions',
    supabase: 'Supabase Edge Functions',
    nhost: 'Nhost Serverless Functions',
    nself: 'ɳSelf Functions runtime',
  },
};

export function HomePage() {
  const { user, loading } = useAuth();
  const { isOnline } = useOffline();
  const platform = detectPlatform();
  const provider = config.backend;
  const environment = config.environment;
  const hasura = isHasuraBased();
  const { status: health } = useHealthCheck();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="mb-12">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              {getProviderLabel()}
            </span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              {getEnvironmentLabel()}
            </span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              {platform}
            </span>
            {hasura && (
              <span className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-600">
                Hasura GraphQL
              </span>
            )}
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Multi-Backend Boilerplate
          </h1>
          <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Production-ready cross-platform foundation with 4 backend providers
            (Bolt, Supabase, Nhost, nSelf), 3 environments (local, staging, production),
            and deployment to web, desktop, and mobile from a single codebase.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/dashboard/"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/skins/"
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Monitor className="h-4 w-4" />
              Platform Skins
            </a>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Backend Services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatusCard
              title="Database"
              description={SERVICE_DESCRIPTIONS.database[provider]}
              icon={Database}
              status="active"
              provider={provider}
            />
            <StatusCard
              title="Authentication"
              description={SERVICE_DESCRIPTIONS.auth[provider]}
              icon={Shield}
              status={loading ? 'ready' : user ? 'active' : 'ready'}
              provider={provider}
            />
            <StatusCard
              title="Storage"
              description={SERVICE_DESCRIPTIONS.storage[provider]}
              icon={HardDrive}
              status="ready"
              provider={provider}
            />
            <StatusCard
              title="Realtime"
              description={SERVICE_DESCRIPTIONS.realtime[provider]}
              icon={Radio}
              status="ready"
              provider={provider}
            />
            <StatusCard
              title="Functions"
              description={SERVICE_DESCRIPTIONS.functions[provider]}
              icon={Zap}
              status="ready"
              provider={provider}
            />
            <StatusCard
              title="Offline Cache"
              description="IndexedDB-backed offline queue with sync"
              icon={Layers}
              status="active"
              provider="built-in"
            />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Provider Matrix</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Service</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Bolt</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Supabase</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Nhost</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">nSelf</th>
                </tr>
              </thead>
              <tbody>
                <MatrixRow service="Database" cells={['PostgREST', 'PostgREST', 'Hasura GQL', 'Hasura GQL']} activeIdx={providerIdx(provider)} />
                <MatrixRow service="Auth" cells={['Supabase Auth', 'Supabase Auth', 'Nhost Auth', 'Hasura Auth']} activeIdx={providerIdx(provider)} />
                <MatrixRow service="Storage" cells={['S3 Buckets', 'S3 Buckets', 'HasuraStorage', 'MinIO S3']} activeIdx={providerIdx(provider)} />
                <MatrixRow service="Realtime" cells={['Channels', 'Channels', 'GQL Subs', 'WebSocket']} activeIdx={providerIdx(provider)} />
                <MatrixRow service="Functions" cells={['Edge Fn', 'Edge Fn', 'Serverless', 'Custom Fn']} activeIdx={providerIdx(provider)} />
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Environment Topology</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <EnvCard
              name="Local Dev"
              active={environment === 'local'}
              topology="Frontend: localhost:3000 | Backend: localhost containers or *.local.nself.org"
            />
            <EnvCard
              name="Staging"
              active={environment === 'staging'}
              topology="Frontend + Backend: same server | *.staging.mydomain.com"
            />
            <EnvCard
              name="Production"
              active={environment === 'production'}
              topology="Frontend: Vercel/CDN | Backend: VPS/AWS | *.mydomain.com"
            />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Platform Targets</h2>
          <div className="flex flex-wrap gap-3">
            <PlatformBadge platform="web" active={platform === 'web'} />
            <PlatformBadge platform="desktop" active={platform === 'desktop'} />
            <PlatformBadge platform="mobile" active={platform === 'mobile'} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Data Flow</h2>
          <ArchitectureDiagram provider={provider} />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Foundation Toolkit</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ToolkitCard icon={Moon} title="Theme System" description="Dark/light mode with system detection and persistence" />
            <ToolkitCard icon={AlertTriangle} title="Error Boundary" description="Global error catching with fallback UI and recovery" />
            <ToolkitCard icon={Layout} title="App Shell" description="Responsive layout with collapsible sidebar and mobile nav" />
            <ToolkitCard icon={Lock} title="Protected Routes" description="Auth-gated wrapper with loading and fallback states" />
            <ToolkitCard icon={Flag} title="Feature Flags" description="Toggle features via config with localStorage override" />
            <ToolkitCard icon={FileText} title="Form Utilities" description="Zod validation schemas for common field types" />
            <ToolkitCard icon={RefreshCw} title="Retry & Backoff" description="Exponential backoff with jitter for failed requests" />
            <ToolkitCard icon={Heart} title="Health Monitor" description="Backend connectivity with latency tracking" />
            <ToolkitCard icon={Globe} title="SEO Metadata" description="Dynamic meta, Open Graph, and Twitter card generation" />
            <ToolkitCard icon={Keyboard} title="Keyboard Shortcuts" description="Global hotkey hook with modifier key support" />
            <ToolkitCard icon={Copy} title="Clipboard" description="Copy to clipboard with auto-reset copied state" />
            <ToolkitCard icon={Clock} title="Debounce" description="Value and callback debouncing for search and input" />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Available Hooks</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <HookCard name="useAuth" args="" description="Auth state, signIn, signUp, signOut" />
            <HookCard name="useQuery" args="table" description="Fetch data with caching" />
            <HookCard name="useMutation" args="table, type" description="Insert, update, delete with offline queue" />
            <HookCard name="useStorage" args="bucket" description="Upload, download, list files" />
            <HookCard name="useRealtime" args="channel" description="Subscribe to realtime events" />
            <HookCard name="useFunctions" args="name" description="Invoke serverless functions" />
            <HookCard name="useTheme" args="" description="Dark mode toggle and detection" />
            <HookCard name="useOffline" args="" description="Online/offline status" />
            <HookCard name="useHealthCheck" args="" description="Backend health and latency" />
            <HookCard name="useLocalStorage" args="key, init" description="Persistent state in localStorage" />
            <HookCard name="useDebounce" args="value, ms" description="Debounce any changing value" />
            <HookCard name="useMediaQuery" args="query" description="Responsive breakpoint detection" />
            <HookCard name="usePagination" args="options" description="Page state, navigation, ranges" />
            <HookCard name="useInfiniteScroll" args="fetchPage" description="Intersection observer auto-load" />
            <HookCard name="useKeyboardShortcut" args="key, cb" description="Global hotkey binding" />
            <HookCard name="useCopyToClipboard" args="" description="Clipboard write with state" />
            <HookCard name="useFeatureFlag" args="name" description="Read feature flag values" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Quick Reference</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReferenceCard title="Switch to Bolt" code="NEXT_PUBLIC_BACKEND_PROVIDER=bolt" />
            <ReferenceCard title="Switch to nSelf" code="NEXT_PUBLIC_BACKEND_PROVIDER=nself" />
            <ReferenceCard title="Switch to Nhost" code="NEXT_PUBLIC_BACKEND_PROVIDER=nhost" />
            <ReferenceCard title="Set Environment" code="NEXT_PUBLIC_ENVIRONMENT=production" />
            <ReferenceCard title="Use Database Hook" code="const { data } = useQuery('app_todos')" />
            <ReferenceCard title="Use Auth Hook" code="const { user, signIn } = useAuth()" />
            <ReferenceCard title="Protected Route" code="<ProtectedRoute>{children}</ProtectedRoute>" />
            <ReferenceCard title="Error Boundary" code="<ErrorBoundary>{children}</ErrorBoundary>" />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 text-xs text-muted-foreground">
          <span>{config.appName} v{config.appVersion}</span>
          <div className="flex items-center gap-3">
            <a href="/login/" className="hover:text-foreground transition-colors">Login</a>
            <a href="/register/" className="hover:text-foreground transition-colors">Register</a>
            <a href="/dashboard/" className="hover:text-foreground transition-colors">Dashboard</a>
            <a href="/skins/" className="hover:text-foreground transition-colors">Skins</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function providerIdx(p: string): number {
  return { bolt: 0, supabase: 1, nhost: 2, nself: 3 }[p] ?? 0;
}

function MatrixRow({ service, cells, activeIdx }: { service: string; cells: string[]; activeIdx: number }) {
  return (
    <tr className="border-b border-border/20 last:border-0">
      <td className="px-4 py-2 font-medium text-foreground">{service}</td>
      {cells.map((cell, i) => (
        <td
          key={i}
          className={`px-4 py-2 ${i === activeIdx ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
        >
          {cell}
          {i === activeIdx && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />}
        </td>
      ))}
    </tr>
  );
}

function EnvCard({ name, active, topology }: { name: string; active: boolean; topology: string }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-card'}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium">{name}</span>
        {active && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{topology}</p>
    </div>
  );
}

function ToolkitCard({ icon: Icon, title, description }: { icon: typeof Moon; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 transition-colors hover:bg-accent/50">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function HookCard({ name, args, description }: { name: string; args: string; description: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <code className="text-xs font-mono font-medium text-foreground">
        {name}({args})
      </code>
      <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

function ReferenceCard({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="mb-2 text-xs font-medium text-muted-foreground">{title}</div>
      <code className="block rounded-lg bg-muted px-3 py-2 text-xs font-mono text-foreground">
        {code}
      </code>
    </div>
  );
}
