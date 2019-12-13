import gql from "gql-tag";

export default gql`
  scalar JSON
  type ServiceInfo {
    auth_instructions_url: String
    contact_info_url: String
    supported_filesystem_protocols: [String]
    supported_wes_versions: [String]
  }
  type RunLog {
    cmd: [String]
    end_time: String
    start_time: String
    exit_code: Int
    name: String
    sttderr: String
    stdout: String
  }
  type TaskLog {
    task_id: Int
    name: String
    process: String
    tag: String
    container: String
    attempt: Int
    state: String
    cmd: [String]
    submit_time: String
    start_time: String
    end_time: String
    sttderr: String
    stdout: String
    exit_code: Int
    workdir: String
    cpus: Int
    memory: Int
    duration: Int
    realtime: Int
  }
  type RunRequest {
    workflow_params: JSON
    workflow_type: String
    workflow_type_version: String
    workflow_url: String
    workflow: Workflow
  }
  type Run {
    run_id: ID!
    state: String
    log: RunLog
    request: RunRequest
    task_log: [TaskLog]
  }
  type RunsPage {
    runs: [Run]
    nextPageToken: String
  }
  type Workflow {
    id: ID!
    name: String
    description: String
    html_url: String
  }
  type Donor {
    id: ID!
    name: String
    files: [File]
  }
  type File {
    id: ID!
  }
  interface Error {
    id: ID!
    message: String
  }
  type InfraError implements Error {
    id: ID!
    message: String
  }
  type WorkflowError implements Error {
    id: ID!
    message: String
    workflow: Workflow
  }
  type DataError implements Error {
    id: ID!
    message: String
  }

  type Query {
    listRuns(pageSize: Int = 10, pageToken: String): RunsPage
    run(id: ID!): Run
    serviceInfo: ServiceInfo
  }
  type Mutation {
    runWorkflow(
      workflow_url: String!
      workflow_params: JSON!
    ): Run
  }
`;
