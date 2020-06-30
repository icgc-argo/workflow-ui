import React from "react";
import { SelectTable, TableColumnConfig } from "@icgc-argo/uikit/Table";
import { Link } from "react-router-dom";
import { RunListQueryResponse, RunCompact } from "../gql/types";
import { parseEpochToEST } from "../utils";

export default ({
  runs,
  selectedRunIds,
  toggleSelection,
  toggleAll,
  selectAll,
  noWorkflow = false
}: {
  runs: RunCompact[];
  selectedRunIds: string[];
  toggleSelection: React.ComponentProps<typeof SelectTable>["toggleSelection"];
  toggleAll: React.ComponentProps<typeof SelectTable>["toggleAll"];
  selectAll: React.ComponentProps<typeof SelectTable>["selectAll"];
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
    <SelectTable
      filterable
      parentRef={React.createRef()}
      data={runs}
      keyField={"runId"}
      isSelected={runId => selectedRunIds.includes(runId)}
      toggleSelection={toggleSelection}
      toggleAll={toggleAll}
      selectAll={selectAll}
      columns={columns}
    />
  );
};
