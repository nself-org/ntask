'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { useActivity } from '@/hooks/use-activity';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  created: 'created this task',
  updated: 'updated this task',
  completed: 'marked as complete',
  assigned: 'was assigned',
  deleted: 'deleted this task',
};

interface TodoActivityLogProps {
  todoId: string;
}

export function TodoActivityLog({ todoId }: TodoActivityLogProps) {
  const { activities, loading } = useActivity(todoId);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
        <span>No activity yet.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const actorName = a.actor?.display_name || a.actor?.email || 'Someone';
        const label = ACTION_LABELS[a.action] ?? a.action;
        const date = new Date(a.created_at);

        return (
          <div key={a.id} className="flex items-start gap-2 text-xs">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-medium uppercase">
              {actorName.slice(0, 1)}
            </div>
            <div className="flex-1 leading-relaxed">
              <span className="font-medium">{actorName}</span>
              {' '}
              <span className="text-muted-foreground">{label}</span>
              {a.metadata && typeof a.metadata === 'object' && 'field' in a.metadata && (
                <span className="text-muted-foreground">
                  {' — '}{String(a.metadata.field)}
                </span>
              )}
            </div>
            <time
              dateTime={a.created_at}
              title={format(date, 'PPpp')}
              className="shrink-0 text-muted-foreground"
            >
              {formatDistanceToNow(date, { addSuffix: true })}
            </time>
          </div>
        );
      })}
    </div>
  );
}
