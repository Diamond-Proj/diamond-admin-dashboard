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
// Assuming these are the functions that interface with your backend to execute the tasks
import { submitTask } from '@/lib/taskHandlers';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  taskType: z.enum(['submitTask']),
  jobName: z.string().min(2, {
    message: 'Job name must be at least 2 characters.'
  }),
  endpoint: z.string().optional(),
  log_path: z.string().optional(),
  task: z.string().optional(),
  // base_image: z.string().optional(),
  container_path: z.string().optional(),
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
    console.log('Endpoints:', endpoints);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let response;
      switch (values.taskType) {
        case 'submitTask':
          response = await submitTask({
            endpoint: values.endpoint,
            log_path: values.log_path,
            task: values.task,
            container_path: values.container_path
          });
          break;
        default:
          console.error('Invalid task type');
          return;
      }
      if (response !== null) {
        console.log('response in form:', response);
        toast({
          title: 'Success',
        });
      }
      console.log('Task triggered successfully:', response);
    } catch (error) {
      console.error('Error triggering task:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="taskType"
          render={({ field }) => (
            <FormItem className="w-[60%] md:w-[20%]">
              <FormLabel>Task Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Endpoint</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
              name="log_path"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Log Path</FormLabel>
                  <Input placeholder="Log Path" {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="container_path"
              render={({ field }) => (
                <FormItem className="w-[60%] md:w-[20%]">
                  <FormLabel>Container Path</FormLabel>
                  <Input placeholder="Container Path" {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem className="w-[80%] md:w-[50%]">
                  <FormLabel>Task</FormLabel>
                  <Textarea placeholder="Task details" {...field} />
                </FormItem>
              )}
            />
          </>
        )}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
