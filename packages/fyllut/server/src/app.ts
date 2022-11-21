import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import correlator from "express-correlation-id";
import mustacheExpress from "mustache-express";
import { checkConfigConsistency, config } from "./config/config";
import { buildDirectory } from "./context.js";
import { setupDeprecatedEndpoints } from "./deprecatedEndpoints.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import httpRequestLogger from "./middleware/httpRequestLogger.js";
import renderIndex from "./renderIndex";
import apiRouter from "./routers/api/index.js";
import internalRouter from "./routers/internal/index.js";

export const createApp = () => {
  checkConfigConsistency(config);

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
  // path /internal is not publicly exposed, see https://doc.nais.io/clusters/gcp/#prod-gcp-ingresses
  fyllutRouter.use("/internal", internalRouter);

  // Get the form id
  fyllutRouter.use("/:formId", (req: Request, res: Response, next: NextFunction) => {
    res.locals.formId = req.params.formId;
    next();
  });

  // Match everything except internal, static and api
  fyllutRouter.use(/^(?!.*\/(internal|static|api)\/).*$/, renderIndex);

  app.use(config.fyllutPath, fyllutRouter);

  app.use(globalErrorHandler);

  return app;
};
