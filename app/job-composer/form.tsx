'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { number, z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { submitTask } from '@/lib/taskHandlers';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState, useRef, useCallback } from 'react';

const formSchema = z.object({
  taskType: z.enum(['submitTask']),
  jobName: z.string().min(2, {
    message: 'Job name must be at least 2 characters.'
  }),
  taskName: z.string().min(2, {
    message: 'Task name must be at least 2 characters.'
  }),
  endpoint: z.string(),
  partition: z.string(),
  account: z.string(),
  num_of_nodes: z
  .string()
  .regex(/^\d+$/, { message: 'Must be a positive integer' })
  .transform((value) => parseInt(value, 10))
  .optional(),
  log_path: z.string(),
  task: z.string().optional(),
  container: z.string(),
  work_path: z.string().optional()
});

export function JobComposerForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskType: 'submitTask',
      jobName: 'submitTask',
    }
  });

  const [endpoints, setEndpoints] = useState<
    { endpoint_uuid: string; endpoint_name: string }[]
  >([]);

  const [partitions, setPartitions] = useState<string[]>([]);
  const [partitionsCache, setPartitionsCache] = useState<{ [key: string]: string[] }>({});
  const [isLoadingPartitions, setIsLoadingPartitions] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [containers, setContainers] = useState<{ [key: string]: any }>({});
  const [isLoadingContainers, setIsLoadingContainers] = useState(false);

  // Polling
  const [isPolling, setIsPolling] = useState(false)
  const [isPollingStderr, setIsPollingStderr] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollStderrIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentEndpointRef = useRef<string | null>(null)
  const currentLogPathRef = useRef<string | null>(null)
  const currentStderrLogPathRef = useRef<string | null>(null)
  const currentTaskIdRef = useRef<string | null>(null)
  const currentLogTaskIdRef = useRef<string | null>(null)
  const currentStderrLogTaskIdRef = useRef<string | null>(null)

  const endpointValue = form.watch('endpoint');

  useEffect(() => {
    async function fetchEndpoints() {
      try {
        const response = await fetch('/api/list_active_endpoints');
        const data = await response.json();
        setEndpoints(data);
      } catch (error) {
        console.error('Error fetching endpoints:', error);
      }
    }
    fetchEndpoints();
  }, []);

  useEffect(() => {
    if (endpointValue) {
      if (partitionsCache[endpointValue]) {
        setPartitions(partitionsCache[endpointValue]);
      } else {
        const fetchPartitions = async () => {
          setIsLoadingPartitions(true);
          try {
            const response = await fetch('/api/list_partitions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ endpoint: endpointValue }),
            });
            const data = await response.json();
            setPartitions(data);
            setPartitionsCache((prevCache) => ({
              ...prevCache,
              [endpointValue]: data,
            }));
          } catch (error) {
            console.error('Error fetching partitions:', error);
          } finally {
            setIsLoadingPartitions(false);
          }
        };
        fetchPartitions();
      }
    } else {
      setPartitions([]);
    }
  }, [endpointValue]);

  useEffect(() => {
    if (endpoints) {
      const fetchAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
          const response = await fetch('/api/list_accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: endpointValue }),
          });
          const data = await response.json();
          // Transform data to extract account and project info
          const accountsWithProjects = data.map((line: string) => {
            const matches = line.match(/^(\S+)\s+\d+\s+\d+\s+(.+)$/);
            if (matches) {
              return {
                account: matches[1],
                project: matches[2].trim()
              };
            }
            return null;
          }).filter(Boolean);
          
          setAccounts(accountsWithProjects.map((a: { account: string }) => a.account));
        } catch (error) {
          console.error('Error fetching accounts:', error);
        } finally {
          setIsLoadingAccounts(false);
        }
      };
      fetchAccounts();
    }
  }, [endpointValue]);
  

  useEffect(() => {
    async function fetchContainers() {
      setIsLoadingContainers(true);
      try {
        const response = await fetch('/api/get_containers');
        const data = await response.json();
        setContainers(data);
      } catch (error) {
        console.error('Error fetching containers:', error);
      } finally {
        setIsLoadingContainers(false);
      }
    }
    fetchContainers();
  }, []);

  const fetchBuildLogs = useCallback(async (endpoint_id: string, log_path: string, build_task_id?: string, log_task_id?: string) => {
    try {
        const url = new URL('/api/get_build_log', window.location.origin)
        url.searchParams.append('endpoint_id', endpoint_id)
        url.searchParams.append('log_path', log_path)
        if (build_task_id) {
            url.searchParams.append('task_id', build_task_id)
        }
        if (log_task_id) {
            url.searchParams.append('log_task_id', log_task_id)
        }
        
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch build logs')
        
        const data = await response.json()
        console.log('data response from fetchBuildLogs:', data)
        
        // Store the new log task ID for next poll
        if (data.log_task_id) {
            currentLogTaskIdRef.current = data.log_task_id
        }
        
        // Update UI based on status
        const logElement = document.getElementById('stdoutLogs')
        const statusElement = document.getElementById('taskStdoutPollingStatus')
        
        if (logElement && statusElement) {
            logElement.textContent = data.log_content || 'Waiting for logs...'
            statusElement.textContent = `Stdout status: ${data.status}`
            
            // Return true to stop polling if build is complete or failed
            return data.status === 'completed' || data.status === 'failed' || data.status === 'error'
        }
    } catch (error) {
        console.error('Error fetching task stdout logs:', error)
        const statusElement = document.getElementById('taskStdoutPollingStatus')
        if (statusElement) {
            statusElement.textContent = 'Error fetching task stdout logs'
        }
        return true // Stop polling on error
    }
    return false
  }, [])

  const startPollingStdout = useCallback((endpoint_id: string, log_path: string, build_task_id: string) => {
    if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
    }

    currentEndpointRef.current = endpoint_id
    currentLogPathRef.current = log_path
    currentTaskIdRef.current = build_task_id
    currentLogTaskIdRef.current = null  // Reset log task ID

    setIsPolling(true)
    
    // Initial fetch
    fetchBuildLogs(endpoint_id, log_path, build_task_id)

    // Start polling
    pollIntervalRef.current = setInterval(async () => {
        if (currentEndpointRef.current && currentLogPathRef.current && currentTaskIdRef.current) {
            const shouldStop = await fetchBuildLogs(
                currentEndpointRef.current,
                currentLogPathRef.current,
                currentTaskIdRef.current,
                currentLogTaskIdRef.current as string
            )
            
            if (shouldStop) {
                setIsPolling(false)
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current)
                }
            }
        }
    }, 5000)

    // Safety timeout after 5 minutes
    setTimeout(() => {
        setIsPolling(false)
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
        }
    }, 300000)
  }, [fetchBuildLogs])

  const fetchStderrLogs = useCallback(async (endpoint_id: string, log_path: string, build_task_id?: string, log_task_id?: string) => {
    try {
        const url = new URL('/api/get_build_log', window.location.origin)
        url.searchParams.append('endpoint_id', endpoint_id)
        url.searchParams.append('log_path', log_path)
        if (build_task_id) {
            url.searchParams.append('task_id', build_task_id)
        }
        if (log_task_id) {
            url.searchParams.append('log_task_id', log_task_id)
        }
        
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch stderr logs')
        
        const data = await response.json()
        
        if (data.log_task_id) {
            currentStderrLogTaskIdRef.current = data.log_task_id
        }
        
        const stderrLogElement = document.getElementById('stderrLogs')
        const stderrStatusElement = document.getElementById('taskStderrPollingStatus')
        
        if (stderrLogElement && stderrStatusElement) {
            stderrLogElement.textContent = data.log_content || 'Waiting for stderr logs...'
            stderrStatusElement.textContent = `Stderr status: ${data.status}`
            
            return data.status === 'completed' || data.status === 'failed' || data.status === 'error'
        }
    } catch (error) {
        console.error('Error fetching stderr logs:', error)
        const stderrStatusElement = document.getElementById('stderrPollingStatus')
        if (stderrStatusElement) {
            stderrStatusElement.textContent = 'Error fetching stderr logs'
        }
        return true
    }
    return false
  }, [])

  const startPollingStderr = useCallback((endpoint_id: string, log_path: string, build_task_id: string) => {
    if (pollStderrIntervalRef.current) {
        clearInterval(pollStderrIntervalRef.current)
    }

    currentEndpointRef.current = endpoint_id
    currentStderrLogPathRef.current = log_path
    currentTaskIdRef.current = build_task_id
    currentStderrLogTaskIdRef.current = null

    setIsPollingStderr(true)
    
    fetchStderrLogs(endpoint_id, log_path, build_task_id)

    pollStderrIntervalRef.current = setInterval(async () => {
        if (currentEndpointRef.current && currentStderrLogPathRef.current && currentTaskIdRef.current) {
            const shouldStop = await fetchStderrLogs(
                currentEndpointRef.current,
                currentStderrLogPathRef.current,
                currentTaskIdRef.current,
                currentStderrLogTaskIdRef.current as string
            )
            
            if (shouldStop) {
                setIsPollingStderr(false)
                if (pollStderrIntervalRef.current) {
                    clearInterval(pollStderrIntervalRef.current)
                }
            }
        }
    }, 5000)

    setTimeout(() => {
        setIsPollingStderr(false)
        if (pollStderrIntervalRef.current) {
            clearInterval(pollStderrIntervalRef.current)
        }
    }, 300000)
  }, [fetchStderrLogs])



  async function onSubmit(values: z.infer<typeof formSchema>) {
    const logComponents = document.getElementById('logComponents')
    if (logComponents) {
        logComponents.classList.remove('hidden')
    }
    const logElement = document.getElementById('stdoutLogs')
    const stdoutStatusElement = document.getElementById('taskStdoutPollingStatus')
    const stderrLogElement = document.getElementById('stderrLogs')
    const stderrStatusElement = document.getElementById('taskStderrPollingStatus')
    
    if (logElement) {
        logElement.textContent = 'Waiting for task to start...'
    }
    if (stdoutStatusElement) {
        stdoutStatusElement.textContent = 'Preparing stdout logs...'
    }
    if (stderrLogElement) {
        stderrLogElement.textContent = 'Waiting for stderr logs...'
    }
    if (stderrStatusElement) {
        stderrStatusElement.textContent = 'Preparing stderr logs...'
    }

    let response;
    try {
      switch (values.taskType) {
        case 'submitTask':
          response = await submitTask({
            endpoint: values.endpoint,
            partition: values.partition,
            log_path: values.log_path,
            num_of_nodes: values.num_of_nodes,
            task: values.task,
            container: values.container,
            work_path: values.work_path,
            taskName: values.taskName, // Include the taskName
          });
          break;
        default:
          console.error('Invalid task type');
          return;
      }
      if (response !== null) {
        console.log('Task submitted successfully!', response);
        toast({
          title: 'Success',
          description: 'Task submitted successfully! Fetching logs...',
          className: 'bg-green-500 text-white'
        });
      }
    } catch (error) {
      console.error('Error triggering task:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit task. Please try again.',
        variant: 'destructive'
      });
    }

    const task_id = response.task_id
    const stdoutLogPath = `${values.log_path}${values.log_path!.endsWith('/') ? '' : '/'}${values.taskName}.stdout`
    const stderrLogPath = `${values.log_path}${values.log_path!.endsWith('/') ? '' : '/'}${values.taskName}.stderr`
    console.log('Task stdoutLogPath:', stdoutLogPath)
    console.log('Task stderrLogPath:', stderrLogPath)
    startPollingStdout(values.endpoint!, stdoutLogPath, task_id)
    startPollingStderr(values.endpoint!, stderrLogPath, task_id)
  }

  return (
    <Form {...form}>
      {isLoadingPartitions && (
        <div className="loading-overlay">
          <div className="spinner">
            <p>Loading partitions...</p>
          </div>
        </div>
      )}
      {isLoadingContainers && (
        <div className="loading-overlay">
          <div className="spinner">
            <p>Loading containers...</p>
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="taskType"
          render={({ field }) => (
            <FormItem className="w-[60%] md:w-[20%]">
              <FormLabel>Task Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isLoadingPartitions || isLoadingContainers}>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="submitTask">Submit Task</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of task you want to execute.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('taskType') === 'submitTask' && (
          <>
            {/* Task Name Field */}
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Task Name</FormLabel>
                  <Input placeholder="Enter task name" {...field} />
                  <FormDescription>
                    Provide a name for the task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Endpoint</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPartitions || isLoadingContainers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select endpoint" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {endpoints.length > 0 ? (
                        endpoints.map((endpoint) => (
                          <SelectItem
                            key={endpoint.endpoint_uuid}
                            value={endpoint.endpoint_uuid}
                          >
                            {endpoint.endpoint_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No endpoints available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partition"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Partition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPartitions || partitions.length === 0 || isLoadingContainers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingPartitions ? "Loading..." : "Select partition"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {partitions.length > 0 ? (
                        partitions.map((partition) => (
                          <SelectItem
                            key={partition}
                            value={partition}
                          >
                            {partition}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No partitions available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a partition from the list.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingAccounts}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingAccounts ? "Loading..." : "Select account"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.length > 0 ? (
                        accounts.map((account) => (
                          <SelectItem
                            key={account}
                            value={account}
                          >
                            {account}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No accounts available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select an account from the list.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="num_of_nodes"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Number of Nodes</FormLabel>
                  <Input
                    placeholder="1"
                    {...field}
                    disabled={isLoadingPartitions || isLoadingContainers}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="container"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Container</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingContainers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingContainers ? "Loading..." : "Select container"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(containers).length > 0 ? (
                        Object.keys(containers).map((key) => (
                          <SelectItem
                            key={key}
                            value={key}
                          >
                            {key}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No containers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a container from the list.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="log_path"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Log Path</FormLabel>
                  <Input placeholder="Log Path" {...field} disabled={isLoadingPartitions || isLoadingContainers} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem className="w-[80%] md:w-[50%]">
                  <FormLabel>Task</FormLabel>
                  <Textarea placeholder="Task details" {...field} disabled={isLoadingPartitions || isLoadingContainers} />
                </FormItem>
              )}
            />
          </>
        )}
        <Button type="submit" disabled={isLoadingPartitions || isLoadingContainers}>Submit</Button>
      </form>
    </Form>
  );
}
