import { getBackend } from '../backend';
import type { BackendClient } from '../types/backend';
import { Tables } from '../utils/tables';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoShare {
  id: string;
  todo_id: string;
  shared_with_email: string;
  permission: 'view' | 'edit';
  created_at: string;
}

export interface CreateTodoInput {
  title: string;
  completed?: boolean;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
  is_public?: boolean;
}

export interface ShareTodoInput {
  todo_id: string;
  shared_with_email: string;
  permission: 'view' | 'edit';
}

export class TodoService {
  private backend: BackendClient;

  constructor(backendAdapter: BackendClient) {
    this.backend = backendAdapter;
  }

  async getTodos(): Promise<Todo[]> {
    const { data, error } = await this.backend.db.query<Todo>(Tables.TODOS, {
      orderBy: [{ column: 'created_at', ascending: false }],
    });

    if (error) throw new Error(error);
    return data || [];
  }

  async getTodoById(id: string): Promise<Todo | null> {
    const { data, error } = await this.backend.db.queryById<Todo>(Tables.TODOS, id);

    if (error) throw new Error(error);
    return data;
  }

  async createTodo(input: CreateTodoInput): Promise<Todo> {
    const user = await this.backend.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.backend.db.insert<Todo>(Tables.TODOS, {
      user_id: user.id,
      title: input.title,
      completed: input.completed ?? false,
      is_public: false,
    });

    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to create todo');
    return data;
  }

  async updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
    const { data, error } = await this.backend.db.update<Todo>(Tables.TODOS, id, input as Record<string, unknown>);

    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to update todo');
    return data;
  }

  async deleteTodo(id: string): Promise<void> {
    const { error } = await this.backend.db.remove(Tables.TODOS, id);

    if (error) throw new Error(error);
  }

  async toggleTodo(id: string): Promise<Todo> {
    const todo = await this.getTodoById(id);
    if (!todo) throw new Error('Todo not found');

    return this.updateTodo(id, { completed: !todo.completed });
  }

  async togglePublic(id: string): Promise<Todo> {
    const todo = await this.getTodoById(id);
    if (!todo) throw new Error('Todo not found');

    return this.updateTodo(id, { is_public: !todo.is_public });
  }

  // --- Sharing ---

  async getShares(todoId: string): Promise<TodoShare[]> {
    const { data, error } = await this.backend.db.query<TodoShare>(Tables.TODO_SHARES, {
      where: { todo_id: todoId },
      orderBy: [{ column: 'created_at', ascending: false }],
    });

    if (error) throw new Error(error);
    return data || [];
  }

  async shareTodo(input: ShareTodoInput): Promise<TodoShare> {
    const { data, error } = await this.backend.db.insert<TodoShare>(Tables.TODO_SHARES, {
      todo_id: input.todo_id,
      shared_with_email: input.shared_with_email,
      permission: input.permission,
    });

    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to share todo');
    return data;
  }

  async removeShare(shareId: string): Promise<void> {
    const { error } = await this.backend.db.remove(Tables.TODO_SHARES, shareId);

    if (error) throw new Error(error);
  }

  async updateSharePermission(shareId: string, permission: 'view' | 'edit'): Promise<TodoShare> {
    const { data, error } = await this.backend.db.update<TodoShare>(Tables.TODO_SHARES, shareId, { permission });

    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to update share');
    return data;
  }

  subscribeToTodos(callback: (todos: Todo[]) => void): () => void {
    const channel = this.backend.realtime.channel(Tables.TODOS);

    channel
      .on('*', async () => {
        const todos = await this.getTodos();
        callback(todos);
      })
      .subscribe();

    return () => {
      this.backend.realtime.removeChannel(Tables.TODOS);
    };
  }
}

export const todoService = new TodoService(getBackend());
