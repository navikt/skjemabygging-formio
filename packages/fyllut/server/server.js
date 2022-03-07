import cors from "cors";
import express from "express";
import correlator from "express-correlation-id";
import mustacheExpress from "mustache-express";
import { checkConfigConsistency, config } from "./config/config.js";
import { buildDirectory } from "./context.js";
import getDecorator from "./dekorator.js";
import { logger } from "./logger.js";
import { globalErrorHandler, logErrors } from "./middleware/globalErrorHandlers.js";
import httpRequestLogger from "./middleware/httpRequestLogger.js";
import apiConfig from "./routers/api/config.js";
import countries from "./routers/api/countries.js";
import form from "./routers/api/form.js";
import forms from "./routers/api/forms.js";
import globalTranslations from "./routers/api/global-translations.js";
import apiRouter from "./routers/api/index.js";
import mottaksadresser from "./routers/api/mottaksadresser.js";
import pdf from "./routers/api/pdf.js";
import translations from "./routers/api/translations.js";
import internalRouter from "./routers/internal/index.js";
import "./utils/errorToJson.js";

const app = express();
app.use(httpRequestLogger);

const skjemaApp = express();

skjemaApp.use(express.json({ limit: "50mb" }));
skjemaApp.use(express.urlencoded({ extended: true, limit: "50mb" }));
skjemaApp.use(correlator());
skjemaApp.use(cors());
skjemaApp.set("views", buildDirectory);
skjemaApp.set("view engine", "mustache");
skjemaApp.engine("html", mustacheExpress());

checkConfigConsistency(config);

skjemaApp.use("/", express.static(buildDirectory, { index: false }));

/* START depreacted endepunkter */
// TODO fjern disse når vi har tatt i bruk tilsvarende endepunkt under /api
skjemaApp.get("/forms", forms.get);
skjemaApp.get("/forms/:formPath", form.get);
skjemaApp.get("/global-translations/:languageCode", globalTranslations.get);
skjemaApp.get("/config", apiConfig.get);
skjemaApp.get("/countries", countries.get); // TODO Krever migrering av skjemadefinisjoner
skjemaApp.get("/mottaksadresser", mottaksadresser.get);
skjemaApp.get("/translations/:form", translations.get);
skjemaApp.post("/pdf-form", pdf["DIGITAL"].post);
skjemaApp.post("/pdf-form-papir", pdf["PAPIR"].post);
/* SLUTT depreacted endepunkter */

skjemaApp.use("/api", apiRouter);
skjemaApp.use("/internal", internalRouter);

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

skjemaApp.use(logErrors);
skjemaApp.use(globalErrorHandler);

app.use("/fyllut", skjemaApp);

const port = parseInt(process.env.PORT || "8080");

logger.info(`serving on ${port}`);
app.listen(port);

//Play nice with nais, force node to delay quiting to ensure no traffic is incoming
process.on("SIGTERM", () => setTimeout(() => logger.debug("Har sovet i 30 sekunder"), 30000));
