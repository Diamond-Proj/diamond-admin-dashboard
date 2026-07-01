'use client';

import { useState, useEffect, useCallback } from 'react';
import { Server, Cpu, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Endpoint, FlowBuilderFormData } from '@/app/images/types';
import { VirtualSelect } from '@/components/ui/virtual-select';

interface EndpointStepProps {
  formData: Partial<FlowBuilderFormData>;
  onUpdate: (data: Partial<FlowBuilderFormData>) => void;
}

export function EndpointStep({ formData, onUpdate }: EndpointStepProps) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [functionId, setFunctionId] = useState<string[]>([]);
  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState(false);
  const [hasDiamondDir, setHasDiamondDir] = useState<boolean>(true);
  const [diamondDirError, setDiamondDirError] = useState<string>('');

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

  const isEndpointSelected = !!formData.gce_endpoint;

  // Filter only online, managed endpoints and create options for VirtualSelect
  const eligibleEndpoints = endpoints.filter(
    (endpoint) => endpoint.endpoint_status === 'online' && endpoint.is_managed
  );
  const endpointOptions = eligibleEndpoints.map(
    (endpoint) => `${endpoint.endpoint_name} (${endpoint.endpoint_status})`
  );

  // Get selected endpoint name for display
  const selectedEndpoint = endpoints.find(
    (ep) => ep.endpoint_uuid === formData.gce_endpoint
  );
  const selectedEndpointDisplay = selectedEndpoint
    ? `${selectedEndpoint.endpoint_name} (${selectedEndpoint.endpoint_status})`
    : undefined;

  // Get selected endpoint name for display
  const selectedDataEndpoint = endpoints.find(
    (ep) => ep.endpoint_uuid === formData.data_endpoint
  );
  const selectedDataEndpointDisplay = selectedDataEndpoint
    ? `${selectedDataEndpoint.endpoint_name} (${selectedDataEndpoint.endpoint_status})`
    : undefined;

  const handleEndpointSelect = (displayName: string) => {
    // Find the endpoint UUID from the display name
    const endpoint = eligibleEndpoints.find(
      (ep) => `${ep.endpoint_name} (${ep.endpoint_status})` === displayName
    );
    if (endpoint) {
      onUpdate({ gce_endpoint: endpoint.endpoint_uuid });
    }
  };

  const handleDataEndpointSelect = (displayName: string) => {
    // Find the endpoint UUID from the display name
    const endpoint = eligibleEndpoints.find(
      (ep) => `${ep.endpoint_name} (${ep.endpoint_status})` === displayName
    );
    if (endpoint) {
      onUpdate({ data_endpoint: endpoint.endpoint_uuid });
    }
  };

  return (
    <div className="space-y-8">
      {/* Grid Layout for large screens */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Data Endpoint Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Server className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Data Source
                </h4>
                <p className="text-sm text-gray-600">
                  Select your data source endpoint
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <VirtualSelect
                options={endpointOptions}
                selected={selectedDataEndpointDisplay}
                onSelect={handleDataEndpointSelect}
                placeholder="Choose an HPC endpoint"
                loading={isLoadingEndpoints}
                className={
                  diamondDirError || !hasDiamondDir ? 'border-red-500' : ''
                }
              />

              {diamondDirError && (
                <p className="text-sm text-red-600">{diamondDirError}</p>
              )}

              {!isLoadingEndpoints &&
                endpoints.length > 0 &&
                eligibleEndpoints.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No online, managed endpoints are available. Please refresh
                    your endpoints in Settings or contact your administrator.
                  </p>
                )}
            </div>
          </div>

          {/* Data Path Selection */}
          <div className="space-y-6">
            <label className="block text-sm font-medium text-gray-700">
              Data Location
            </label>
            <Input
              placeholder="Enter data directory path"
              value={formData.data_path || ''}
              onChange={(e) => onUpdate({ data_path: e.target.value })}
              className="h-11 rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100"
            />
          </div>

          {/* Compute Endpoint Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Server className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Compute Endpoint
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
              className={
                diamondDirError || !hasDiamondDir ? 'border-red-500' : ''
              }
            />

            {diamondDirError && (
              <p className="text-sm text-red-600">{diamondDirError}</p>
            )}

            {!isLoadingEndpoints &&
              endpoints.length > 0 &&
              eligibleEndpoints.length === 0 && (
                <p className="text-sm text-amber-600">
                  No online, managed endpoints are available. Please refresh
                  your endpoints in Settings or contact your administrator.
                </p>
              )}
          </div>
        </div>

          {/* Function Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Cpu className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Function Code
                </h4>
                <p className="text-sm text-gray-600">
                  Choose compute function code
                </p>
              </div>
            </div>
            <div className="space-y-4">
                <Textarea
                  value={formData.function_code}
                  onChange={(e) => onUpdate({ function_code: e.target.value })}
                  placeholder="Enter command to run inside the container"
                  className="mt-1"
                  rows={3}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
