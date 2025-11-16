'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { VirtualSelect } from '@/components/ui/virtual-select';
import {
  TaskSubmissionData,
  Endpoint,
  ContainersResponse,
  DatasetsApiResponse,
  Dataset
} from '../tasks.types';
import { isPerlmutterHost } from '@/app/utils/hosts';

interface TaskSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskSubmissionModal({
  isOpen,
  onClose,
  onSuccess
}: TaskSubmissionModalProps) {
  const [formData, setFormData] = useState<TaskSubmissionData>({
    endpoint: '',
    endpointHost: '',
    taskName: '',
    partition: '',
    qos: '',
    constraint: '',
    account: '',
    reservation: '',
    container: '',
    task: '',
    num_of_nodes: 1,
    time_duration: '',
    dataset_id: ''
  });

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [partitions, setPartitions] = useState<string[]>([]);
  const [qosOptions, setQosOptions] = useState<string[]>([]);
  const [constraintOptions, setConstraintOptions] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [containers, setContainers] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  // For mapping endpoint UUIDs to display names
  const [endpointOptions, setEndpointOptions] = useState<string[]>([]);
  const [endpointMap, setEndpointMap] = useState<Map<string, string>>(
    new Map()
  );

  // For mapping dataset IDs to display names
  const [datasetOptions, setDatasetOptions] = useState<string[]>([]);
  const [datasetMap, setDatasetMap] = useState<Map<string, string>>(new Map());

  const [loading, setLoading] = useState({
    endpoints: false,
    partitions: false,
    accounts: false,
    containers: false,
    datasets: false,
    submit: false,
    perlmutterOptions: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPerlmutterSelected = isPerlmutterHost(formData.endpointHost);

  const fetchEndpoints = async () => {
    setLoading((prev) => ({ ...prev, endpoints: true }));
    try {
      const response = await fetch('/api/list_all_endpoints', {
        credentials: 'include'
      });
      const data = await response.json();
      setEndpoints(data);

      // Filter only online endpoints and create options and mapping for VirtualSelect
      const onlineEndpoints = data.filter(
        (ep: Endpoint) => ep.endpoint_status === 'online'
      );

      const options: string[] = [];
      const map = new Map<string, string>();

      onlineEndpoints.forEach((ep: Endpoint) => {
        const displayName = `${ep.endpoint_name} (${ep.endpoint_status})`;
        options.push(displayName);
        map.set(displayName, ep.endpoint_uuid);
      });

      setEndpointOptions(options);
      setEndpointMap(map);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    } finally {
      setLoading((prev) => ({ ...prev, endpoints: false }));
    }
  };

  const fetchPartitions = useCallback(async () => {
    if (!formData.endpoint || isPerlmutterHost(formData.endpointHost)) {
      setPartitions([]);
      return;
    }

    setLoading((prev) => ({ ...prev, partitions: true }));
    try {
      const response = await fetch('/api/list_partitions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: formData.endpoint })
      });
      const data = await response.json();
      setPartitions(data);
      // setPartitions(['partition1', 'partition2']); // Temporary hardcode for testing
    } catch (error) {
      console.error('Error fetching partitions:', error);
    } finally {
      setLoading((prev) => ({ ...prev, partitions: false }));
    }
  }, [formData.endpoint, formData.endpointHost]);

  const fetchAccounts = useCallback(async () => {
    if (!formData.endpoint) return;

    setLoading((prev) => ({ ...prev, accounts: true }));
    try {
      const response = await fetch('/api/list_accounts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: formData.endpoint })
      });
      const data = await response.json();
      setAccounts(data);
      // setAccounts(['test', 'test1', 'test2']); // Temporary hardcode for testing
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading((prev) => ({ ...prev, accounts: false }));
    }
  }, [formData.endpoint]);

  const fetchPerlmutterOptions = useCallback(async () => {
    if (!formData.endpoint) return;

    setLoading((prev) => ({ ...prev, perlmutterOptions: true }));
    try {
      const response = await fetch('/api/list_qos_constraint', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: formData.endpoint })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQosOptions(data.qos || []);
      setConstraintOptions(data.constraints || []);
    } catch (error) {
      console.error('Error fetching QoS/constraint options:', error);
      setQosOptions([]);
      setConstraintOptions([]);
    } finally {
      setLoading((prev) => ({ ...prev, perlmutterOptions: false }));
    }
  }, [formData.endpoint]);

  const fetchContainersForEndpoint = useCallback(async () => {
    if (!formData.endpoint) {
      setContainers([]);
      return;
    }

    setLoading((prev) => ({ ...prev, containers: true }));
    try {
      const response = await fetch('/api/get_containers_on_endpoint', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint_uuid: formData.endpoint })
      });
      const data: ContainersResponse = await response.json();
      setContainers(Object.keys(data));
    } catch (error) {
      console.error('Error fetching containers:', error);
      setContainers([]);
    } finally {
      setLoading((prev) => ({ ...prev, containers: false }));
    }
  }, [formData.endpoint]);

  const fetchDatasets = async () => {
    setLoading((prev) => ({ ...prev, datasets: true }));
    try {
      const response = await fetch('/api/datasets', {
        credentials: 'include'
      });
      const data: DatasetsApiResponse = await response.json();
      setDatasets(data.datasets);

      // Create options and mapping for VirtualSelect
      const options = ['No dataset'];
      const map = new Map<string, string>();
      map.set('No dataset', '');

      data.datasets.forEach((ds: Dataset) => {
        const displayName = ds.dataset_name || ds.globus_path;
        options.push(displayName);
        map.set(displayName, ds.id.toString());
      });

      setDatasetOptions(options);
      setDatasetMap(map);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading((prev) => ({ ...prev, datasets: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEndpoints();
      fetchDatasets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formData.endpoint) return;

    if (isPerlmutterSelected) {
      setPartitions([]);
      fetchPerlmutterOptions();
    } else {
      setQosOptions([]);
      setConstraintOptions([]);
      fetchPartitions();
    }
    fetchAccounts();
    fetchContainersForEndpoint();
  }, [
    formData.endpoint,
    formData.endpointHost,
    isPerlmutterSelected,
    fetchPartitions,
    fetchAccounts,
    fetchPerlmutterOptions,
    fetchContainersForEndpoint
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.taskName.trim()) newErrors.taskName = 'Task name is required';
    if (!formData.endpoint) newErrors.endpoint = 'Endpoint is required';
    if (isPerlmutterSelected) {
      if (!formData.qos) newErrors.qos = 'QoS is required';
      if (!formData.constraint) newErrors.constraint = 'Constraint is required';
    } else if (!formData.partition) {
      newErrors.partition = 'Partition is required';
    }
    if (!formData.account) newErrors.account = 'Account is required';
    if (!formData.container) newErrors.container = 'Container is required';
    if (!formData.time_duration)
      newErrors.time_duration = 'Time duration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const payload: TaskSubmissionData = {
        endpoint: formData.endpoint,
        taskName: formData.taskName,
        partition: isPerlmutterSelected
          ? undefined
          : formData.partition || undefined,
        qos: isPerlmutterSelected ? formData.qos : undefined,
        constraint: isPerlmutterSelected ? formData.constraint : undefined,
        account: formData.account,
        reservation: formData.reservation || undefined,
        container: formData.container,
        task: formData.task || undefined,
        num_of_nodes: formData.num_of_nodes,
        time_duration: formData.time_duration,
        dataset_id: formData.dataset_id || undefined
      };

      const response = await fetch('/api/submit_task', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
        resetForm();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to submit task' });
      }
    } catch (error) {
      setErrors({ submit: `Failed to submit task: ${error}` });
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      endpoint: '',
      endpointHost: '',
      taskName: '',
      partition: '',
      qos: '',
      constraint: '',
      account: '',
      reservation: '',
      container: '',
      task: '',
      num_of_nodes: 1,
      time_duration: '',
      dataset_id: ''
    });
    setPartitions([]);
    setQosOptions([]);
    setConstraintOptions([]);
    setErrors({});
  };

  // Helper functions to get display values for selected items
  const getSelectedEndpointDisplay = () => {
    const endpoint = endpoints.find(
      (ep) => ep.endpoint_uuid === formData.endpoint
    );
    return endpoint
      ? `${endpoint.endpoint_name} (${endpoint.endpoint_status})`
      : '';
  };

  const getSelectedDatasetDisplay = () => {
    if (!formData.dataset_id) return 'No dataset';
    const dataset = datasets.find(
      (ds) => ds.id.toString() === formData.dataset_id
    );
    return dataset ? dataset.dataset_name || dataset.globus_path : '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Submit New Task
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Configure and submit a new computational task
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Name *
                </label>
                <Input
                  type="text"
                  value={formData.taskName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taskName: e.target.value
                    }))
                  }
                  placeholder="Enter task name"
                  className={`mt-1 ${errors.taskName ? 'border-red-500' : ''}`}
                />
                {errors.taskName && (
                  <p className="mt-1 text-sm text-red-600">{errors.taskName}</p>
                )}
              </div>

              {/* Endpoint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Endpoint *
                </label>
                <div className="mt-1">
                  <VirtualSelect
                    options={endpointOptions}
                    selected={getSelectedEndpointDisplay()}
                    onSelect={(displayName) => {
                      const uuid = endpointMap.get(displayName);
                      if (uuid) {
                        const endpointDetails = endpoints.find(
                          (ep) => ep.endpoint_uuid === uuid
                        );
                        setFormData((prev) => ({
                          ...prev,
                          endpoint: uuid,
                          endpointHost: endpointDetails?.endpoint_host || '',
                          partition: '',
                          qos: '',
                          constraint: '',
                          account: '',
                          container: ''
                        }));
                        setPartitions([]);
                        setQosOptions([]);
                        setConstraintOptions([]);
                        setErrors({});
                      }
                    }}
                    placeholder="Select endpoint"
                    loading={loading.endpoints}
                    className={errors.endpoint ? 'border-red-500' : ''}
                  />
                </div>
                {errors.endpoint && (
                  <p className="mt-1 text-sm text-red-600">{errors.endpoint}</p>
                )}
              </div>

              {/* Partition */}
              {!isPerlmutterSelected && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Partition *
                  </label>
                  <div className="mt-1">
                    <VirtualSelect
                      options={partitions}
                      selected={formData.partition}
                      onSelect={(value) =>
                        setFormData((prev) => ({ ...prev, partition: value }))
                      }
                      placeholder="Select partition"
                      loading={loading.partitions}
                      disabled={!formData.endpoint}
                      className={errors.partition ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.partition && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.partition}
                    </p>
                  )}
                </div>
              )}

              {/* QoS */}
              {isPerlmutterSelected && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    QoS *
                  </label>
                  <div className="mt-1 space-y-4">
                    <VirtualSelect
                      options={qosOptions}
                      selected={
                        qosOptions.includes(formData.qos || '')
                          ? formData.qos
                          : ''
                      }
                      onSelect={(value) =>
                        setFormData((prev) => ({ ...prev, qos: value }))
                      }
                      placeholder="Select QoS"
                      loading={loading.perlmutterOptions}
                      disabled={!formData.endpoint}
                      className={errors.qos ? 'border-red-500' : ''}
                    />
                    <Input
                      placeholder="Enter QoS manually (e.g., regular)"
                      value={formData.qos || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          qos: e.target.value
                        }))
                      }
                      disabled={!formData.endpoint}
                      className={errors.qos ? 'border-red-500' : ''}
                    />
                    {qosOptions.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No QoS presets configured; enter a value manually.
                      </p>
                    )}
                  </div>
                  {errors.qos && (
                    <p className="mt-1 text-sm text-red-600">{errors.qos}</p>
                  )}
                </div>
              )}

              {/* Constraint */}
              {isPerlmutterSelected && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Constraint *
                  </label>
                  <div className="mt-1 space-y-4">
                    <VirtualSelect
                      options={constraintOptions}
                      selected={
                        constraintOptions.includes(formData.constraint || '')
                          ? formData.constraint
                          : ''
                      }
                      onSelect={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          constraint: value
                        }))
                      }
                      placeholder="Select constraint"
                      loading={loading.perlmutterOptions}
                      disabled={!formData.endpoint}
                      className={errors.constraint ? 'border-red-500' : ''}
                    />
                    <Input
                      placeholder="Enter constraint manually (e.g., cpu)"
                      value={formData.constraint || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          constraint: e.target.value
                        }))
                      }
                      disabled={!formData.endpoint}
                      className={errors.constraint ? 'border-red-500' : ''}
                    />
                    {constraintOptions.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No constraint presets configured; enter a value
                        manually.
                      </p>
                    )}
                  </div>
                  {errors.constraint && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.constraint}
                    </p>
                  )}
                </div>
              )}

              {/* Account */}
              <div className="md:row-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account *
                </label>
                <div className="mt-1 space-y-6">
                  <VirtualSelect
                    options={accounts}
                    selected={
                      accounts.includes(formData.account)
                        ? formData.account
                        : ''
                    }
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, account: value }))
                    }
                    placeholder="Select account"
                    loading={loading.accounts}
                    disabled={!formData.endpoint}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Manual Input
                    </label>
                    <Input
                      placeholder="Or enter account manually"
                      value={formData.account || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          account: e.target.value
                        }))
                      }
                      disabled={!formData.endpoint}
                      className={`mt-1 ${errors.account ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>
                {errors.account && (
                  <p className="mt-1 text-sm text-red-600">{errors.account}</p>
                )}
              </div>

              {/* Container */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Container *
                </label>
                <div className="mt-1">
                  <VirtualSelect
                    options={containers}
                    selected={formData.container}
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, container: value }))
                    }
                    placeholder="Select container"
                    loading={loading.containers}
                    disabled={!formData.endpoint}
                    className={errors.container ? 'border-red-500' : ''}
                  />
                </div>
                {errors.container && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.container}
                  </p>
                )}
              </div>

              {/* Dataset */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dataset (Optional)
                </label>
                <div className="mt-1">
                  <VirtualSelect
                    options={datasetOptions}
                    selected={getSelectedDatasetDisplay()}
                    onSelect={(displayName) => {
                      const id = datasetMap.get(displayName);
                      setFormData((prev) => ({
                        ...prev,
                        dataset_id: id || ''
                      }));
                    }}
                    placeholder="Select dataset"
                    loading={loading.datasets}
                  />
                </div>
              </div>

              {/* Reservation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reservation (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.reservation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reservation: e.target.value
                    }))
                  }
                  placeholder="Enter reservation"
                  className="mt-1"
                />
              </div>

              {/* Number of Nodes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Number of Nodes
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.num_of_nodes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      num_of_nodes: parseInt(e.target.value) || 1
                    }))
                  }
                  placeholder="1"
                  className="mt-1"
                />
              </div>

              {/* Time Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Duration (HH:MM:SS) *
                </label>
                <Input
                  type="text"
                  value={formData.time_duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      time_duration: e.target.value
                    }))
                  }
                  placeholder="01:00:00"
                  className={`mt-1 ${errors.time_duration ? 'border-red-500' : ''}`}
                />
                {errors.time_duration && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.time_duration}
                  </p>
                )}
              </div>

              {/* Task Command */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Command (Optional)
                </label>
                <Textarea
                  value={formData.task}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, task: e.target.value }))
                  }
                  placeholder="Enter command to run inside the container"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading.submit}
            className="cursor-pointer"
          >
            {loading.submit ? 'Submitting...' : 'Submit Task'}
          </Button>
        </div>
      </div>
    </div>
  );
}
