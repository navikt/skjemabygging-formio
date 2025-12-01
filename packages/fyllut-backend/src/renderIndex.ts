import { navFormUtils, SubmissionMethod, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { ParsedUrlQueryInput } from 'querystring';
import url from 'url';
import { config } from './config/config';
import { createRedirectUrl, getDecorator } from './dekorator';
import { logger } from './logger';
import { formService } from './services';
import { QueryParamSub } from './types/custom';
import { excludeQueryParam } from './utils/express';
import { logFormNotFound } from './utils/formError';
import { getDefaultPageMeta, getFormMeta } from './utils/page';

const redirectToSubmissionType = (req: Request, res: Response, sub: SubmissionMethod) => {
  const formPath = res.locals.formId;
  const targetUrl = `${config.fyllutPath}/${formPath}`;
  return res.redirect(
    url.format({
      pathname: targetUrl,
      query: {
        ...(req.query as ParsedUrlQueryInput),
        sub: sub,
      },
    }),
  );
};

const renderIndex = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('Render index.html', { queryParams: { ...req.query }, baseUrl: req.baseUrl });
  try {
    const qpForm = req.query.form;
    const qpInnsendingsId = req.query.innsendingsId;
    const qpSub = req.query.sub as QueryParamSub;
    const formPath = res.locals.formId;

    let redirectUrl: string | undefined;
    let redirectParams: { [key: string]: any } = { ...req.query };
    if (qpForm) {
      redirectUrl = `${config.fyllutPath}/${qpForm}`;
      redirectParams = { ...excludeQueryParam('form', redirectParams) };
    }

    if (qpInnsendingsId && qpSub !== 'digital') {
      redirectUrl = redirectUrl ?? req.baseUrl;
      redirectParams = { ...redirectParams, sub: 'digital' };
    } else if (
      !qpInnsendingsId &&
      qpSub === 'digital' &&
      formPath &&
      req.originalUrl.match(new RegExp(`/(oppsummering|ingen-innsending|send-i-posten)`))
    ) {
      redirectUrl = `${config.fyllutPath}/${formPath}`;
      redirectParams = { ...excludeQueryParam('innsendingsId', redirectParams) };
    } else if (qpSub === 'digitalnologin' && formPath && !req.originalUrl.match(new RegExp(`/legitimasjon`))) {
      redirectUrl = `${config.fyllutPath}/${formPath}/legitimasjon`;
    }

    if (redirectUrl) {
      return res.redirect(
        url.format({
          pathname: redirectUrl,
          query: redirectParams,
        }),
      );
    }

    let pageMeta = getDefaultPageMeta();
    let httpStatusCode = 200;
    if (formPath) {
      logger.debug('Loading form...', { formPath });
      const form = await formService.loadForm(formPath);
      if (form && form.properties) {
        const { submissionTypes } = form.properties;
        if (!qpSub) {
          if (submissionTypes && submissionTypes.length > 1) {
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
            return redirectToSubmissionType(req, res, 'digital');
          } else if (submissionTypesUtils.isPaperSubmissionOnly(submissionTypes)) {
            return redirectToSubmissionType(req, res, 'paper');
          } else if (submissionTypesUtils.isDigitalNoLoginSubmissionOnly(submissionTypes)) {
            return redirectToSubmissionType(req, res, 'digitalnologin');
          }
        } else if (qpSub && !navFormUtils.isSubmissionMethodAllowed(qpSub, form)) {
          logger.info('Submission method is not allowed', { qpSub, formPath, submissionTypes });

          const validSubmissionMethod = qpSub === 'digital' || qpSub === 'paper' || qpSub === 'digitalnologin';
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
  } catch (_) {
    next(new Error('Failed to return index file'));
  }
};

export default renderIndex;
