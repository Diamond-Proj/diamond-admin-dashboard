'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { TasksList } from './tasks-list';
import { TaskSubmissionModal } from './task-submission-modal';
import { TaskControls } from './task-controls';
import { TaskStats } from './task-stats';
import { Task, TasksApiResponse, Endpoint } from '../tasks.types';
import { useToast } from '@/components/ui/use-toast';

interface TasksPageContentProps {
  isAuthenticated: boolean;
}

export function TasksPageContent({ isAuthenticated }: TasksPageContentProps) {
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'completed' | 'pending' | 'running' | 'failed'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchEndpoints = useCallback(async () => {
    try {
      const response = await fetch('/api/list_all_endpoints', {
        credentials: 'include'
      });
      const data = await response.json();
      setEndpoints(data);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      // setLoading(true);
      const response = await fetch('/api/get_task_status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data: TasksApiResponse = await response.json();
      const tasksArray = Object.values(data);
      const tasksArrayNew = tasksArray.map(task => {
        const endpoint = endpoints.find(
          ep => ep.endpoint_uuid === task.details.endpoint_id
        );
        return {
          ...task,
          details: {
            ...task.details,
            endpoint_name: endpoint?.endpoint_name || 'Unknown'
          }
        };
      });
      setTasks(tasksArrayNew);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive'
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [toast, endpoints]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEndpoints();
    }
  }, [isAuthenticated, fetchEndpoints]);

  useEffect(() => {
    if (isAuthenticated && endpoints.length > 0) {
      fetchTasks();
      const intervalId = setInterval(fetchTasks, 10000);
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, endpoints.length, refreshTrigger, fetchTasks]);

  const handleSubmissionSuccess = () => {
    setIsSubmissionOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      setDeletingTasks((prev) => new Set(prev).add(taskId));

      try {
        const response = await fetch('/api/delete_task', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ taskId })
        });

        if (response.ok) {
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.task_id !== taskId)
          );
          toast({
            title: 'Success',
            description: 'Task deleted successfully'
          });
        } else {
          throw new Error('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete task',
          variant: 'destructive'
        });
      } finally {
        setDeletingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }
    },
    [toast]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === 'all' || task.status.toLowerCase() === filter;

      const matchesSearch =
        task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.status.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-lg">
            Submit and manage computational tasks across HPC resources
          </p>
        </div>

        <button
          onClick={() => setIsSubmissionOpen(true)}
          className="group flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-md focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          Submit New Task
        </button>
      </div>

      {/* Task Stats */}
      <TaskStats tasks={tasks} loading={loading} />

      {/* Task Controls */}
      <TaskControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
      />

      {/* Tasks List */}
      <TasksList
        tasks={filteredTasks}
        loading={loading}
        onDeleteTask={handleDeleteTask}
        deletingTasks={deletingTasks}
      />

      {/* Task Submission Modal */}
      <TaskSubmissionModal
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  );
}
