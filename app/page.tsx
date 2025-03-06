import React from 'react';
import { is_authenticated } from '@/lib/authUtils';

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const isAuthenticated = await is_authenticated();
  
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
                    <strong>Important:</strong> Before using Diamond services, you need to create a Globus Compute endpoint on your HPC machine.
                  </p>
                  <p className="mb-2">
                    To create an endpoint, run the following command on your HPC machine:
                  </p>
                  <div className="card-muted p-3 rounded font-mono text-sm mb-3">
                    globus-compute-endpoint create &lt;endpoint-name&gt;
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
