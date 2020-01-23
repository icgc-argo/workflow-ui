export type RunLog = {
  cmd: string[];
  end_time: string;
  exit_code: number;
  name: string;
  start_time: string;
  stderr: string;
  stdout: string;
  duration: number;
};

export type TaskLog = {
  task_id: number;
  name: string;
  process: string;
  tag: string;
  container: string;
  attempt: number;
  state: string;
  cmd: [string];
  submit_time: string;
  start_time: string;
  end_time: string;
  stderr: string;
  stdout: string;
  exit_code: number;
  workdir: string;
  cpus: number;
  memory: number;
  duration: number;
  realtime: number;
};

export type RunDetail = {
  outputs: {};
  request: RunRequest;
  run_id: string;
  run_log: RunLog;
  state: string;
  task_logs: TaskLog[];
};

export type RunRequest = {
  workflow_params: {[k: string]: any};
  workflow_engine_params: {[k: string]: any};
  workflow_type: string;
  workflow_type_version: string;
  workflow_url: string;
}

export type RunStatus = {
  run_id: string;
  state: string;
};

export type ServiceInfo = {
  auth_instructions_url: string;
  contact_info_url: string;
  supported_filesystem_protocols: string[];
  supported_wes_versions: string[];
  default_workflow_engine_parameters: {
    name: string;
    type: string;
  }[];
  system_state_counts: {
    [k: string]: number;
  };
  workflow_engine_versions: {
    [k: string]: string;
  };
  workflow_type_versions: {
    [k: string]: string;
  };
};

export type Workflow = {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
}
