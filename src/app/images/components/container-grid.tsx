'use client';

import { useEffect, useState, useCallback } from 'react';
import { Container, CheckCircle2, Clock, X, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ContainersResponse } from '@/app/images/types';
import ContainerItem from './container/ContainerItem';

interface ContainerGridProps {
  isAuthenticated: boolean;
  refreshTrigger: number;
}

export function ContainerGrid({
  isAuthenticated,
  refreshTrigger
}: ContainerGridProps) {
  const [containersData, setContainersData] = useState<ContainersResponse>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deletingContainers, setDeletingContainers] = useState<Set<string>>(
    new Set()
  );
  const { toast } = useToast();

  const fetchContainerStatus = useCallback(async () => {
    try {
      // setIsLoading(true);
      const response = await fetch('/api/get_containers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data: ContainersResponse = await response.json();
      console.log('Fetched container data:', data);
      setContainersData(data);
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
        setContainersData((prevData) => {
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
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'building':
      case 'pending':
        return <Activity className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'failed':
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/30 hover:bg-green-50/70 dark:hover:bg-green-950/40';
      case 'building':
      case 'pending':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/40';
      case 'failed':
      case 'error':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-50/70 dark:hover:bg-red-950/40';
      default:
        return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/30 hover:bg-gray-50/70 dark:hover:bg-gray-950/40';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300';
      case 'building':
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card dark:bg-card space-y-4 rounded-lg border p-6 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="bg-muted dark:bg-muted h-12 w-12 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="bg-muted dark:bg-muted h-4 w-3/4 rounded"></div>
                  <div className="bg-muted dark:bg-muted h-3 w-1/2 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-muted dark:bg-muted h-3 w-full rounded"></div>
                <div className="bg-muted dark:bg-muted ml-auto h-8 w-20 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (Object.keys(containersData).length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="bg-muted dark:bg-muted/50 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <Container className="text-muted-foreground h-12 w-12" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No containers found</h3>
        <p className="text-muted-foreground mx-auto mb-6 max-w-md">
          {`You haven't built any container images yet. Click "Build New Image" to get started.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(containersData).map(([containerName, data]) => (
        <ContainerItem
          key={containerName}
          containerName={containerName}
          data={data}
          deletingContainers={deletingContainers}
          deleteContainer={deleteContainer}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getStatusBadgeColor={getStatusBadgeColor}
        />
      ))}
    </div>
  );
}
