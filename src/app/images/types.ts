export interface ContainerData {
  status: string;
  location: string;
  container_task_id: string;
  base_image: string;
}

export interface BuilderFormData {
  endpoint: string;
  partition: string;
  account: string;
  reservation?: string;
  containerName: string;
  location: string;
  baseImage: string;
  dependencies?: string;
  environment?: string;
  commands?: string;
}

interface ReviewItem {
  label: string;
  value: string;
  expandable?: string;
  content?: string;
}

export interface ReviewSection {
  title: string;
  icon: React.ReactNode;
  items: ReviewItem[];
}

export interface ContainersResponse {
  [containerName: string]: ContainerData;
}

export interface BuildLogResponse {
  log_content: string;
  status: string;
  log_task_id?: string;
}

export interface ImageBuilderPayload {
  endpoint: string;
  partition: string;
  name: string; // Container name
  location: string;
  base_image: string;
  dependencies: string;
  environment: string;
  commands: string;
  account: string;
  reservation: string;
}

export interface ImageBuilderResponse {
  task_id: string;
  container_name: string;
  message?: string;
}

export interface Endpoint {
  endpoint_name: string; // Endpoint display name
  endpoint_uuid: string; // Endpoint UUID identifier
  endpoint_host: string; // Endpoint host address
  endpoint_status: string; // Endpoint status (online/offline)
  diamond_dir: string; // Diamond working directory path
}
