'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateUserProfile } from '@/lib/taskHandlers';

export default function DashboardPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status from cookies client-side
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      
      const authCookies = [
        'is_authenticated',
        'tokens',
        'access_token',
        'id_token',
        'refresh_token',
        'name',
        'email',
        'primary_identity'
      ];
      
      const hasAuthCookie = cookies.some(cookie => {
        const cookieName = cookie.trim().split('=')[0];
        return authCookies.includes(cookieName);
      });
      
      setIsAuthenticated(hasAuthCookie);
      
      // If authenticated, get user info from cookies
      if (hasAuthCookie) {
        const cookieObj: Record<string, string> = {};
        cookies.forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (name) cookieObj[name] = decodeURIComponent(value || '');
        });
        
        setUserInfo({
          name: cookieObj['name'],
          email: cookieObj['email'],
          primary_identity: cookieObj['primary_identity'],
          institution: cookieObj['institution']
        });
      }
    };

    // Check auth only once when component mounts
    checkAuth();
  }, []);
  
  // Update user profile once when authenticated and user info is available
  useEffect(() => {
    const checkAndUpdateProfile = async () => {
      console.log('checkAndUpdateProfile');
      if (isAuthenticated && userInfo && userInfo.primary_identity) {
        console.log('userInfo', userInfo);
        try {
          const profile = await getUserProfile({
            identity_id: userInfo.primary_identity
          });
          console.log('profile', profile);
          // If the profile is not found, create it or if any of the fields are different, update it
          if (!profile.profile || profile.profile.institution !== userInfo.institution) {
            console.log('updating profile');
            await updateUserProfile({
              identity_id: userInfo.primary_identity,
              name: userInfo.name,
              email: userInfo.email,
              institution: userInfo.institution,
            });
            console.log('profile updated');
          }
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
    };
    
    checkAndUpdateProfile();
  }, [isAuthenticated, userInfo]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <main className="flex flex-1 flex-col p-4 md:p-6 items-center justify-center">
        <div className="text-center">
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }
  
  return (
    <>
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <div className="flex items-center mb-8">
          <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
        </div>
        <div className="w-full mb-4">
          {/* <Search value={searchParams.q} /> */}
        </div>
        <div className="w-full mb-4">
          {isAuthenticated ? (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
              <div className="bg-success p-3 rounded-md mb-6">
                <p className="text-success font-medium">
                  ✓ You are successfully authenticated
                </p>
              </div>
              
              {/* Globus Compute Endpoint Setup Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Globus Compute Endpoint Setup</h3>
                <div className="bg-info p-4 rounded-md">
                  <p className="mb-2 text-info font-medium">
                    <strong>Important:</strong> Before using Diamond services, you need to create a <a href="https://globus-compute.readthedocs.io/en/2.6.0/endpoints.html" target="_blank" rel="noopener noreferrer">Globus Compute endpoint</a> on your HPC machine.
                  </p>
                  <p className="mb-2">
                    Install Globus Compute Endpoint package PyPi package:
                  </p>
                  <div className="card-muted p-3 rounded font-mono text-sm mb-3">
                    python3 -m pipx install globus-compute-endpoint
                  </div>
                  <p className="mb-2">
                    To create an endpoint, run the following command on your HPC machine:
                  </p>
                  <div className="card-muted p-3 rounded font-mono text-sm mb-3">
                    globus-compute-endpoint configure &lt;endpoint-name&gt;
                  </div>
                  <p className="mb-2">
                    After creating your endpoint, start it with:
                  </p>
                  <div className="card-muted p-3 rounded font-mono text-sm mb-3">
                    globus-compute-endpoint start &lt;endpoint-name&gt;
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Replace &lt;endpoint-name&gt; with a unique name for your endpoint. This step is required to connect your HPC resources with Diamond.
                  </p>
                </div>
              </div>
              
              {/* Welcome message and getting started information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Getting Started</h3>
                <div className="card-muted p-4 rounded-md">
                  <p className="mb-3">
                    Welcome to Diamond! You can now use the navigation menu to access various features:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Image Builder</strong> - Create custom container images for your HPC workloads</li>
                    <li><strong>Image Manager</strong> - Manage your existing container images</li>
                    <li><strong>Job Composer</strong> - Create and submit jobs to HPC resources</li>
                    <li><strong>Task Manager</strong> - Monitor and manage your running tasks</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
              <div className="bg-warning p-3 rounded-md">
                <p className="text-warning">
                  You are not authenticated. Please sign in to access the dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
