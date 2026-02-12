import type { Metadata } from 'next';
import { TodosPageContent } from './content';

export const metadata: Metadata = {
  title: 'Todos | nApp',
  description: 'Manage your tasks with realtime updates and sharing',
};

export default function TodosPage() {
  return <TodosPageContent />;
}
