'use client';

import { useState } from 'react';
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
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold">
            Container Images
          </h1>
          <p className="text-muted-foreground text-lg">
            Build, manage, and deploy your container images across HPC resources
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="group flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-red-700 hover:to-red-800 hover:shadow-md focus:ring-2 focus:ring-red-500/50 focus:outline-none"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          Build New Image
        </button>
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
