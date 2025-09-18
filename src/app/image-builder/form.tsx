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
import {registerContainer} from '@/lib/taskHandlers';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  endpoint: z.string().optional(),
  location: z.string().optional(),
  name: z.string().min(2, {
    message: 'Job name must be at least 2 characters.'
  }),
  description: z.string().optional(),
  base_image: z.string().optional()
});

export function ImageManagerForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  });

  const [endpoints, setEndpoints] = useState<
    { endpoint_uuid: string; endpoint_name: string }[]
  >([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchEndpoints() {
      try {
        const response = await fetch('/api/list_active_endpoints');
        const data = await response.json();
        if (isMounted) setEndpoints(data);
      } catch (error) {
        console.error('Error fetching endpoints:', error);
      }
    }
    fetchEndpoints();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await registerContainer({
        endpoint: values.endpoint ?? '',
        base_image: values.base_image ?? '',
        location: values.location ?? '',
        name: values.name ?? '',
        description: values.description ?? ''
      });
      console.log('response after register container:', response);
      if (response !== null) {
        console.log('response in form:', response);
        toast({
          title: 'Success',
          description: response.message
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
          name="endpoint"
          render={({ field }) => (
            <FormItem className="w-[60%] md:w-[20%]">
              <FormLabel>Endpoint</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="base_image"
          render={({ field }) => (
            <FormItem className="w-[60%] md:w-[20%]">
              <FormLabel>Base Image</FormLabel>
              <Input placeholder="Base Image" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="w-[60%] md:w-[20%]">
              <FormLabel>Location</FormLabel>
              <Input placeholder="Location" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-[60%] md:w-[20%]">
              <FormLabel>Name</FormLabel>
              <Input placeholder="Name" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-[80%] md:w-[50%]">
              <FormLabel>Description</FormLabel>
              <Textarea placeholder="Description" {...field} />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
