type Log = {
  cmd: string[];
  end_time: string;
  exit_code: number;
  name: string;
  start_time: string;
  stderr: string;
  stdout: string;
};
export type RunDetail = {
  outputs: {};
  request?: {
    workflow_params: {};
    workflow_type: string;
    workflow_type_version: string;
    workflow_url: string;
  };
  run_id: string;
  run_log: Log;
  state: string;
  task_logs: Log[];
};

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
