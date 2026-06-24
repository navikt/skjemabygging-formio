import { NextFunction, Request, Response } from 'express';
import { openAsBlob } from 'node:fs';
import { logger } from '../../../../../logger';
import { applicationService } from '../../../../../services';
import { createUploadResponseError, removeUploadedTempFile } from '../../../helpers/upload';
import { validateNologinContext } from './context';

const createBlobFromBuffer = (file: Express.Multer.File) =>
  new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });

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

    const fileBlob = file.path ? await openAsBlob(file.path, { type: file.mimetype }) : createBlobFromBuffer(file);
    const result = await applicationService.uploadAttachment({
      accessToken,
      attachmentId,
      fileBlob,
      fileName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      innsendingsId,
      type: 'nologin',
    });
    logger.info(`${innsendingsId}: Upload request completed for nologin application`, {
      ...logMeta,
      uploadedFileId: result.fileId,
    });
    res.status(201).json(result);
  } catch (error) {
    const innsendingsId = req.getNologinContext()?.innsendingsId;
    const logMeta = { ...baseLogMeta, innsendingsId };
    const uploadError = createUploadResponseError(error);
    if (uploadError) {
      logger.warn(`${innsendingsId}: Upload failed for nologin application`, { ...logMeta, error: uploadError });
      return next(uploadError);
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

    await applicationService.deleteAttachment({ accessToken, attachmentId, fileId, innsendingsId, type: 'nologin' });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
  delete: deleteAttachment,
};
