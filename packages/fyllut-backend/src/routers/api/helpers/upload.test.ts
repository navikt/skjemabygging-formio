import { errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import express from 'express';
import request from 'supertest';
import { HttpError } from '../../../utils/errors/HttpError';
import { createUploadResponseError, removeUploadedTempFile, uploadSingleFile } from './upload';

const createUploadApp = (maxFileSizeBytes?: number) => {
  const app = express();
  app.post('/upload', uploadSingleFile('filinnhold', { maxFileSizeBytes }), async (req, res) => {
    const file = req.file;
    try {
      if (!file) {
        return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
      }

      return res.status(201).json({
        fileName: file.originalname,
        size: file.size,
      });
    } finally {
      await removeUploadedTempFile(file);
    }
  });
  app.use(errorHandler);

  return app;
};

describe('uploadSingleFile', () => {
  it('allows files under configured size limit', async () => {
    const app = createUploadApp(10);

    const response = await request(app)
      .post('/upload')
      .attach('filinnhold', Buffer.from('12345'), 'small.txt')
      .expect(201);

    expect(response.body).toEqual({ fileName: 'small.txt', size: 5 });
  });

  it('returns bad request when file exceeds configured size limit', async () => {
    const app = createUploadApp(5);

    const response = await request(app)
      .post('/upload')
      .attach('filinnhold', Buffer.from('123456'), 'large.txt')
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Uploaded file exceeds maximum size.',
      errorCode: 'BAD_REQUEST',
      userMessage: TEXTS.statiske.uploadFile.fileTooLargeError,
    });
  });
});

describe('createUploadResponseError', () => {
  it('maps too many pages to ResponseError with userMessage', () => {
    const error = new HttpError('Upload failed');
    error.http_status = 400;
    error.http_response_body = { errorCode: 'illegalAction.fileWithTooManyPages' };
    error.correlation_id = 'corr-id';

    expect(createUploadResponseError(error)).toEqual(
      new ResponseError(
        'BAD_REQUEST',
        'Upload failed because file has too many pages',
        'corr-id',
        TEXTS.statiske.uploadFile.uploadFileToManyPagesError,
      ),
    );
  });

  it('maps temporarily unavailable to ResponseError with userMessage', () => {
    const error = new HttpError('Upload failed');
    error.http_status = 503;
    error.http_response_body = { errorCode: 'temporarilyUnavailable' };

    expect(createUploadResponseError(error)).toEqual(
      new ResponseError(
        'SERVICE_UNAVAILABLE',
        'Upload temporarily unavailable',
        undefined,
        TEXTS.statiske.nologin.temporarilyUnavailable,
      ),
    );
  });
});
