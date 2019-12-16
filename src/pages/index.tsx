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

export type Run = {
  run_id: string;
  state: string;
  log?: {
    start_time: string;
    end_time: string;
  };
  request?: {
    workflow: {
      id: string;
      name: string;
      version: string;
    };
  };
};

export type RunListQueryResponse = {
  runList: {
    runs: Run[];
  };
};

export default () => {
  /**
   * modal stuff
   */
  const [loading, setLoading] = React.useState(false);

  const { doesPoll } = useAppContext();

  const { data } = useQuery<RunListQueryResponse>(
    gql`
      {
        runList: listRuns(pageSize: 2) {
          runs {
            run_id
            state
            log {
              start_time
              end_time
            }
            request {
              workflow {
                id
                name
              }
            }
          }
        }
      }
    `,
    { pollInterval: doesPoll ? 1000 : 0 }
  );

  const [selectedRunIds, setSelectedRunIds] = React.useState<string[]>([]);

  const selectAll = React.useMemo(() => {
    const output =
      !!data &&
      data.runList.runs
        .map(r => r.run_id)
        .every(id => selectedRunIds.includes(id));
    return output;
  }, [selectedRunIds, data]);

  const toggleAll = () => {
    if (!!data) {
      if (selectAll) {
        setSelectedRunIds([]);
      } else {
        setSelectedRunIds(data.runList.runs.map(r => r.run_id));
      }
    }
  };

  const toggleSelection = (selectionString: string) => {
    const runId = selectionString.split("select-").join("");
    selectedRunIds.includes(runId)
      ? setSelectedRunIds(selectedRunIds.filter(id => id !== runId))
      : setSelectedRunIds([...selectedRunIds, runId]);
  };

  return (
    <div
      className={css`
        padding: 20px;
      `}
    >
      {loading && (
        <ModalPortal>
          <DNALoader />
        </ModalPortal>
      )}
      <div
        className={css`
          margin: 10px 0px;
        `}
      >
        <NewRunFormModal setLoading={setLoading}/>
      </div>
      <Container
        className={css`
          padding: 10px;
          padding-bottom: 0px;
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
          {/* <Button size="sm" disabled={!selectedRunIds.length}>
            rerun
          </Button> */}
        </div>
        <RunsTable
          runs={data ? data.runList.runs : []}
          toggleSelection={toggleSelection}
          toggleAll={toggleAll}
          selectAll={selectAll}
          selectedRunIds={selectedRunIds}
        />
      </Container>
    </div>
  );
};
