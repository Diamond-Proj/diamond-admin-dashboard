'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold">Datasets</h1>
          <p className="text-muted-foreground text-lg">
            Manage and explore your Diamond data collections
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="group flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-700 hover:to-purple-800 hover:shadow-md focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          Create Dataset
        </button>
      </div>

      {/* Stats Summary */}
      <DatasetStats datasets={datasets} loading={loading} />

      {/* Controls */}
      <DatasetControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
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
