export interface TaskSubmissionData {
  endpoint: string;
  taskName: string;
  partition: string;
  account: string;
  reservation?: string;
  container: string;
  task?: string;
  num_of_nodes?: number;
  time_duration: string;
  dataset_id?: string;
}

export interface Task {
  task_id: string;
  identity_id: string;
  task_name: string;
  status: 'COMPLETED' | 'PENDING' | 'RUNNING' | 'FAILED';
  details: {
    endpoint_id: string;
    endpoint_name?: string;
    task_create_time: string;
  };
  result: string | null;
  error: string | null;
}

export interface TasksApiResponse {
  [taskId: string]: Task;
}

export interface Endpoint {
  endpoint_name: string;
  endpoint_uuid: string;
  endpoint_host: string;
  endpoint_status: string;
  diamond_dir: string;
}

export interface Container {
  container_task_id: string;
  status: string;
  base_image: string;
  location: string;
}

export interface ContainersResponse {
  [containerName: string]: Container;
}

export interface Dataset {
  id: number;
  collection_uuid: string;
  globus_path: string;
  system_path: string;
  public: boolean;
  machine_name: string;
  dataset_name: string;
  dataset_metadata: string;
}

export interface DatasetsApiResponse {
  datasets: Dataset[];
}
