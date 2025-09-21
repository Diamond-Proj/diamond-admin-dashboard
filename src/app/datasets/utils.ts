import { Dataset, DatasetMetadata, DisplayDataset } from './datasets.types';

export function transformDataset(dataset: Dataset): DisplayDataset {
  let metadata: DatasetMetadata = {};

  try {
    metadata = JSON.parse(dataset.dataset_metadata);
  } catch (error) {
    console.warn('Failed to parse dataset metadata:', error);
  }

  return {
    id: dataset.id,
    collection_uuid: dataset.collection_uuid,
    dataset_path: dataset.dataset_path,
    public: dataset.public,
    machine_name: dataset.machine_name,
    description: metadata.description || 'No description available',
    size: metadata.size || 'Unknown',
    format: metadata.format || 'Unknown'
  };
}

export const VALID_MACHINES = [
  'Delta@NCSA',
  'Frontera@NCSA',
  'Lonestar6@TACC',
  'Anvil@RCAC',
  'System@TACC',
  'System@NCSA'
];
