import { FlowsPageContent } from './components/flows-page-content';

export default async function FlowsPage() {
  const isAuthenticated = true;

  return (
    <main className="min-h-full bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <FlowsPageContent isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}
