'use client';

import { useEffect, useState } from 'react';

export function ContainerManagerForm( { isAuthenticated }: { isAuthenticated: boolean } ) {
  const [containersData, setContainersData] = useState<{ [key: string]: any }>({});;

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
        // If the delete request is successful, remove the container from the state
        setContainersData((prevContainersData) => {
          const newContainersData = { ...prevContainersData };
          delete newContainersData[containerId]; // Remove the deleted container
          return newContainersData;
        });
      } else {
        console.error('Failed to delete container');
      }
    } catch (error) {
      console.error('Error deleting container:', error);
    }
  };

  useEffect(() => {
    fetchContainerStatus();
    // const intervalId = setInterval(fetchContainerStatus, 5000);
    // return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  return (
    <div>
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Container Name</th>
            <th className="border px-4 py-2">Container Status</th>
            <th className="border px-4 py-2">Base Image</th>
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(containersData).length > 0 ? (
            Object.keys(containersData).map((containerName) => (
              <tr key={containerName}>
                <td className="border px-4 py-2">{containerName}</td>
                <td className="border px-4 py-2">{containersData[containerName]?.status || ''}</td>
                <td className="border px-4 py-2">{containersData[containerName]?.base_image || ''}</td>
                <td className="border px-4 py-2">{containersData[containerName]?.location || ''}</td>
                <td className="border px-4 py-2">{containersData[containerName]?.description || ''}</td>
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
              <td className="border px-4 py-2" colSpan={5}>No containers found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
