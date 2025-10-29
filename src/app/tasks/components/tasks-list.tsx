'use client';

import { useCallback, useMemo } from 'react';
import { Task } from '../tasks.types';
import { CheckCircle, Clock, XCircle, Loader, Terminal } from 'lucide-react';
import TaskItem from './task/TaskItem';

interface TasksListProps {
  tasks: Task[];
  loading: boolean;
  onDeleteTask: (taskId: string) => void;
  deletingTasks: Set<string>;
}

export function TasksList({
  tasks,
  loading,
  onDeleteTask,
  deletingTasks
}: TasksListProps) {
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case 'RUNNING':
        return (
          <Loader className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        );
      case 'PENDING':
        return (
          <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        );
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  const getStatusBadgeColor = useCallback((status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300';
      case 'RUNNING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-300';
    }
  }, []);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      return new Date(b.details.task_create_time).getTime() - 
             new Date(a.details.task_create_time).getTime();
    });
  }, [tasks]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start gap-4">
              <div className="bg-muted dark:bg-muted h-12 w-12 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="bg-muted dark:bg-muted h-4 w-3/4 rounded"></div>
                <div className="bg-muted dark:bg-muted h-3 w-1/2 rounded"></div>
                <div className="space-y-2">
                  <div className="bg-muted dark:bg-muted h-3 w-full rounded"></div>
                  <div className="bg-muted dark:bg-muted h-3 w-2/3 rounded"></div>
                </div>
              </div>
              <div className="bg-muted dark:bg-muted h-8 w-16 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="bg-muted dark:bg-muted/50 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <Terminal className="text-muted-foreground h-12 w-12" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No tasks found</h3>
        <p className="text-muted-foreground mx-auto mb-6 max-w-md">
          Submit your first computational task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.task_id}
          task={task}
          deletingTasks={deletingTasks}
          deleteTask={onDeleteTask}
          getStatusIcon={getStatusIcon}
          getStatusBadgeColor={getStatusBadgeColor}
        />
      ))}
    </div>
  );
}
