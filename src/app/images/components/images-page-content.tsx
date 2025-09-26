'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContainerGrid } from './container-grid';
import { ImageBuilderModal } from './image-builder-modal';

interface ImagesPageContentProps {
  isAuthenticated: boolean;
}

export function ImagesPageContent({ isAuthenticated }: ImagesPageContentProps) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBuilderSuccess = () => {
    setIsBuilderOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold md:text-4xl">
            Container Images
          </h1>
          <p className="text-muted-foreground text-lg">
            Build, manage, and deploy your container images across HPC resources
          </p>
        </div>

        <Button
          onClick={() => setIsBuilderOpen(true)}
          className="flex cursor-pointer items-center gap-2"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          Build New Image
        </Button>
      </div>

      {/* Container Grid */}
      <ContainerGrid
        isAuthenticated={isAuthenticated}
        refreshTrigger={refreshTrigger}
      />

      {/* Image Builder Modal */}
      <ImageBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSuccess={handleBuilderSuccess}
      />
    </div>
  );
}
