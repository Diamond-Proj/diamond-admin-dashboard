import { is_authenticated } from '@/lib/authUtils';
import { ContainerManagerForm } from './form';

export default async function ContainerManagerPage() {
  const isAuthenticated = await is_authenticated();
  return (
    <main className="flex flex-1 flex-col gap-4 m-8 md:gap-8 md:p-6 items-start">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Task Manager</h1>
      </div>
      <div className="flex flex-2 flex-col items-center gap-2 px-8 w-full">
        <ContainerManagerForm isAuthenticated/>
      </div>
    </main>
  );
}
