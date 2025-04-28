import { navFormUtils, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { ParsedUrlQueryInput } from 'querystring';
import url from 'url';
import { config } from './config/config';
import { createRedirectUrl, getDecorator } from './dekorator';
import { logger } from './logger';
import { formService } from './services';
import { QueryParamSub } from './types/custom';
import { ErrorWithCause } from './utils/errors';
import { excludeQueryParam } from './utils/express';
import { logFormNotFound } from './utils/formError';
import { getDefaultPageMeta, getFormMeta } from './utils/page';

const renderIndex = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('Render index.html', { queryParams: { ...req.query }, baseUrl: req.baseUrl });
  try {
    const qpForm = req.query.form;
    const qpInnsendingsId = req.query.innsendingsId;
    const qpSub = req.query.sub as QueryParamSub;
    let redirectUrl: string | undefined;
    let redirectParams: { [key: string]: any } = { ...req.query };
    if (qpForm) {
      redirectUrl = `${config.fyllutPath}/${qpForm}`;
      redirectParams = { ...excludeQueryParam('form', redirectParams) };
    }

    if (qpInnsendingsId && qpSub !== 'digital') {
      redirectUrl = redirectUrl ?? req.baseUrl;
      redirectParams = { ...redirectParams, sub: 'digital' };
    }

    if (redirectUrl) {
      return res.redirect(
        url.format({
          pathname: redirectUrl,
          query: redirectParams,
        }),
      );
    }

    const formPath = res.locals.formId;
    let pageMeta = getDefaultPageMeta();

    let httpStatusCode = 200;
    if (formPath && !config.noFormValidation) {
      logger.debug('Loading form...', { formPath });
      const form = await formService.loadForm(formPath);
      if (form && form.properties) {
        const { submissionTypes } = form.properties;
        const isPaperAndDigitalSubmission =
          submissionTypesUtils.isPaperSubmission(submissionTypes) &&
          submissionTypesUtils.isDigitalSubmission(submissionTypes);
        if (!qpSub) {
          if (isPaperAndDigitalSubmission) {
            logger.info('Submission query param is missing', { formPath });
            const targetUrl = `${config.fyllutPath}/${formPath}`;
            if (req.baseUrl !== targetUrl) {
              const logMeta = { formPath, targetUrl, baseUrl: req.baseUrl };
              logger.info('Redirecting to intro page since submission query param is missing', logMeta);
              return res.redirect(
                url.format({
                  pathname: targetUrl,
                  query: req.query as ParsedUrlQueryInput,
                }),
              );
            }
          } else if (submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) {
            const targetUrl = `${config.fyllutPath}/${formPath}`;
            return res.redirect(
              url.format({
                pathname: targetUrl,
                query: {
                  ...(req.query as ParsedUrlQueryInput),
                  sub: 'digital',
                },
              }),
            );
          } else if (submissionTypesUtils.isPaperSubmissionOnly(submissionTypes)) {
            const targetUrl = `${config.fyllutPath}/${formPath}`;
            return res.redirect(
              url.format({
                pathname: targetUrl,
                query: {
                  ...(req.query as ParsedUrlQueryInput),
                  sub: 'paper',
                },
              }),
            );
          }
        } else if (qpSub && !navFormUtils.isSubmissionMethodAllowed(qpSub, form)) {
          logger.info('Submission method is not allowed', { qpSub, formPath, submissionTypes });

          const validSubmissionMethod = qpSub === 'digital' || qpSub === 'paper';
          if (!validSubmissionMethod || submissionTypesUtils.isNoneSubmission(submissionTypes)) {
            const targetUrl = `${config.fyllutPath}/${formPath}`;
            return res.redirect(
              url.format({
                pathname: targetUrl,
                query: {
                  ...excludeQueryParam('sub', req.query),
                },
              }),
            );
          }
        }

        pageMeta = getFormMeta(form);
      } else {
        logFormNotFound(formPath);
        httpStatusCode = 404;
      }
    }

    const decoratorFragments = await getDecorator(createRedirectUrl(req, res));
    res.status(httpStatusCode).render('index.html', {
      ...decoratorFragments,
      ...pageMeta,
      ...(config.umamiWebsiteId && { umamiWebsiteId: config.umamiWebsiteId }),
    });
  } catch (cause: any) {
    next(new ErrorWithCause('Failed to return index file', cause));
  }
};

export default renderIndex;
