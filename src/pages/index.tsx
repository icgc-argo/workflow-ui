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

import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Container from "@icgc-argo/uikit/Container";
import { css } from "emotion";
import Typography from "@icgc-argo/uikit/Typography";
import RunsTable from "../components/RunsTable";
import { useAppContext } from "../context/App";
import DNALoader from "@icgc-argo/uikit/DnaLoader";
import { ModalPortal } from "../App";
import NewRunFormModal from "../components/NewRunFormModal";
import { DashboardQueryResponse } from "../gql/types";
import RDPCStats from "../components/RDPCStats";

export default () => {
  /**
   * modal stuff
   */
  const { DEV_disablePolling } = useAppContext();

  const { loading: dataLoading, error, data } = useQuery<DashboardQueryResponse>(
    gql`
      query($pageFrom: Int!, $pageSize: Int!) {
        runs(page: { from: $pageFrom, size: $pageSize }) {
          runId
          sessionId
          state
          startTime
          completeTime
          repository
          engineParameters {
            revision
          }
        }
        tasks(filter: {state: "RUNNING"}, page: {from: 0, size: 500}) {
          process
          runId
          cpus
          state
          startTime
        }
      }
    `,
    {
      variables: {
        pageFrom: 0,
        pageSize: 100,
      },
      pollInterval: DEV_disablePolling ? 0 : 1000,
    }
  );

  const [loading, setLoading] = React.useState(false);

  return (
    <div
      className={css`
        padding: 20px;
      `}
    >
      {(dataLoading || loading) && (
        <ModalPortal>
          <DNALoader />
        </ModalPortal>
      )}
      {error && <div>Houston, we have a problem!</div>}
      <div
        className={css`
          margin: 10px 0px;
        `}
      >
        <NewRunFormModal setLoading={setLoading} />
      </div>
      <div
        className={css`
          display: flex;
        `}
      >
        <Container
          className={css`
            padding: 10px;
            padding-bottom: 0px;
            flex: 3 1 0;
            margin-right: 12px;
          `}
        >
          <div
            className={css`
              padding-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            `}
          >
            <Typography variant="sectionHeader" bold color="primary">
              Workflow runs
            </Typography>
          </div>
          <RunsTable runs={data?.runs || []} setLoading={setLoading} />
        </Container>
        <Container
          className={css`
            padding: 10px;
            padding-bottom: 0px;
            flex: 1 3 0;
          `}
        >
          <RDPCStats runData={data?.runs || []} taskData={data?.tasks || []} />
        </Container>
      </div>
    </div>
  );
};
