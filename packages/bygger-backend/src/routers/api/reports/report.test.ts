import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import express, { Request, Response } from 'express';
import { createServer, Server } from 'node:http';
import { Writable } from 'node:stream';
import { mock, mockDeep } from 'vitest-mock-extended';
import { reportService } from '../../../services';
import ReportService from '../../../services/ReportService';
import { ReportDependencies } from '../../../services/reports/types';
import apiErrorHandler from '../helpers/apiErrorHandler';
import { ApiError } from '../helpers/errors';
import report from './report';

const deferred = <T = void>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
};

vi.mock('../../../services', () => ({
  reportService: { getReportDefinition: vi.fn(), generate: vi.fn() },
}));

describe('Report download route', () => {
  beforeEach(() => {
    vi.mocked(reportService.getReportDefinition).mockReturnValue({
      id: 'all-forms-summary',
      title: 'Summary',
      contentType: 'text/csv',
      fileExtension: 'csv',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('preserves download headers and waits for generation', async () => {
    const generated = deferred();
    vi.mocked(reportService.generate).mockReturnValue(generated.promise);
    const req = mock<Request>({ params: { reportId: 'all-forms-summary' } });
    const res = mock<Response>();
    const next = vi.fn();
    let complete = false;
    const completion = Promise.resolve(report(req, res, next)).then(() => {
      complete = true;
    });
    await Promise.resolve();
    expect(complete).toBe(false);
    expect(res.contentType).toHaveBeenCalledWith('text/csv; charset=utf-8');
    expect(res.attachment).toHaveBeenCalledWith('all-forms-summary.csv');
    expect(reportService.generate).toHaveBeenCalledWith('all-forms-summary', expect.any(Writable));
    generated.resolve();
    await completion;
    expect(next).not.toHaveBeenCalled();
  });

  it('passes pre-stream failures to the existing error handler', async () => {
    vi.mocked(reportService.generate).mockRejectedValue(new Error('failure'));
    const next = vi.fn();
    await report(
      mock<Request>({ params: { reportId: 'all-forms-summary' } }),
      mock<Response>({ headersSent: false, destroyed: false }),
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });

  it.each([
    [true, false],
    [true, true],
    [false, true],
  ])(
    'does not append JSON after a started or destroyed stream (headers %s, destroyed %s)',
    async (headersSent, destroyed) => {
      vi.mocked(reportService.generate).mockRejectedValue(new Error('failure'));
      const res = mock<Response>({ headersSent, destroyed });
      const next = vi.fn();
      await report(mock<Request>({ params: { reportId: 'all-forms-summary' } }), res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(res.destroy).toHaveBeenCalledTimes(destroyed ? 0 : 1);
    },
  );

  describe('HTTP streaming', () => {
    let server: Server;
    let baseUrl: string;
    let dependencies: ReturnType<typeof mockDeep<ReportDependencies>>;

    const formFor = (path: string): Form => ({
      path,
      skjemanummer: path,
      title: path,
      status: 'published',
      components: [],
      properties: { skjemanummer: path, tema: 'TEST', submissionTypes: [], subsequentSubmissionTypes: [] },
    });

    beforeEach(async () => {
      dependencies = mockDeep<ReportDependencies>();
      dependencies.formsService.getAll.mockResolvedValue([formFor('one'), formFor('two')]);
      dependencies.recipientService.getAll.mockResolvedValue([]);
      dependencies.formsService.get.mockImplementation(async (path) => formFor(path));
      dependencies.staticPdfService.getAll.mockResolvedValue([]);
      const service = new ReportService(dependencies);
      vi.mocked(reportService.getReportDefinition).mockImplementation((id) => service.getReportDefinition(id));
      vi.mocked(reportService.generate).mockImplementation((id, destination) => service.generate(id, destination));

      const app = express();
      app.get('/reports/:reportId', report);
      app.use(apiErrorHandler);
      server = createServer(app);
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Expected a local TCP address');
      baseUrl = `http://127.0.0.1:${address.port}/reports`;
    });

    afterEach(async () => {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    });

    it.each(['forms', 'recipients', 'details', 'pdfs', 'row'])(
      'returns a safe HTTP error if %s fails before the first CSV byte',
      async (stage) => {
        const failure = new Error('Private upstream response must not be exposed');
        if (stage === 'forms') dependencies.formsService.getAll.mockRejectedValue(failure);
        if (stage === 'recipients') dependencies.recipientService.getAll.mockRejectedValue(failure);
        if (stage === 'details') dependencies.formsService.get.mockRejectedValue(failure);
        if (stage === 'pdfs') dependencies.staticPdfService.getAll.mockRejectedValue(failure);
        if (stage === 'row') {
          const form = formFor('one');
          form.properties.mottaksadresseId = 'unknown-recipient';
          dependencies.formsService.getAll.mockResolvedValue([form]);
        }

        const response = await fetch(`${baseUrl}/all-forms-summary`);

        expect(response.status).toBe(500);
        expect(response.headers.get('content-type')).toContain('application/json');
        expect(response.headers.get('content-disposition')).toBeNull();
        expect(await response.json()).toEqual({ message: 'Kunne ikke generere rapport', functional: true });
      },
    );

    it.each([true, false])('finishes a successful CSV download, empty: %s', async (empty) => {
      const form = { ...formFor('one'), status: 'unpublished' as const };
      dependencies.formsService.getAll.mockResolvedValue(empty ? [] : [form]);

      const response = await fetch(`${baseUrl}/unpublished-forms`);
      const csv = Buffer.from(await response.arrayBuffer()).toString('utf8');

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/csv');
      expect(response.headers.get('content-disposition')).toContain('unpublished-forms.csv');
      expect(csv).toBe(
        '\uFEFFskjemanummer;skjematittel;avpublisert;avpublisert av;radnummer\n' + (empty ? '' : 'one;one;;;1\n'),
      );
    });

    it('terminates a partial CSV instead of appending an error response', async () => {
      const releaseFailure = deferred();
      dependencies.formsService.get.mockImplementation(async (path) => {
        if (path === 'two') {
          await releaseFailure.promise;
          throw new Error('Private upstream response must not be exposed');
        }
        return formFor(path);
      });

      const response = await fetch(`${baseUrl}/all-forms-summary`);
      const reader = response.body!.getReader();
      const firstChunk = await reader.read();
      expect(response.status).toBe(200);
      expect(Buffer.from(firstChunk.value!).toString('utf8')).toContain('skjemanummer;');
      releaseFailure.resolve();

      const remainingChunks: Uint8Array[] = [];
      const consume = async () => {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) return;
          remainingChunks.push(chunk.value);
        }
      };
      await expect(consume()).rejects.toThrow();
      const downloaded = Buffer.concat([firstChunk.value!, ...remainingChunks]).toString('utf8');
      expect(downloaded).not.toContain('Kunne ikke generere rapport');
      expect(downloaded).not.toContain('Private upstream response');
      expect(dependencies.staticPdfService.getAll).toHaveBeenCalledTimes(1);
    });

    it('cancels an in-flight lookup when the HTTP client disconnects before output', async () => {
      const started = deferred();
      const finished = deferred();
      const pending = deferred<Form[]>();
      dependencies.formsService.getAll.mockImplementation(() => {
        started.resolve();
        return pending.promise;
      });
      const service = new ReportService(dependencies);
      vi.mocked(reportService.generate).mockImplementation(async (id, destination) => {
        try {
          await service.generate(id, destination);
        } finally {
          finished.resolve();
        }
      });
      const controller = new AbortController();
      const request = fetch(`${baseUrl}/all-forms-summary`, { signal: controller.signal });
      const failure = request.catch((error: unknown) => error);
      await started.promise;
      controller.abort();
      await expect(failure).resolves.toBeInstanceOf(Error);
      await finished.promise;

      expect(dependencies.recipientService.getAll).not.toHaveBeenCalled();
      pending.resolve([]);
    });
  });
});
