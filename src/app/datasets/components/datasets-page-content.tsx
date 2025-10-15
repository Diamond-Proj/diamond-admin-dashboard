'use client';

import { useState, useEffect, useMemo } from 'react';
import { Database } from 'lucide-react';
import { CreateDatasetModal } from './create-dataset-modal';
import { DatasetStats } from './dataset-stats';
import { DatasetControls } from './dataset-controls';
import { DatasetList } from './dataset-list';
import {
  DisplayDataset,
  Dataset,
  DatasetsApiResponse
} from '../datasets.types';
import { transformDataset } from '../utils';

export function DatasetsPageContent() {
  const [datasets, setDatasets] = useState<DisplayDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchDatasets = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/datasets', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch datasets:', await response.text());
        throw new Error('Failed to fetch datasets');
      }

      const data: DatasetsApiResponse = await response.json();
      const transformedDatasets = data.datasets.map((dataset: Dataset) =>
        transformDataset(dataset)
      );

      setDatasets(transformedDatasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleDatasetCreated = () => {
    fetchDatasets();
    setShowCreateModal(false);
  };

  const filteredDatasets = useMemo(() => {
    return datasets.filter((dataset) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'public' && dataset.public) ||
        (filter === 'private' && !dataset.public);

      const matchesSearch =
        dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.globus_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.system_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.machine_name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [datasets, filter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Datasets
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and explore your Diamond data collections
        </p>
      </div>

      {/* Stats Summary */}
      <DatasetStats datasets={datasets} loading={loading} />

      {/* Controls */}
      <DatasetControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        onCreateDataset={() => setShowCreateModal(true)}
      />

      {/* Datasets List */}
      <DatasetList datasets={filteredDatasets} loading={loading} />

      {/* Create Dataset Modal */}
      <CreateDatasetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onDatasetCreated={handleDatasetCreated}
      />
    </div>
  );
}
