import { createTemporaryFileStorage } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AsyncResource } from 'node:async_hooks';
import { unlink } from 'node:fs/promises';
import { logger } from '../../../logger';

// Allow files up to 150MB by default, can be overridden per route if needed
const MAX_UPLOAD_FILE_SIZE_BYTES = 150 * 1024 * 1024;

interface UploadSingleFileOptions {
  maxFileSizeBytes?: number;
}

const uploadSingleFile = (fieldName: string, options: UploadSingleFileOptions = {}) => {
  const maxFileSizeBytes = options.maxFileSizeBytes ?? MAX_UPLOAD_FILE_SIZE_BYTES;
  const upload = multer({
    storage: createTemporaryFileStorage(),
    limits: { fileSize: maxFileSizeBytes },
  }).single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    const logMeta = {
      route: req.originalUrl?.split('?')[0],
      fieldName,
      innsendingsId: req.params?.innsendingsId ?? req.getNologinContext?.()?.innsendingsId,
      attachmentId: req.params?.attachmentId,
    };
    // Express restores route parameters before application-level error handling.
    res.locals.requestLogMeta = logMeta;
    const handleUpload: NextFunction = (error) => {
      if (
        error instanceof Error &&
        'storageErrors' in error &&
        Array.isArray(error.storageErrors) &&
        error.storageErrors.length > 0
      ) {
        return next(
          new AggregateError(error.storageErrors, 'Failed to remove temporary upload files.', { cause: error }),
        );
      }

      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
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
        return next(error);
      }

      if (req.file) {
        logger.info('Upload stored in temporary file', {
          ...logMeta,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
        });
      }

      next();
    };
    // Multer's stream events can run outside the request's correlation context.
    upload(req, res, AsyncResource.bind(handleUpload));
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

export { MAX_UPLOAD_FILE_SIZE_BYTES, removeUploadedTempFile, uploadSingleFile };
