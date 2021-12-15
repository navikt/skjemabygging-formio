import { languagesUtil } from "@navikt/skjemadigitalisering-shared-domain";
import cors from "cors";
import express from "express";
import correlator from "express-correlation-id";
import mustacheExpress from "mustache-express";
import fetch from "node-fetch";
import client from "prom-client";
import morgan from "morgan";
import ecsFormat from '@elastic/ecs-morgan-format';
import qs from "qs";
import { checkConfigConsistency, config } from "./config/config.js";
import { buildDirectory } from "./context.js";
import getDecorator from "./dekorator.js";
import { logger } from "./logger.js";
import { Pdfgen, PdfgenPapir } from "./pdfgen.js";
import { getCountries } from "./utils/countries.js";
import { fetchFromFormioApi, loadAllJsonFilesFromDirectory, loadFileFromDirectory } from "./utils/forms.js";
import "./utils/errorToJson.js";

const app = express();
const skjemaApp = express();

skjemaApp.use(cors());
// Parse application/json
skjemaApp.use(express.json({ limit: "50mb" }));
skjemaApp.use(express.urlencoded({ extended: true, limit: "50mb" }));
skjemaApp.use(correlator());
skjemaApp.set("views", buildDirectory);
skjemaApp.set("view engine", "mustache");
skjemaApp.engine("html", mustacheExpress());

const {
  sentryDsn,
  naisClusterName,
  useFormioApi,
  skjemaDir,
  formioProjectUrl,
  forstesideUrl,
  resourcesDir,
  translationDir,
  gitVersion,
  skjemabyggingProxyUrl,
  skjemabyggingProxyClientId,
  azureOpenidTokenEndpoint,
  clientId,
  clientSecret,
  featureToggles,
} = config;
checkConfigConsistency(config);

const Registry = client.Registry;
const register = new Registry();
client.collectDefaultMetrics({ register });

// Logging http traffic
const INTERNAL_PATHS = /.*\/internal\/(isAlive|isReady|metrics)/;
app.use(morgan((token, req, res) => {
  const logEntry = JSON.parse(ecsFormat({apmIntegration: false})(token, req, res));
  logEntry.correlation_id = req.correlationId();
  return JSON.stringify(logEntry);
}, {
  skip: (req) => INTERNAL_PATHS.test(req.url)
}));

const formRequestHandler = (req) => {
  const submission = JSON.parse(req.body.submission);
  const form = JSON.parse(req.body.form);
  const translations = JSON.parse(req.body.translations);
  return [form, submission, translations];
};

const jsonRequestHandler = (req) => {
  const submission = req.body.submission;
  const form = req.body.form;
  const translations = req.body.translations;
  return [form, submission, translations];
};

const pdfGenHandler = (pdfGenClass, requestHandler) => {
  return (req, res) => {
    const [form, submission, translations] = requestHandler(req);
    logger.debug({ label: "request submission", message: submission });
    res.contentType("application/pdf");
    pdfGenClass.generatePdf(submission, form, gitVersion, res, translations);
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
  const response = await fetch(forstesideUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: foerstesideData,
  });
  if (response.ok) {
    const body = await response.text();
    res.contentType("application/json");
    res.send(body);
  } else {
    res
      .contentType("application/json")
      .status(response.status)
      .send({
        message: "Feil ved generering av førsteside",
        correlation_id: req.correlationId(),
      });
  }
});

const fetchTranslationsFromFormioApi = async (formPath) => {
  const response = await fetch(`${formioProjectUrl}/language/submission?data.form=${formPath}&limit=1000`, {
    method: "GET",
  });
  if (response.ok) {
    const translationsForForm = await response.json();
    return translationsForForm.reduce((acc, obj) => ({ ...acc, [obj.data.language]: { ...obj.data.i18n } }), {});
  }
  return {};
};

const fetchGlobalTranslationsFromFormioApi = async (lang) => {
  const response = await fetch(
    `${formioProjectUrl}/language/submission?data.name=global&data.language=${lang}&limit=1000`,
    { method: "GET" }
  );
  if (response.ok) {
    const responseJson = await response.json();
    return languagesUtil.globalEntitiesToI18nGroupedByTag(responseJson);
  }
  return {};
};

const loadForms = async () => {
  return useFormioApi
    ? await fetchFromFormioApi(
        `${formioProjectUrl}/form?type=form&tags=nav-skjema&limit=1000&select=title,path,modified`
      )
    : await loadAllJsonFilesFromDirectory(skjemaDir).then((forms) =>
        forms.map((form) => ({
          title: form.title,
          path: form.path,
          modified: form.modified,
        }))
      );
};

const loadForm = async (formPath) => {
  return useFormioApi
    ? await fetchFromFormioApi(`${formioProjectUrl}/form?type=form&tags=nav-skjema&path=${formPath}`).then((results) =>
        results.length > 0 ? results[0] : null
      )
    : await loadFileFromDirectory(skjemaDir, formPath, null);
};

const loadTranslations = async (formPath) => {
  return useFormioApi
    ? await fetchTranslationsFromFormioApi(formPath)
    : await loadFileFromDirectory(translationDir, formPath);
};

const loadGlobalTranslations = async (languageCode) => {
  const globalTranslations = useFormioApi
    ? await fetchGlobalTranslationsFromFormioApi(languageCode)
    : await loadFileFromDirectory(resourcesDir, `global-translations-${languageCode}`);
  return languagesUtil.flattenGlobalI18nGroupedByTag(globalTranslations);
};

const loadMottaksadresser = async () => {
  return useFormioApi
    ? await fetchFromFormioApi(`${formioProjectUrl}/mottaksadresse/submission`)
    : await loadFileFromDirectory(resourcesDir, "mottaksadresser.json", []);
};

skjemaApp.get("/config", async (req, res) => {
  return res.json({
    NAIS_CLUSTER_NAME: naisClusterName,
    REACT_APP_SENTRY_DSN: sentryDsn,
    FEATURE_TOGGLES: featureToggles,
  });
});

skjemaApp.get("/forms/:formPath", async (req, res) => {
  const form = await loadForm(req.params.formPath);
  if (!form) {
    return res.sendStatus(404);
  }
  return res.json(form);
});

skjemaApp.get("/forms", async (req, res) => {
  const form = await loadForms();
  return res.json(form);
});

skjemaApp.use("/", express.static(buildDirectory, { index: false }));

skjemaApp.get("/translations/:form", async (req, res) => res.json(await loadTranslations(req.params.form)));

skjemaApp.get("/global-translations/:languageCode", async (req, res) =>
  res.json(await loadGlobalTranslations(req.params.languageCode))
);

skjemaApp.get("/countries", (req, res) => res.json(getCountries(req.query.lang)));

skjemaApp.get("/mottaksadresser", async (req, res) => res.json(await loadMottaksadresser()));

const postData = {
  grant_type: "client_credentials",
  scope: `openid api://${skjemabyggingProxyClientId}/.default`,
  client_id: clientId,
  client_secret: clientSecret,
  client_auth_method: "client_secret_basic",
};

const toJsonOrThrowError = (errorMessage) => async (response) => {
  if (response.ok) {
    return response.json();
  }
  const contentType = response.headers.get("content-type");
  const error = new Error(errorMessage);
  error.http_response_body = contentType?.includes("application/json") ? await response.json() : await response.text();
  error.http_url = response.url;
  error.http_status = response.status;
  error.correlation_id = correlator.getId();
  throw error;
};

skjemaApp.get("/api/enhetsliste", (req, res) => {
  const body = qs.stringify(postData);
  fetch(azureOpenidTokenEndpoint, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: body,
  })
    .then(toJsonOrThrowError("Feil ved autentisering"))
    .then(({ access_token }) =>
      fetch(`${skjemabyggingProxyUrl}/norg2/api/v1/enhet/kontaktinformasjon/organisering/AKTIV`, {
        headers: { consumerId: "skjemadigitalisering", Authorization: `Bearer ${access_token}` },
      })
    )
    .then(toJsonOrThrowError("Feil ved henting av enhetsliste"))
    .then((enhetsliste) => res.send(enhetsliste))
    .catch((err) => {
      console.error(JSON.stringify(err));
      res.status(500).send({message: err.message, correlation_id: req.correlationId()});
    });
});

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
  logger.error({ message: err.message, stack: err.stack, correlation_id: req.correlationId() });
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.send({ error: "something failed", correlation_id: req.correlationId() });
}

skjemaApp.use(logErrors);
skjemaApp.use(errorHandler);

app.use("/fyllut", skjemaApp);

const port = parseInt(process.env.PORT || "8080");

logger.info(`serving on ${port}`);
app.listen(port);

//Play nice with nais, force node to delay quiting to ensure no traffic is incoming
process.on("SIGTERM", () => setTimeout(() => logger.debug("Har sovet i 30 sekunder"), 30000));
