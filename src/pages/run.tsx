import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-solarized_dark";
import Container from "@icgc-argo/uikit/Container";
import Notification from "@icgc-argo/uikit/notifications/Notification";
import Typography from "@icgc-argo/uikit/Typography";
import { css } from "emotion";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";
import Tabs, { Tab } from "@icgc-argo/uikit/Tabs";
import Icon from "@icgc-argo/uikit/Icon";
import groupBy from "lodash/groupBy";
import { RunLog, TaskLog, RunRequest } from "../gql/types";
import { useAppContext } from "../context/App";

type SingleRunQuery = {
  run: {
    run_id: string;
    log: RunLog;
    task_log: TaskLog[];
    request: RunRequest & {
      workflow: {
        id: string;
        name: string;
      };
    };
  };
};

export default ({ runId }: { runId: string }) => {
  const { DEV_disablePolling } = useAppContext();
  const { data, loading } = useQuery<SingleRunQuery, { runId: string }>(
    gql`
      query SINGLE_RUN_QUERY($runId: ID!) {
        run(id: $runId) {
          run_id
          log {
            end_time
            start_time
            exit_code
            name
            stderr
            stdout
          }
          task_log {
            task_id
            name
            process
            tag
            container
            attempt
            state
            cmd
            submit_time
            start_time
            end_time
            stderr
            stdout
            exit_code
            workdir
            cpus
            memory
            duration
            realtime
          }
          request {
            workflow {
              name
              id
            }
            workflow_url
            workflow_params
            workflow_engine_params
            workflow_type
            workflow_type_version
          }
        }
      }
    `,
    {
      variables: {
        runId
      },
      pollInterval: DEV_disablePolling ? 0 : 500
    }
  );

  const theme = useTheme();
  const [highlightColor, textColor] = data?.run.log.stderr
    ? [theme.colors.error_1, theme.colors.error]
    : [theme.colors.success, theme.colors.success_dark];
  const [activeTab, setActiveTab] = React.useState<"logs" | "params">("logs");

  return (
    <div
      className={css`
        padding: 20px;
      `}
    >
      {!loading && data && (
        <div>
          <Typography variant="title">
            Workflow Name: <strong>{data.run.request.workflow.name}</strong>
          </Typography>
          <Typography variant="subtitle">
            Run ID: <strong>{data.run.run_id}</strong>
          </Typography>
          <Typography variant="label" as="div">
            <strong>started:</strong> {data.run.log.start_time}
          </Typography>
          <Typography variant="label" as="div">
            <strong>completed:</strong> {data.run.log.end_time}
          </Typography>
          {data?.run.log.stderr && (
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
                <strong>Error Msg:</strong> {data.run.log.stderr}
              </Typography>
            </div>
          )}
        </div>
      )}
      {!!data && (
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
              onClick={e => setActiveTab("logs")}
            />
            <Tab
              label="Params"
              value="params"
              onClick={e => setActiveTab("params")}
            />
          </Tabs>
          <div
            className={css`
              padding: 10px;
            `}
          >
            {activeTab === "logs" && (
              <div>
                {Object.entries(groupBy(data.run.task_log, "task_id"))
                  .sort(
                    ([taskId], [otherTaskId]) =>
                      parseInt(taskId) - parseInt(otherTaskId)
                  )
                  .map(([task_id, tasks]) => {
                    const lastTask = tasks.reduce((acc, curr) => {
                      if (curr.state === "COMPLETE") {
                        acc = curr;
                        return acc;
                      } else if (
                        curr.state === "RUNNING" &&
                        acc.state !== "COMPLETE"
                      ) {
                        acc = curr;
                        return curr;
                      }

                      return acc;
                    });

                    return (
                      <div
                        className={css`
                          overflow: hidden;
                          margin: 10px;
                          background: ${highlightColor};
                          display: flex;
                          border: solid 1px ${highlightColor};
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
                              {Math.floor(lastTask.duration / 1000)} seconds
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
                            {lastTask.cmd.map(
                              cmd =>
                                `@ ${lastTask.start_time ||
                                  lastTask.submit_time} > ${cmd}\n`
                            )}
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
                      <span>Workflow URL: </span>
                      {data.run.request.workflow_url}
                    </div>
                    <div>
                      <span>Workflow Type: </span>
                      {data.run.request.workflow_type}
                    </div>
                    <div>
                      <span>Workflow Version: </span>
                      {data.run.request.workflow_type_version}
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
                      value={JSON.stringify(
                        data.run.request.workflow_params,
                        null,
                        "\t"
                      )}
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
                      value={JSON.stringify(
                        data.run.request.workflow_engine_params,
                        null,
                        "\t"
                      )}
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
