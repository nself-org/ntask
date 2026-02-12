'use client';

import { useState } from 'react';
import type { CreateTodoInput } from '@/lib/services/todos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface CreateTodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<void>;
}

export function CreateTodoForm({ onSubmit }: CreateTodoFormProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit({ title: title.trim() });
      setTitle('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        disabled={isLoading}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !title.trim()}>
        <Plus className="h-4 w-4 mr-2" />
        Add
      </Button>
    </form>
  );
}
