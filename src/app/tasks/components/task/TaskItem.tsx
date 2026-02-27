'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
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
  const [logViewer, setLogViewer] = useState<{ type: 'stdout' | 'stderr'; path: string } | null>(null);
  const [logContent, setLogContent] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const logPollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleViewLog = (logType: 'stdout' | 'stderr') => {
    const logPath = logType === 'stdout' ? task.result : task.error;
    if (!logPath) {
      return;
    }

    setLogViewer({ type: logType, path: logPath });
    setLogContent('');
    setLogError(null);
    setLogLoading(true);

  };

  const handleCloseLogViewer = () => {
    if (logPollingRef.current) {
      clearInterval(logPollingRef.current);
      logPollingRef.current = null;
    }
    setLogViewer(null);
    setLogContent('');
    setLogError(null);
    setLogLoading(false);
  };

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

  useEffect(() => {
    if (!logViewer) {
      if (logPollingRef.current) {
        clearInterval(logPollingRef.current);
        logPollingRef.current = null;
      }
      return;
    }

    let isActive = true;

    const fetchTaskLog = async () => {
      try {
        const params = new URLSearchParams({
          task_id: task.task_id,
          endpoint_id: task.details.endpoint_id,
          log_path: logViewer.path
        });

        const response = await fetch(`/api/get_task_log?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch task log');
        }

        const data = await response.json();
        if (!isActive) return;
        setLogContent(data.log_content ?? '');
        setLogError(null);
      } catch (error) {
        if (!isActive) return;
        console.error('Error fetching task log:', error);
        setLogError('Failed to load log content.');
      } finally {
        if (!isActive) return;
        setLogLoading(false);
      }
    };

    fetchTaskLog();
    logPollingRef.current = setInterval(fetchTaskLog, 5000);

    return () => {
      isActive = false;
      if (logPollingRef.current) {
        clearInterval(logPollingRef.current);
        logPollingRef.current = null;
      }
    };
  }, [logViewer, task.details.endpoint_id, task.task_id]);

  return (
    <>
      <div className="group dashboard-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-900 transition-colors duration-200 group-hover:text-slate-700 dark:text-slate-100 dark:group-hover:text-slate-200">
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
              <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-700/70 dark:bg-slate-800/50">
                <span className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Endpoint
                </span>
                <span
                  className="mt-1 block text-sm font-semibold text-slate-900 dark:text-slate-100"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {task.details.endpoint_name}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-700/70 dark:bg-slate-800/50">
                <span className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Task ID
                </span>
                <span
                  className="mt-1 block text-sm font-semibold text-slate-900 dark:text-slate-100"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {task.task_id}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-700/70 dark:bg-slate-800/50">
                <span className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Created
                </span>
                <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {new Date(task.details.task_create_time).toLocaleString()}
                </span>
              </div>
            </div>

            {(task.result || task.error) && (
              <div className="border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-700/70 dark:bg-slate-800/50">
                    <span className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Stdout Log
                    </span>
                    {task.result ? (
                      <button
                        onClick={() => handleViewLog('stdout')}
                        className="mt-1 block w-full cursor-pointer break-all text-left text-sm text-rose-700 underline underline-offset-4 transition-colors hover:text-rose-600 dark:text-rose-200 dark:hover:text-rose-100"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {task.result}
                      </button>
                    ) : (
                      <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                        Not available
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-700/70 dark:bg-slate-800/50">
                    <span className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Stderr Log
                    </span>
                    {task.error ? (
                      <button
                        onClick={() => handleViewLog('stderr')}
                        className="mt-1 block w-full cursor-pointer break-all text-left text-sm text-rose-700 underline underline-offset-4 transition-colors hover:text-rose-600 dark:text-rose-200 dark:hover:text-rose-100"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {task.error}
                      </button>
                    ) : (
                      <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                        Not available
                      </span>
                    )}
                  </div>
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

      {logViewer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-[hsl(var(--dashboard-surface))] shadow-xl dark:border-slate-700/80">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {logViewer.type === 'stdout' ? 'Stdout Log Output' : 'Stderr Log Output'}
                  </h3>
                  <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                    Path: {logViewer.path}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseLogViewer}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
              <div className="min-h-60 max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700/70 dark:bg-slate-800/60">
                {logLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading log...
                  </div>
                ) : logError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{logError}</p>
                ) : (
                  <pre className="wrap-break-word whitespace-pre-wrap font-mono text-xs text-slate-900 dark:text-slate-100">
                    {logContent || 'Log is empty.'}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-[hsl(var(--dashboard-surface))] shadow-xl dark:border-slate-700/80">
            <div className="p-6">
              {/* Header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-950/30">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Delete Task</h3>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="mb-2 text-slate-600 dark:text-slate-400">
                  Are you sure you want to delete this task?
                </p>
                <div className="space-y-2 rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-700/70 dark:bg-slate-800/60">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{task.task_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold">Task ID:</span>{' '}
                    <span className="font-mono">{task.task_id}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold">Endpoint:</span>{' '}
                    <span className="font-mono">
                      {task.details.endpoint_name}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
