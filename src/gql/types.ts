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

type RunsQuery<RT = Run> = {
  runs: RT[];
};

type AnalysesQuery<AT = Analysis> = {
  analyses: AT[];
};

type RunsTaskQuery<RT = Run, TT = Task> = {
  runs: RT[];
  tasks: TT[];
};

export type DashboardQueryResponse = RunsTaskQuery<RunCompact, DashboardTask>;
export type RunQueryResponse = RunsQuery<Run>;
export type GraphRunsQueryResponse = RunsQuery<GraphRun>;
export type GraphAnalysesQueryResponse = AnalysesQuery<GraphAnalysis>;

export type RunCompact = {
  runId: string;
  sessionId: string;
  state: string;
  startTime: string;
  completeTime: string;
  repository: string;
  engineParameters: {
    revision: string;
  };
};

export type Run = {
  runId: string;
  sessionId: string;
  commandLine: string[];
  completeTime: string;
  duration: number;
  engineParameters: EngineParameters;
  errorReport: string;
  exitStatus: number;
  parameters: { [k: string]: any };
  repository: string;
  startTime: string;
  state: string;
  success: boolean;
  tasks: Task[];
};

export type DashboardTask = {
  runId: string;
  process: string;
  cpus: number;
  state: string;
  startTime: string;
};

export type Task = {
  taskId: number;
  runId: string;
  attempt: number;
  completeTime: string;
  container: string;
  cpus: number;
  duration: number;
  exit: number;
  memory: number;
  name: string;
  process: string;
  realtime: number;
  script: string;
  startTime: string;
  state: string;
  submitTime: string;
  tag: string;
};

export type EngineParameters = {
  launchDir: string;
  projectDir: string;
  resume: string;
  revision: string;
  workDir: string;
};

export type Analysis = {
  analysisId: string;
  analysisType: string;
  analysisState: string;
  analysisVersion: Number;
  donors: Donor[];
  experiment: JSON;
  files: AnalysisFile[];
  studyId: string;
  workflow: Workflow;
  inputForRuns: [Run];
};

export type GraphRun = {
  runId: string;
  repository: string;
  state: string;
  inputAnalyses: AnalysisCompact[];
  producedAnalyses: (AnalysisCompact & { inputForRuns: GraphRun[] })[]; // recursive types ;)
};

export type GraphAnalysis = {
  analysisId: string;
  analysisType: string;
  studyId: string;
  donors: DonorCompact[];
  inputForRuns: {
    runId: string;
    repository: string;
    state: string;
    producedAnalyses: (AnalysisCompact & InputForRunsLoop)[];
  }[];
};

type InputForRunsLoop = {
  runId: string;
  repository: string;
  state: string;
  producedAnalyses: AnalysisCompact[];
  inputForRuns: InputForRunsLoop[];
};

type AnalysisCompact = {
  analysisId: string;
  analysisType: string;
  files: AnalysisFileCompact[];
};

type DonorCompact = {
  donorId: string;
  specimens: SpecimenCompact[];
};

type Donor = {
  donorId: string;
  gender: string;
  specimens: Specimen[];
  submitterDonorId: string;
};

type Specimen = {
  specimenId: string;
  samples: Sample[];
  specimenTissueSource: string;
  specimenType: string;
  submitterSpecimenId: string;
  tumourNormalDesignation: string;
};

type SpecimenCompact = {
  specimenId: string;
  samples: SampleCompact[];
  tumourNormalDesignation: string;
};

type Sample = {
  sampleId: string;
  matchedNormalSubmitterSampleId: string;
  sampleType: string;
  submitterSampleId: string;
};

type SampleCompact = {
  sampleId: string;
  submitterSampleId: string;
  matchedNormalSubmitterSampleId: string;
};

type AnalysisFile = {
  dataType: string;
  fileAccess: string;
  fileType: string;
  md5Sum: string;
  name: string;
  objectId: string;
  size: Number;
};

type AnalysisFileCompact = {
  dataType: string;
};

type Workflow = {
  analysisTools: string[];
  genomeBuild: string;
  inputs: JSON[];
  runId: string;
  workflowName: string;
  workflowVersion: string;
  run: Run;
};
