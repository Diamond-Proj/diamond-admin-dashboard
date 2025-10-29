'use client';

import { useEffect } from 'react';
import { Container, MapPin, Box, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BuilderFormData } from '@/app/images/types';
import { isPerlmutterHost } from '@/app/utils/hosts';

interface ContainerStepProps {
  formData: Partial<BuilderFormData>;
  onUpdate: (data: Partial<BuilderFormData>) => void;
}

export function ContainerStep({ formData, onUpdate }: ContainerStepProps) {
  const isPerlmutter = isPerlmutterHost(formData.endpointHost);

  useEffect(() => {
    if (!isPerlmutter) {
      return;
    }

    const desiredName = formData.baseImage || '';
    if (formData.containerName !== desiredName) {
      onUpdate({ containerName: desiredName });
    }
  }, [
    formData.baseImage,
    formData.containerName,
    isPerlmutter,
    onUpdate
  ]);

  const handleBaseImageChange = (value: string) => {
    if (isPerlmutter) {
      onUpdate({
        baseImage: value,
        containerName: value
      });
      return;
    }

    onUpdate({ baseImage: value });
  };

  if (isPerlmutter) {
    return (
      <div className="space-y-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-500/90 p-1.5 text-white">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">
                Perlmutter uses Shifter – only the base image is required.
              </p>
              <p className="mt-1 text-xs opacity-90">
                The base image string will be used as the job identifier and log
                name.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="mb-3 flex items-center gap-2">
            <Box className="text-primary h-5 w-5" />
            <h4 className="text-lg font-semibold">Base Image</h4>
          </div>

          <Input
            placeholder="registry/image:tag"
            value={formData.baseImage || ''}
            onChange={(e) => handleBaseImageChange(e.target.value)}
            className="max-w-md"
          />
          <p className="text-muted-foreground text-sm">
            Provide the Shifter-compatible image reference (e.g.,
            openfold/openfold:0.1).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Container Name */}
      <div className="space-y-4">
        <div className="mb-3 flex items-center gap-2">
          <Container className="text-primary h-5 w-5" />
          <h4 className="text-lg font-semibold">Container Name</h4>
        </div>

        <Input
          placeholder="my-container"
          value={formData.containerName || ''}
          onChange={(e) => onUpdate({ containerName: e.target.value })}
          className="max-w-md"
        />
        <p className="text-muted-foreground text-sm">
          Choose a unique name for your container image
        </p>
      </div>

      {/* Build Location */}
      <div className="space-y-4">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="text-primary h-5 w-5" />
          <h4 className="text-lg font-semibold">Build Location (Optional)</h4>
        </div>

        <Input
          placeholder="/home/user/builds"
          value={formData.location || ''}
          onChange={(e) => onUpdate({ location: e.target.value })}
          className="max-w-md"
        />
        <p className="text-muted-foreground text-sm">
          Directory where the container will be built on the HPC system
        </p>
      </div>

      {/* Base Image */}
      <div className="space-y-4">
        <div className="mb-3 flex items-center gap-2">
          <Box className="text-primary h-5 w-5" />
          <h4 className="text-lg font-semibold">Base Image</h4>
        </div>

        <Input
          placeholder="ubuntu:22.04"
          value={formData.baseImage || ''}
          onChange={(e) => handleBaseImageChange(e.target.value)}
          className="max-w-md"
        />
        <p className="text-muted-foreground text-sm">
          Base container image to build from (e.g., ubuntu:22.04, centos:8,
          python:3.9)
        </p>
      </div>
    </div>
  );
}
