import { EndpointsContent } from './components/endpoints-content';

export default async function EndpointsPage() {
  return (
    <main className="min-h-full bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <EndpointsContent />
      </div>
    </main>
  );
}
