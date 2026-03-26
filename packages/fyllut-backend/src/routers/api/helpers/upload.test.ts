import express from 'express';
import request from 'supertest';
import { removeUploadedTempFile, uploadSingleFile } from './upload';

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

    expect(response.body).toEqual({
      message: 'Feil ved opplasting av fil. Filen er for stor.',
      errorCode: 'BAD_REQUEST',
    });
  });
});
