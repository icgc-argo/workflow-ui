import React from "react";
import Button from "@icgc-argo/uikit/Button";
import { ModalPortal } from "../App";
import Modal from "@icgc-argo/uikit/Modal";
import InputLabel from "@icgc-argo/uikit/form/InputLabel";
import Input from "@icgc-argo/uikit/form/Input";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

export default ({
  setLoading
}: {
  setLoading: (isLoading: boolean) => void;
}) => {
  const [workflow_url, setWorkflowUrl] = React.useState("");
  const [workflow_params, setWorkflowParams] = React.useState({});
  const [newRunModalShown, setNewRunModalShown] = React.useState(false);

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

  const onNewRunClick: React.ComponentProps<typeof Button>["onClick"] = () => {
    setNewRunModalShown(true);
  };

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

  return (
    <>
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
    </>
  );
};
