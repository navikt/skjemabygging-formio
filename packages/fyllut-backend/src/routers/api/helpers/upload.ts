import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { logger } from '../../../logger';

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
        return res.status(400).json({
          message: 'Feil ved opplasting av fil. Filen er for stor.',
          errorCode: 'BAD_REQUEST',
        });
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

export { MAX_UPLOAD_FILE_SIZE_BYTES, removeUploadedTempFile, uploadSingleFile };
