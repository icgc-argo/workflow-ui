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
import ApolloClient from 'apollo-client';
import gql from "graphql-tag";
import { MANAGEMENT_API } from 'config/globals';

export const cancelWorkflow = ({ client, runId, token }: {client: ApolloClient<any>, runId: String, token: string}): Promise<{ run_id: string }> =>
  fetch(urlJoin(MANAGEMENT_API, `/runs/${runId}/cancel`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
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
