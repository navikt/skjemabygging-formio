import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { NextFunction, Request, Response } from "express";
import { ParsedUrlQueryInput } from "querystring";
import url from "url";
import { config } from "./config/config";
import { createRedirectUrl, getDecorator } from "./dekorator";
import { logger } from "./logger";
import { formService } from "./services";
import { QueryParamSub } from "./types/custom";
import { ErrorWithCause } from "./utils/errors";
import { excludeQueryParam } from "./utils/express";
import { getDefaultPageMeta, getFormMeta } from "./utils/page";

const renderIndex = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Render index.html", { queryParams: { ...req.query }, baseUrl: req.baseUrl });
  try {
    const qpForm = req.query.form;
    if (qpForm) {
      return res.redirect(
        url.format({
          pathname: `${config.fyllutPath}/${qpForm}`,
          query: {
            ...excludeQueryParam("form", req.query),
          },
        })
      );
    }

    const qpSub = req.query.sub as QueryParamSub;
    const formPath = res.locals.formId;
    let pageMeta = getDefaultPageMeta();

    if (formPath) {
      logger.debug("Loading form...", { formPath });
      const form = await formService.loadForm(formPath);
      if (form) {
        const { innsending } = form.properties;
        if (!qpSub) {
          if (!innsending || innsending === "PAPIR_OG_DIGITAL") {
            logger.error("Submission query param is missing", { formPath });
            const targetUrl = `${config.fyllutPath}/${formPath}`;
            if (req.baseUrl !== targetUrl) {
              const logMeta = { formPath, targetUrl, baseUrl: req.baseUrl };
              logger.info("Redirecting to intro page since submission query param is missing", logMeta);
              return res.redirect(
                url.format({
                  pathname: targetUrl,
                  query: req.query as ParsedUrlQueryInput,
                })
              );
            }
          } else if (innsending === "KUN_DIGITAL") {
            const targetUrl = `${config.fyllutPath}/${formPath}`;
            return res.redirect(
              url.format({
                pathname: targetUrl,
                query: {
                  ...(req.query as ParsedUrlQueryInput),
                  sub: "digital",
                },
              })
            );
          }
        } else if (qpSub && !navFormUtils.isSubmissionMethodAllowed(qpSub, form)) {
          logger.error("Submission method is not allowed", { qpSub, formPath, innsending });
        }

        pageMeta = getFormMeta(form);
      } else {
        logger.error("Form not found", { formPath });
      }
    }

    const decoratorFragments = await getDecorator(createRedirectUrl(req, res));
    res.render("index.html", {
      ...decoratorFragments,
      ...pageMeta,
    });
  } catch (cause: any) {
    next(new ErrorWithCause("Failed to return index file", cause));
  }
};

export default renderIndex;
