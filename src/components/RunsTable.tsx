import React from "react";
import { SelectTable, TableColumnConfig } from "@icgc-argo/uikit/Table";
import { Link } from "react-router-dom";
import { Run, RunsQueryResponse } from "../pages";

export default ({
  runs,
  selectedRunIds,
  toggleSelection,
  toggleAll,
  selectAll,
  noWorkflow = false
}: {
  runs: Run[];
  selectedRunIds: string[];
  toggleSelection: React.ComponentProps<typeof SelectTable>["toggleSelection"];
  toggleAll: React.ComponentProps<typeof SelectTable>["toggleAll"];
  selectAll: React.ComponentProps<typeof SelectTable>["selectAll"];
  noWorkflow?: boolean;
}) => {
  const columns: TableColumnConfig<Run> = [
    {
      Header: "State",
      accessor: "state",
      width: 80,
      resizable: false
    },
    {
      Header: "id",
      accessor: "runId",
      Cell: ({
        original
      }: {
        original: RunsQueryResponse["runs"][0];
      }) => <Link to={`/runs/${original.runId}`}>{original.runId}</Link>
    },
    {
      Header: "session id",
      accessor: "sessionId"
    },
    {
      Header: "start time",
      accessor: "startTime"
    },
    {
      Header: "end time",
      accessor: "completeTime"
    },
    ...(noWorkflow
      ? []
      : [
          {
            Header: "Workflow",
            accessor: "repository",
            Cell: ({
              original
            }: {
              original: RunsQueryResponse["runs"][0];
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
