import React from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import RunsTable from "../components/RunsTable";
import Container from "@icgc-argo/uikit/Container";
import { css } from "emotion";
import Typography from "@icgc-argo/uikit/Typography";
import Button from "@icgc-argo/uikit/Button";
import Modal from "@icgc-argo/uikit/Modal";
import DNALoader from "@icgc-argo/uikit/DnaLoader";
import Input from "@icgc-argo/uikit/form/Input";
import InputLabel from "@icgc-argo/uikit/form/InputLabel";
import { ModalPortal } from "../App";

type WorkflowQueryResponse = {
  workflow: {
    id: string;
    url: string;
    runs: {
      runs: {
        run_id: string;
        state: string;
        log: {
          start_time: string;
          end_time: string;
        };
        request: {
          workflow: {
            id: string;
            version: string;
            name: string;
          };
        };
      }[];
    };
  };
};
export default ({ workflowId }: { workflowId: string }) => {
  const { data } = useQuery<WorkflowQueryResponse>(
    gql`
      query WORKFLOW_QUERY($workflowId: ID!) {
        workflow(id: $workflowId) {
          id
          url
          runs {
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
                  version
                  name
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        workflowId
      },
      pollInterval: 500
    }
  );

  /**
   * table states
   */
  const [selectedRunIds, setSelectedRunIds] = React.useState<string[]>([]);
  const selectAll = React.useMemo(() => {
    const output =
      !!data &&
      data.workflow.runs.runs
        .map(r => r.run_id)
        .every(id => selectedRunIds.includes(id));
    return output;
  }, [selectedRunIds]);
  const toggleAll = () => {
    if (!!data) {
      if (selectAll) {
        setSelectedRunIds([]);
      } else {
        setSelectedRunIds(data.workflow.runs.runs.map(r => r.run_id));
      }
    }
  };
  const toggleSelection = (selectionString: string) => {
    const runId = selectionString.split("select-").join("");
    selectedRunIds.includes(runId)
      ? setSelectedRunIds(selectedRunIds.filter(id => id !== runId))
      : setSelectedRunIds([...selectedRunIds, runId]);
  };

  /**
   * modal stuff
   */
  const [loading, setLoading] = React.useState(false);
  const [runWorkflow] = useMutation(
    gql`
      mutation($workflow_url: String!) {
        runWorkflow(workflow_url: $workflow_url) {
          run_id
        }
      }
    `,
    {
      variables: {
        workflow_url: data ? data.workflow.url : ""
      }
    }
  );
  const [newRunModalShown, setNewRunModalShown] = React.useState(false);
  const onNewRunClick: React.ComponentProps<typeof Button>["onClick"] = () => {
    setNewRunModalShown(true);
  };
  const onNewRunConfirmed: React.ComponentProps<
    typeof Modal
  >["onActionClick"] = async () => {
    runWorkflow();
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

  return (
    <div
      className={css`
        padding: 20px;
      `}
    >
      {data && (
        <div>
          <Typography variant="subtitle">
            Workflow ID: <strong>{data.workflow.id}</strong>
            {loading && (
              <ModalPortal>
                <DNALoader />
              </ModalPortal>
            )}
          </Typography>
          <Typography variant="label">
            url: <a href={data.workflow.url}>{data.workflow.url}</a>
          </Typography>
        </div>
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
                Input Analysis ID
                <Input aria-label="test" />
              </InputLabel>
              <InputLabel>
                Some other params?
                <Input aria-label="test" />
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
          runs={data ? data.workflow.runs.runs : []}
          toggleSelection={toggleSelection}
          toggleAll={toggleAll}
          selectAll={selectAll}
          selectedRunIds={selectedRunIds}
          noWorkflow
        />
      </Container>
    </div>
  );
};
