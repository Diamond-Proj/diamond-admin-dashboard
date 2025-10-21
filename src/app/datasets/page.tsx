import { DatasetsPageContent } from './components/datasets-page-content';

export default async function DatasetsPage() {
  return (
    <main className="min-h-full bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <DatasetsPageContent />
      </div>
    </main>
  );
}
