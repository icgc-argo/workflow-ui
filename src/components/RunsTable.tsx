import React from "react";
import Table, { TableColumnConfig } from "@icgc-argo/uikit/Table";
import { Link } from "react-router-dom";
import { RunListQueryResponse, RunCompact } from "../gql/types";
import { parseEpochToEST } from "../utils";

export default ({
  runs,
  noWorkflow = false
}: {
  runs: RunCompact[];
  noWorkflow?: boolean;
}) => {
  const columns: TableColumnConfig<RunCompact> = [
    {
      Header: "State",
      accessor: "state",
      width: 80,
      resizable: false
    },
    {
      Header: "Run ID",
      accessor: "runId",
      Cell: ({
        original
      }: {
        original: RunListQueryResponse["runs"][0];
      }) => <Link to={`/runs/${original.runId}`}>{original.runId}</Link>
    },
    {
      Header: "Session ID",
      accessor: "sessionId"
    },
    {
      Header: "Start",
      accessor: "startTime",
      Cell: ({
        original
      }: {
        original: RunListQueryResponse["runs"][0];
      }) => parseEpochToEST(original.startTime)
    },
    {
      Header: "Complete",
      accessor: "completeTime",
      Cell: ({
        original
      }: {
        original: RunListQueryResponse["runs"][0];
      }) => parseEpochToEST(original.completeTime)
    },
    ...(noWorkflow
      ? []
      : [
          {
            Header: "Repository",
            accessor: "repository",
            Cell: ({
              original
            }: {
              original: RunListQueryResponse["runs"][0];
            }) => (
              <div>
                {original.repository}
              </div>
            )
          }
        ])
  ];
  return (
    <Table
      filterable
      parentRef={React.createRef()}
      data={runs}
      columns={columns}
    />
  );
};
