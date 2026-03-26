import { TEXTS, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../logger';
import { applicationService } from '../../../services';
import { NologinContext } from '../../../types/nologin';
import { HttpError } from '../../../utils/errors/HttpError';
import { removeUploadedTempFile } from '../helpers/upload';

const nologinFile = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const attachmentId = req.query.attachmentId as string;
    const baseLogMeta = {
      attachmentId,
      route: req.originalUrl,
      hasTempFile: Boolean(file?.path),
      fileSize: file?.size,
      fileType: file?.mimetype,
    };
    try {
      const noLoginContext = validateNologinContext(req.getNologinContext());

      const innsendingsId = noLoginContext.innsendingsId;
      const accessToken = req.headers.AzureAccessToken as string;
      const logMeta = { ...baseLogMeta, innsendingsId };

      if (!file) {
        logger.warn(`${innsendingsId}: Upload request received without file for nologin-file endpoint`, logMeta);
        return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
      }
      validateAttachmentId(attachmentId);
      logger.info(`${innsendingsId}: Received file upload request for nologin-file endpoint`, logMeta);

      const result = await applicationService.uploadFile(file, accessToken, attachmentId, innsendingsId, 'nologin');
      logger.info(`${innsendingsId}: Upload request completed for nologin-file endpoint`, {
        ...logMeta,
        uploadedFileId: result.fileId,
      });
      res.status(201).json(result);
    } catch (error: any) {
      const innsendingsId = req.getNologinContext()?.innsendingsId;
      const logMeta = { ...baseLogMeta, innsendingsId };
      if (error instanceof HttpError && error.http_status === 403) {
        logger.warn(`${innsendingsId}: Upload failed for nologin-file endpoint due to authorization error`, logMeta);
        return res.status(403).json({
          message: 'Feil ved opplasting av fil for uinnlogget søknad, autorisering feilet',
        });
      } else if (
        error instanceof HttpError &&
        error.http_status === 400 &&
        error.http_response_body.errorCode === 'illegalAction.fileWithTooManyPages'
      ) {
        logger.warn(`${innsendingsId}: Upload failed for nologin-file endpoint due to too many pages`, logMeta);
        return res.status(400).json({
          message: 'Feil ved opplasting av fil for uinnlogget søknad.',
          errorCode: 'FILE_TOO_MANY_PAGES',
        });
      } else if (error instanceof HttpError && error.http_response_body.errorCode === 'temporarilyUnavailable') {
        logger.warn(
          `${innsendingsId}: Upload failed for nologin-file endpoint due to temporary unavailability`,
          logMeta,
        );
        return res.status(503).json({
          message: TEXTS.statiske.nologin.temporarilyUnavailable,
          errorCode: 'SERVICE_UNAVAILABLE',
        });
      }

      logger.warn(`${innsendingsId}: Upload request failed for nologin-file endpoint`, { ...logMeta, error });
      next(error);
    } finally {
      await removeUploadedTempFile(file);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nologinContext = validateNologinContext(req.getNologinContext());

      const innsendingsId = nologinContext.innsendingsId;
      const attachmentId = req.query.attachmentId as string | undefined;
      const fileId = req.params.fileId as string | undefined;
      const accessToken = req.headers.AzureAccessToken as string;

      validateAttachmentId(attachmentId);

      await applicationService.deleteFile(accessToken, innsendingsId, attachmentId, fileId, 'nologin');
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};

export const validateNologinContext = (context: NologinContext | undefined): NologinContext => {
  if (!context) {
    throw Error('Nologin context is missing');
  }
  if (!validatorUtils.isValidUuid(context.innsendingsId)) {
    throw Error('Invalid innsendingsId in nologin context');
  }
  return context;
};

const validateAttachmentId = (attachmentId: string | undefined) => {
  if (attachmentId && !validatorUtils.isValidAttachmentId(attachmentId)) {
    throw Error(`Invalid attachmentId: ${attachmentId}`);
  }
};

export default nologinFile;
