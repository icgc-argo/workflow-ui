/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of the GNU Affero General Public License v3.0.
 * You should have received a copy of the GNU Affero General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import urlJoin from "url-join";
import ApolloClient, { gql } from "apollo-boost";
import { MANAGEMENT_API, RDPC_GATEWAY } from 'config/globals';

const client = new ApolloClient({
  uri: RDPC_GATEWAY,
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
