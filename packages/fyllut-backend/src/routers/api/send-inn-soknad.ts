import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logger';
import { getIdportenPid, getTokenxAccessToken } from '../../security/tokenHelper';
import { applicationService, formService, translationService } from '../../services';
import { base64Decode } from '../../utils/base64';
import { getFyllutUrl } from '../../utils/url';
import { isResponseError, wrapResponseError } from './helpers/responseErrors';
import {
  assembleSendInnSoknadBody,
  byteArrayToObject,
  sanitizeInnsendingsId,
  SendInnSoknadBody,
  validateInnsendingsId,
} from './helpers/sendInn';

const getErrorMessage = 'Kan ikke hente mellomlagret søknad.';
const postErrorMessage = 'Kan ikke starte mellomlagring av søknaden.';
const putErrorMessage = 'Kan ikke oppdatere mellomlagret søknad.';
const deleteErrorMessage = 'Kan ikke slette mellomlagret søknad.';

const shouldRespondWithNotFound = (error: unknown) => error instanceof ResponseError && error.errorCode === 'NOT_FOUND';

const withSendInnMessage = (error: ResponseError, userMessage: string) =>
  wrapResponseError({
    error,
    message: 'SendInn draft request failed',
    userMessage: `Feil ved kall til SendInn. ${userMessage}`,
  });

const sendInnSoknad = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);
      const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;

      const sanitizedInnsendingsId = sanitizeInnsendingsId(innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId, getErrorMessage);
      if (errorMessage) {
        return res.sendStatus(404);
      }

      const json = await applicationService.getSoknad<SendInnSoknadBody>({
        accessToken: tokenxAccessToken,
        innsendingsId: sanitizedInnsendingsId,
      });
      logger.debug('Successfylly fetched data from SendInn');
      const response = {
        ...json,
        hoveddokumentVariant: {
          ...json.hoveddokumentVariant,
          ...(json.hoveddokumentVariant.document && {
            document: byteArrayToObject(base64Decode(json.hoveddokumentVariant.document)),
          }),
        },
        ...shouldUploadAttachmentsInFyllut(json),
      };
      res.json(response);
    } catch (error) {
      if (shouldRespondWithNotFound(error)) {
        logger.info(`${req.params.innsendingsId}: Not found. Failed to get`, error);
        return res.sendStatus(404);
      }
      if (isResponseError(error)) {
        logger.debug('Failed to fetch data from SendInn');
        return next(withSendInnMessage(error, getErrorMessage));
      }
      next(error);
    }
  },
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const fyllutUrl = getFyllutUrl(req);
      const forceMellomlagring = req.query.forceMellomlagring as string | undefined;

      const { formPath } = req.body;
      const form = await formService.getForm({
        formPath,
        select: ['skjemanummer', 'title', 'path', 'properties', 'components'],
      });
      const translations = await translationService.getTranslations({ formPath });

      const body = assembleSendInnSoknadBody({ ...req.body, form, translations }, idportenPid, fyllutUrl, null);
      const envQualifier = req.getEnvQualifier();
      let status: number;
      let soknad: SendInnSoknadBody;
      try {
        const response = await applicationService.createSoknad<SendInnSoknadBody>({
          accessToken: tokenxAccessToken,
          body,
          envQualifier,
          force: Boolean(forceMellomlagring),
          innsendingsId: req.body.innsendingsId ?? '',
        });
        status = response.status;
        soknad = response.body;
      } catch (error) {
        if (isResponseError(error)) {
          logger.debug('Failed to post data to SendInn');
          return next(withSendInnMessage(error, postErrorMessage));
        }
        throw error;
      }

      logger.debug(status === 200 ? 'User has active tasks' : 'Successfylly posted data to SendInn');
      res.status(status);
      res.json({
        ...soknad,
        ...shouldUploadAttachmentsInFyllut(soknad),
      });
    } catch (error) {
      next(error);
    }
  },

  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const fyllutUrl = getFyllutUrl(req);

      const { innsendingsId, formPath } = req.body;

      const sanitizedInnsendingsId = sanitizeInnsendingsId(innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId, putErrorMessage);
      if (errorMessage) {
        next(new Error(errorMessage));
        return;
      }

      const form = await formService.getForm({
        formPath,
        select: ['skjemanummer', 'title', 'path', 'properties', 'components'],
      });
      const translations = await translationService.getTranslations({ formPath });

      const body = assembleSendInnSoknadBody({ ...req.body, form, translations }, idportenPid, fyllutUrl, null);

      let response: SendInnSoknadBody;
      try {
        response = await applicationService.updateSoknad<SendInnSoknadBody>({
          accessToken: tokenxAccessToken,
          body,
          innsendingsId: sanitizedInnsendingsId,
        });
      } catch (error) {
        if (shouldRespondWithNotFound(error)) {
          logger.info(`${req.body.innsendingsId}: Not found. Failed to update`, error);
          return res.sendStatus(404);
        }
        if (isResponseError(error)) {
          logger.debug('Failed to update data in SendInn');
          return next(withSendInnMessage(error, putErrorMessage));
        }
        throw error;
      }

      logger.debug('Successfylly updated data in SendInn');
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);
      const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;

      const sanitizedInnsendingsId = sanitizeInnsendingsId(innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId, deleteErrorMessage);
      if (errorMessage) {
        next(new Error(errorMessage));
        return;
      }

      const response = await applicationService.deleteSoknad({
        accessToken: tokenxAccessToken,
        innsendingsId: sanitizedInnsendingsId,
      });

      logger.debug(`Successfylly deleted soknad with innsendingsId ${sanitizedInnsendingsId}`);
      res.json(response);
    } catch (error) {
      if (shouldRespondWithNotFound(error)) {
        logger.info(`${req.params.innsendingsId}: Not found. Failed to delete`, error);
        return res.sendStatus(404);
      }
      if (isResponseError(error)) {
        logger.debug(`Failed to delete soknad with innsendingsId ${req.params.innsendingsId}`);
        return next(withSendInnMessage(error, deleteErrorMessage));
      }
      next(error);
    }
  },
};

const shouldUploadAttachmentsInFyllut = (soknad: SendInnSoknadBody) => {
  const shouldUploadAttachmentsInFyllut = (soknad.vedleggsListe?.length || 0) === 0;
  if (!shouldUploadAttachmentsInFyllut) {
    logger.info(`${soknad.innsendingsId}: Attachment upload in Fyllut disabled, send-inn-frontend will be used`, {
      skjemanummer: soknad.skjemanr,
      attachmentsCount: soknad.vedleggsListe?.length,
      formPath: soknad.skjemaPath,
    });
  }
  return {
    shouldUploadAttachmentsInFyllut,
  };
};

export default sendInnSoknad;
