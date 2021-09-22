import express from "express";
import mustacheExpress from "mustache-express";
import client from "prom-client";
import fetch from "node-fetch";
import getDecorator from "./dekorator.js";
import { Pdfgen, PdfgenPapir } from "./pdfgen.js";
import { buildDirectory } from "./context.js";
import { logger } from "./logger.js";
import cors from "cors";
import { fetchFormsFromFormioApi, loadJsonFilesFromDisk, loadJsonFileFromDisk } from "./utils/forms.js";
import { config, checkConfigConsistency } from "./config/config.js";

const app = express();
const skjemaApp = express();

skjemaApp.use(cors());
// Parse application/json
skjemaApp.use(express.json({ limit: "50mb" }));
skjemaApp.use(express.urlencoded({ extended: true, limit: "50mb" }));
skjemaApp.set("views", buildDirectory);
skjemaApp.set("view engine", "mustache");
skjemaApp.engine("html", mustacheExpress());

const { sentryDsn, naisClusterName, useFormioApi, skjemaDir, skjemaUrl, gitVersion } = config;
checkConfigConsistency(config);

const Registry = client.Registry;
const register = new Registry();
client.collectDefaultMetrics({ register });

const formRequestHandler = (req) => {
  const submission = JSON.parse(req.body.submission);
  const form = JSON.parse(req.body.form);
  return [form, submission];
};

const jsonRequestHandler = (req) => {
  const submission = req.body.submission;
  const form = req.body.form;
  return [form, submission];
};

const pdfGenHandler = (pdfGenClass, requestHandler) => {
  return (req, res) => {
    const [form, submission] = requestHandler(req);
    logger.debug({ label: "request submission", message: submission });
    res.contentType("application/pdf");
    pdfGenClass.generatePdf(submission, form, gitVersion, res);
  };
};

// TODO: rename pdf-form til pdf-form-dok-innsending
skjemaApp.post("/pdf-form", pdfGenHandler(Pdfgen, formRequestHandler));
skjemaApp.post("/pdf-form-papir", pdfGenHandler(PdfgenPapir, formRequestHandler));

// json encoded post body - used for debugging
skjemaApp.post("/pdf-json", pdfGenHandler(Pdfgen, jsonRequestHandler));
skjemaApp.post("/pdf-json-papir", pdfGenHandler(PdfgenPapir, jsonRequestHandler));

skjemaApp.post("/foersteside", async (req, res) => {
  const foerstesideData = JSON.stringify(req.body);
  const response = await fetch(process.env.FOERSTESIDE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: foerstesideData,
  });
  if (response.ok) {
    const body = await response.text();
    res.contentType("application/json");
    res.send(body);
  } else {
    logger.error("Failed to retrieve foersteside from soknadsveiviser " + response.status);
    return response;
  }
});

const loadForms = async () => {
  return useFormioApi ? await fetchFormsFromFormioApi(skjemaUrl) : await loadJsonFilesFromDisk(skjemaDir);
};

const loadTranslations = async (formName) => {
  // return useFormioApi ? {} : await loadJsonFilesFromDisk(translationDir);
  return await loadJsonFileFromDisk("../temp-translations/" + formName);
};

skjemaApp.get("/config", async (req, res) => {
  const forms = await loadForms();

  return res.json({
    NAIS_CLUSTER_NAME: naisClusterName,
    REACT_APP_SENTRY_DSN: sentryDsn,
    FORMS: forms,
  });
});

skjemaApp.use("/", express.static(buildDirectory, { index: false }));

skjemaApp.get("/translations/:form", async (req, res) => res.json(await loadTranslations(req.params.form)));

skjemaApp.get("/internal/isAlive|isReady", (req, res) => res.sendStatus(200));

skjemaApp.get("/internal/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Match everything except internal og static
skjemaApp.use(/^(?!.*\/(internal|static)\/).*$/, (req, res) => {
  return getDecorator()
    .then((fragments) => {
      res.render("index.html", fragments);
    })
    .catch((e) => {
      const error = `Failed to get decorator: ${e}`;
      logger.error(error);
      res.status(500).send(error);
    });
});

function logErrors(err, req, res, next) {
  logger.error({ message: err.message, stack: err.stack });
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.send({ error: "something failed" });
}

skjemaApp.use(logErrors);
skjemaApp.use(errorHandler);

app.use("/fyllut", skjemaApp);

const port = parseInt(process.env.PORT || "8080");

logger.info(`serving on ${port}`);
app.listen(port);

//Play nice with nais, force node to delay quiting to ensure no traffic is incoming
process.on("SIGTERM", () => setTimeout(() => logger.debug("Har sovet i 30 sekunder"), 30000));
