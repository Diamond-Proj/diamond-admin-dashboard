export type ArtifactType = 'container' | 'dataset' | 'model' | 'generic';

export interface Artifact {
  id: string;
  machine_name: string;
  identity_id: string;
  public: boolean;
  collection_uuid: string;
  globus_path: string;
  system_path: string;
  artifact_name: string | null;
  artifact_type: ArtifactType;
  artifact_metadata: string | null;
  description: string | null;
  creation_date: string | null;
  base_image?: string | null;
  container_type?: 'apptainer' | 'docker' | null;
  param_size?: string | null;
  architecture?: string | null;
  has_dataset_details?: boolean;
}

export interface ArtifactFormData {
  artifact_name: string;
  artifact_type: ArtifactType;
  machine_name: string;
  collection_uuid: string;
  globus_path: string;
  system_path: string;
  description: string;
  artifact_metadata: string;
  public: boolean;
  container_base_image: string;
  container_type: '' | 'apptainer' | 'docker';
  model_param_size: string;
  model_architecture: string;
}

export interface ArtifactsApiResponse {
  artifacts: Artifact[];
}
