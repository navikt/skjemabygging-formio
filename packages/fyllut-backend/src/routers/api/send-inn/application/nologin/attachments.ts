import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../../logger';
import { applicationService } from '../../../../../services';
import { HttpError } from '../../../../../utils/errors/HttpError';
import { removeUploadedTempFile } from '../../../helpers/upload';
import { validateNologinContext } from '../../../nologin-file/nologin-file';

const post = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  const attachmentId = req.params.attachmentId as string;
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
      logger.warn(`${innsendingsId}: Upload request received without file for nologin application`, logMeta);
      return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
    }
    logger.info(`${innsendingsId}: Received file upload request for nologin application`, logMeta);

    const result = await applicationService.uploadFile(file, accessToken, attachmentId, innsendingsId, 'nologin');
    logger.info(`${innsendingsId}: Upload request completed for nologin application`, {
      ...logMeta,
      uploadedFileId: result.fileId,
    });
    res.status(201).json(result);
  } catch (error) {
    const innsendingsId = req.getNologinContext()?.innsendingsId;
    const logMeta = { ...baseLogMeta, innsendingsId };
    if (error instanceof HttpError && error.http_status === 403) {
      logger.warn(`${innsendingsId}: Upload failed for nologin application due to authorization error`, logMeta);
      return res.status(403).json({
        message: 'Feil ved opplasting av fil for uinnlogget søknad, autorisering feilet',
      });
    } else if (
      error instanceof HttpError &&
      error.http_status === 400 &&
      error.http_response_body.errorCode === 'illegalAction.fileWithTooManyPages'
    ) {
      logger.warn(`${innsendingsId}: Upload failed for nologin application due to too many pages`, logMeta);
      return res.status(400).json({
        message: 'Feil ved opplasting av fil for uinnlogget søknad.',
        errorCode: 'FILE_TOO_MANY_PAGES',
      });
    } else if (error instanceof HttpError && error.http_response_body.errorCode === 'temporarilyUnavailable') {
      logger.warn(`${innsendingsId}: Upload failed for nologin application due to temporary unavailability`, logMeta);
      return res.status(503).json({
        message: TEXTS.statiske.nologin.temporarilyUnavailable,
        errorCode: 'SERVICE_UNAVAILABLE',
      });
    }
    logger.warn(`${innsendingsId}: Upload request failed for nologin application`, { ...logMeta, error });
    next(error);
  } finally {
    await removeUploadedTempFile(file);
  }
};

const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nologinContext = validateNologinContext(req.getNologinContext());
    const innsendingsId = nologinContext.innsendingsId;
    const attachmentId = req.params.attachmentId as string | undefined;
    const fileId = req.params.fileId as string | undefined;
    const accessToken = req.headers.AzureAccessToken as string;

    await applicationService.deleteFile(accessToken, innsendingsId, attachmentId, fileId, 'nologin');
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
  delete: deleteAttachment,
};
