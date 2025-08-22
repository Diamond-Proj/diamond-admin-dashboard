import { is_authenticated } from '@/lib/authUtils';
import { SettingsForm } from './form';

export default async function SettingsPage() {
  const isAuthenticated = await is_authenticated();
  
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center mb-8">
        <h1 className="font-semibold text-lg md:text-2xl">Settings</h1>
      </div>
      <div className="w-full max-w-4xl">
        <SettingsForm />
      </div>
    </main>
  );
}
