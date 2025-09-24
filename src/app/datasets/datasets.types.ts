export interface Dataset {
  id: number;
  collection_uuid: string;
  globus_path: string;
  system_path: string;
  public: boolean;
  machine_name: string;
  dataset_metadata: string;
}

export interface DatasetMetadata {
  description?: string;
  size?: string;
  format?: string;
}

export interface DisplayDataset {
  id: number;
  collection_uuid: string;
  globus_path: string;
  system_path: string;
  public: boolean;
  machine_name: string;
  description: string;
  size: string;
  format: string;
}
