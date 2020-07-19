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
import Table, { TableColumnConfig } from "@icgc-argo/uikit/Table";
import { Link } from "react-router-dom";
import { GraphAnalysesQueryResponse } from "../gql/types";

type GraphTableData = {
  studyId: String;
  donorId: String;
  specimenId: String;
  tumourNormalDesignation: String;
  sampleId: String;
  submitterSampleId: String;
  matchedNormalSubmitterSampleId: String;
  seqExpAnalysisId: String;
  alignRun?: RunInfo;
  seqAlignAnalysisId?: String;
  sangerRun?: RunInfo;
  varCallingAnalysis?: AnalysisInfo;
};

type AnalysisInfo = { analysisId: String; type: String };
type RunInfo = { runId: String; state: String };

export default ({ data }: { data?: GraphAnalysesQueryResponse }) => {
  const columns: TableColumnConfig<GraphTableData> = [
    {
      Header: "Study",
      accessor: "studyId",
      width: 80,
      resizable: false,
    },
    {
      Header: "Donor",
      accessor: "donorId",
      width: 80,
      resizable: false,
    },
    {
      Header: "Specimen",
      accessor: "specimenId",
      width: 80,
      resizable: false,
    },
    {
      Header: "Tumour/Normal",
      accessor: "tumourNormalDesignation",
      width: 80,
      resizable: false,
    },
    {
      Header: "Sample",
      accessor: "sampleId",
      width: 80,
      resizable: false,
    },
    {
      Header: "Submitter Sample ID",
      accessor: "submitterSampleId",
      width: 160,
    },
    {
      Header: "Matched Normal SS-ID",
      accessor: "matchedNormalSubmitterSampleId",
      width: 160,
    },
    {
      Header: "SeqExp Analysis",
      accessor: "seqExpAnalysisId",
      width: 300,
    },
    {
      Header: "Alignment Run",
      accessor: "alignRun",
      width: 340,
      Cell: ({ original }: { original: GraphTableData }) =>
        original.alignRun ? (
          <Link to={`/runs/${original.alignRun.runId}`}>
            ({original.alignRun.state}) {original.alignRun.runId}
          </Link>
        ) : (
          "N/A"
        ),
    },
    {
      Header: "SeqAlignment Analysis",
      accessor: "seqAlignAnalysisId",
      width: 340,
      Cell: ({ original }: { original: GraphTableData }) =>
        original.seqAlignAnalysisId ? original.seqAlignAnalysisId : "N/A",
    },
    {
      Header: "Sanger Run",
      accessor: "sangerRun",
      width: 340,
      Cell: ({ original }: { original: GraphTableData }) =>
        original.sangerRun ? (
          <Link to={`/runs/${original.sangerRun.runId}`}>
            ({original.sangerRun.state}) {original.sangerRun.runId}
          </Link>
        ) : (
          "N/A"
        ),
    },
    {
      Header: "VarCalling Analysis",
      accessor: "varCallingAnalysis",
      width: 340,
      Cell: ({ original }: { original: GraphTableData }) =>
        original.varCallingAnalysis ? (
          <>
            ({original.varCallingAnalysis.type}){" "}
            {original.varCallingAnalysis.analysisId}
          </>
        ) : (
          "N/A"
        ),
    },
  ];

  //   TODO: look into this ... there are 3 "variant_calling" analysis types per run and each have different files
  const visibleDataTypes = ["Raw SNV Calls", "Raw CNV Calls", "Raw SV Calls"];

  const tableData =
    data?.analyses.reduce((collection, analysis) => {
      // Basic fields
      const { studyId, analysisId } = analysis;
      const donor = analysis.donors[0];
      const specimen = donor.specimens[0];
      const sample = specimen.samples[0];
      const { donorId } = donor;
      const { specimenId, tumourNormalDesignation } = specimen;
      const {
        sampleId,
        submitterSampleId,
        matchedNormalSubmitterSampleId,
      } = sample;

      // base row data
      const row = {
        studyId,
        donorId,
        specimenId,
        tumourNormalDesignation,
        sampleId,
        submitterSampleId,
        matchedNormalSubmitterSampleId,
        seqExpAnalysisId: analysisId,
      };

      ///
      // Inception
      ///

      // Level 1: stop here if no produced analysis from alignment
      analysis.inputForRuns.forEach((alignRun) => {
        if (!alignRun.producedAnalyses.length) {
          collection = [
            ...collection,
            {
              ...row,
              alignRun: {
                runId: alignRun.runId,
                state: alignRun.state,
              },
            },
          ];
        }

        // Level 2: filter for "sequencing_alignment" and
        // stop here if analysis not used for variant calling
        alignRun.producedAnalyses
          .filter(
            (alignAnalysis) =>
              alignAnalysis.analysisType === "sequencing_alignment"
          )
          .forEach((alignAnalysis) => {
            if (!alignAnalysis.inputForRuns.length) {
              collection = [
                ...collection,
                {
                  ...row,
                  alignRun: {
                    runId: alignRun.runId,
                    state: alignRun.state,
                  },
                  seqAlignAnalysisId: alignAnalysis.analysisId,
                },
              ];
            }

            // Level 3: stop here if no produced analysis from variant calling
            alignAnalysis.inputForRuns.forEach((sangerRun) => {
              if (!sangerRun.producedAnalyses.length) {
                collection = [
                  ...collection,
                  {
                    ...row,
                    alignRun: {
                      runId: alignRun.runId,
                      state: alignRun.state,
                    },
                    seqAlignAnalysisId: alignAnalysis.analysisId,
                    sangerRun: {
                      runId: sangerRun.runId,
                      state: sangerRun.state,
                    },
                  },
                ];
              }

              // Level 4: we have end-to-end at this point however
              // we need to filter out some unwanted analysis types
              // from showing here
              sangerRun.producedAnalyses
                .filter(
                  (varCallAnalysis) =>
                    varCallAnalysis.analysisType === "variant_calling" &&
                    visibleDataTypes.includes(varCallAnalysis.files[0].dataType)
                )
                .forEach((varCallAnalysis) => {
                  collection = [
                    ...collection,
                    {
                      ...row,
                      alignRun: {
                        runId: alignRun.runId,
                        state: alignRun.state,
                      },
                      seqAlignAnalysisId: alignAnalysis.analysisId,
                      sangerRun: {
                        runId: sangerRun.runId,
                        state: sangerRun.state,
                      },
                      varCallingAnalysis: {
                        analysisId: varCallAnalysis.analysisId,
                        type: varCallAnalysis.files[0].dataType,
                      },
                    },
                  ];
                });
            });
          });
      });

      return collection;
    }, [] as GraphTableData[]) || [];

  return (
    <Table
      filterable
      parentRef={React.createRef()}
      data={tableData}
      columns={columns}
      defaultPageSize={25}
    />
  );
};
