'use client';

import { useState, useEffect } from 'react';
import { Server, Cpu, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BuilderFormData, Endpoint } from '@/app/images/types';
import { VirtualSelect } from '@/components/ui/virtual-select';

interface EndpointStepProps {
  formData: Partial<BuilderFormData>;
  onUpdate: (data: Partial<BuilderFormData>) => void;
}

export function EndpointStep({ formData, onUpdate }: EndpointStepProps) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [partitions, setPartitions] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState(false);
  const [isLoadingPartitions, setIsLoadingPartitions] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Fetch all available endpoints on component mount
  useEffect(() => {
    const fetchEndpoints = async () => {
      setIsLoadingEndpoints(true);
      try {
        const response = await fetch('/api/list_all_endpoints', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEndpoints(data);
      } catch (error) {
        console.error('Error fetching endpoints:', error);
        setEndpoints([]);
      } finally {
        setIsLoadingEndpoints(false);
      }
    };
    fetchEndpoints();
  }, []);

  // Fetch partitions and accounts when endpoint changes
  useEffect(() => {
    if (formData.endpoint) {
      const fetchPartitions = async () => {
        setIsLoadingPartitions(true);
        try {
          const response = await fetch('/api/list_partitions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ endpoint: formData.endpoint })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setPartitions(data || []);
          // setPartitions(['partition1', 'partition2']); // Temporary hardcode for testing
        } catch (error) {
          console.error('Error fetching partitions:', error);
          setPartitions([]);
        } finally {
          setIsLoadingPartitions(false);
        }
      };
      fetchPartitions();

      const fetchAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
          const response = await fetch('/api/list_accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ endpoint: formData.endpoint })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setAccounts(data || []);
          // setAccounts(['test', 'test1', 'test2']); // Temporary hardcode for testing
        } catch (error) {
          console.error('Error fetching accounts:', error);
          setAccounts([]);
        } finally {
          setIsLoadingAccounts(false);
        }
      };
      fetchAccounts();
    } else {
      // Clear partitions and accounts when no endpoint is selected
      setPartitions([]);
      setAccounts([]);
    }
  }, [formData.endpoint]);

  const isEndpointSelected = !!formData.endpoint;

  // Filter only online endpoints and create options for VirtualSelect
  const onlineEndpoints = endpoints.filter(
    (endpoint) => endpoint.endpoint_status === 'online'
  );
  const endpointOptions = onlineEndpoints.map(
    (endpoint) => `${endpoint.endpoint_name} (${endpoint.endpoint_status})`
  );

  // Get selected endpoint name for display
  const selectedEndpoint = endpoints.find(
    (ep) => ep.endpoint_uuid === formData.endpoint
  );
  const selectedEndpointDisplay = selectedEndpoint
    ? `${selectedEndpoint.endpoint_name} (${selectedEndpoint.endpoint_status})`
    : undefined;

  const handleEndpointSelect = (displayName: string) => {
    // Find the endpoint UUID from the display name
    const endpoint = onlineEndpoints.find(
      (ep) => `${ep.endpoint_name} (${ep.endpoint_status})` === displayName
    );
    if (endpoint) {
      onUpdate({ endpoint: endpoint.endpoint_uuid });
    }
  };

  return (
    <div className="space-y-8">
      {/* Grid Layout for large screens */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Endpoint Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Server className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  HPC Endpoint
                </h4>
                <p className="text-sm text-gray-600">
                  Select your compute endpoint
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <VirtualSelect
                options={endpointOptions}
                selected={selectedEndpointDisplay}
                onSelect={handleEndpointSelect}
                placeholder="Choose an HPC endpoint"
                loading={isLoadingEndpoints}
              />

              {!isLoadingEndpoints &&
                endpoints.length > 0 &&
                onlineEndpoints.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No online endpoints available. Please contact your
                    administrator.
                  </p>
                )}
            </div>
          </div>

          {/* Partition Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Cpu className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Partition
                </h4>
                <p className="text-sm text-gray-600">
                  Choose compute partition
                </p>
              </div>
            </div>

            {!isEndpointSelected ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <Cpu className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="mb-1 text-sm font-medium text-gray-600">
                  Select an endpoint first
                </p>
                <p className="text-xs text-gray-500">
                  Partitions will be available after endpoint selection
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {partitions.length > 0 ? (
                  <VirtualSelect
                    options={partitions}
                    selected={formData.partition}
                    onSelect={(partition) => onUpdate({ partition })}
                    placeholder="Choose a partition"
                    loading={isLoadingPartitions}
                  />
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Partition Name
                    </label>
                    <Input
                      placeholder="Enter partition name"
                      value={formData.partition || ''}
                      onChange={(e) => onUpdate({ partition: e.target.value })}
                      className="h-11 rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100"
                    />
                    {!isLoadingPartitions && (
                      <p className="text-xs text-gray-500">
                        No available partitions found for this endpoint
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Account Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  HPC Account
                </h4>
                <p className="text-sm text-gray-600">Your compute account</p>
              </div>
            </div>

            {!isEndpointSelected ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <User className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="mb-1 text-sm font-medium text-gray-600">
                  Select an endpoint first
                </p>
                <p className="text-xs text-gray-500">
                  Accounts will be available after endpoint selection
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.length > 0 && (
                  <VirtualSelect
                    options={accounts}
                    selected={formData.account}
                    onSelect={(account) => onUpdate({ account })}
                    placeholder="Choose an account"
                    loading={isLoadingAccounts}
                  />
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {accounts.length > 0 ? 'Or enter manually' : 'Account Name'}
                  </label>
                  <Input
                    placeholder="Enter account name"
                    value={formData.account || ''}
                    onChange={(e) => onUpdate({ account: e.target.value })}
                    className="h-11 rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100"
                  />
                  {accounts.length === 0 && !isLoadingAccounts && (
                    <p className="text-xs text-gray-500">
                      No available accounts found for this endpoint
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reservation (Optional) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Reservation
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Optional)
                  </span>
                </h4>
                <p className="text-sm text-gray-600">
                  Reserved compute resources
                </p>
              </div>
            </div>

            {!isEndpointSelected ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="mb-1 text-sm font-medium text-gray-600">
                  Select an endpoint first
                </p>
                <p className="text-xs text-gray-500">
                  Reservations can be specified after endpoint selection
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Reservation Name
                </label>
                <Input
                  placeholder="Enter reservation name (optional)"
                  value={formData.reservation || ''}
                  onChange={(e) => onUpdate({ reservation: e.target.value })}
                  className="h-11 rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100"
                />
                <p className="text-xs text-gray-500">
                  Leave empty if no reservation is required
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
