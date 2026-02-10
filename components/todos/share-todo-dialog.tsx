'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { TodoShare } from '@/lib/services/todos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Lock, Copy, Loader2, Trash2, UserPlus } from 'lucide-react';

interface ShareTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todoId: string;
  todoTitle: string;
  isPublic: boolean;
  onTogglePublic: () => Promise<void>;
  onShare: (email: string, permission: 'view' | 'edit') => Promise<void>;
  onRemoveShare: (shareId: string) => Promise<void>;
  getShares: (todoId: string) => Promise<TodoShare[]>;
}

export function ShareTodoDialog({
  open,
  onOpenChange,
  todoId,
  todoTitle,
  isPublic,
  onTogglePublic,
  onShare,
  onRemoveShare,
  getShares,
}: ShareTodoDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [shares, setShares] = useState<TodoShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharesLoading, setSharesLoading] = useState(false);

  const loadShares = useCallback(async () => {
    setSharesLoading(true);
    try {
      const data = await getShares(todoId);
      setShares(data);
    } catch {
      // Error already handled by hook
    } finally {
      setSharesLoading(false);
    }
  }, [getShares, todoId]);

  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open, loadShares]);

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await onShare(email.trim(), permission);
      setEmail('');
      await loadShares();
    } catch {
      // Error already handled by hook
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveShare(shareId: string) {
    try {
      await onRemoveShare(shareId);
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } catch {
      // Error already handled by hook
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/todo/${todoId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Todo</DialogTitle>
          <DialogDescription className="truncate">
            {todoTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-4 w-4 text-emerald-500" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isPublic ? 'Public' : 'Private'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? 'Anyone with the link can view'
                    : 'Only you and shared users can access'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePublic}
            >
              {isPublic ? 'Make Private' : 'Make Public'}
            </Button>
          </div>

          {/* Copy link */}
          <div className="flex items-center gap-2">
            <Input
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/todo/${todoId}`}
              readOnly
              className="text-xs"
            />
            <Button variant="outline" size="icon" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Share by email */}
          <form onSubmit={handleShare} className="space-y-3">
            <Label>Share with someone</Label>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                disabled={loading}
                className="flex-1"
              />
              <Select
                value={permission}
                onValueChange={(v) => setPermission(v as 'view' | 'edit')}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" size="icon" disabled={loading || !email.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Current shares */}
          {sharesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              <Label>Shared with</Label>
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-sm">{share.shared_with_email}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {share.permission}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleRemoveShare(share.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
