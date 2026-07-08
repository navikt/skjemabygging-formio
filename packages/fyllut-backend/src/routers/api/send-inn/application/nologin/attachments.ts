import { fileUtil, requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../../logger';
import { applicationService } from '../../../../../services';
import { removeUploadedTempFile } from '../../../helpers/upload';
import { validateNologinContext } from './context';

const post = async (req: Request, res: Response, next: NextFunction) => {
  const attachmentId = requestUtil.getStringParam(req, 'attachmentId')!;
  const file = requestUtil.getFile(req);
  try {
    const noLoginContext = validateNologinContext(req.getNologinContext());
    const innsendingsId = noLoginContext.innsendingsId;
    const accessToken = requestUtil.getAzureAccessToken(req);
    const logMeta = {
      attachmentId,
      innsendingsId,
      route: req.originalUrl,
      hasTempFile: Boolean(file.path),
      fileSize: file.size,
      fileType: file.mimetype,
    };
    logger.info(`${innsendingsId}: Received file upload request for nologin application`, logMeta);

    const fileBlob = await fileUtil.createBlobFromUploadedFile(file);
    const result = await applicationService.uploadAttachment({
      accessToken,
      attachmentId,
      fileBlob,
      fileName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      innsendingsId,
      logMeta,
      type: 'nologin',
    });
    logger.info(`${innsendingsId}: Upload request completed for nologin application`, {
      ...logMeta,
      uploadedFileId: result.fileId,
    });
    res.status(201).json(result);
  } catch (error) {
    const innsendingsId = req.getNologinContext()?.innsendingsId;
    const logMeta = {
      attachmentId,
      innsendingsId,
      route: req.originalUrl,
      hasTempFile: Boolean(file.path),
      fileSize: file.size,
      fileType: file.mimetype,
    };
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
    const attachmentId = requestUtil.getStringParam(req, 'attachmentId', true);
    const fileId = requestUtil.getStringParam(req, 'fileId', true);
    const accessToken = requestUtil.getAzureAccessToken(req);
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
      type: 'nologin',
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
  delete: deleteAttachment,
};
