import { SettingsContent } from './components/settings-content';

export default async function SettingsPage() {
  return (
    <main className="min-h-full bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <SettingsContent />
      </div>
    </main>
  );
}
