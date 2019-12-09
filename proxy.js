const express = require("express");
const cors = require("cors");
const httpProxy = require("express-http-proxy");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const uuid = require("uuid");

const PORT = process.env.port || 7000;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/search", httpProxy("http://localhost:8082/"));
// app.use("/relay", httpProxy("http://localhost:8083/"));
app.post("/relay/runs", (req, res) => {
  const { workflow_url } = req.body;
  const runName = uuid();
  exec(
    `./nextflow/nextflow run ${workflow_url} -with-weblog http://localhost:8081 -name ${runName}`,
    (err, stdout, stderr) => {
      if (err) {
        res.status(500).send(err);
      } else {
        console.log("stdout: ", stdout);
        res.send({
          run_id: runName
        });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`proxy listening on on port: ${PORT}`);
});
