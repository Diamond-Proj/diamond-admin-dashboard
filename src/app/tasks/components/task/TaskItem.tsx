'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '../../tasks.types';

export default function TaskItem({
  task,
  deletingTasks,
  deleteTask,
  getStatusIcon,
  getStatusBadgeColor
}: {
  task: Task;
  deletingTasks: Set<string>;
  deleteTask: (taskId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadgeColor: (status: string) => string;
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteTask(task.task_id);
    setShowConfirmDialog(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/80 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600/80">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {task.task_name}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(task.status)}`}
                >
                  {getStatusIcon(task.status)}
                  {task.status || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Task Details Grid */}
            <div className="mb-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Endpoint
                </span>
                <span className="mt-1 block font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {task.details.endpoint_id}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Task ID
                </span>
                <span className="mt-1 block font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {task.task_id}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Created
                </span>
                <span className="mt-1 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(task.details.task_create_time).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Result/Log Path */}
            {task.result && (
              <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Log Path
                  </span>
                  <span className="mt-1 block font-mono text-sm text-gray-700 dark:text-gray-300">
                    {task.result}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="ml-6">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deletingTasks.has(task.task_id)}
              className="flex cursor-pointer items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deletingTasks.has(task.task_id) ? 'Deleting...' : 'Delete'}
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
                <h3 className="text-lg font-semibold">Delete Task</h3>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-muted-foreground mb-2">
                  Are you sure you want to delete this task?
                </p>
                <div className="bg-muted/30 dark:bg-muted/20 space-y-2 rounded-md p-3">
                  <p className="text-sm font-medium">{task.task_name}</p>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-bold">Task ID:</span>{' '}
                    <span className="font-mono">{task.task_id}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-bold">Endpoint:</span>{' '}
                    <span className="font-mono">
                      {task.details.endpoint_id}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-bold">Status:</span>{' '}
                    {task.status || 'Unknown'}
                  </p>
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
                  Delete Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
