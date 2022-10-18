import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import correlator from "express-correlation-id";
import mustacheExpress from "mustache-express";
import url from "url";
import { checkConfigConsistency, config } from "./config/config";
import { buildDirectory } from "./context.js";
import { createRedirectUrl, getDecorator } from "./dekorator.js";
import { setupDeprecatedEndpoints } from "./deprecatedEndpoints.js";
import { logger } from "./logger.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import httpRequestLogger from "./middleware/httpRequestLogger.js";
import apiRouter from "./routers/api/index.js";
import internalRouter from "./routers/internal/index.js";
import { formService } from "./services";
import { QueryParamSub } from "./types/custom";
import { getDefaultPageMeta, getFormMeta, getQueryParamSub } from "./utils/page";

const FYLLUT_PATH = "/fyllut";

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
  fyllutRouter.use(/^(?!.*\/(internal|static|api)\/).*$/, async (req: Request, res: Response) => {
    try {
      const qpSub = req.query.sub as QueryParamSub;
      const qpForm = req.query.form;
      logger.debug("Render index.html", { queryParams: { ...req.query } });

      const formPath = res.locals.formId || qpForm;
      let pageMeta = getDefaultPageMeta();

      if (formPath) {
        logger.debug(`Loading form...`, { formPath });
        const form = await formService.loadForm(formPath);
        if (form) {
          if (!qpSub) {
            logger.warn(`Submission query param is missing`, { formPath });
            const sub = getQueryParamSub(form);
            if (sub) {
              const { form, ...query } = req.query;
              logger.info(`Redirect to sub=${sub}`, { formPath, qpForm: form });
              return res.redirect(
                url.format({
                  pathname: `${FYLLUT_PATH}/${formPath}`,
                  query: {
                    ...query,
                    sub,
                  },
                })
              );
            }
          }

          pageMeta = getFormMeta(form);
        } else {
          logger.error(`Form not found`, { formPath });
        }
      }
      const decoratorFragments = await getDecorator(createRedirectUrl(req, res));
      res.render("index.html", {
        ...decoratorFragments,
        ...pageMeta,
      });
    } catch (err: any) {
      const errorMessage = `Failed to return index file: ${err.message}`;
      logger.error(errorMessage);
      res.status(500).send(errorMessage);
    }
  });

  app.use(FYLLUT_PATH, fyllutRouter);

  app.use(globalErrorHandler);

  return app;
};
