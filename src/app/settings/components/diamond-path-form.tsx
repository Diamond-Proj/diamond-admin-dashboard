'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import Form from 'next/form';

interface Endpoint {
  endpoint_uuid: string;
  endpoint_name: string;
  is_managed: boolean;
  diamond_dir?: string;
}

interface DiamondPathFormProps {
  endpoint: Endpoint;
}

export function DiamondPathForm({ endpoint }: DiamondPathFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [path, setPath] = useState(endpoint.diamond_dir || '');
  const { toast } = useToast();

  const hasChanges = path !== (endpoint.diamond_dir || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedPath = path.trim();
    if (!trimmedPath) {
      toast({
        title: 'Error',
        description: 'Path is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSaving(true);
      const workPath = trimmedPath.replace(/\/diamond\/?$/, '');

      const response = await fetch('/api/set_diamond_work_path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint_uuid: endpoint.endpoint_uuid,
          diamond_work_path: workPath
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save diamond directory');
      }

      toast({
        title: 'Success',
        description: 'Diamond work path saved successfully!'
      });
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

  return (
    <Form action="" onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm text-gray-900 dark:text-white">
        <span className="font-medium">Diamond Work Path</span>
        <span className="ml-2 font-normal text-gray-600 dark:text-gray-400">
          (Specify the working directory for Diamond tasks on this endpoint)
        </span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/path/to/diamond/work/directory"
          disabled={isSaving}
          className="flex h-10 w-full flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 ring-offset-white transition-colors placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:ring-offset-gray-950 dark:placeholder:text-gray-500 dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-400/20"
        />
        <button
          type="submit"
          disabled={isSaving || !path || !hasChanges}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:ring-blue-400"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Path
            </>
          )}
        </button>
      </div>
    </Form>
  );
}
