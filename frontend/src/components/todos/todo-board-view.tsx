'use client';

import { useMemo } from 'react';
import { useTodos } from '@/hooks/use-todos';
import { TodoItem } from './todo-item';
import { QuickAddTodo } from './quick-add-todo';
import { TaskDetailDrawer } from './task-detail-drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/providers/auth-provider';
import { useCanApprove } from '@/hooks/use-list-members';
import { useListPresence } from '@/hooks/use-list-presence';
import { useState, useCallback } from 'react';
import type {
  Todo,
  TodoPriority,
  UpdateTodoInput,
  TodoFilters,
  TodoSortOptions,
} from '@/lib/types/todos';

interface Column {
  id: TodoPriority | 'complete';
  label: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: 'high', label: 'High Priority', color: 'border-red-500' },
  { id: 'medium', label: 'Medium Priority', color: 'border-orange-500' },
  { id: 'low', label: 'Low Priority', color: 'border-blue-500' },
  { id: 'none', label: 'No Priority', color: 'border-muted' },
  { id: 'complete', label: 'Done', color: 'border-green-500' },
];

interface TodoBoardViewProps {
  listId?: string;
  search?: string;
  filters?: TodoFilters;
  sort?: TodoSortOptions;
}

export function TodoBoardView({ listId, search = '', filters, sort }: TodoBoardViewProps) {
  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    togglePublic,
    shareTodo,
    removeShare,
    getShares,
  } = useTodos(listId);

  const { user } = useAuth();
  const { canApprove } = useCanApprove(listId, user?.id);
  const { updateStatus } = useListPresence(listId ?? null);

  const [drawerTodo, setDrawerTodo] = useState<Todo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = useCallback(
    (todo: Todo) => {
      setDrawerTodo(todo);
      setDrawerOpen(true);
      updateStatus('editing', todo.id);
    },
    [updateStatus]
  );

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      setDrawerOpen(open);
      if (!open) updateStatus('viewing', null);
    },
    [updateStatus]
  );

  const visibleTodos = useMemo(() => {
    let filtered = [...todos];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          todo.notes?.toLowerCase().includes(searchLower) ||
          todo.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters) {
      if (filters.completed !== undefined) {
        filtered = filtered.filter((todo) => todo.completed === filters.completed);
      }
      if (filters.priority) {
        filtered = filtered.filter((todo) => todo.priority === filters.priority);
      }
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((todo) =>
          todo.tags?.some((tag) => filters.tags!.includes(tag))
        );
      }
    }

    return filtered;
  }, [todos, search, filters]);

  const columnTodos = useMemo(() => {
    const map: Record<string, Todo[]> = {
      high: [],
      medium: [],
      low: [],
      none: [],
      complete: [],
    };

    for (const todo of visibleTodos) {
      if (todo.completed) {
        map.complete.push(todo);
      } else {
        map[todo.priority || 'none'].push(todo);
      }
    }

    // Sort within each column by position
    for (const col of Object.values(map)) {
      col.sort((a, b) => (a.position || 0) - (b.position || 0));
    }

    return map;
  }, [visibleTodos]);

  const handleApprove = async (todoId: string) => {
    try {
      await updateTodo(todoId, { approved: true, rejected_by: null, rejection_reason: null });
      toast.success('Task approved');
    } catch {
      toast.error('Failed to approve task');
    }
  };

  const handleReject = async (todoId: string, reason?: string) => {
    try {
      await updateTodo(todoId, {
        completed: false,
        approved: false,
        rejected_by: user?.id || null,
        rejection_reason: reason || null,
      });
      toast.success('Task rejected');
    } catch {
      toast.error('Failed to reject task');
    }
  };

  const handleQuickAdd = useCallback(
    async (title: string, priority?: TodoPriority, dueDate?: string) => {
      await createTodo({
        ...(listId ? { list_id: listId } : {}),
        title,
        priority: priority || 'none',
        ...(dueDate ? { due_date: dueDate } : {}),
      });
    },
    [listId, createTodo]
  );

  const handleUpdateTodo = async (id: string, input: UpdateTodoInput) => {
    await updateTodo(id, input);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Quick add */}
      <div className="max-w-sm">
        <QuickAddTodo onAdd={handleQuickAdd} placeholder="Quick add task..." />
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="min-w-[280px] space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTodos = columnTodos[col.id] ?? [];
            return (
              <div
                key={col.id}
                className={`flex min-w-[280px] max-w-[320px] flex-col rounded-lg border-t-4 bg-muted/30 ${col.color}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium">{col.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {colTodos.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {colTodos.length === 0 ? (
                    <div className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                      No tasks
                    </div>
                  ) : (
                    colTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={(id) => toggleTodo(id).then(() => {})}
                        onUpdate={handleUpdateTodo}
                        onDelete={deleteTodo}
                        onTogglePublic={(id) => togglePublic(id).then(() => {})}
                        onShare={(todoId, email, permission) =>
                          shareTodo({ todo_id: todoId, shared_with_email: email, permission }).then(() => {})
                        }
                        onRemoveShare={removeShare}
                        getShares={getShares}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        canApprove={canApprove}
                        onDetailOpen={handleOpenDrawer}
                        selected={false}
                        onSelectChange={() => {}}
                        selectionMode={false}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskDetailDrawer
        todo={drawerTodo}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        onUpdate={handleUpdateTodo}
      />
    </div>
  );
}
