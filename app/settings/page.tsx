import { cookies } from 'next/headers';
import { is_authenticated } from '@/lib/authUtils';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const isAuthenticated = await is_authenticated();
  
  // If not authenticated, redirect to sign-in page
  if (!isAuthenticated) {
    redirect('/sign-in');
  }
  
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center mb-8">
        <h1 className="font-semibold text-lg md:text-2xl">Settings</h1>
      </div>
      
      <div className="w-full max-w-3xl">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Appearance</h3>
              <div className="card-muted p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  You can toggle between light and dark mode using the theme toggle button at the bottom left of the screen.
                </p>
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium mb-4">Endpoint Configuration</h3>
              <div className="card-muted p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your Globus Compute endpoints and manage their settings.
                </p>
                <div className="bg-info p-3 rounded-md mb-4">
                  <p className="text-info text-sm font-medium">
                    <strong>Note:</strong> Endpoint configuration settings will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
              <div className="card-muted p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your notification preferences for job completions, errors, and system updates.
                </p>
                <div className="bg-info p-3 rounded-md">
                  <p className="text-info text-sm font-medium">
                    <strong>Note:</strong> Notification settings will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
