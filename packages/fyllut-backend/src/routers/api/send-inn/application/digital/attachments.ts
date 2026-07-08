import { fileUtil, requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { logger } from '../../../../../logger';
import { applicationService } from '../../../../../services';
import { removeUploadedTempFile } from '../../../helpers/upload';

const post = async (req: Request, res: Response, next: NextFunction) => {
  const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;
  const attachmentId = requestUtil.getStringParam(req, 'attachmentId')!;
  try {
    const accessToken = req.getTokenxAccessToken();
    const file = requestUtil.getFile(req);
    const logMeta = {
      innsendingsId,
      attachmentId,
      route: req.originalUrl,
      hasTempFile: Boolean(file.path),
      fileSize: file.size,
      fileType: file.mimetype,
    };
    logger.info(`${innsendingsId}: Received file upload request for digital application`, logMeta);

    const fileBlob = await fileUtil.createBlobFromUploadedFile(file);
    const result = await applicationService.uploadAttachment({
      accessToken,
      attachmentId,
      fileBlob,
      fileName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      innsendingsId,
      logMeta,
      type: 'digital',
    });
    logger.info(`${innsendingsId}: Upload request completed for digital application`, {
      ...logMeta,
      uploadedFileId: result.fileId,
    });
    res.status(201).json(result);
  } catch (error) {
    const file = req.file;
    const logMeta = {
      innsendingsId,
      attachmentId,
      route: req.originalUrl,
      hasTempFile: Boolean(file?.path),
      fileSize: file?.size,
      fileType: file?.mimetype,
    };
    logger.warn(`${innsendingsId}: Upload request failed for digital application`, { ...logMeta, error });
    next(error);
  } finally {
    await removeUploadedTempFile(req.file);
  }
};

const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;
    const attachmentId = requestUtil.getStringParam(req, 'attachmentId')!;
    const fileId = requestUtil.getStringParam(req, 'fileId', true);
    const accessToken = req.getTokenxAccessToken();
    const logMeta = {
      attachmentId,
      fileId,
      innsendingsId,
      route: req.originalUrl,
    };

    await applicationService.deleteAttachment({
      accessToken,
      attachmentId,
      fileId,
      innsendingsId,
      logMeta,
      type: 'digital',
    });
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
    const logMeta = {
      attachmentId,
      fileId,
      innsendingsId,
      route: req.originalUrl,
    };
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
      logMeta,
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
