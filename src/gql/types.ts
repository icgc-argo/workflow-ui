type RunsQuery<RT = Run> = {
  runs: RT[];
};

export type RunListQueryResponse = RunsQuery<RunCompact>;
export type RunQueryResponse = RunsQuery<Run>;

export type RunCompact = {
  runId: string;
  sessionId: string;
  state: string;
  startTime: string;
  completeTime: string;
  repository: string;
  engineParameters: {
    revision: string;
  };
};

export type Run = {
  runId: string;
  sessionId: string;
  commandLine: string[];
  completeTime: string;
  duration: number;
  engineParameters: EngineParameters;
  errorReport: string;
  exitStatus: number;
  parameters: { [k: string]: any };
  repository: string;
  startTime: string;
  state: string;
  success: boolean;
  tasks: Task[];
};

export type Task = {
  taskId: number;
  runId: string;
  attempt: number;
  completeTime: string;
  container: string;
  cpus: number;
  duration: number;
  exit: number;
  memory: number;
  name: string;
  process: string;
  realtime: number;
  script: string;
  startTime: string;
  state: string;
  submitTime: string;
  tag: string;
};

export type EngineParameters = {
  launchDir: string;
  projectDir: string;
  resume: string;
  revision: string;
  workDir: string;
};
