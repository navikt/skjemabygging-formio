import express from "express";
import mustacheExpress from "mustache-express";
import getDecorator from "./dekorator.js";
import { Pdfgen } from "./pdfgen.js";
import { buildDirectory } from "./context.js";
import fs from "fs";
import { gitVersionFromIndexHtml } from "./commit_version.js";
import { buildDirectoryIndexHtml } from "./context.js";

const app = express();
const skjemaApp = express();

// Parse application/json
skjemaApp.use(express.json({ limit: "50mb" }));
skjemaApp.use(express.urlencoded({ extended: true, limit: "50mb" }));
skjemaApp.set("views", buildDirectory);
skjemaApp.set("view engine", "mustache");
skjemaApp.engine("html", mustacheExpress());

let gitVersion;
if (process.env.NODE_ENV === "development") {
  gitVersion = "dø-detta-er-development-vet-ikke-hva-versionen-er";
} else {
  const indexHtml = fs.readFileSync(buildDirectoryIndexHtml);
  gitVersion = gitVersionFromIndexHtml(indexHtml);
}

// form encoded post body
skjemaApp.post("/pdf-form", (req, res) => {
  const submission = JSON.parse(req.body.submission);
  const form = JSON.parse(req.body.form);
  console.log("submission", submission);
  res.contentType("application/pdf");
  Pdfgen.generatePdf(submission, form, gitVersion, res);
});

// json encoded post body
skjemaApp.post("/pdf-json", (req, res) => {
  const submission = req.body.submission;
  const form = req.body.form;
  console.log("submission", submission);
  res.contentType("application/pdf");
  Pdfgen.generatePdf(submission, form, gitVersion, res);
});

skjemaApp.get("/config", (req, res) =>
  res.json({
    NAIS_CLUSTER_NAME: process.env.NAIS_CLUSTER_NAME,
  })
);

skjemaApp.use("/", express.static(buildDirectory, { index: false }));

skjemaApp.get("/internal/isAlive|isReady", (req, res) => res.sendStatus(200));

// Match everything except internal og static
skjemaApp.use(/^(?!.*\/(internal|static)\/).*$/, (req, res) => {
  return getDecorator()
    .then((fragments) => {
      res.render("index.html", fragments);
    })
    .catch((e) => {
      const error = `Failed to get decorator: ${e}`;
      console.error(error);
      res.status(500).send(error);
    });
});

app.use("/skjema", skjemaApp);

const port = parseInt(process.env.PORT || "8080");
console.log("serving on ", port);
app.listen(port);

process.on("SIGTERM", () => setTimeout(() => console.log("Har sovet i 30 sekunder"), 30000));
