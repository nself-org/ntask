export type BackendProvider = 'bolt' | 'supabase' | 'nhost' | 'nself';
export type Environment = 'local' | 'staging' | 'production';
export type Platform = 'web' | 'desktop' | 'mobile';

export const config = {
  backend: (process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'nself') as BackendProvider,
  environment: (process.env.NEXT_PUBLIC_ENVIRONMENT || 'local') as Environment,
  platform: (process.env.NEXT_PUBLIC_PLATFORM || 'web') as Platform,

  appName: process.env.NEXT_PUBLIC_APP_NAME || 'App',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',

  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  nhost: {
    backendUrl: process.env.NEXT_PUBLIC_NHOST_BACKEND_URL || '',
    region: process.env.NEXT_PUBLIC_NHOST_REGION || '',
    subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || '',
    graphqlUrl: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL || '',
    graphqlWsUrl: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_WS_URL || '',
    authUrl: process.env.NEXT_PUBLIC_NHOST_AUTH_URL || '',
    storageUrl: process.env.NEXT_PUBLIC_NHOST_STORAGE_URL || '',
    functionsUrl: process.env.NEXT_PUBLIC_NHOST_FUNCTIONS_URL || '',
  },

  nself: {
    graphqlUrl: process.env.NEXT_PUBLIC_NSELF_GRAPHQL_URL || '',
    graphqlWsUrl: process.env.NEXT_PUBLIC_NSELF_GRAPHQL_WS_URL || '',
    authUrl: process.env.NEXT_PUBLIC_NSELF_AUTH_URL || '',
    storageUrl: process.env.NEXT_PUBLIC_NSELF_STORAGE_URL || '',
    realtimeUrl: process.env.NEXT_PUBLIC_NSELF_REALTIME_URL || '',
    functionsUrl: process.env.NEXT_PUBLIC_NSELF_FUNCTIONS_URL || '',
  },
} as const;

export function isBolt(): boolean {
  return config.backend === 'bolt';
}

export function isSupabase(): boolean {
  return config.backend === 'supabase' || config.backend === 'bolt';
}

export function isNhost(): boolean {
  return config.backend === 'nhost';
}

export function isNself(): boolean {
  return config.backend === 'nself';
}

export function isHasuraBased(): boolean {
  return config.backend === 'nhost' || config.backend === 'nself';
}

export function isLocal(): boolean {
  return config.environment === 'local';
}

export function isStaging(): boolean {
  return config.environment === 'staging';
}

export function isProduction(): boolean {
  return config.environment === 'production';
}

export function isDesktop(): boolean {
  return config.platform === 'desktop';
}

export function isMobile(): boolean {
  return config.platform === 'mobile';
}

export function isWeb(): boolean {
  return config.platform === 'web';
}

export function getProviderLabel(): string {
  switch (config.backend) {
    case 'bolt': return 'Bolt (Supabase)';
    case 'supabase': return 'Supabase';
    case 'nhost': return 'Nhost';
    case 'nself': return 'ɳSelf';
  }
}

export function getEnvironmentLabel(): string {
  switch (config.environment) {
    case 'local': return 'Local Dev';
    case 'staging': return 'Staging';
    case 'production': return 'Production';
  }
}
