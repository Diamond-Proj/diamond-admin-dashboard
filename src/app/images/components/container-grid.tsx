'use client';

import { useEffect, useState, useCallback } from 'react';
import { Container, CheckCircle2, Clock, X, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  ContainerData,
  ContainersResponse,
  ContainersApiResponse
} from '@/app/images/types';
import ContainerItem from './container/ContainerItem';
import { BuilderLogs } from './builder/builder-logs';

interface ContainerGridProps {
  isAuthenticated: boolean;
  refreshTrigger: number;
}

export function ContainerGrid({
  isAuthenticated,
  refreshTrigger
}: ContainerGridProps) {
  const [privateContainers, setPrivateContainers] =
    useState<ContainersResponse>({});
  const [publicContainers, setPublicContainers] = useState<
    Record<string, ContainersResponse>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [deletingContainers, setDeletingContainers] = useState<Set<string>>(
    new Set()
  );
  const [activeLogViewer, setActiveLogViewer] = useState<{
    taskId: string;
    containerName: string;
    endpointId: string;
  } | null>(null);
  const { toast } = useToast();

  const fetchContainerStatus = useCallback(async () => {
    try {
      // setIsLoading(true);
      const response = await fetch('/api/get_all_containers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data: ContainersApiResponse = await response.json();
      console.log('Fetched container data:', data);
      setPrivateContainers(data.containers || {});
      setPublicContainers(data.public_by_host || {});
    } catch (error) {
      console.error('Error fetching container status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch container status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteContainer = async (
    containerName: string,
    containerId: string
  ) => {
    setDeletingContainers((prev) => new Set(prev).add(containerName));

    try {
      const response = await fetch('/api/delete_container', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ containerId })
      });

      if (response.ok) {
        setPrivateContainers((prevData) => {
          const newData = { ...prevData };
          delete newData[containerName];
          return newData;
        });
        toast({
          title: 'Success',
          description: `Container "${containerName}" deleted successfully`
        });
      } else {
        throw new Error('Failed to delete container');
      }
    } catch (error) {
      console.error('Error deleting container:', error);
      toast({
        title: 'Error',
        description: `Failed to delete container "${containerName}"`,
        variant: 'destructive'
      });
    } finally {
      setDeletingContainers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContainerStatus();
      const intervalId = setInterval(fetchContainerStatus, 10000);
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, refreshTrigger, fetchContainerStatus]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'completed+':
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'building':
      case 'pending':
      case 'running':
      case 'completing':
        return (
          <Activity className="h-4 w-4 animate-pulse text-sky-500 dark:text-sky-300" />
        );
      case 'failed':
      case 'error':
      case 'missing':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'completed+':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300';
      case 'building':
      case 'pending':
      case 'running':
      case 'completing':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300';
      case 'failed':
      case 'error':
      case 'missing':
        return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-950/50 dark:text-slate-300';
    }
  };

  const handleViewLogs = useCallback(
    (containerName: string, data: ContainerData) => {
      if (!data.container_task_id || !data.endpoint_id) {
        toast({
          title: 'Logs Unavailable',
          description:
            'Missing build task metadata for this image. Try refreshing the page.',
          variant: 'destructive'
        });
        return;
      }
      setActiveLogViewer({
        taskId: data.container_task_id,
        containerName,
        endpointId: data.endpoint_id
      });
    },
    [toast]
  );

  const handleCloseLogViewer = useCallback(() => {
    setActiveLogViewer(null);
  }, []);

  const handleLogViewerComplete = useCallback(() => {
    fetchContainerStatus();
    setActiveLogViewer(null);
  }, [fetchContainerStatus]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="dashboard-card animate-pulse p-6">
            <div className="flex items-start gap-4">
              <div className="bg-muted dark:bg-muted h-12 w-12 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="bg-muted dark:bg-muted h-4 w-3/4 rounded"></div>
                <div className="bg-muted dark:bg-muted h-3 w-1/2 rounded"></div>
                <div className="space-y-2">
                  <div className="bg-muted dark:bg-muted h-3 w-full rounded"></div>
                  <div className="bg-muted dark:bg-muted h-3 w-2/3 rounded"></div>
                </div>
              </div>
              <div className="bg-muted dark:bg-muted h-8 w-16 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const privateKeys = Object.keys(privateContainers);
  const publicHosts = Object.keys(publicContainers);
  const hasPrivate = privateKeys.length > 0;
  const hasPublic = publicHosts.some(
    (host) =>
      publicContainers[host] && Object.keys(publicContainers[host]).length > 0
  );

  if (!hasPrivate && !hasPublic) {
    return (
      <div className="dashboard-card py-16 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-800/80">
          <Container className="h-12 w-12 text-slate-500 dark:text-slate-300" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          No containers found
        </h3>
        <p className="mx-auto mb-6 max-w-md text-slate-600 dark:text-slate-300">
          {`You haven't built any container images yet. Click "Build New Image" to get started.`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {privateKeys.map((containerName) => {
        const data = privateContainers[containerName];
        if (!data) return null;
        return (
          <ContainerItem
            key={containerName}
            containerName={containerName}
            data={data}
            deletingContainers={deletingContainers}
            deleteContainer={deleteContainer}
            onViewLogs={handleViewLogs}
            getStatusIcon={getStatusIcon}
            getStatusBadgeColor={getStatusBadgeColor}
          />
        );
      })}

      {hasPublic && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Public Images by Host
          </h3>
          {publicHosts.map((host, index) => {
            const hostContainers = publicContainers[host];
            if (!hostContainers || Object.keys(hostContainers).length === 0) {
              return null;
            }
            return (
              <details key={host} className="dashboard-card" open={index === 0}>
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <span>{host}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {Object.keys(hostContainers).length} image
                    {Object.keys(hostContainers).length === 1 ? '' : 's'}
                  </span>
                </summary>
                <div className="border-t border-slate-200/70 px-4 py-4 dark:border-slate-700/70">
                  <div className="flex flex-col gap-4">
                    {Object.entries(hostContainers).map(
                      ([containerName, data]) => (
                        <ContainerItem
                          key={containerName}
                          containerName={containerName}
                          data={data}
                          onViewLogs={handleViewLogs}
                          getStatusIcon={getStatusIcon}
                          getStatusBadgeColor={getStatusBadgeColor}
                        />
                      )
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {activeLogViewer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-[hsl(var(--dashboard-surface))] shadow-xl dark:border-slate-700/80">
            <div className="flex items-center justify-between border-b border-slate-200/70 p-6 dark:border-slate-700/70">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Build Logs: {activeLogViewer.containerName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  SLURM Job ID: {activeLogViewer.taskId}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseLogViewer}
                className="cursor-pointer rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <BuilderLogs
                taskId={activeLogViewer.taskId}
                containerName={activeLogViewer.containerName}
                endpoint={activeLogViewer.endpointId}
                onComplete={handleLogViewerComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
