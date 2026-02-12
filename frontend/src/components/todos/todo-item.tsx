'use client';

import { useState } from 'react';
import type { Todo, TodoShare, UpdateTodoInput } from '@/lib/services/todos';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Check, X, Share2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareTodoDialog } from './share-todo-dialog';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onUpdate: (id: string, input: UpdateTodoInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePublic: (id: string) => Promise<void>;
  onShare: (todoId: string, email: string, permission: 'view' | 'edit') => Promise<void>;
  onRemoveShare: (shareId: string) => Promise<void>;
  getShares: (todoId: string) => Promise<TodoShare[]>;
}

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  onTogglePublic,
  onShare,
  onRemoveShare,
  getShares,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isLoading, setIsLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(todo.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    setIsLoading(true);
    try {
      await onUpdate(todo.id, { title: editTitle });
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={handleToggle}
          disabled={isLoading || isEditing}
          className="mt-0.5"
        />

        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
            autoFocus
          />
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  'text-sm font-medium truncate',
                  todo.completed && 'line-through text-muted-foreground'
                )}
              >
                {todo.title}
              </p>
              {todo.is_public && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                  <Globe className="h-2.5 w-2.5 mr-0.5" />
                  Public
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(todo.created_at).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSave}
                disabled={isLoading || !editTitle.trim()}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShareOpen(true)}
                disabled={isLoading}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                disabled={isLoading}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <ShareTodoDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        todoId={todo.id}
        todoTitle={todo.title}
        isPublic={todo.is_public}
        onTogglePublic={() => onTogglePublic(todo.id)}
        onShare={(email, perm) => onShare(todo.id, email, perm)}
        onRemoveShare={onRemoveShare}
        getShares={getShares}
      />
    </>
  );
}
