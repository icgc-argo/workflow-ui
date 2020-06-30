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
import { RunListQueryResponse } from "../gql/types";

export default () => {
  /**
   * modal stuff
   */
  const { DEV_disablePolling } = useAppContext();

  const { loading: dataLoading, error, data } = useQuery<RunListQueryResponse>(
    gql`
      query ($pageFrom: Int!, $pageSize: Int!) {
        runs(page: {from: $pageFrom, size: $pageSize}) {
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
      }
    `,
    { 
      variables: {
        pageFrom: 0,
        pageSize: 100
      },
      pollInterval: DEV_disablePolling ? 0 : 1000 }
  );

  const [loading, setLoading] = React.useState(false);

  const [selectedRunIds, setSelectedRunIds] = React.useState<string[]>([]);

  const selectAll = React.useMemo(() => {
    const output =
      !!data &&
      (data?.runs || [])
        .map((r) => r.runId)
        .every((id) => selectedRunIds.includes(id));
    return output;
  }, [selectedRunIds, data]);

  const toggleAll = () => {
    if (!!data) {
      if (selectAll) {
        setSelectedRunIds([]);
      } else {
        setSelectedRunIds(data.runs.map((r) => r.runId));
      }
    }
  };

  const toggleSelection = (selectionString: string) => {
    const runId = selectionString.split("select-").join("");
    selectedRunIds.includes(runId)
      ? setSelectedRunIds(selectedRunIds.filter((id) => id !== runId))
      : setSelectedRunIds([...selectedRunIds, runId]);
  };

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
      {error && (
        <div>Houston, we have a problem!</div>
      )}
      <div
        className={css`
          margin: 10px 0px;
        `}
      >
        <NewRunFormModal setLoading={setLoading} />
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
        </div>
        <RunsTable
          runs={data?.runs || []}
          toggleSelection={toggleSelection}
          toggleAll={toggleAll}
          selectAll={selectAll}
          selectedRunIds={selectedRunIds}
        />
      </Container>
    </div>
  );
};
