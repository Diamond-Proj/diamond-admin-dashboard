'use client';

import { useEffect, useState } from 'react';

export function TaskManagerForm() {
  const [tasksData, setTasksData] = useState<Record<string, any>>({});

  const fetchTaskStatus = async () => {
    try {
      const response = await fetch('/api/get_task_status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setTasksData(data);
    } catch (error) {
      console.error('Error fetching task status:', error);
    }
  };

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
        // Remove the task from the state after successful deletion
        setTasksData((prevTasksData) => {
          const newTasksData = { ...prevTasksData };
          delete newTasksData[taskId];
          return newTasksData;
        });
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    fetchTaskStatus();
    const intervalId = setInterval(fetchTaskStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Task ID</th>
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
                  <td className="border px-4 py-2">{taskId}</td>
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
              <td className="border px-4 py-2" colSpan={5}>No tasks found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
