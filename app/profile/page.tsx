import { cookies } from 'next/headers';
import { is_authenticated } from '@/lib/authUtils';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const isAuthenticated = await is_authenticated();

  // If not authenticated, redirect to sign-in page
  if (!isAuthenticated) {
    redirect('/sign-in');
  }

  const cookieStore = await cookies();
  // Get user profile information from cookies
  const name = cookieStore.get('name')?.value || 'Not available';
  const email = cookieStore.get('email')?.value || 'Not available';
  const username =
    cookieStore.get('primary_username')?.value || 'Not available';
  const institution = cookieStore.get('institution')?.value || 'Not available';

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="mb-8 flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Your Profile</h1>
      </div>

      <div className="w-full max-w-3xl">
        <div className="card p-6">
          <div className="mb-6 flex items-center">
            <div className="bg-primary text-primary-foreground mr-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-medium">
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="border-border border-t pt-6">
            <h3 className="mb-4 text-lg font-medium">Account Information</h3>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="card-muted p-4">
                <dt className="text-muted-foreground mb-1 font-medium">
                  Full Name
                </dt>
                <dd className="text-foreground">{name}</dd>
              </div>

              <div className="card-muted p-4">
                <dt className="text-muted-foreground mb-1 font-medium">
                  Email
                </dt>
                <dd className="text-foreground">{email}</dd>
              </div>

              <div className="card-muted p-4">
                <dt className="text-muted-foreground mb-1 font-medium">
                  Username
                </dt>
                <dd className="text-foreground">{username}</dd>
              </div>

              <div className="card-muted p-4">
                <dt className="text-muted-foreground mb-1 font-medium">
                  Institution
                </dt>
                <dd className="text-foreground">{institution}</dd>
              </div>
            </dl>
          </div>

          <div className="border-border mt-6 border-t pt-6">
            <h3 className="mb-4 text-lg font-medium">Authentication</h3>
            <div className="bg-success mb-2 rounded-md p-3">
              <p className="text-success font-medium">
                ✓ Your account is authenticated with Globus
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              Your authentication is managed through Globus Auth. If you need to
              update your profile information, please visit your Globus account
              settings.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
