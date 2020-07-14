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
          run {
            state
          }
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
          <RunsTable runs={data?.runs || []} />
        </Container>
        <Container
          className={css`
            padding: 10px;
            padding-bottom: 0px;
            flex: 1 3 0;
          `}
        >
          <RDPCStats taskData={data?.tasks || []} />
        </Container>
      </div>
    </div>
  );
};
