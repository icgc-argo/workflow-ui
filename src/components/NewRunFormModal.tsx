import React from "react";
import Button from "@icgc-argo/uikit/Button";
import { ModalPortal } from "../App";
import Modal from "@icgc-argo/uikit/Modal";
import InputLabel from "@icgc-argo/uikit/form/InputLabel";
import Input from "@icgc-argo/uikit/form/Input";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import { css } from "emotion";
import { ApolloError } from "apollo-client";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";

type RunResponse = {
  runWorkflow: {
    run_id: string;
  };
};

export default ({
  setLoading
}: {
  setLoading: (isLoading: boolean) => void;
}) => {
  const [workflow_url, setWorkflowUrl] = React.useState("");
  const [workflow_params, setWorkflowParams] = React.useState("");
  const [newRunModalShown, setNewRunModalShown] = React.useState(false);
  const [runResponse, setRunResponse] = React.useState<
    RunResponse | ApolloError | undefined | null
  >(null);
  const theme = useTheme();

  const [runWorkflow] = useMutation<
    RunResponse,
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

  const onNewRunClick: React.ComponentProps<typeof Button>["onClick"] = () => {
    setNewRunModalShown(true);
  };

  const onRunAcknowledge: React.ComponentProps<
    typeof Button
  >["onClick"] = () => {
    setRunResponse(null);
  };

  const onNewRunConfirmed: React.ComponentProps<
    typeof Modal
  >["onActionClick"] = async () => {
    setLoading(true);
    try {
      const run = await runWorkflow({
        variables: {
          workflow_url: workflow_url,
          workflow_params:
            workflow_params.length > 0 ? JSON.parse(workflow_params.trim()) : {}
        }
      });
      setLoading(false);
      setNewRunModalShown(false);
      setRunResponse(run.data);
    } catch (error) {
      setLoading(false);
      setNewRunModalShown(false);
      setRunResponse(error);
    }
  };

  const onNewRunCanceled: React.ComponentProps<
    typeof Modal
  >["onCancelClick"] = () => {
    setNewRunModalShown(false);
  };

  return (
    <>
      <Button onClick={onNewRunClick}>new run</Button>
      {runResponse && (
        <ModalPortal>
          <Modal
            title="Workflow Run Initiated"
            actionDisabled
            onCancelClick={onRunAcknowledge}
            cancelText="Ok"
          >
            {"runWorkflow" in runResponse && (
              <p>
                A run with ID: <strong>{runResponse.runWorkflow.run_id}</strong>{" "}
                has been initiated, it will appear in the list momentarily.
              </p>
            )}
            {"graphQLErrors" in runResponse && (
              <>
                <p>
                  The following error was encountered trying to run your
                  workflow:
                </p>
                <div
                  className={css`
                    background: ${theme.colors.error_2};
                    border: 2px solid ${theme.colors.error_1};
                    border-radius: 3px;
                    padding: 0 10px;
                  `}
                >
                  {runResponse.graphQLErrors.map(e => (
                    <p>
                      <strong>Error:</strong> {e.message}
                    </p>
                  ))}
                </div>
              </>
            )}
          </Modal>
        </ModalPortal>
      )}
      {newRunModalShown && (
        <ModalPortal>
          <Modal
            title="Execute a Nextflow Workflow"
            onCancelClick={onNewRunCanceled}
            onActionClick={onNewRunConfirmed}
          >
            <p>
              This will kick off any nextflow workflow publicly available on
              Github. We currently do not support file-uploads as part of the
              workflow execution step, therefore any files required by the
              workflow being run must be downloaded/uploaded as part of the
              workflow.
            </p>
            <InputLabel>Workflow URL</InputLabel>
            <Input
              aria-label="workflow_url"
              value={workflow_url}
              onChange={e => setWorkflowUrl(e.target.value)}
            />
            <InputLabel>Workflow Params</InputLabel>
            <AceEditor
              aria-label="workflow_params"
              name="workflow_params"
              mode="json"
              theme="github"
              value={workflow_params}
              onChange={setWorkflowParams}
            />
          </Modal>
        </ModalPortal>
      )}
    </>
  );
};
