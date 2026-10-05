import { ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AsyncLocalStorage } from 'node:async_hooks';
import { tmpdir } from 'node:os';
import { Readable } from 'node:stream';
import { logger } from '../../../logger';
import { mockRequest, mockResponse } from '../../../test/testHelpers';
import { MAX_UPLOAD_FILE_SIZE_BYTES, uploadSingleFile } from './upload';

const { upload, single, configureMulter } = vi.hoisted(() => ({
  upload: vi.fn<(req: Request, res: Response, next: NextFunction) => void>(),
  single: vi.fn<(fieldName: string) => ReturnType<multer.Multer['single']>>(),
  configureMulter: vi.fn<(options: multer.Options) => Pick<multer.Multer, 'single'>>(),
}));

vi.mock('multer', async (importOriginal) => {
  const actual = await importOriginal<{ default: typeof multer }>();
  return {
    ...actual,
    default: Object.assign(configureMulter, { MulterError: actual.default.MulterError }),
  };
});

const createRequest = (overrides: Partial<Request> = {}) =>
  Object.assign(mockRequest({}), {
    originalUrl: '/upload?access=hidden',
    aborted: false,
    destroyed: false,
    complete: true,
    ...overrides,
  });

const createFile = (): Express.Multer.File => ({
  fieldname: 'filinnhold',
  originalname: 'small.txt',
  encoding: '7bit',
  mimetype: 'text/plain',
  size: 5,
  destination: tmpdir(),
  filename: 'temporary-upload',
  path: `${tmpdir()}/temporary-upload`,
  buffer: Buffer.from('hello'),
  stream: Readable.from('hello'),
});

beforeEach(() => {
  upload.mockReset().mockImplementation((_req, _res, next) => next());
  single.mockReset().mockReturnValue(upload);
  configureMulter.mockReset().mockReturnValue({ single });
});

afterEach(() => vi.restoreAllMocks());

describe('uploadSingleFile', () => {
  it.each([undefined, 10])('configures the field and file-size limit: %s', (maxFileSizeBytes) => {
    const req = createRequest();
    const res = mockResponse();
    const next = vi.fn();

    uploadSingleFile('filinnhold', { maxFileSizeBytes })(req, res, next);

    expect(configureMulter).toHaveBeenCalledExactlyOnceWith({
      storage: expect.objectContaining({ _handleFile: expect.any(Function), _removeFile: expect.any(Function) }),
      limits: { fileSize: maxFileSizeBytes ?? MAX_UPLOAD_FILE_SIZE_BYTES },
    });
    expect(single).toHaveBeenCalledExactlyOnceWith('filinnhold');
    expect(upload).toHaveBeenCalledExactlyOnceWith(req, res, expect.any(Function));
    expect(next).toHaveBeenCalledExactlyOnceWith();
  });

  it('logs successful digital uploads with identifiers and without query parameters', () => {
    const info = vi.spyOn(logger, 'info');
    const next = vi.fn();
    const req = createRequest({
      originalUrl: '/digital/submission-1/attachments/attachment-1?access=hidden',
      params: { innsendingsId: 'submission-1', attachmentId: 'attachment-1' },
      file: createFile(),
    });

    uploadSingleFile('filinnhold')(req, mockResponse(), next);

    expect(info).toHaveBeenCalledExactlyOnceWith('Upload stored in temporary file', {
      route: '/digital/submission-1/attachments/attachment-1',
      fieldName: 'filinnhold',
      innsendingsId: 'submission-1',
      attachmentId: 'attachment-1',
      fileSize: 5,
      fileType: 'text/plain',
    });
    expect(next).toHaveBeenCalledExactlyOnceWith();
  });

  it('does not log a stored file when Multer supplies no file', () => {
    const info = vi.spyOn(logger, 'info');
    const next = vi.fn();

    uploadSingleFile('filinnhold')(createRequest(), mockResponse(), next);

    expect(info).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledExactlyOnceWith();
  });

  it('maps the Multer size-limit error without logging a duplicate warning', () => {
    const warn = vi.spyOn(logger, 'warn');
    const next = vi.fn();
    upload.mockImplementation((_req, _res, callback) => callback(new multer.MulterError('LIMIT_FILE_SIZE')));

    uploadSingleFile('filinnhold', { maxFileSizeBytes: 5 })(createRequest(), mockResponse(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0]).toBeInstanceOf(ResponseError);
    expect(next.mock.calls[0][0]).toMatchObject({
      message: 'Uploaded file exceeds maximum size.',
      errorCode: 'BAD_REQUEST',
      userMessage: TEXTS.statiske.uploadFile.fileTooLargeError,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('forwards an aborted no-login upload without logging or responding', () => {
    const info = vi.spyOn(logger, 'info');
    const warn = vi.spyOn(logger, 'warn');
    const res = mockResponse();
    const next = vi.fn();
    const req = createRequest({
      aborted: true,
      complete: false,
      originalUrl: '/nologin-application/attachments/attachment-1?access=hidden',
      params: { attachmentId: 'attachment-1' },
      getNologinContext: () => ({ innsendingsId: 'submission-1' }),
    });
    const error = new Error('Request aborted');
    upload.mockImplementation((_req, _res, callback) => callback(error));

    uploadSingleFile('filinnhold')(req, res, next);

    expect(info).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledExactlyOnceWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('forwards a premature stream close without logging or responding', () => {
    const info = vi.spyOn(logger, 'info');
    const res = mockResponse();
    const next = vi.fn();
    const req = createRequest({
      destroyed: true,
      complete: false,
      originalUrl: '/digital/submission-2/attachments/attachment-2?access=hidden',
      params: { innsendingsId: 'submission-2', attachmentId: 'attachment-2' },
    });
    const error = new Error('Request closed');
    upload.mockImplementation((_req, _res, callback) => callback(error));

    uploadSingleFile('filinnhold')(req, res, next);

    expect(info).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledExactlyOnceWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it.each([
    [new Error('Request aborted'), {}],
    [new Error('Request closed'), { destroyed: true, complete: true }],
    [new Error('stream failed'), { aborted: true, destroyed: true, complete: false }],
    [new multer.MulterError('LIMIT_UNEXPECTED_FILE'), {}],
  ])('forwards non-disconnect failures unchanged: %s', (error, state) => {
    const warn = vi.spyOn(logger, 'warn');
    const info = vi.spyOn(logger, 'info');
    const next = vi.fn();
    upload.mockImplementation((_req, _res, callback) => callback(error));

    uploadSingleFile('filinnhold')(createRequest(state), mockResponse(), next);

    expect(next).toHaveBeenCalledExactlyOnceWith(error);
    expect(warn).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
  });

  it('restores request context when forwarding an error from another async context', () => {
    const error = new Error('stream failed');
    const context = new AsyncLocalStorage<string>();
    let forwardedContext: string | undefined;
    const next = vi.fn(() => {
      forwardedContext = context.getStore();
    });
    upload.mockImplementation(() => {});
    context.run('upload-context', () => {
      uploadSingleFile('filinnhold')(createRequest(), mockResponse(), next);
    });
    const callback = upload.mock.calls[0][2];

    context.run('unrelated-context', () => callback(error));

    expect(next).toHaveBeenCalledExactlyOnceWith(error);
    expect(forwardedContext).toBe('upload-context');
  });

  it.each([new Error('Request aborted'), new multer.MulterError('LIMIT_FILE_SIZE')])(
    'forwards cleanup failures instead of treating %s as a normal client outcome',
    (uploadError) => {
      const cleanupError = new Error('Cannot remove temporary file');
      const error = Object.assign(uploadError, { storageErrors: [cleanupError] });
      const info = vi.spyOn(logger, 'info');
      const next = vi.fn();
      upload.mockImplementation((_req, _res, callback) => callback(error));

      uploadSingleFile('filinnhold')(createRequest({ aborted: true, complete: false }), mockResponse(), next);

      expect(next).toHaveBeenCalledOnce();
      const forwardedError = next.mock.calls[0][0];
      expect(forwardedError).toBeInstanceOf(AggregateError);
      expect(forwardedError.errors).toEqual([cleanupError]);
      expect(forwardedError.cause).toBe(error);
      expect(info).not.toHaveBeenCalled();
    },
  );
});
