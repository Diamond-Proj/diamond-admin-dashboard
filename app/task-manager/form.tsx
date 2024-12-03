'use client';

import { useEffect, useState } from 'react';

export function TaskManagerForm() {
  const [tasksData, setTasksData] = useState<Record<string, any>>({});

  // Fetch task statuses from the server
  const fetchTaskStatus = async () => {
    try {
      const response = await fetch('/api/get_tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setTasksData(data); // Use the entire response as tasksData
    } catch (error) {
      console.error('Error fetching task status:', error);
    }
  };

  // Trigger task status updates on the server
  const updateTaskStatus = async () => {
    try {
      const response = await fetch('/api/update_task_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Task status update triggered successfully');
      } else {
        console.error('Failed to trigger task status update');
      }
    } catch (error) {
      console.error('Error triggering task status update:', error);
    }
  };

  // Delete a specific task and refresh task list
  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/delete_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });

      if (response.ok) {
        setTasksData((prevTasksData) => {
          const newTasksData = { ...prevTasksData };
          delete newTasksData[taskId];
          return newTasksData;
        });
        fetchTaskStatus(); // Refresh task list after deletion
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    // Fetch task status when the component mounts
    fetchTaskStatus();

    // Set up intervals for fetching and updating tasks
    const fetchIntervalId = setInterval(fetchTaskStatus, 3000); // Refresh tasks every 3 seconds
    const updateIntervalId = setInterval(updateTaskStatus, 3000); // Trigger update every 15 seconds

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(fetchIntervalId);
      clearInterval(updateIntervalId);
    };
  }, []);

  return (
    <div>
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Task Name</th>
            <th className="border px-4 py-2">Endpoint</th>
            <th className="border px-4 py-2">Task Status</th>
            <th className="border px-4 py-2">Log Path</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(tasksData).length > 0 ? (
            Object.keys(tasksData).map((taskId) => {
              const task = tasksData[taskId];
              return (
                <tr key={taskId}>
                  <td className="border px-4 py-2">{task?.task_name || 'Unknown'}</td>
                  <td className="border px-4 py-2">{task?.details?.endpoint_id || 'N/A'}</td>
                  <td className="border px-4 py-2">{task?.status || 'Unknown'}</td>
                  <td className="border px-4 py-2">{task?.result || 'No Log Path'}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => deleteTask(taskId)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="border px-4 py-2" colSpan={5}>
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
