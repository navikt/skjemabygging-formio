import cors from "cors";
import express from "express";
import correlator from "express-correlation-id";
import mustacheExpress from "mustache-express";
import { checkConfigConsistency, config } from "./config/config.js";
import { buildDirectory } from "./context.js";
import getDecorator from "./dekorator.js";
import { setupDeprecatedEndpoints } from "./deprecatedEndpoints.js";
import { logger } from "./logger.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import httpRequestLogger from "./middleware/httpRequestLogger.js";
import apiRouter from "./routers/api/index.js";
import internalRouter from "./routers/internal/index.js";
import "./utils/errorToJson.js";

checkConfigConsistency(config);

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

skjemaApp.use("/", express.static(buildDirectory, { index: false }));

setupDeprecatedEndpoints(skjemaApp);
skjemaApp.use("/api", apiRouter);
skjemaApp.use("/internal", internalRouter);

// Match everything except internal, static and api
skjemaApp.use(/^(?!.*\/(internal|static|api)\/).*$/, (req, res) => {
  return getDecorator()
    .then((fragments) => {
      res.render("index.html", fragments);
    })
    .catch((err) => {
      const errorMessage = `Failed to get decorator: ${err.message}`;
      logger.error(errorMessage);
      res.status(500).send(errorMessage);
    });
});

skjemaApp.use(globalErrorHandler);

app.use("/fyllut", skjemaApp);

const port = parseInt(process.env.PORT || "8080");

logger.info(`serving on ${port}`);
app.listen(port);

//Play nice with nais, force node to delay quiting to ensure no traffic is incoming
process.on("SIGTERM", () => setTimeout(() => logger.debug("Har sovet i 30 sekunder"), 30000));
