import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logger';
import { getIdportenPid, getTokenxAccessToken } from '../../security/tokenHelper';
import { applicationService, formService, translationService } from '../../services';
import { base64Decode } from '../../utils/base64';
import { getFyllutUrl } from '../../utils/url';
import {
  assembleSendInnSoknadBody,
  byteArrayToObject,
  sanitizeInnsendingsId,
  SendInnSoknadBody,
  validateInnsendingsId,
} from './helpers/sendInn';

const getErrorMessage = 'Kan ikke hente mellomlagret søknad.';
const putErrorMessage = 'Kan ikke oppdatere mellomlagret søknad.';
const deleteErrorMessage = 'Kan ikke slette mellomlagret søknad.';

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
      const response = await applicationService.createSoknad<SendInnSoknadBody>({
        accessToken: tokenxAccessToken,
        body,
        envQualifier,
        force: Boolean(forceMellomlagring),
        innsendingsId: req.body.innsendingsId ?? '',
      });
      const { status, body: soknad } = response;

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

      const response = await applicationService.updateSoknad<SendInnSoknadBody>({
        accessToken: tokenxAccessToken,
        body,
        innsendingsId: sanitizedInnsendingsId,
      });

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
