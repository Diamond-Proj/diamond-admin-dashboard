import { cookies } from 'next/headers';
import { is_authenticated } from '@/lib/authUtils';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const isAuthenticated = await is_authenticated();
  
  // If not authenticated, redirect to sign-in page
  if (!isAuthenticated) {
    redirect('/sign-in');
  }
  
  // Get user profile information from cookies
  const name = cookies().get('name')?.value || 'Not available';
  const email = cookies().get('email')?.value || 'Not available';
  const username = cookies().get('primary_username')?.value || 'Not available';
  const institution = cookies().get('institution')?.value || 'Not available';
  
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center mb-8">
        <h1 className="font-semibold text-lg md:text-2xl">Your Profile</h1>
      </div>
      
      <div className="w-full max-w-3xl">
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-medium mr-4">
              {name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="text-muted-foreground">{email}</p>
            </div>
          </div>
          
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="card-muted p-4">
                <dt className="font-medium text-muted-foreground mb-1">Full Name</dt>
                <dd className="text-foreground">{name}</dd>
              </div>
              
              <div className="card-muted p-4">
                <dt className="font-medium text-muted-foreground mb-1">Email</dt>
                <dd className="text-foreground">{email}</dd>
              </div>
              
              <div className="card-muted p-4">
                <dt className="font-medium text-muted-foreground mb-1">Username</dt>
                <dd className="text-foreground">{username}</dd>
              </div>
              
              <div className="card-muted p-4">
                <dt className="font-medium text-muted-foreground mb-1">Institution</dt>
                <dd className="text-foreground">{institution}</dd>
              </div>
            </dl>
          </div>
          
          <div className="border-t border-border mt-6 pt-6">
            <h3 className="text-lg font-medium mb-4">Authentication</h3>
            <div className="bg-success p-3 rounded-md mb-2">
              <p className="text-success font-medium">✓ Your account is authenticated with Globus</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your authentication is managed through Globus Auth. If you need to update your profile information,
              please visit your Globus account settings.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 