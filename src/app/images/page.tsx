import { is_authenticated } from '@/lib/authUtils';
import { ImagesPageContent } from './components/images-page-content';

export default async function ImagesPage() {
  const isAuthenticated = await is_authenticated();

  return (
    <main className="flex h-full flex-1 flex-col gap-6 bg-gray-50 p-4 md:p-6 lg:p-8 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[1400px]">
        <ImagesPageContent isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}
