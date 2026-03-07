'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { VirtualSelect } from '@/components/ui/virtual-select';
import {
  TaskSubmissionData,
  TaskTemplate,
  Endpoint,
  DatasetsApiResponse,
  Dataset,
  EndpointContainersApiResponse
} from '../tasks.types';
import { TASK_TEMPLATES } from '../templates';
import { TemplateSelector } from './template-selector';

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
  const INITIAL_FORM_DATA: TaskSubmissionData = {
    endpoint: '',
    taskName: '',
    partition: '',
    account: '',
    reservation: '',
    container: '',
    task: '',
    num_of_nodes: 1,
    time_duration: '',
    dataset_id: '',
    slurm_options: '',
    input_path: 'prompts.jsonl',
    input_content: '',
    output_path: 'results.json',
    model: 'Qwen3-0.6B',
    model_path: '',
    engine: 'vllm',
    batch_size: 4,
    hf_token: ''
  };

  const [formData, setFormData] = useState<TaskSubmissionData>(INITIAL_FORM_DATA);

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [partitions, setPartitions] = useState<string[]>([]);
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
    submit: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasDiamondDir, setHasDiamondDir] = useState<boolean>(true);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const activeTemplate = TASK_TEMPLATES.find((t) => t.id === activeTemplateId);
  const isLlmfluxTemplate =
    activeTemplate?.submissionEndpoint === '/api/launch_llmflux';

  const applyTemplate = (template: TaskTemplate) => {
    setActiveTemplateId(template.id);
    setFormData((prev) => ({ ...prev, ...template.defaults }));
  };

  const clearTemplate = () => {
    const active = TASK_TEMPLATES.find((t) => t.id === activeTemplateId);
    if (active) {
      const revertedFields = Object.fromEntries(
        Object.keys(active.defaults).map((key) => [
          key,
          INITIAL_FORM_DATA[key as keyof TaskSubmissionData]
        ])
      ) as Partial<TaskSubmissionData>;
      setFormData((prev) => ({ ...prev, ...revertedFields }));
    }
    setActiveTemplateId(null);
  };

  const checkDiamondDir = useCallback(async (endpointUuid: string) => {
    if (!endpointUuid) {
      setHasDiamondDir(true);
      return;
    }

    try {
      const response = await fetch(
        `/api/get_diamond_dir?endpoint_uuid=${endpointUuid}`,
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      const diamondDirExists = data.diamond_dir !== null && data.diamond_dir !== undefined;
      setHasDiamondDir(diamondDirExists);
      
      if (!diamondDirExists) {
        setErrors((prev) => ({
          ...prev,
          endpoint: 'Diamond directory not configured for this endpoint. Please configure it in settings.'
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.endpoint;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error checking diamond directory:', error);
      setHasDiamondDir(false);
      setErrors((prev) => ({
        ...prev,
        endpoint: 'Failed to verify diamond directory configuration'
      }));
    }
  }, []);

  const fetchEndpoints = async () => {
    setLoading((prev) => ({ ...prev, endpoints: true }));
    try {
      const response = await fetch('/api/list_all_endpoints', {
        credentials: 'include'
      });
      const data = await response.json();
      setEndpoints(data);

      // Filter only online, managed endpoints and create options and mapping for VirtualSelect
      const eligibleEndpoints = data.filter(
        (ep: Endpoint) => ep.endpoint_status === 'online' && ep.is_managed
      );

      const options: string[] = [];
      const map = new Map<string, string>();

      eligibleEndpoints.forEach((ep: Endpoint) => {
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
    if (!formData.endpoint) return;

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
  }, [formData.endpoint]);

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
      const data: EndpointContainersApiResponse = await response.json();
      const privateNames = Object.keys(data.private || {});
      const publicNames = Object.keys(data.public || {}).filter(
        (name) => !privateNames.includes(name)
      );
      setContainers([...privateNames, ...publicNames]);
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
    if (formData.endpoint) {
      fetchPartitions();
      fetchAccounts();
      checkDiamondDir(formData.endpoint);
    } else {
      setHasDiamondDir(true);
    }
    if (!isLlmfluxTemplate) {
      fetchContainersForEndpoint();
    } else {
      setContainers([]);
    }
  }, [
    formData.endpoint,
    fetchPartitions,
    fetchAccounts,
    fetchContainersForEndpoint,
    checkDiamondDir,
    isLlmfluxTemplate
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.taskName.trim()) newErrors.taskName = 'Task name is required';
    if (!formData.endpoint) {
      newErrors.endpoint = 'Endpoint is required';
    } else if (!hasDiamondDir) {
      newErrors.endpoint = 'Diamond directory not configured for this endpoint. Please configure it in settings.';
    }
    if (!formData.partition) newErrors.partition = 'Partition is required';
    if (!formData.account.trim()) newErrors.account = 'Account is required';

    if (isLlmfluxTemplate) {
      if (!formData.input_path?.trim()) {
        newErrors.input_path = 'Input path is required';
      }
      if (!formData.output_path?.trim()) {
        newErrors.output_path = 'Output path is required';
      }
      if (!formData.model?.trim()) {
        newErrors.model = 'Model is required';
      }
      if (!formData.engine || !['vllm', 'ollama'].includes(formData.engine)) {
        newErrors.engine = 'Engine must be vllm or ollama';
      }
      if (!formData.batch_size || formData.batch_size < 1) {
        newErrors.batch_size = 'Batch size must be at least 1';
      }
    } else {
      if (!formData.container) newErrors.container = 'Container is required';
      if (!formData.time_duration) {
        newErrors.time_duration = 'Time duration is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const submissionEndpoint =
        activeTemplate?.submissionEndpoint ?? '/api/submit_task';
      const payload =
        submissionEndpoint === '/api/launch_llmflux'
          ? {
              endpoint: formData.endpoint,
              taskName: formData.taskName,
              account: formData.account,
              partition: formData.partition,
              input_path: formData.input_path,
              input_content: formData.input_content || '',
              output_path: formData.output_path,
              model: formData.model,
              model_path: formData.model_path || '',
              engine: formData.engine,
              batch_size: formData.batch_size,
              hf_token: formData.hf_token || ''
            }
          : {
              endpoint: formData.endpoint,
              taskName: formData.taskName,
              partition: formData.partition,
              account: formData.account,
              reservation: formData.reservation || undefined,
              container: formData.container,
              task: formData.task || undefined,
              num_of_nodes: formData.num_of_nodes,
              time_duration: formData.time_duration,
              dataset_id: formData.dataset_id || undefined,
              slurm_options: formData.slurm_options || undefined
            };

      const response = await fetch(submissionEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
        resetForm();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to submit task' }));
        setErrors({ submit: errorData.error || 'Failed to submit task' });
      }
    } catch (error) {
      setErrors({ submit: `Failed to submit task: ${error}` });
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setHasDiamondDir(true);
    setActiveTemplateId(null);
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
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-[hsl(var(--dashboard-surface))] shadow-xl dark:border-slate-700/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/70 p-6 dark:border-slate-700/70">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Submit New Task
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Configure and submit a new computational task
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Template Selector */}
        <TemplateSelector
          templates={TASK_TEMPLATES}
          activeTemplateId={activeTemplateId}
          onSelect={applyTemplate}
          onClear={clearTemplate}
        />

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Endpoint *
                </label>
                <div className="mt-1">
                  <VirtualSelect
                    options={endpointOptions}
                    selected={getSelectedEndpointDisplay()}
                    onSelect={(displayName) => {
                      const uuid = endpointMap.get(displayName);
                      if (uuid) {
                        setFormData((prev) => ({
                          ...prev,
                          endpoint: uuid,
                          partition: '',
                          account: '',
                          container: ''
                        }));
                        checkDiamondDir(uuid);
                      }
                    }}
                    placeholder="Select an online, managed endpoint"
                    loading={loading.endpoints}
                    className={errors.endpoint || !hasDiamondDir ? 'border-red-500' : ''}
                  />
                </div>
                {errors.endpoint && (
                  <p className="mt-1 text-sm text-red-600">{errors.endpoint}</p>
                )}
              </div>

              {/* Partition */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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

              {/* Account */}
              <div className="md:row-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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

              {!isLlmfluxTemplate ? (
                <>
                  {/* Container */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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

                  {/* Slurm Options */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Slurm Options (Optional)
                    </label>
                    <Textarea
                      value={formData.slurm_options}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slurm_options: e.target.value
                        }))
                      }
                      placeholder="Extra Slurm directives or lines to include in the batch script. 
                    e.g., --gpus-per-node=1 or --mem=16G (one per line or space-separated)."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Task Command */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100 md:col-span-2">
                    LLMFlux manages its own runtime image and will build a container in
                    your endpoint `diamond_work_dir` when needed.
                  </div>

                  {/* Input Path */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Input Path *
                    </label>
                    <Input
                      type="text"
                      value={formData.input_path}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          input_path: e.target.value
                        }))
                      }
                      placeholder="prompts.jsonl"
                      className={`mt-1 ${errors.input_path ? 'border-red-500' : ''}`}
                    />
                    {errors.input_path && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.input_path}
                      </p>
                    )}
                  </div>

                  {/* Input Prompts */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Input Prompts
                    </label>
                    <Textarea
                      value={formData.input_content || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          input_content: e.target.value
                        }))
                      }
                      placeholder='{"prompt":"Write a short summary of this paragraph..."}'
                      className="mt-1"
                      rows={5}
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Hint: Enter prompts in JSONL format (one JSON object per
                      line). This content will be written to the filename in
                      Input Path before launch.
                    </p>
                  </div>

                  {/* Output Path */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Output Path *
                    </label>
                    <Input
                      type="text"
                      value={formData.output_path}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          output_path: e.target.value
                        }))
                      }
                      placeholder="results.json"
                      className={`mt-1 ${errors.output_path ? 'border-red-500' : ''}`}
                    />
                    {errors.output_path && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.output_path}
                      </p>
                    )}
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Model name *
                    </label>
                    <Input
                      type="text"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          model: e.target.value
                        }))
                      }
                      placeholder="Qwen3-0.6B"
                      className={`mt-1 ${errors.model ? 'border-red-500' : ''}`}
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Hint: Model name should be a valid Hugging Face model repo name (e.g. "Qwen2.5-3B-Instruct").
                    </p>
                    {errors.model && (
                      <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                    )}
                  </div>

                  {/* Model Path */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Model Path (Optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.model_path || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, model_path: e.target.value || '' }))
                      }
                      placeholder="/scratch/bcrc/hxie6/output/"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Hint: Model path is the path to the finetuned model directory.
                    </p>
                  </div>

                  {/* Engine */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Engine *
                    </label>
                    <select
                      value={formData.engine || 'vllm'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          engine: e.target.value as 'vllm' | 'ollama'
                        }))
                      }
                      className={`mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm ${errors.engine ? 'border-red-500' : 'border-input'}`}
                    >
                      <option value="vllm">vllm</option>
                      <option value="ollama">ollama</option>
                    </select>
                    {errors.engine && (
                      <p className="mt-1 text-sm text-red-600">{errors.engine}</p>
                    )}
                  </div>

                  {/* Batch Size */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Batch Size *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.batch_size}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          batch_size: parseInt(e.target.value, 10) || 1
                        }))
                      }
                      placeholder="4"
                      className={`mt-1 ${errors.batch_size ? 'border-red-500' : ''}`}
                    />
                    {errors.batch_size && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.batch_size}
                      </p>
                    )}
                  </div>

                  {/* Hugging Face Token */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Hugging Face Token (Optional)
                    </label>
                    <Input
                      type="password"
                      value={formData.hf_token}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hf_token: e.target.value
                        }))
                      }
                      placeholder="hf_..."
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Required for gated models such as Llama-3.
                    </p>
                  </div>
                </>
              )}
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
        <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 bg-slate-50/70 p-6 dark:border-slate-700/70 dark:bg-slate-900/60">
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
            className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {loading.submit ? 'Submitting...' : 'Submit Task'}
          </Button>
        </div>
      </div>
    </div>
  );
}
