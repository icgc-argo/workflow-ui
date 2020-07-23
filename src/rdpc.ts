import urlJoin from "url-join";
import ApolloClient, { gql } from "apollo-boost";

const MANAGEMENT_API = process.env.REACT_APP_MANAGEMENT_API || "";

const client = new ApolloClient({
  uri: process.env.REACT_APP_RDPC_GATEWAY,
});

export const runWorkflow = ({
  workflow_url,
  workflow_params,
  workflow_engine_params,
}: {
  workflow_url: string;
  workflow_params: string;
  workflow_engine_params: string;
}): Promise<{ run_id: string }> =>
  fetch(urlJoin(MANAGEMENT_API, "/runs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workflow_url,
      workflow_params,
      workflow_engine_params,
    }),
  }).then(async (res) => res.json());

export const cancelWorkflow = (runId: String): Promise<{ run_id: string }> =>
  fetch(urlJoin(MANAGEMENT_API, `/runs/${runId}/cancel`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then(async (res) => {
    // Cancelling takes a little bit of time so we want to
    // query until we get the cancelled state back and
    // then finally return the runId that was cancelled
    // (TODO: implement "CANCELLING" state in WF management)
    const query = gql`
      query($runId: String!) {
        runs(filter: { runId: $runId }) {
          state
        }
      }
    `;

    while (true) {
      const response = await client.query({
        query,
        variables: { runId },
        fetchPolicy: "no-cache",
      });

      if (response.data.runs[0]?.state === "EXECUTOR_ERROR") {
        break;
      } else {
        await sleep(1000);
      }
    }

    return res.json();
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
