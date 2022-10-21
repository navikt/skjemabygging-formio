import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { Request, Response } from "express";
import url from "url";
import { config } from "./config/config";
import { createRedirectUrl, getDecorator } from "./dekorator";
import { logger } from "./logger";
import { formService } from "./services";
import { QueryParamSub } from "./types/custom";
import { excludeQueryParam } from "./utils/express";
import { getDefaultPageMeta, getFormMeta } from "./utils/page";

const renderIndex = async (req: Request, res: Response) => {
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
        if (!qpSub && (!innsending || innsending === "PAPIR_OG_DIGITAL")) {
          logger.error("Submission query param is missing", { formPath });
          const targetUrl = `${config.fyllutPath}/${formPath}`;
          if (req.baseUrl !== targetUrl) {
            const logMeta = { formPath, targetUrl, baseUrl: req.baseUrl };
            logger.info("Redirecting to intro page since submission query param is missing", logMeta);
            return res.redirect(
              url.format({
                pathname: targetUrl,
                query: {
                  ...excludeQueryParam("form", req.query),
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
  } catch (err: any) {
    const errorMessage = `Failed to return index file: ${err.message}`;
    logger.error(errorMessage);
    res.status(500).send(errorMessage);
  }
};

export default renderIndex;
