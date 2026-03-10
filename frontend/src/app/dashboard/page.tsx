'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/providers';
import { AppShell } from '@/components/layout/app-shell';
import { AppHeader } from '@/components/layout/app-header';
import { ListSidebar } from '@/components/lists/list-sidebar';
import { TodoList } from '@/components/todos/todo-list';
import { Loader2, ListTodo } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'there';

  return (
    <AppShell
      header={<AppHeader />}
      sidebar={<ListSidebar />}
      collapsible
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {getGreeting()}, {displayName}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ListTodo className="h-3.5 w-3.5" />
            My Tasks
          </p>
        </div>

        <TodoList />
      </div>
    </AppShell>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
