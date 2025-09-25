'use client';

import { useState, useEffect, useMemo } from 'react';
import { Database } from 'lucide-react';
import { CreateDatasetModal } from './components/create-dataset-modal';
import { DatasetStats } from './components/dataset-stats';
import { DatasetControls } from './components/dataset-controls';
import { DatasetList } from './components/dataset-list';
import { DisplayDataset, Dataset } from './datasets.types';
import { transformDataset } from './utils';

// Mock data for testing
// const mockDatasets: DisplayDataset[] = [
//   {
//     id: 1,
//     collection_uuid: 'abc123-def456-ghi789-jkl012',
//     globus_path: '/data/climate/temperature_2024',
//     system_path: '/home/researcher/climate/temp_data',
//     public: true,
//     machine_name: 'Delta@NCSA',
//     description:
//       'Comprehensive climate data including temperature, precipitation, and atmospheric readings from global weather stations across North America',
//     size: '2.4 GB',
//     format: 'CSV, JSON'
//   },
//   {
//     id: 2,
//     collection_uuid: 'def456-ghi789-jkl012-mno345',
//     globus_path: '/private/sales/analytics_q3_2024',
//     system_path: '/scratch/business/sales_analytics',
//     public: false,
//     machine_name: 'Frontera@NCSA',
//     description:
//       'Private dataset containing quarterly sales data, customer segments, and revenue analytics for business intelligence',
//     size: '890 MB',
//     format: 'Excel, CSV'
//   },
//   {
//     id: 3,
//     collection_uuid: 'ghi789-jkl012-mno345-pqr678',
//     globus_path: '/public/code/opensource_metrics',
//     system_path: '/shared/code_analysis/metrics',
//     public: true,
//     machine_name: 'Lonestar6@TACC',
//     description:
//       'Analysis of code quality metrics, commit patterns, and contributor statistics from open source projects',
//     size: '1.8 GB',
//     format: 'JSON, Parquet'
//   },
//   {
//     id: 4,
//     collection_uuid: 'jkl012-mno345-pqr678-stu901',
//     globus_path: '/research/genomics/dna_sequences',
//     system_path: '/work/biodata/genomics',
//     public: false,
//     machine_name: 'Anvil@RCAC',
//     description:
//       'Genomic sequencing data for research purposes including DNA sequences and protein structures',
//     size: '5.2 GB',
//     format: 'FASTA, HDF5'
//   },
//   {
//     id: 5,
//     collection_uuid: 'mno345-pqr678-stu901-vwx234',
//     globus_path: '/public/demographics/census_2024',
//     system_path: '/data/census/2024_data',
//     public: true,
//     machine_name: 'System@TACC',
//     description:
//       'Public demographic data including population growth, age distribution, and urbanization trends',
//     size: '450 MB',
//     format: 'CSV, XML'
//   }
// ];

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<DisplayDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchDatasets = async () => {
    try {
      setLoading(true);

      // Simulate API call delay
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // setDatasets(mockDatasets);

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

      const data = await response.json();
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
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
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
    </div>
  );
}
