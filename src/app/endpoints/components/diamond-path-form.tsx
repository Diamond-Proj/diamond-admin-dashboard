'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import Form from 'next/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
      <label className="block text-sm text-slate-900 dark:text-slate-100">
        <span className="font-medium">Diamond Work Path</span>
        <span className="ml-2 font-normal text-slate-600 dark:text-slate-400">
          (Specify the working directory for Diamond tasks on this endpoint)
        </span>
      </label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/path/to/diamond/work/directory"
          disabled={isSaving}
          className="h-10 flex-1 border-slate-200/80 bg-white/80 font-mono text-slate-900 placeholder:text-slate-400 focus-visible:ring-rose-500/25 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <Button
          type="submit"
          disabled={isSaving || !path || !hasChanges}
          className="h-10 whitespace-nowrap bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
        </Button>
      </div>
    </Form>
  );
}
