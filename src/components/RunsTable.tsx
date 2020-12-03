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
import Table, { TableColumnConfig } from "@icgc-argo/uikit/Table";
import { Link } from "react-router-dom";
import { DashboardQueryResponse, RunCompact } from "gql/types";
import { parseEpochToEST } from "utils/time";
import { CancelConfirmModal, CancelResponseModal, CancelResponse } from "components/CancelRun";
import Modal from "@icgc-argo/uikit/Modal";
import ApolloClient, { ApolloError } from "apollo-client";
import Button from "@icgc-argo/uikit/Button";
import { cancelWorkflow } from "rdpc";
import { useAuth } from "providers/Auth";

export default ({
  client,
  runs,
  setLoading,
}: {
  client: ApolloClient<any>,
  runs: RunCompact[];
  setLoading: (isLoading: boolean) => void;
}) => {
  const [cancelModalRunId, setCancelModalRunId] = React.useState<string>("");
  const [cancelResponse, setCancelResponse] = React.useState<
    CancelResponse | ApolloError | undefined | null
  >(null);
  const { isAdmin, token } = useAuth();

  const onCancelClick = (runId: string) => {
    setCancelModalRunId(runId);
  };

  const onCancelConfirmed = async (runId: string) => {
    setLoading(true);
    try {
      const cancelledRun = await cancelWorkflow({ client, runId, token });
      setLoading(false);
      setCancelModalRunId("");
      setCancelResponse(cancelledRun);
    } catch (error) {
      setLoading(false);
      setCancelModalRunId("");
      setCancelResponse(error);
    }
  };

  const onCancelCancelled: React.ComponentProps<
    typeof Modal
  >["onCancelClick"] = () => {
    setCancelModalRunId("");
  };

  const onCancelAcknowledge: React.ComponentProps<
    typeof Button
  >["onClick"] = () => {
    setCancelResponse(null);
  };

  const columns: TableColumnConfig<RunCompact> = [
    {
      Header: "State",
      accessor: "state",
      width: 80,
      resizable: false,
    },
    {
      Header: "Run ID",
      accessor: "runId",
      Cell: ({ original }: { original: DashboardQueryResponse["runs"][0] }) => (
        <Link to={`/runs/${original.runId}`}>{original.runId}</Link>
      ),
    },
    {
      Header: "Session ID",
      accessor: "sessionId",
    },
    {
      Header: "Start",
      accessor: "startTime",
      Cell: ({ original }: { original: DashboardQueryResponse["runs"][0] }) =>
        parseEpochToEST(original.startTime),
    },
    {
      Header: "Complete",
      accessor: "completeTime",
      Cell: ({ original }: { original: DashboardQueryResponse["runs"][0] }) =>
        parseEpochToEST(original.completeTime),
    },
    {
      Header: "Repository",
      accessor: "repository",
      Cell: ({ original }: { original: DashboardQueryResponse["runs"][0] }) => (
        <div>{original.repository}</div>
      ),
    },
    {
      Header: "Action",
      Cell: ({ original }: { original: DashboardQueryResponse["runs"][0] }) => (
        <Button
          onClick={() => onCancelClick(original.runId)}
          variant="text"
          size="sm"
          disabled={!isAdmin() || original.state !== "RUNNING"}
        >
          Cancel
        </Button>
      ),
    },
  ];

  return (
    <>
      {cancelModalRunId && (
        <CancelConfirmModal
          runId={cancelModalRunId}
          onCancelCancelled={onCancelCancelled}
          onCancelConfirmed={() => onCancelConfirmed(cancelModalRunId)}
        />
      )}
      {cancelResponse && (
        <CancelResponseModal
          cancelResponse={cancelResponse}
          onCancelAcknowledge={onCancelAcknowledge}
        />
      )}
      <Table
        filterable
        parentRef={React.createRef()}
        data={runs}
        columns={columns}
        defaultPageSize={25}
      />
    </>
  );
};
