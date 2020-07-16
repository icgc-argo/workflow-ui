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
import { css } from "emotion";
import { Link } from "react-router-dom";
import { DashboardTask, RunCompact } from "../gql/types";
import Typography from "@icgc-argo/uikit/Typography";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";

export default ({
  runData,
  taskData,
}: {
  runData: RunCompact[];
  taskData: DashboardTask[];
}) => {
  const theme = useTheme();

  const sortByDate = (
    a: RunCompact | DashboardTask,
    b: RunCompact | DashboardTask
  ) => (a.startTime < b.startTime ? 1 : -1);

  const runs = runData
    .filter((run) => run.state === "RUNNING")
    .sort(sortByDate);

  const activeRunIds = runs.map((run) => run.runId);

  // TODO: the filter is required because we don't have the
  // same task appending like we do for workflow entities,
  // this will be fixed soon ...
  const tasks = taskData
    .filter((task) => activeRunIds.includes(task.runId))
    .sort(sortByDate);


  const totalCPUs = 1535; // TODO either get this from somewhere or move to env
  const cpusInUse = tasks.reduce((acc, curr) => (acc += curr.cpus), 0);
  const cpusInUseAsPerc = parseFloat(
    ((cpusInUse / totalCPUs) * 100).toFixed(2)
  );

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
            Workflows Running:
          </Typography>
          <span
            className={css`
              font-weight: bold;
              font-size: 16px;
              margin-left: 6px;
              color: ${theme.colors.secondary_dark};
            `}
          >
            {runs.length}
          </span>
        </div>
        <div>
          <Typography variant="label" bold color="primary">
            Tasks Running:
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
              color: ${cpusInUseAsPerc >= 100
                ? theme.colors.error
                : cpusInUseAsPerc >= 80
                ? theme.colors.warning
                : theme.colors.secondary_dark};
            `}
          >
            {cpusInUse}/{totalCPUs} CPUs ({cpusInUseAsPerc}%)
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
        {tasks.length === 0 && (
          <div
            className={css`
              font-size: 14px;
              margin: 8px 0;
            `}
          >
            No running tasks!
          </div>
        )}
        {tasks.slice(0, 10).map((task: DashboardTask) => (
          <div
            className={css`
              font-size: 14px;
              padding: 6px;
              background: ${theme.colors.grey_4};
              margin: 7px 0;
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
                display: flex;
                flex-direction: row;

                > div:first-of-type {
                  margin-right: 16px;
                }
              `}
            >
              <div>
                <span>Process:</span> {task.process}
              </div>
              <div>
                <span>CPUs Requested:</span> {task.cpus}
              </div>
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
