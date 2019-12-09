import { makeExecutableSchema } from "graphql-tools";
import urlJoin from "url-join";
import typeDefs from "./typedefs";
import { RunDetail, RunStatus } from "./types";
import GraphQLJSON from "graphql-type-json";

const SEARCH_API =
  process.env.REACT_APP_SEARCH_API || `http://localhost:7000/search`;
const MANAGEMENT_API =
  process.env.REACT_APP_MANAGEMENT_API || `http://localhost:7000/relay`;
const WORKFLOWS = [
  {
    id: "nextflow-hello",
    version: "1.0.0",
    name: "hello world",
    url: "https://github.com/nextflow-io/hello.git"
  },
  {
    id: "nextflow-hello",
    version: "1.0.1",
    name: "hello world",
    url: "https://github.com/nextflow-io/hello.git"
  },
  {
    id: "minh-hello",
    version: "1.0.0",
    name: "tutorial",
    url: "https://github.com/hlminh2000/hello.git"
  }
];

const getSingleRun = async (runId: string): Promise<RunDetail> =>
  fetch(urlJoin(SEARCH_API, `runs/${runId}`)).then(res => res.json());

const triggerWorkFlow = ({
  workflow_url = "https://github.com/nextflow-io/hello.git"
}): Promise<{ run_id: string }> =>
  fetch(urlJoin(MANAGEMENT_API, "/runs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflow_url })
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
    workflow: (obj: { workflow_url: string }) =>
      WORKFLOWS.find(w => w.url === obj.workflow_url)
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
  Workflow: {
    runs: async (obj: { url: string }) => {
      const runPage = await listRuns({ pageSize: 1000 });
      return {
        ...runPage,
        runs: Promise.all(runPage.runs.map(r => getSingleRun(r.run_id))).then(
          runs =>
            runs.filter(run => {
              const workflow_url = run.request
                ? run.request.workflow_url
                : null;
              return workflow_url === obj.url;
            })
        )
      };
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
    },
    workflows: () => WORKFLOWS,
    workflow: (obj: any, args: { id: string }) =>
      WORKFLOWS.find(({ id }) => id === args.id)
  },
  Mutation: {
    runWorkflow: async (
      obj: any,
      args: {
        workflow_url: string;
      }
    ): Promise<{ run_id: string }> =>
      triggerWorkFlow({
        workflow_url: args.workflow_url
      })
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
