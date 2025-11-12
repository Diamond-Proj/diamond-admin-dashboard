import { TasksPageContent } from './components/tasks-page-content';

export default async function TasksPage() {
  const isAuthenticated = true;

  return (
    <main className="min-h-full bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <TasksPageContent isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}
