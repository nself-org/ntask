export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  env: Environment;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  isServer: boolean;
  isClient: boolean;
  enableDevTools: boolean;
  enableFauxSignin: boolean;
  apiUrl: string;
}

function detectEnvironment(): Environment {
  if (typeof window === 'undefined') {
    return (process.env.NODE_ENV as Environment) || 'development';
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.local')) {
    return 'development';
  }

  if (hostname.includes('staging') || hostname.includes('preview') || hostname.includes('dev')) {
    return 'staging';
  }

  return 'production';
}

function createEnvironmentConfig(): EnvironmentConfig {
  const env = detectEnvironment();
  const isServer = typeof window === 'undefined';
  const isClient = !isServer;

  const isDevelopment = env === 'development';
  const isStaging = env === 'staging';
  const isProduction = env === 'production';

  return {
    env,
    isDevelopment,
    isStaging,
    isProduction,
    isServer,
    isClient,
    enableDevTools: isDevelopment || isStaging,
    enableFauxSignin: isDevelopment,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  };
}

export const env = createEnvironmentConfig();

export function isDevEnvironment(): boolean {
  return env.isDevelopment;
}

export function isStagingEnvironment(): boolean {
  return env.isStaging;
}

export function isProductionEnvironment(): boolean {
  return env.isProduction;
}

export function shouldEnableDevTools(): boolean {
  return env.enableDevTools;
}

export function shouldEnableFauxSignin(): boolean {
  return env.enableFauxSignin;
}

export function getEnvironmentName(): string {
  switch (env.env) {
    case 'development':
      return 'Development';
    case 'staging':
      return 'Staging';
    case 'production':
      return 'Production';
    default:
      return 'Unknown';
  }
}

export function getEnvironmentColor(): string {
  switch (env.env) {
    case 'development':
      return '#10b981';
    case 'staging':
      return '#f59e0b';
    case 'production':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}
