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

import moment from "moment-timezone";
import { Task } from "./gql/types";

moment.updateLocale("en", {
  invalidDate: "N/A",
});

export const parseEpochToEST = (milli: string) =>
  moment(parseInt(milli))
    .tz("America/Toronto")
    .format("MMMM Do YYYY, h:mm:ss a");

export const sortTasks = (tasks: Task[], reverse = false) => {
  const stateOrder = [
    "UNKNOWN",
    "QUEUED",
    "RUNNING",
    "COMPLETE",
    "EXECUTOR_ERROR",
  ];

  const sortedTasks = tasks.sort((a, b) => {
    const ai = stateOrder.indexOf(a.state);
    const bi = stateOrder.indexOf(b.state);

    return ai > bi ? -1 : ai < bi ? 1 : 0;
  });

  return reverse ? sortedTasks.reverse() : sortedTasks;
};
