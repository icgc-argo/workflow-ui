import React from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Container from "@icgc-argo/uikit/Container";
import { css } from "emotion";
import Typography from "@icgc-argo/uikit/Typography";
import RunsTable from "../components/RunsTable";
import { useAppContext } from "../context/App";
import Button from "@icgc-argo/uikit/Button";
import Modal from "@icgc-argo/uikit/Modal";
import DNALoader from "@icgc-argo/uikit/DnaLoader";
import { ModalPortal } from "../App";
import InputLabel from "@icgc-argo/uikit/form/InputLabel";
import Input from "@icgc-argo/uikit/form/Input";

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

  const [runWorkflow] = useMutation<
    any,
    { workflow_url: string; workflow_params: { [k: string]: any } }
  >(
    gql`
      mutation($workflow_url: String!, $workflow_params: JSON!) {
        runWorkflow(
          workflow_url: $workflow_url
          workflow_params: $workflow_params
        ) {
          run_id
          __typename
        }
      }
    `
  );

  const [newRunModalShown, setNewRunModalShown] = React.useState(false);

  const onNewRunClick: React.ComponentProps<typeof Button>["onClick"] = () => {
    setNewRunModalShown(true);
  };

  const [workflow_url, setWorkflowUrl] = React.useState("");
  const [workflow_params, setWorkflowParams] = React.useState({});

  const onNewRunConfirmed: React.ComponentProps<
    typeof Modal
  >["onActionClick"] = async () => {
    runWorkflow({
      variables: {
        workflow_url: workflow_url,
        workflow_params: workflow_params
      }
    });
    setLoading(true);
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
    setLoading(false);
    setNewRunModalShown(false);
  };

  const onNewRunCanceled: React.ComponentProps<
    typeof Modal
  >["onCancelClick"] = () => {
    setNewRunModalShown(false);
  };

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
        <Button onClick={onNewRunClick}>new run</Button>
        {newRunModalShown && (
          <ModalPortal>
            <Modal
              title="Some famcy form to input params"
              onCancelClick={onNewRunCanceled}
              onActionClick={onNewRunConfirmed}
            >
              <InputLabel>
                Workflow URL
                <Input
                  aria-label="workflow_url"
                  value={workflow_url}
                  onChange={e => setWorkflowUrl(e.target.value)}
                />
              </InputLabel>
              <InputLabel>
                Workflow Params
                <Input
                  aria-label="workflow_params"
                  value={JSON.stringify(workflow_params)}
                  onChange={e => setWorkflowParams(JSON.parse(e.target.value))}
                />
              </InputLabel>
            </Modal>
          </ModalPortal>
        )}
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
