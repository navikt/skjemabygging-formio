import cors from "cors";
import express from "express";
import correlator from "express-correlation-id";
import mustacheExpress from "mustache-express";
import { buildDirectory } from "./context.js";
import getDecorator from "./dekorator.js";
import { setupDeprecatedEndpoints } from "./deprecatedEndpoints.js";
import { logger } from "./logger.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import httpRequestLogger from "./middleware/httpRequestLogger.js";
import apiRouter from "./routers/api/index.js";
import internalRouter from "./routers/internal/index.js";

const app = express();
app.use(httpRequestLogger);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(correlator());
app.use(cors());
app.set("views", buildDirectory);
app.set("view engine", "mustache");
app.engine("html", mustacheExpress());

const fyllutRouter = express.Router();

fyllutRouter.use("/", express.static(buildDirectory, { index: false }));

setupDeprecatedEndpoints(fyllutRouter);
fyllutRouter.use("/api", apiRouter);
fyllutRouter.use("/internal", internalRouter);

// Match everything except internal, static and api
fyllutRouter.use(/^(?!.*\/(internal|static|api)\/).*$/, (req, res) => {
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

app.use("/fyllut", fyllutRouter);

app.use(globalErrorHandler);

export default app;
