import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'local',
    backend: process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'nself',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  return NextResponse.json(health);
}
