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
import { RunQueryResponse } from "../gql/types";
import { useAppContext } from "../context/App";

export default ({ runId }: { runId: string }) => {
  const { DEV_disablePolling } = useAppContext();
  const { data, loading } = useQuery<RunQueryResponse, { runId: string }>(
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
      pollInterval: DEV_disablePolling ? 0 : 500,
    }
  );

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
      {!loading && run && (
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
              <strong>started:</strong> {run.startTime}
            </Typography>
            <Typography variant="label" as="div">
              <strong>completed:</strong> {run.completeTime}
            </Typography>
            <Typography variant="label" as="div">
              <strong>duration:</strong> {fmtTime(run.duration)}
            </Typography>
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
          loading={loading}
          className={css`
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
                    const lastTask = tasks.reduce((acc, curr) => {
                      if (curr.state === "EXECUTOR_ERROR") {
                        acc = curr;
                        return acc;
                      } else if (
                        curr.state === "COMPLETE" &&
                        acc.state !== "EXECUTOR_ERROR"
                      ) {
                        acc = curr;
                        return acc;
                      } else if (
                        curr.state === "RUNNING" &&
                        acc.state !== "EXECUTOR_ERROR" &&
                        acc.state !== "COMPLETE"
                      ) {
                        acc = curr;
                        return curr;
                      }

                      return acc;
                    });

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
