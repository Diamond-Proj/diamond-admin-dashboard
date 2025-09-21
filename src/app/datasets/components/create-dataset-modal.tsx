'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { VALID_MACHINES } from '../utils';

interface CreateDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetCreated: () => void;
}

interface DatasetFormData {
  collection_uuid: string;
  dataset_path: string;
  machine_name: string;
  description: string;
  size: string;
  format: string;
}

export function CreateDatasetModal({
  isOpen,
  onClose,
  onDatasetCreated
}: CreateDatasetModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DatasetFormData>({
    collection_uuid: '',
    dataset_path: '',
    machine_name: '',
    description: '',
    size: '',
    format: ''
  });

  const [errors, setErrors] = useState<Partial<DatasetFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<DatasetFormData> = {};

    if (!formData.collection_uuid.trim()) {
      newErrors.collection_uuid = 'Collection UUID is required';
    }
    if (!formData.dataset_path.trim()) {
      newErrors.dataset_path = 'Dataset path is required';
    }
    if (!formData.machine_name.trim()) {
      newErrors.machine_name = 'Machine name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const metadata = {
        description: formData.description.trim() || 'No description provided',
        size: formData.size.trim() || 'Unknown',
        format: formData.format.trim() || 'Unknown'
      };

      const payload = {
        collection_uuid: formData.collection_uuid.trim(),
        dataset_path: formData.dataset_path.trim(),
        machine_name: formData.machine_name,
        dataset_metadata: JSON.stringify(metadata)
      };

      const response = await fetch('/api/datasets', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create dataset');
      }

      const result = await response.json();

      onDatasetCreated();

      toast({
        title: 'Success',
        description: result.message || 'Dataset registered successfully!',
        className: 'bg-green-500 text-white'
      });

      setFormData({
        collection_uuid: '',
        dataset_path: '',
        machine_name: '',
        description: '',
        size: '',
        format: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating dataset:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create dataset. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DatasetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Register New Dataset
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Register a dataset with Diamond platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Required Information
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Collection UUID *
              </label>
              <Input
                value={formData.collection_uuid}
                onChange={(e) =>
                  handleInputChange('collection_uuid', e.target.value)
                }
                placeholder="e.g., abc123-def456-ghi789"
                className={errors.collection_uuid ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.collection_uuid && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.collection_uuid}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The Globus collection UUID where your data is stored
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dataset Path *
                </label>
                <Input
                  value={formData.dataset_path}
                  onChange={(e) =>
                    handleInputChange('dataset_path', e.target.value)
                  }
                  placeholder="e.g., /home/user/data"
                  className={errors.dataset_path ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.dataset_path && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dataset_path}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Machine Name *
                </label>
                <select
                  value={formData.machine_name}
                  onChange={(e) =>
                    handleInputChange('machine_name', e.target.value)
                  }
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100 ${
                    errors.machine_name
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Select a machine</option>
                  {VALID_MACHINES.map((machine) => (
                    <option key={machine} value={machine}>
                      {machine}
                    </option>
                  ))}
                </select>
                {errors.machine_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.machine_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Optional Metadata
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Provide a description of your dataset..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Size
                </label>
                <Input
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="e.g., 2.4 GB"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Format
                </label>
                <Input
                  value={formData.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  placeholder="e.g., CSV, JSON, HDF5"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer bg-purple-600 text-white hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Register Dataset
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
