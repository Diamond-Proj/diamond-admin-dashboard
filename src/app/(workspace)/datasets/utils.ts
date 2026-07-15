import { Dataset, DatasetMetadata, DisplayDataset } from './datasets.types';

function isDatasetMetadata(value: unknown): value is DatasetMetadata {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseDatasetMetadata(
  datasetMetadata: Dataset['dataset_metadata']
): DatasetMetadata {
  if (!datasetMetadata) {
    return {};
  }

  if (typeof datasetMetadata === 'string') {
    try {
      const parsedMetadata: unknown = JSON.parse(datasetMetadata);
      return isDatasetMetadata(parsedMetadata) ? parsedMetadata : {};
    } catch (error) {
      console.warn('Failed to parse dataset metadata:', error);
      return {};
    }
  }

  return isDatasetMetadata(datasetMetadata) ? datasetMetadata : {};
}

function getDatasetDeduplicationKey(dataset: Dataset): string {
  const metadata = parseDatasetMetadata(dataset.dataset_metadata);

  return JSON.stringify({
    id: dataset.id,
    collection_uuid: dataset.collection_uuid,
    globus_path: dataset.globus_path,
    system_path: dataset.system_path,
    public: dataset.public,
    machine_name: dataset.machine_name,
    dataset_name: dataset.dataset_name,
    metadata: {
      description: metadata.description || '',
      size: metadata.size || '',
      format: metadata.format || ''
    }
  });
}

export function deduplicateDatasets(datasets: Dataset[]): Dataset[] {
  const seen = new Set<string>();

  return datasets.filter((dataset) => {
    const key = getDatasetDeduplicationKey(dataset);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function transformDataset(dataset: Dataset): DisplayDataset {
  const metadata = parseDatasetMetadata(dataset.dataset_metadata);

  return {
    id: dataset.id,
    collection_uuid: dataset.collection_uuid,
    globus_path: dataset.globus_path,
    system_path: dataset.system_path,
    public: dataset.public,
    machine_name: dataset.machine_name,
    dataset_name: dataset.dataset_name || `Dataset ${dataset.id}`,
    description: metadata.description || 'No description available',
    size: metadata.size || 'Unknown',
    format: metadata.format || 'Unknown'
  };
}

export const VALID_MACHINES = [
  'Delta@NCSA',
  'Frontera@TACC',
  'Lonestar6@TACC',
  'Anvil@RCAC',
  'System@TACC',
  'System@NCSA'
] as const;
