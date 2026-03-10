'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBackend } from '@/lib/providers/backend-provider';
import { Tables } from '@/lib/utils/tables';
import type { TodoActivity } from '@/lib/types/todos';

export function useActivity(todoId: string | null) {
  const [activities, setActivities] = useState<TodoActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!todoId) return;
    setLoading(true);
    try {
      const backend = getBackend();
      const { data } = await backend.db.select<TodoActivity>(Tables.ACTIVITY, {
        filters: [{ column: 'todo_id', operator: 'eq', value: todoId }],
        orderBy: { column: 'created_at', ascending: false },
        limit: 50,
      });
      setActivities(data ?? []);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [todoId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, refetch: fetchActivities };
}
