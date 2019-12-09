import gql from "gql-tag";

export default gql`
  scalar JSON
  type ServiceInfo {
    auth_instructions_url: String
    contact_info_url: String
    supported_filesystem_protocols: [String]
    supported_wes_versions: [String]
  }
  type Log {
    cmd: [String]
    end_time: String
    start_time: String
    exit_code: Int
    name: String
    sttderr: String
    stdout: String
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
    log: Log
    request: RunRequest
    task_log: [Log]
  }
  type RunsPage {
    runs: [Run]
    nextPageToken: String
  }
  type AnalysisType {
    id: ID!
    name: String!
  }
  type Analysis {
    id: ID!
    analysisType: AnalysisType
    workflow: Workflow
    runs(pageSize: Int = 10, pageToken: String): RunsPage
    donors: [Donor]
  }
  type Workflow {
    id: ID!
    name: String
    version: String
    url: String
    runs: RunsPage
    output_analyses: [Analysis]
    input_analysis_types: [AnalysisType]
    output_analysis_type: AnalysisType
  }
  type Donor {
    id: ID!
    name: String
    files: [File]
  }
  type File {
    id: ID!
  }
  type Query {
    listRuns(pageSize: Int = 10, pageToken: String): RunsPage
    run(id: ID!): Run
    serviceInfo: ServiceInfo
    workflows: [Workflow]
    workflow(id: ID!): Workflow
  }

  type Mutation {
    runWorkflow(workflow_url: String!): Run
  }
`;
