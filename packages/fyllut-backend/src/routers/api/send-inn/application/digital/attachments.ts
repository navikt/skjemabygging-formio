import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../../logger';
import { applicationService } from '../../../../../services';
import { HttpError } from '../../../../../utils/errors/HttpError';
import { removeUploadedTempFile } from '../../../helpers/upload';

const post = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  const innsendingsId = req.params.innsendingsId as string;
  const attachmentId = req.params.attachmentId as string;
  const logMeta = {
    innsendingsId,
    attachmentId,
    route: req.originalUrl,
    hasTempFile: Boolean(file?.path),
    fileSize: file?.size,
    fileType: file?.mimetype,
  };
  try {
    const accessToken = req.getTokenxAccessToken();

    if (!file) {
      logger.warn(`${innsendingsId}: Upload request received without file for digital application`, logMeta);
      return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
    }
    logger.info(`${innsendingsId}: Received file upload request for digital application`, logMeta);

    const result = await applicationService.uploadFile(file, accessToken, attachmentId, innsendingsId, 'digital');
    logger.info(`${innsendingsId}: Upload request completed for digital application`, {
      ...logMeta,
      uploadedFileId: result.fileId,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof HttpError && error.http_response_body.errorCode === 'temporarilyUnavailable') {
      logger.warn(`${innsendingsId}: Upload failed for digital application due to temporary unavailability`, logMeta);
      return res.status(503).json({
        message: TEXTS.statiske.nologin.temporarilyUnavailable,
        errorCode: 'SERVICE_UNAVAILABLE',
      });
    }
    logger.warn(`${innsendingsId}: Upload request failed for digital application`, { ...logMeta, error });
    next(error);
  } finally {
    await removeUploadedTempFile(file);
  }
};

const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { innsendingsId, attachmentId, fileId } = req.params;
    const accessToken = req.getTokenxAccessToken();

    await applicationService.deleteFile(accessToken, innsendingsId, attachmentId, fileId, 'digital');
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
  delete: deleteFile,
};
