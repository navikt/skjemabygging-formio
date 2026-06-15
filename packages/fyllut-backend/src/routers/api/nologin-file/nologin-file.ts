import { ResponseError, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { openAsBlob } from 'node:fs';
import { logger } from '../../../logger';
import { applicationService } from '../../../services';
import { NologinContext } from '../../../types/nologin';
import { hasErrorCode, isResponseError, wrapResponseError } from '../helpers/responseErrors';
import { removeUploadedTempFile } from '../helpers/upload';

const createBlobFromBuffer = (file: Express.Multer.File) =>
  new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });

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

      const fileBlob = file.path ? await openAsBlob(file.path, { type: file.mimetype }) : createBlobFromBuffer(file);
      const result = await applicationService.uploadAttachment({
        accessToken,
        attachmentId,
        fileBlob,
        fileName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        innsendingsId,
        type: 'nologin',
      });
      logger.info(`${innsendingsId}: Upload request completed for nologin-file endpoint`, {
        ...logMeta,
        uploadedFileId: result.fileId,
      });
      res.status(201).json(result);
    } catch (error) {
      const innsendingsId = req.getNologinContext()?.innsendingsId;
      const logMeta = { ...baseLogMeta, innsendingsId };
      if (hasErrorCode(error, 'FORBIDDEN')) {
        logger.warn(`${innsendingsId}: Upload failed for nologin-file endpoint due to authorization error`, logMeta);
        return next(
          wrapResponseError({
            error: error as ResponseError,
            message: 'Nologin file upload forbidden',
            userMessage: 'Feil ved opplasting av fil for uinnlogget søknad, autorisering feilet',
          }),
        );
      } else if (hasErrorCode(error, 'FILE_TOO_MANY_PAGES')) {
        logger.warn(`${innsendingsId}: Upload failed for nologin-file endpoint due to too many pages`, logMeta);
        return next(error);
      } else if (hasErrorCode(error, 'SERVICE_UNAVAILABLE')) {
        logger.warn(
          `${innsendingsId}: Upload failed for nologin-file endpoint due to temporary unavailability`,
          logMeta,
        );
        return next(error);
      } else if (isResponseError(error)) {
        logger.warn(`${innsendingsId}: Upload request failed for nologin-file endpoint`, { ...logMeta, error });
        return next(
          wrapResponseError({
            error,
            message: 'Nologin file upload failed',
            userMessage: 'Feil ved opplasting av fil for uinnlogget søknad.',
          }),
        );
      }

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

      await applicationService.deleteAttachment({ accessToken, attachmentId, fileId, innsendingsId, type: 'nologin' });
      res.sendStatus(204);
    } catch (error) {
      if (isResponseError(error)) {
        return next(
          wrapResponseError({
            error,
            message: 'Nologin file delete failed',
            userMessage: 'Feil ved sletting av fil',
          }),
        );
      }
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
