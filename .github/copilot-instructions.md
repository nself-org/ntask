# GitHub Copilot Instructions for nApp

This project uses a backend abstraction layer. All application code is backend-agnostic.

## Key Rules

1. **Never import backend SDKs directly** (`@supabase/supabase-js`, `graphql-request`, etc.)
2. **Always use the abstraction hooks**: `useAuth`, `useQuery`, `useMutation`, `useStorage`, `useRealtime`, `useFunctions`
3. **Components use**: shadcn/ui, Tailwind CSS, Lucide React icons
4. **Forms use**: React Hook Form + Zod
5. **Add `'use client'`** directive for components using React hooks

## Import Patterns

```typescript
// Auth
import { useAuth } from '@/lib/providers';

// Data
import { useQuery, useMutation } from '@/hooks';

// Storage
import { useStorage } from '@/hooks';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Icons
import { Plus, Trash2 } from 'lucide-react';

// Config
import { config } from '@/lib/config';
import { appConfig } from '@/lib/app.config';
```

## File Organization

- Pages: `app/[route]/page.tsx`
- Components: `components/[feature]/[name].tsx`
- Hooks: `hooks/use-[name].ts`
- Types: `lib/types/[name].ts`
- Utils: `lib/[name].ts`

## Reference Files

- `lib/types/backend.ts` - All TypeScript interfaces
- `lib/backend/index.ts` - Backend factory
- `hooks/index.ts` - Available hooks
- `.cursorrules` - Complete coding guide
