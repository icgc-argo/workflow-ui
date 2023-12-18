@Library(value='jenkins-pipeline-library@master', changelog=false) _
pipelineRDPCWorkflowUi(
    buildImage: "node:12.6.0",
    dockerRegistry: "ghcr.io",
    dockerRepo: "icgc-argo/workflow-ui",
    gitRepo: "icgc-argo/workflow-ui",
    testCommand: "npm ci && npm run test",
    helmRelease: "ui"
)
