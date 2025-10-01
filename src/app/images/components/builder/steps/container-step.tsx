'use client';

import { Container, MapPin, Box } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BuilderFormData } from '@/app/images/types';

interface ContainerStepProps {
  formData: Partial<BuilderFormData>;
  onUpdate: (data: Partial<BuilderFormData>) => void;
}

export function ContainerStep({ formData, onUpdate }: ContainerStepProps) {
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
          onChange={(e) => onUpdate({ baseImage: e.target.value })}
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
