'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw, Save, FolderOpen } from 'lucide-react';

interface Endpoint {
  endpoint_name: string;
  endpoint_uuid: string;
  endpoint_host: string;
  endpoint_status: string;
  diamond_dir?: string;
}

// Schema for diamond path form
const diamondPathSchema = z.object({
  diamond_work_path: z.string()
});

type DiamondPathFormData = z.infer<typeof diamondPathSchema>;

export function SettingsForm() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch endpoints on component mount
  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/list_all_endpoints');
      if (!response.ok) {
        throw new Error('Failed to fetch endpoints');
      }
      const data = await response.json();
      const enriched = await Promise.all(
        data.map(async (ep: Endpoint) => {
          try {
            const res = await fetch(`/api/get_diamond_dir?endpoint_uuid=${encodeURIComponent(ep.endpoint_uuid)}`);
            if (!res.ok) return ep;
            const { diamond_dir } = await res.json();
            return { ...ep, diamond_dir: diamond_dir || '' };
          } catch {
            return ep;
          }
        })
      );
      setEndpoints(enriched);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch endpoints. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEndpoints = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/register_all_endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh endpoints');
      }
      
      toast({
        title: 'Success',
        description: 'Endpoints refreshed successfully!',
      });
      
      // Fetch updated endpoints
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

  const saveDiamondPath = async (endpointUuid: string, path: string) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/set_diamond_work_path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint_uuid: endpointUuid,
          diamond_work_path: path
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save diamond directory');
      }
      
      toast({
        title: 'Success',
        description: 'Diamond work path saved successfully!',
      });
      
      // Update local state
      setEndpoints(prev => prev.map(endpoint => 
        endpoint.endpoint_uuid === endpointUuid 
          ? { ...endpoint, diamond_work_path: path }
          : endpoint
      ));
    } catch (error) {
      console.error('Error saving diamond directory:', error);
      toast({
        title: 'Error',
        description: 'Failed to save diamond work path. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'offline':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'starting':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Endpoint Configuration */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Endpoint Configuration</h2>
          </div>
          <Button
            onClick={refreshEndpoints}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Endpoints
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Manage your Globus Compute endpoints and configure diamond work paths for each endpoint.
        </p>
        
        {endpoints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No endpoints found. Click "Refresh Endpoints" to discover your available endpoints.
            </p>
            <Button onClick={refreshEndpoints} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Endpoints
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.endpoint_uuid}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{endpoint.endpoint_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.endpoint_status)}`}>
                        {endpoint.endpoint_status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Host: {endpoint.endpoint_host}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      UUID: {endpoint.endpoint_uuid}
                    </p>
                  </div>
                </div>
                
                <DiamondPathForm 
                  endpoint={endpoint}
                  onSave={saveDiamondPath}
                  isSaving={isSaving}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appearance Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <p className="text-muted-foreground mb-4">
          Customize the appearance of your dashboard.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <p className="text-sm text-muted-foreground mt-1">
              You can toggle between light and dark mode using the theme toggle button at the bottom left of the screen.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
        <p className="text-muted-foreground mb-4">
          Manage your notification preferences for job completions, errors, and system updates.
        </p>
        <div className="bg-info p-3 rounded-md">
          <p className="text-info text-sm font-medium">
            <strong>Note:</strong> Notification settings will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}

// Separate component for the diamond path form
function DiamondPathForm({ 
  endpoint, 
  onSave, 
  isSaving 
}: { 
  endpoint: Endpoint; 
  onSave: (endpointUuid: string, path: string) => Promise<void>;
  isSaving: boolean;
}) {
  const form = useForm<DiamondPathFormData>({
    resolver: zodResolver(diamondPathSchema),
    defaultValues: {
      // show the exact diamond_dir; empty → placeholder shown
      diamond_work_path: endpoint.diamond_dir || ''
    }
  });

  useEffect(() => {
    form.reset({ diamond_work_path: endpoint.diamond_dir || '' });
  }, [endpoint.diamond_dir, form]);

  const onSubmit = async (values: DiamondPathFormData) => {
    const input = values.diamond_work_path.trim();
    // convert displayed diamond_dir → diamond_work_path for the API
    const workPath = input.replace(/\/diamond\/?$/, '');
    await onSave(endpoint.endpoint_uuid, workPath);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="diamond_work_path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diamond Work Path</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="/path/to/diamond/work/directory"
                    {...field}
                    className="flex-1"
                  />
                </FormControl>
                <Button
                  type="submit"
                  disabled={isSaving || !field.value}
                  size="sm"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
              <FormDescription>
                This path will be used as the working directory for Diamond tasks on this endpoint.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
