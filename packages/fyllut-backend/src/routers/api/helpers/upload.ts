import { ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { logger } from '../../../logger';
import { HttpError } from '../../../utils/errors/HttpError';

// Allow files up to 150MB by default, can be overridden per route if needed
const MAX_UPLOAD_FILE_SIZE_BYTES = 150 * 1024 * 1024;

interface UploadSingleFileOptions {
  maxFileSizeBytes?: number;
}

const uploadSingleFile = (fieldName: string, options: UploadSingleFileOptions = {}) => {
  const maxFileSizeBytes = options.maxFileSizeBytes ?? MAX_UPLOAD_FILE_SIZE_BYTES;
  const upload = multer({
    dest: tmpdir(),
    limits: { fileSize: maxFileSizeBytes },
  }).single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (error) => {
      const queryAttachmentId = typeof req.query.attachmentId === 'string' ? req.query.attachmentId : undefined;
      const logMeta = {
        route: req.originalUrl,
        fieldName,
        innsendingsId: req.params.innsendingsId,
        attachmentId: req.params.attachmentId ?? queryAttachmentId,
      };

      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        logger.warn('Upload rejected due to file size limit', {
          ...logMeta,
          maxFileSizeBytes,
        });
        return next(
          new ResponseError(
            'BAD_REQUEST',
            'Uploaded file exceeds maximum size.',
            undefined,
            TEXTS.statiske.uploadFile.fileTooLargeError,
          ),
        );
      }

      if (error) {
        logger.warn('Upload failed before route handler', { ...logMeta, error });
        return next(error);
      }

      if (req.file) {
        logger.info('Upload stored in temporary file', {
          ...logMeta,
          hasTempFile: Boolean(req.file.path),
          fileSize: req.file.size,
          fileType: req.file.mimetype,
        });
      }

      next();
    });
  };
};

const removeUploadedTempFile = async (file?: Express.Multer.File): Promise<void> => {
  const filePath = file?.path;
  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
    logger.info('Removed temporary uploaded file', {
      hadTempFile: true,
      fileSize: file.size,
      fileType: file.mimetype,
    });
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      logger.warn('Failed to remove uploaded temporary file', { hadTempFile: true, error });
    }
  }
};

const createUploadResponseError = (error: unknown): ResponseError | undefined => {
  if (error instanceof ResponseError) {
    if (error.errorCode === 'FORBIDDEN') {
      return new ResponseError(
        'FORBIDDEN',
        'Upload failed because authorization failed',
        error.correlationId,
        TEXTS.statiske.uploadFile.uploadFileError,
      );
    }

    if (error.errorCode === 'FILE_TOO_MANY_PAGES') {
      return new ResponseError(
        'BAD_REQUEST',
        'Upload failed because file has too many pages',
        error.correlationId,
        TEXTS.statiske.uploadFile.uploadFileToManyPagesError,
      );
    }

    if (error.errorCode === 'SERVICE_UNAVAILABLE') {
      return new ResponseError(
        'SERVICE_UNAVAILABLE',
        'Upload temporarily unavailable',
        error.correlationId,
        TEXTS.statiske.nologin.temporarilyUnavailable,
      );
    }

    return new ResponseError(
      error.errorCode,
      'Upload failed',
      error.correlationId,
      TEXTS.statiske.uploadFile.uploadFileError,
    );
  }

  if (!(error instanceof HttpError)) {
    return undefined;
  }

  if (error.http_status === 403) {
    return new ResponseError(
      'FORBIDDEN',
      'Upload failed because authorization failed',
      error.correlation_id,
      TEXTS.statiske.uploadFile.uploadFileError,
    );
  }

  if (error.http_status === 400 && error.http_response_body?.errorCode === 'illegalAction.fileWithTooManyPages') {
    return new ResponseError(
      'BAD_REQUEST',
      'Upload failed because file has too many pages',
      error.correlation_id,
      TEXTS.statiske.uploadFile.uploadFileToManyPagesError,
    );
  }

  if (error.http_response_body?.errorCode === 'temporarilyUnavailable') {
    return new ResponseError(
      'SERVICE_UNAVAILABLE',
      'Upload temporarily unavailable',
      error.correlation_id,
      TEXTS.statiske.nologin.temporarilyUnavailable,
    );
  }

  return undefined;
};

export { createUploadResponseError, MAX_UPLOAD_FILE_SIZE_BYTES, removeUploadedTempFile, uploadSingleFile };
