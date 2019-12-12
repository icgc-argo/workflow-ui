import { makeExecutableSchema } from "graphql-tools";
import urlJoin from "url-join";
import typeDefs from "./typedefs";
import { RunDetail, RunStatus } from "./types";
import GraphQLJSON from "graphql-type-json";

const SEARCH_API =
  process.env.REACT_APP_SEARCH_API || `/api/v1`;
const MANAGEMENT_API =
  process.env.REACT_APP_MANAGEMENT_API || `/api/v1`;
const WORKFLOWS = [
  {
    id: "nextflow-dna-seq-alignment",
    version: "1.0.0",
    name: "DNA Sequence Alignment",
    url: "https://github.com/icgc-argo/nextflow-dna-seq-alignment.git",
    workflow_url: "icgc-argo/nextflow-dna-seq-alignment"
  }
];

const getSingleRun = async (runId: string): Promise<RunDetail> =>
  fetch(urlJoin(SEARCH_API, `runs/${runId}`)).then(res => res.json());

const triggerWorkFlow = ({
  workflow_url,
  analysis_id,
  api_token
}: {
  workflow_url: string;
  analysis_id: string;
  api_token: string;
}): Promise<{ run_id: string }> =>
  fetch(urlJoin(MANAGEMENT_API, "/runs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workflow_url,
      workflow_params: {
        study_id: "TEST-PRO",
        analysis_id: analysis_id,
        song_url: "https://song.qa.argo.cancercollaboratory.org",
        score_url: "https://score.qa.argo.cancercollaboratory.org",
        api_token: api_token,
        reference_dir:
          "/mnt/volume/nextflow/reference/tiny-grch38-chr11-530001-537000",
        a2_template_path:
          "/mnt/volume/nextflow/analysis_templates/a2_template.json",
        aligned_lane_prefix: "grch38-aligned",
        aligned_basename: "HCC1143.3.20190726.wgs.grch38",
        align: {
          cpus: 2,
          memory: 4000
        },
        download: {},
        preprocess: {},
        merge: {},
        a2_gen_params: {},
        upload: {}
      }
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
        api_token: string;
        analysis_id: string;
      }
    ): Promise<{ run_id: string }> =>
      triggerWorkFlow({
        workflow_url: args.workflow_url,
        api_token: args.api_token,
        analysis_id: args.analysis_id
      })
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
