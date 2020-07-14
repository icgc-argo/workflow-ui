import React from "react";
import { css } from "emotion";
import { Link } from "react-router-dom";
import { DashboardTask } from "../gql/types";
import Typography from "@icgc-argo/uikit/Typography";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";

export default ({ taskData }: { taskData: DashboardTask[] }) => {
  const theme = useTheme();

  // TODO: this is because we don't have the same task appending like we do for
  // workflow entities, this will be fixed soon
  const tasks = taskData
    .filter((task) => task.run.state === "RUNNING")
    .sort((a, b) => (a.startTime < b.startTime ? 1 : -1));

  return (
    <>
      <Typography variant="sectionHeader" bold color="primary">
        RDPC Stats
      </Typography>
      <div
        className={css`
          margin-top: 12px;
          padding: 10px 0;
          border-top: 1px solid ${theme.colors.grey_2};
        `}
      >
        <div>
          <Typography variant="label" bold color="primary">
            Number of Tasks Running:
          </Typography>
          <span
            className={css`
              font-weight: bold;
              font-size: 16px;
              margin-left: 6px;
              color: ${theme.colors.secondary_dark};
            `}
          >
            {tasks.length}
          </span>
        </div>
        <div>
          <Typography variant="label" bold color="primary">
            Total CPU Cores Requested:
          </Typography>
          <span
            className={css`
              font-weight: bold;
              font-size: 16px;
              margin-left: 6px;
              color: ${theme.colors.secondary_dark};
            `}
          >
            {tasks.reduce((acc, curr) => (acc += curr.cpus), 0)}
          </span>
        </div>
      </div>
      <div
        className={css`
          display: flex;
          flex-direction: column;
          padding: 12px 0;
          border-top: 1px solid ${theme.colors.grey_2};
        `}
      >
        <Typography variant="sectionHeader" bold color="primary">
          Latest Tasks
        </Typography>
        {tasks.slice(0, 10).map((task: DashboardTask) => (
          <div
            className={css`
              font-size: 14px;
              padding: 6px;
              background: ${theme.colors.grey_4};
              margin: 8px 0;
              border-radius: 4px;

              div {
                color: ${theme.colors.black};

                span {
                  font-weight: 600;
                  color: ${theme.colors.primary};
                }
              }

              &:first-of-type {
                margin-top: 12px;
              }

              &:last-of-type {
                margin-bottom: 0;
              }
            `}
          >
            <div
              className={css`
                margin-bottom: 4px;
              `}
            >
              <span>Process:</span> {task.process}
            </div>
            <div>
              <span>RunId:</span>{" "}
              <Link to={`/runs/${task.runId}`}>{task.runId}</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
