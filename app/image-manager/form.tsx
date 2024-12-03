'use client';

import { useEffect, useState } from 'react';

export function ContainerManagerForm({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [containersData, setContainersData] = useState<{ [key: string]: any }>({});

  // Fetch container statuses from the server
  const fetchContainerStatus = async () => {
    try {
      const response = await fetch('/api/get_containers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setContainersData(data);
    } catch (error) {
      console.error('Error fetching container status:', error);
    }
  };

  // Trigger container update logic on the server
  const updateContainerStatus = async () => {
    try {
      const response = await fetch('/api/update_containers_status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Container status update triggered successfully');
      } else {
        console.error('Failed to trigger container status update');
      }
    } catch (error) {
      console.error('Error triggering container status update:', error);
    }
  };

  // Delete a specific container and refresh container list
  const deleteContainer = async (containerId: string) => {
    try {
      const response = await fetch('/api/delete_container', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ containerId }),
      });

      if (response.ok) {
        // Remove the deleted container from state
        setContainersData((prevContainersData) => {
          const newContainersData = { ...prevContainersData };
          delete newContainersData[containerId]; // Remove the deleted container
          return newContainersData;
        });
        fetchContainerStatus(); // Refresh containers after deletion
      } else {
        console.error('Failed to delete container');
      }
    } catch (error) {
      console.error('Error deleting container:', error);
    }
  };

  useEffect(() => {
    // Fetch container status when the component mounts
    fetchContainerStatus();
    const fetchIntervalId = setInterval(fetchContainerStatus, 3000); // Refresh containers every 3 seconds

    // Trigger update container status periodically
    const updateIntervalId = setInterval(updateContainerStatus, 3000); // Trigger update every 15 seconds

    // Cleanup intervals on unmount
    return () => {
      clearInterval(fetchIntervalId);
      clearInterval(updateIntervalId);
    };
  }, [isAuthenticated]);

  return (
    <div>
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Container Name</th>
            <th className="border px-4 py-2">Container Status</th>
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(containersData).length > 0 ? (
            Object.keys(containersData).map((containerName) => (
              <tr key={containerName}>
                <td className="border px-4 py-2">{containerName}</td>
                <td className="border px-4 py-2">{containersData[containerName]?.status || 'Unknown'}</td>
                <td className="border px-4 py-2">{containersData[containerName]?.location || 'Unknown'}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => deleteContainer(containersData[containerName]?.container_task_id)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2" colSpan={4}>
                No containers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
