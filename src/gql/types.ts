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
  runs: AT[];
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
  analysisId: String;
  analysisType: String;
  analysisState: String;
  analysisVersion: Number;
  donors: Donor[];
  experiment: JSON;
  files: AnalysisFile[];
  studyId: String;
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
  analysisId: String;
  analysisType: String;
  studyId: String;
  donors: DonorCompact[];
  inputForRuns: {
    runId: string;
    repository: string;
    state: string;
    producedAnalyses: AnalysisCompact[];
  };
};

type AnalysisCompact = {
  analysisId: String;
  analysisType: String;
};

type DonorCompact = {
  donorId: String;
  specimens: SpecimenCompact[];
}

type Donor = {
  donorId: String;
  gender: String;
  specimens: Specimen[];
  submitterDonorId: String;
};

type Specimen = {
  specimenId: String;
  samples: Sample[];
  specimenTissueSource: String;
  specimenType: String;
  submitterSpecimenId: String;
  tumourNormalDesignation: String;
};

type SpecimenCompact = {
  specimenId: String;
  samples: SampleCompact[];
  tumourNormalDesignation: String;
};

type Sample = {
  sampleId: String;
  matchedNormalSubmitterSampleId: String;
  sampleType: String;
  submitterSampleId: String;
};

type SampleCompact = {
  sampleId: String;
  matchedNormalSubmitterSampleId: String;
};

type AnalysisFile = {
  dataType: String;
  fileAccess: String;
  fileType: String;
  md5Sum: String;
  name: String;
  objectId: String;
  size: Number;
};

type Workflow = {
  analysisTools: String[];
  genomeBuild: String;
  inputs: JSON[];
  runId: String;
  workflowName: String;
  workflowVersion: String;
  run: Run;
};
