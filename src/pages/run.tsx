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
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-solarized_dark";
import Container from "@icgc-argo/uikit/Container";
// import Banner from "@icgc-argo/uikit/notifications/Banner";
import Typography from "@icgc-argo/uikit/Typography";
import { css } from "emotion";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";
import Tabs, { Tab } from "@icgc-argo/uikit/Tabs";
import Icon from "@icgc-argo/uikit/Icon";
import groupBy from "lodash/groupBy";
import { RunQueryResponse } from "gql/types";
import { useAppContext } from "context/App";
import { parseEpochToEST } from "utils/time";
import { sortTasks } from "utils/task";
import { CancelRunButton } from "components/CancelRun";
import { ModalPortal } from "App";
import DNALoader from "@icgc-argo/uikit/DnaLoader";

export default ({ runId }: { runId: string }) => {
  const { DEV_disablePolling } = useAppContext();

  const { data, loading: dataLoading, error } = useQuery<
    RunQueryResponse,
    { runId: string }
  >(
    gql`
      query SINGLE_RUN_QUERY($runId: String!) {
        runs(filter: { runId: $runId }) {
          runId
          sessionId
          commandLine
          completeTime
          duration
          engineParameters {
            launchDir
            projectDir
            resume
            revision
            workDir
          }
          errorReport
          exitStatus
          parameters
          repository
          startTime
          state
          success
          tasks {
            taskId
            runId
            attempt
            completeTime
            container
            cpus
            duration
            exit
            memory
            name
            process
            realtime
            script
            startTime
            state
            submitTime
            tag
          }
        }
      }
    `,
    {
      variables: {
        runId,
      },
      pollInterval: DEV_disablePolling ? 0 : 1000,
    }
  );

  const [loading, setLoading] = React.useState(false);

  const run = data?.runs[0];

  const theme = useTheme();
  const [highlightColor, textColor] = run?.errorReport
    ? [theme.colors.error_1, theme.colors.error]
    : [theme.colors.success, theme.colors.success_dark];
  const [activeTab, setActiveTab] = React.useState<"logs" | "params">("logs");

  const fmtTime = (ms: number): string =>
    `${(ms / 1000 / 3600).toFixed(2)} hours (${Math.floor(ms / 1000)} seconds)`;

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
      {!dataLoading && run && (
        <div
          className={css`
            margin: 0 0 12px;

            > div {
              margin: 0 0 12px;
            }
          `}
        >
          <div>
            <Typography variant="title">
              Workflow Repo: <strong>{run.repository}</strong>
            </Typography>
            <Typography variant="subtitle">
              Run ID: <strong>{run.runId}</strong>
            </Typography>
            <Typography variant="subtitle">
              Session ID: <strong>{run.sessionId}</strong>
            </Typography>
            <Typography variant="label" as="div">
              <strong>started:</strong> {parseEpochToEST(run.startTime)}
            </Typography>
            <Typography variant="label" as="div">
              <strong>completed:</strong> {parseEpochToEST(run.completeTime)}
            </Typography>
            <Typography variant="label" as="div">
              <strong>duration:</strong> {fmtTime(run.duration)}
            </Typography>
            <CancelRunButton
              variant="primary"
              size="md"
              run={{ runId: run.runId, state: run.state }}
              setLoading={setLoading}
              className={css`
                margin: 16px 0;
              `}
            />
          </div>
          {run?.errorReport && (
            <div
              className={css`
                padding: 12px;
                background: ${theme.colors.error_3};
                border-radius: 8px;
                border: 1px solid ${theme.colors.error};
                margin: 10px 0;
              `}
            >
              <Typography variant="label" as="div">
                <strong>Error Msg:</strong> {run.errorReport}
              </Typography>
            </div>
          )}
        </div>
      )}
      {!!run && (
        <Container
          loading={dataLoading}
          className={css`
            z-index: 0; /* Ace Editor > Modal overlap fix */
            button,
            button.active {
              color: ${textColor};
              border-color: ${highlightColor};
            }
          `}
        >
          <Tabs value={activeTab}>
            <Tab
              label="Task Logs"
              value="logs"
              onClick={(e) => setActiveTab("logs")}
            />
            <Tab
              label="Params"
              value="params"
              onClick={(e) => setActiveTab("params")}
            />
          </Tabs>
          <div
            className={css`
              padding: 10px;
            `}
          >
            {activeTab === "logs" && (
              <div>
                {Object.entries(groupBy(run.tasks, "taskId"))
                  .sort(
                    ([taskId], [otherTaskId]) =>
                      parseInt(taskId) - parseInt(otherTaskId)
                  )
                  .reverse()
                  .map(([taskId, tasks]) => {
                    const lastTask = sortTasks(tasks)[0];

                    const [taskHighlightColor, taskTextColor] =
                      lastTask.state === "EXECUTOR_ERROR"
                        ? [theme.colors.error_1, theme.colors.error]
                        : lastTask.state === "COMPLETE"
                        ? [theme.colors.success, theme.colors.success_dark]
                        : [theme.colors.primary_4, theme.colors.primary];

                    return (
                      <div
                        className={css`
                          overflow: hidden;
                          margin: 10px;
                          background: ${taskHighlightColor};
                          display: flex;
                          border: solid 1px ${taskHighlightColor};
                        `}
                      >
                        <div
                          className={css`
                            display: flex;
                            align-items: center;
                          `}
                        >
                          <Icon name="checkmark" fill="white" height="12px" />
                        </div>
                        <div
                          className={css`
                            flex: 1;
                            background: white;
                          `}
                        >
                          <Typography
                            color={taskTextColor}
                            bold
                            variant="label"
                            className={css`
                              padding: 2px;
                              padding-left: 5px;
                              display: flex;
                              flex-direction: column;
                              align-items: flex-start;

                              span {
                                color: black;
                              }
                            `}
                          >
                            <div>
                              <span>Name: </span>
                              {lastTask.name}
                            </div>
                            <div>
                              <span>State: </span>
                              {lastTask.state}
                            </div>
                            <div>
                              <span>Container: </span>
                              {lastTask.container}
                            </div>
                            <div>
                              <span>Process: </span>
                              {lastTask.process}
                            </div>
                            <div>
                              <span>Tag: </span>
                              {lastTask.tag}
                            </div>
                            <div>
                              <span>Duration: </span>
                              {fmtTime(lastTask.duration)}
                            </div>
                            <div>
                              <span>Realtime: </span>
                              {fmtTime(lastTask.realtime)}
                            </div>
                          </Typography>
                          <pre
                            className={css`
                              margin: 0px;
                              padding: 3px;
                              resize: vertical;
                              overflow: auto;
                              background: ${theme.colors.primary};
                              color: ${theme.colors.white};
                            `}
                          >
                            {lastTask.script}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            {activeTab === "params" && (
              <div
                className={css`
                  overflow: hidden;
                  margin: 10px;
                  background: ${highlightColor};
                  display: flex;
                  flex-direction: column;
                  border: solid 1px ${highlightColor};
                `}
              >
                <div
                  className={css`
                    flex: 1;
                    background: white;
                  `}
                >
                  <Typography
                    color={textColor}
                    bold
                    variant="label"
                    className={css`
                      padding: 2px;
                      padding-left: 5px;
                      display: flex;
                      flex-direction: column;
                      align-items: flex-start;

                      span {
                        color: black;
                      }
                    `}
                  >
                    <div>
                      <span>Workflow Repository: </span>
                      {run.repository}
                    </div>
                    <div>
                      <span>Workflow Version: </span>
                      {run.engineParameters.revision}
                    </div>
                  </Typography>
                </div>
                <div
                  className={css`
                    display: flex;
                    flex-direction: row;
                  `}
                >
                  <div
                    className={css`
                      width: 50%;
                    `}
                  >
                    <Typography
                      color="black"
                      bold
                      variant="label"
                      className={css`
                        padding: 2px;
                        padding-left: 5px;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        border-right: 3px solid ${theme.colors.accent1_dark};
                      `}
                    >
                      Workflow Params
                    </Typography>
                    <AceEditor
                      aria-label="workflow_params"
                      name="workflow_params"
                      mode="json"
                      theme="solarized_dark"
                      value={JSON.stringify(run.parameters, null, "\t")}
                      readOnly
                      width="100%"
                    />
                  </div>
                  <div
                    className={css`
                      width: 50%;
                    `}
                  >
                    <Typography
                      color="black"
                      bold
                      variant="label"
                      className={css`
                        padding: 2px;
                        padding-left: 5px;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                      `}
                    >
                      Workflow Engine Params
                    </Typography>
                    <AceEditor
                      aria-label="workflow_engine_params"
                      name="workflow_engine_params"
                      mode="json"
                      theme="solarized_dark"
                      value={JSON.stringify(run.engineParameters, null, "\t")}
                      readOnly
                      width="100%"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      )}
    </div>
  );
};
