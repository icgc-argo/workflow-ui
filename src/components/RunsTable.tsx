import React from "react";
import { SelectTable, TableColumnConfig } from "@icgc-argo/uikit/Table";
import { Link } from "react-router-dom";
import { Run, RunListQueryResponse } from "../pages";

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
      accessor: "run_id",
      Cell: ({
        original
      }: {
        original: RunListQueryResponse["runList"]["runs"][0];
      }) => <Link to={`/runs/${original.run_id}`}>{original.run_id}</Link>
    },
    {
      Header: "start time",
      accessor: "log.start_time"
    },
    {
      Header: "end time",
      accessor: "log.end_time"
    },
    ...(noWorkflow
      ? []
      : [
          {
            Header: "Workflow",
            accessor: "request.workflow.name",
            Cell: ({
              original
            }: {
              original: RunListQueryResponse["runList"]["runs"][0];
            }) => (
              <div>
                {original.request ? (
                  <Link to={`/workflows/${original.request.workflow.id}`}>
                    {original.request.workflow.name}
                  </Link>
                ) : null}
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
      keyField={"run_id"}
      isSelected={runId => selectedRunIds.includes(runId)}
      toggleSelection={toggleSelection}
      toggleAll={toggleAll}
      selectAll={selectAll}
      columns={columns}
    />
  );
};
