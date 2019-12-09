import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Container from "@icgc-argo/uikit/Container";
import Typography from "@icgc-argo/uikit/Typography";
import Button from "@icgc-argo/uikit/Button";
import { css } from "emotion";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";
import Tabs, { Tab } from "@icgc-argo/uikit/Tabs";
import Icon from "@icgc-argo/uikit/Icon";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import last from "lodash/last";

type SingleRunQuery = {
  run: {
    run_id: string;
    log: {
      cmd: string;
      end_time: string;
      start_time: string;
      exit_code: string;
      name: string;
      sttderr: string;
      stdout: string;
    };
    task_log: {
      cmd: string[];
      name: string;
      start_time: string;
    }[];
    request: {
      workflow: {
        id: string;
        name: string;
      };
    };
  };
};

export default ({ runId }: { runId: string }) => {
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
            sttderr
            stdout
          }
          task_log {
            cmd
            start_time
            name
            sttderr
            stdout
          }
          request {
            workflow {
              name
              id
            }
          }
        }
      }
    `,
    {
      variables: {
        runId
      },
      pollInterval: 5000
    }
  );
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState<"logs" | "params">("logs");

  return (
    <div
      className={css`
        padding: 20px;
      `}
    >
      {!loading && data && (
        <div>
          <Typography variant="subtitle">
            Run ID: <strong>{data.run.run_id}</strong>
          </Typography>
          <Typography variant="label" as="div">
            <strong>started:</strong> {data.run.log.start_time}
          </Typography>
          <Typography variant="label" as="div">
            <strong>completed:</strong> {data.run.log.end_time}
          </Typography>
          <Typography variant="label" as="div">
            <strong>workflow:</strong>{" "}
            <Link to={`/workflows/${data.run.request.workflow.id}`}>
              {data.run.request.workflow.name}
            </Link>
          </Typography>
        </div>
      )}

      {/* <div
        className={css`
          padding: 5px 0px;
          display: flex;
          justify-content: flex-end;
        `}
      >
        <Button variant="text" size={"md"}>
          rerun
        </Button>
      </div> */}
      {!!data && (
        <Container loading={loading}>
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
                {Object.entries(groupBy(data.run.task_log, "name")).map(
                  ([taskName, tasks]) => {
                    const lastTask = last(
                      orderBy(tasks, task => new Date(task.start_time))
                    );
                    return (
                      <div
                        className={css`
                          overflow: hidden;
                          margin: 10px;
                          background: ${theme.colors.success};
                          display: flex;
                          border: solid 1px ${theme.colors.success};
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
                            color="success_dark"
                            bold
                            variant="label"
                            className={css`
                              padding: 2px;
                              padding-left: 5px;
                              display: flex;
                              align-items: center;
                            `}
                          >
                            {taskName}
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
                            {lastTask &&
                              lastTask.cmd.map(
                                cmd => `@ ${lastTask.start_time} > ${cmd}\n`
                              )}
                          </pre>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
            {activeTab === "params" && <div>nothing to see!</div>}
          </div>
        </Container>
      )}
    </div>
  );
};
