'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SettingsHeader } from './settings-header';
import { EndpointStats } from './endpoint-stats';
import { EndpointTabs } from './endpoint-tabs';
import { ManagedEndpointCard } from './managed-endpoint-card';
import { AvailableEndpointCard } from './available-endpoint-card';
import { EmptyState } from './empty-state';
import { Loader2 } from 'lucide-react';

interface Endpoint {
  endpoint_uuid: string;
  endpoint_name: string;
  is_managed: boolean;
  diamond_dir?: string;
}

interface EndpointDetail {
  endpoint_name: string;
  endpoint_uuid: string;
  endpoint_host: string;
  endpoint_status: string;
  diamond_dir: string;
}

interface EndpointApiResponse {
  name: string;
  is_managed: boolean;
}

interface EndpointOverviewResponse {
  [uuid: string]: EndpointApiResponse;
}

export function SettingsContent() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [endpointDetails, setEndpointDetails] = useState<EndpointDetail[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [managingEndpoints, setManagingEndpoints] = useState<Set<string>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState<'managed' | 'available'>(
    'managed'
  );
  const { toast } = useToast();

  const fetchEndpoints = useCallback(async () => {
    try {
      const response = await fetch('/api/endpoint_overview', {
        credentials: 'include'
      });
      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to fetch endpoint list. Please try again.',
          variant: 'destructive'
        });
        throw new Error('Failed to fetch endpoints');
      }
      const data = (await response.json()) as EndpointOverviewResponse;

      const endpointArray: Endpoint[] = Object.entries(data).map(
        ([uuid, info]) => ({
          endpoint_uuid: uuid,
          endpoint_name: info.name,
          is_managed: info.is_managed
        })
      );

      const enriched = await Promise.all(
        endpointArray.map(async (ep: Endpoint) => {
          try {
            const res = await fetch(
              `/api/get_diamond_dir?endpoint_uuid=${encodeURIComponent(ep.endpoint_uuid)}`,
              { credentials: 'include' }
            );
            if (!res.ok) return ep;
            const { diamond_dir } = await res.json();
            return { ...ep, diamond_dir: diamond_dir || '' };
          } catch (error) {
            console.error(
              `Failed to fetch diamond_dir for ${ep.endpoint_uuid}:`,
              error
            );
            return ep;
          }
        })
      );
      setEndpoints(enriched);

      // Fetch endpoint details
      try {
        const detailsResponse = await fetch('/api/list_all_endpoints', {
          credentials: 'include'
        });
        if (detailsResponse.ok) {
          const details = (await detailsResponse.json()) as EndpointDetail[];
          setEndpointDetails(details);
        }
      } catch (error) {
        console.error('Failed to fetch endpoint details:', error);
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch endpoints. Please try again.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchEndpoints();
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, [fetchEndpoints]);

  const refreshEndpoints = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/register_all_endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to refresh endpoints');
      }

      toast({
        title: 'Success',
        description: 'Endpoints refreshed successfully!'
      });

      await fetchEndpoints();
    } catch (error) {
      console.error('Error refreshing endpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh endpoints. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleEndpointManagement = async (
    endpointUuid: string,
    isManaged: boolean
  ) => {
    try {
      setManagingEndpoints((prev) => new Set(prev).add(endpointUuid));

      const response = await fetch(`/api/manage_endpoint/${endpointUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_managed: isManaged
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Failed to update endpoint management status'
        );
      }

      toast({
        title: 'Success',
        description: `Endpoint ${isManaged ? 'added to' : 'removed from'} management successfully!`
      });

      setEndpoints((prev) =>
        prev.map((endpoint) =>
          endpoint.endpoint_uuid === endpointUuid
            ? { ...endpoint, is_managed: isManaged }
            : endpoint
        )
      );
    } catch (error) {
      console.error('Error updating endpoint management:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update endpoint management status.',
        variant: 'destructive'
      });

      setEndpoints((prev) => [...prev]);
    } finally {
      setManagingEndpoints((prev) => {
        const next = new Set(prev);
        next.delete(endpointUuid);
        return next;
      });
    }
  };

  const managedEndpoints = endpoints.filter((ep) => ep.is_managed);
  const availableEndpoints = endpoints.filter((ep) => !ep.is_managed);

  return (
    <div className="space-y-6">
      <SettingsHeader
        isRefreshing={isRefreshing}
        onRefresh={refreshEndpoints}
      />

      {isInitialLoading && (
        <>
          {/* Stats Loading Skeleton */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm dark:border-gray-700/60 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-8 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Loading */}
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading endpoints...
              </p>
            </div>
          </div>
        </>
      )}

      {!isInitialLoading && (
        <>
          <EndpointStats
            totalEndpoints={endpoints.length}
            managedEndpoints={managedEndpoints.length}
            availableEndpoints={availableEndpoints.length}
            configuredEndpoints={
              managedEndpoints.filter((ep) => ep.diamond_dir).length
            }
          />

          <EndpointTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'managed' && (
            <div className="space-y-4">
              {managedEndpoints.length === 0 && (
                <EmptyState
                  type="managed"
                  onAction={() => setActiveTab('available')}
                />
              )}
              {managedEndpoints.length > 0 &&
                managedEndpoints.map((endpoint) => (
                  <ManagedEndpointCard
                    key={endpoint.endpoint_uuid}
                    endpoint={endpoint}
                    endpointDetail={endpointDetails.find(
                      (detail) =>
                        detail.endpoint_uuid === endpoint.endpoint_uuid
                    )}
                    isManaging={managingEndpoints.has(endpoint.endpoint_uuid)}
                    onRemove={() =>
                      toggleEndpointManagement(endpoint.endpoint_uuid, false)
                    }
                  />
                ))}
            </div>
          )}

          {activeTab === 'available' && (
            <div className="space-y-3">
              {availableEndpoints.length === 0 && (
                <EmptyState type="available" />
              )}
              {availableEndpoints.length > 0 && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add endpoints to Diamond management to configure work paths
                    and enable workflow execution.
                  </p>
                  {availableEndpoints.map((endpoint) => (
                    <AvailableEndpointCard
                      key={endpoint.endpoint_uuid}
                      endpoint={endpoint}
                      isAdding={managingEndpoints.has(endpoint.endpoint_uuid)}
                      onAdd={() =>
                        toggleEndpointManagement(endpoint.endpoint_uuid, true)
                      }
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
