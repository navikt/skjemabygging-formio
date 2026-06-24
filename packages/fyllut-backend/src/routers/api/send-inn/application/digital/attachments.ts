import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { openAsBlob } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { logger } from '../../../../../logger';
import { applicationService } from '../../../../../services';
import { createUploadResponseError, removeUploadedTempFile } from '../../../helpers/upload';

const createBlobFromBuffer = (file: Express.Multer.File) =>
  new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });

const post = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;
  const attachmentId = requestUtil.getStringParam(req, 'attachmentId')!;
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

    const fileBlob = file.path ? await openAsBlob(file.path, { type: file.mimetype }) : createBlobFromBuffer(file);
    const result = await applicationService.uploadAttachment({
      accessToken,
      attachmentId,
      fileBlob,
      fileName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      innsendingsId,
      type: 'digital',
    });
    logger.info(`${innsendingsId}: Upload request completed for digital application`, {
      ...logMeta,
      uploadedFileId: result.fileId,
    });
    res.status(201).json(result);
  } catch (error) {
    const uploadError = createUploadResponseError(error);
    if (uploadError) {
      logger.warn(`${innsendingsId}: Upload failed for digital application`, { ...logMeta, error: uploadError });
      return next(uploadError);
    }
    logger.warn(`${innsendingsId}: Upload request failed for digital application`, { ...logMeta, error });
    next(error);
  } finally {
    await removeUploadedTempFile(file);
  }
};

const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;
    const attachmentId = requestUtil.getStringParam(req, 'attachmentId')!;
    const fileId = requestUtil.getStringParam(req, 'fileId', true);
    const accessToken = req.getTokenxAccessToken();

    await applicationService.deleteAttachment({ accessToken, attachmentId, fileId, innsendingsId, type: 'digital' });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;
    const attachmentId = requestUtil.getStringParam(req, 'attachmentId')!;
    const fileId = requestUtil.getStringParam(req, 'fileId')!;
    const accessToken = req.getTokenxAccessToken();
    const {
      body: fileStream,
      contentType,
      contentDisposition,
      contentLength,
    } = await applicationService.downloadAttachment({
      accessToken,
      attachmentId,
      fileId,
      innsendingsId,
      type: 'digital',
    });

    res.contentType(contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition);
    }

    res.status(200);
    await pipeline(Readable.fromWeb(fileStream as NodeReadableStream), res);
  } catch (error) {
    next(error);
  }
};

export default {
  get,
  post,
  delete: deleteFile,
};
