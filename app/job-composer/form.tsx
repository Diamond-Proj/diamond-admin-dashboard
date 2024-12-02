'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { useEffect, useState } from 'react';

const formSchema = z.object({
  taskType: z.enum(['submitTask']),
  jobName: z.string().min(2, {
    message: 'Job name must be at least 2 characters.'
  }),
  taskName: z.string().min(2, {
    message: 'Task name must be at least 2 characters.'
  }),
  endpoint: z.string().optional(),
  partition: z.string().optional(),
  log_path: z.string().optional(),
  task: z.string().optional(),
  container: z.string().optional(),
  work_path: z.string().optional(),
  nodes: z.string().regex(/^\d+$/, {
    message: 'Nodes must be a positive integer.'
  })
});

export function JobComposerForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskType: 'submitTask',
      jobName: 'submitTask',
      nodes: '1',
    }
  });

  const [endpoints, setEndpoints] = useState<
    { endpoint_uuid: string; endpoint_name: string }[]
  >([]);

  const [partitions, setPartitions] = useState<string[]>([]);
  const [partitionsCache, setPartitionsCache] = useState<{ [key: string]: string[] }>({});
  const [isLoadingPartitions, setIsLoadingPartitions] = useState(false);

  const [containers, setContainers] = useState<{ [key: string]: any }>({});
  const [isLoadingContainers, setIsLoadingContainers] = useState(false);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let response;
      switch (values.taskType) {
        case 'submitTask':
          response = await submitTask({
            endpoint: values.endpoint,
            partition: values.partition,
            log_path: values.log_path,
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
        toast({
          title: 'Success',
        });
      }
    } catch (error) {
      console.error('Error triggering task:', error);
    }
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
