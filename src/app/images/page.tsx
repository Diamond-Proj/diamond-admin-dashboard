import { is_authenticated } from '@/lib/authUtils';
import { ImagesPageContent } from './components/images-page-content';

export default async function ImagesPage() {
  const isAuthenticated = await is_authenticated();

  return (
    <main className="h-full bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <ImagesPageContent isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}
