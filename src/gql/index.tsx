import { makeExecutableSchema } from "graphql-tools";
import urlJoin from "url-join";
import typeDefs from "./typedefs";
import { RunDetail, RunStatus, RunRequest, Workflow } from "./types";
import GraphQLJSON from "graphql-type-json";

const SEARCH_API =
  process.env.REACT_APP_SEARCH_API || `/api/v1`;

const MANAGEMENT_API =
  process.env.REACT_APP_MANAGEMENT_API || `/api/v1`;

const getSingleRun = async (runId: string): Promise<RunDetail> =>
  fetch(urlJoin(SEARCH_API, `runs/${runId}`)).then(res => res.json());

// TODO: Make this regex
const getWorkflowRepo = async (githubUrl: string): Promise<Workflow> =>
  fetch('http://api.github.com/repos/icgc-argo/nextflow-dna-seq-alignment').then(res => res.json());

const triggerWorkFlow = ({
  workflow_url,
  workflow_params
}: {
  workflow_url: string;
  workflow_params: string;
}): Promise<{ run_id: string }> =>
  fetch(urlJoin(MANAGEMENT_API, "/runs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workflow_url,
      workflow_params
    })
  }).then(res => res.json());

const listRuns = ({
  pageSize,
  pageToken
}: {
  pageSize: number;
  pageToken?: string;
}): Promise<{
  nextPageToken: string;
  runs: RunStatus[];
}> =>
  fetch(
    urlJoin(
      SEARCH_API,
      `runs?page_size=${pageSize}`,
      !!pageToken ? `&page_token=${pageToken}` : ""
    )
  ).then(res => res.json());

const resolvers = {
  JSON: GraphQLJSON,
  RunRequest: {
    workflow: async (obj: RunRequest) => {
      const repo = await getWorkflowRepo(obj.workflow_url);
      return {
        ...repo,
        id: repo.full_name
      };
    }
  },
  Run: {
    log: async (obj: RunStatus) => {
      const run = await getSingleRun(obj.run_id);
      return run.run_log;
    },
    request: async (obj: RunStatus) => {
      const run = await getSingleRun(obj.run_id);
      return run.request;
    },
    task_log: async (obj: RunStatus) => {
      const run = await getSingleRun(obj.run_id);
      return run.task_logs;
    },
    state: async (obj: RunStatus) => {
      return obj.state || (await getSingleRun(obj.run_id)).state;
    }
  },
  Query: {
    run: async (obj: any, args: { id: string }) => getSingleRun(args.id),
    listRuns: async (
      obj: any,
      args: { pageSize: number; pageToken: string }
    ): Promise<{
      nextPageToken: string;
      runs: RunStatus[];
    }> => {
      const { pageSize, pageToken } = args;
      return listRuns({ pageSize, pageToken });
    }
  },
  Mutation: {
    runWorkflow: async (
      obj: any,
      args: {
        workflow_url: string;
        workflow_params: string;
      }
    ): Promise<{ run_id: string }> =>
      triggerWorkFlow({
        workflow_url: args.workflow_url,
        workflow_params: args.workflow_params
      })
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
