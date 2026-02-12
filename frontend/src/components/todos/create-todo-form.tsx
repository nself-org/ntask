'use client';

import { useState } from 'react';
import type { CreateTodoInput } from '@/lib/types/todos';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTodoDialog } from './create-todo-dialog';

interface CreateTodoFormProps {
  listId: string;
  onSubmit: (input: CreateTodoInput) => Promise<void>;
}

export function CreateTodoForm({ listId, onSubmit }: CreateTodoFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Todo
      </Button>

      <CreateTodoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        listId={listId}
        onCreate={onSubmit}
      />
    </>
  );
}
