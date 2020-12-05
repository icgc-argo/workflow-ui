/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of the GNU Affero General Public License v3.0.
 * You should have received a copy of the GNU Affero General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from "react";
import Button from "@icgc-argo/uikit/Button";
import { ModalPortal } from "App";
import Modal from "@icgc-argo/uikit/Modal";
import InputLabel from "@icgc-argo/uikit/form/InputLabel";
import Input from "@icgc-argo/uikit/form/Input";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import { css } from "emotion";
import { ApolloError } from "apollo-client";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";
import { useAuth } from "providers/Auth";
import useStartRunMutation from './../hooks/useStartRunMutation';
import { GraphQLError, RunsResponse } from './../gql/types';

export default ({
  setLoading,
}: {
  setLoading: (isLoading: boolean) => void;
}) => {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const startRun = useStartRunMutation();

  const [workflow_url, setWorkflowUrl] = React.useState("");
  const [workflow_params, setWorkflowParams] = React.useState("");
  const [workflow_engine_params, setWorkflowEngineParams] = React.useState("");
  
  const [newRunModalShown, setNewRunModalShown] = React.useState(false);
  const [runResponse, setRunResponse] = React.useState<RunsResponse | undefined | null>(null);
  const [runError, setRunError] = React.useState<ApolloError | GraphQLError[] | undefined | null>(null);

  const onNewRunClick: React.ComponentProps<typeof Button>["onClick"] = () => {
    setNewRunModalShown(true);
  };

  const onRunAcknowledge: React.ComponentProps<
    typeof Button
  >["onClick"] = () => {
    setRunResponse(null);
    setRunError(null);
  };

  const onNewRunConfirmed: React.ComponentProps<
    typeof Modal
  >["onActionClick"] = async () => {
    setLoading(true);
    try {
      const { data, errors } = await startRun({
        workflowUrl: workflow_url,
        workflowParams:
          workflow_params.length > 0 ? JSON.parse(workflow_params.trim()) : undefined,
        workflowEngineParams:
          workflow_engine_params.length > 0
            ? JSON.parse(workflow_engine_params.trim())
            : undefined,
      });
      setLoading(false);
      setNewRunModalShown(false);
      if (errors && errors.length > 0) {
        setRunError(errors);
      } else {
        setRunResponse(data);
      }
    } catch (error) {
      setLoading(false);
      setNewRunModalShown(false);
      setRunError(error);
    }
  };

  const onNewRunCanceled: React.ComponentProps<
    typeof Modal
  >["onCancelClick"] = () => {
    setNewRunModalShown(false);
  };

  return (
    <>
      <Button disabled={!isAdmin()} onClick={onNewRunClick}>new run</Button>
      {runResponse && (
        <ModalPortal>
          <Modal
            title="Workflow Run Initiated"
            actionVisible={false}
            onCancelClick={onRunAcknowledge}
            cancelText="Ok"
          >
            {runResponse && runResponse.startRun && runResponse.startRun.runId && (
              <p>
                A run with ID: <strong>{runResponse.startRun.runId}</strong> has been
                initiated, it will appear in the list momentarily.
              </p>
            )}
            {runError && (
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
                  {runError instanceof ApolloError && (
                    <p>
                      <strong>Msg:</strong> {runError.message}
                    </p>
                  )}
                  {runError instanceof Array && (
                    <ul>
                      {runError.map((error, i) => (
                        <li key={`run-error-${i}`}>{error.message}</li>
                      ))}
                    </ul>
                  )}
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
              onChange={(e) => setWorkflowUrl(e.target.value)}
            />
            <InputLabel>
              Workflow Params (equivalent to -params-file)
            </InputLabel>
            <AceEditor
              aria-label="workflow_params"
              name="workflow_params"
              mode="json"
              theme="github"
              height="200px"
              value={workflow_params}
              onChange={setWorkflowParams}
            />
            <InputLabel>
              Workflow Engine Params (revision, resume, etc)
            </InputLabel>
            <AceEditor
              aria-label="workflow_engine_params"
              name="workflow_engine_params"
              mode="json"
              theme="github"
              height="200px"
              value={workflow_engine_params}
              onChange={setWorkflowEngineParams}
            />
          </Modal>
        </ModalPortal>
      )}
    </>
  );
};
