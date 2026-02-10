'use client';

import { AppHeader } from '@/components/layout/app-header';
import { TodoList } from '@/components/todos/todo-list';

export function TodosPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
          <p className="text-muted-foreground mt-2">
            Create, share, and collaborate on tasks with other users
          </p>
        </div>
        <TodoList />
      </main>
    </div>
  );
}
