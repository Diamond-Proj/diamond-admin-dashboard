'use client';

import { useState } from 'react';
import {
  Container,
  MapPin,
  Trash2,
  AlertTriangle,
  Package,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContainerData } from '@/app/images/types';

export default function ContainerItem({
  containerName,
  data,
  deletingContainers,
  deleteContainer,
  getStatusColor,
  getStatusIcon,
  getStatusBadgeColor
}: {
  containerName: string;
  data: ContainerData;
  deletingContainers: Set<string>;
  deleteContainer: (name: string, taskId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadgeColor: (status: string) => string;
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteContainer(containerName, data.container_task_id);
    setShowConfirmDialog(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div
        className={`bg-card dark:bg-card rounded-xl border border-l-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:hover:shadow-xl ${getStatusColor(data.status)}`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-start gap-4">
            <div className="bg-primary/10 dark:bg-primary/20 flex-shrink-0 rounded-lg p-3">
              <Container className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="mb-2 truncate text-lg font-semibold"
                title={containerName}
              >
                {containerName}
              </h3>
              <div className="flex items-center gap-2">
                {getStatusIcon(data.status)}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusBadgeColor(data.status)}`}
                >
                  {data.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Container Details */}
          <div className="mb-6 space-y-3">
            {/* Base Image */}
            {data.base_image && (
              <div className="text-muted-foreground flex items-center gap-2 rounded-md text-sm">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="text-muted-foreground text-sm font-bold">
                  Base Image:
                </span>
                <span
                  className="truncate font-mono text-sm"
                  title={data.base_image}
                >
                  {data.base_image}
                </span>
              </div>
            )}

            {/* Task ID */}
            {data.container_task_id && (
              <div className="text-muted-foreground flex items-center gap-2 rounded-md text-sm">
                <Hash className="h-4 w-4 flex-shrink-0" />
                <span className="text-muted-foreground text-sm font-bold">
                  Task ID:
                </span>
                <span
                  className="truncate font-mono text-sm"
                  title={data.container_task_id}
                >
                  {data.container_task_id}
                </span>
              </div>
            )}

            {/* Location */}
            {data.location && (
              <div className="text-muted-foreground flex items-center gap-2 rounded-md text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-muted-foreground text-sm font-bold">
                  Location:
                </span>
                <span
                  className="truncate font-mono text-sm"
                  title={data.location}
                >
                  {data.location}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deletingContainers.has(containerName)}
              className="flex cursor-pointer items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deletingContainers.has(containerName) ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
          <div className="bg-background dark:bg-background w-full max-w-md rounded-lg border shadow-xl dark:border-gray-800">
            <div className="p-6">
              {/* Header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-950/30">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold">Delete Container</h3>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-muted-foreground mb-2">
                  Are you sure you want to delete this container?
                </p>
                <div className="bg-muted/30 dark:bg-muted/20 space-y-2 rounded-md p-3">
                  <p className="text-sm font-medium">{containerName}</p>
                  {data.base_image && (
                    <p className="text-muted-foreground text-xs">
                      <span className="font-bold">Base Image:</span>{' '}
                      <span className="font-mono">{data.base_image}</span>
                    </p>
                  )}
                  {data.container_task_id && (
                    <p className="text-muted-foreground text-xs">
                      <span className="font-bold">Task ID:</span>{' '}
                      <span className="font-mono">
                        {data.container_task_id}
                      </span>
                    </p>
                  )}
                  {data.location && (
                    <p className="text-muted-foreground text-xs">
                      <span className="font-bold">Location:</span>{' '}
                      {data.location}
                    </p>
                  )}
                </div>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  className="cursor-pointer"
                >
                  Delete Container
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
