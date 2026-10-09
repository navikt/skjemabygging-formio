import { Form, PublishedTranslations, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Writable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { mockDeep } from 'vitest-mock-extended';
import { logger } from '../../logging/logger';
import ReportService from '../ReportService';
import { ReportDependencies } from './types';

const deferred = <T = void>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
};

const formFor = (path: string): Form => ({
  path,
  skjemanummer: path,
  title: `Example ${path}`,
  status: 'published',
  components: [],
  properties: { skjemanummer: path, tema: 'TEST', submissionTypes: [], subsequentSubmissionTypes: [] },
});

describe('Report streaming orchestration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { failingCall: 'forms', operation: 'list-forms', formPath: undefined },
    { failingCall: 'recipients', operation: 'list-recipients', formPath: undefined },
    { failingCall: 'details', operation: 'load-form', formPath: 'one' },
    { failingCall: 'pdfs', operation: 'list-pdfs', formPath: 'one' },
  ])('logs safe context when $failingCall fails', async ({ failingCall, operation, formPath }) => {
    const dependencies = mockDeep<ReportDependencies>();
    const failure = new ResponseError('SERVICE_UNAVAILABLE', 'Private upstream response');
    const logged = vi.spyOn(logger, 'warn');
    dependencies.formsService.getAll.mockResolvedValue([formFor('one')]);
    dependencies.recipientService.getAll.mockResolvedValue([]);
    dependencies.formsService.get.mockResolvedValue(formFor('one'));
    dependencies.staticPdfService.getAll.mockResolvedValue([]);
    if (failingCall === 'forms') dependencies.formsService.getAll.mockRejectedValue(failure);
    if (failingCall === 'recipients') dependencies.recipientService.getAll.mockRejectedValue(failure);
    if (failingCall === 'details') dependencies.formsService.get.mockRejectedValue(failure);
    if (failingCall === 'pdfs') dependencies.staticPdfService.getAll.mockRejectedValue(failure);

    await expect(new ReportService(dependencies).generate('all-forms-summary', new Writable())).rejects.toBe(failure);

    expect(logged).toHaveBeenCalledExactlyOnceWith('Report failed', {
      reportId: 'all-forms-summary',
      rowCount: 0,
      durationMs: expect.any(Number),
      operation,
      ...(formPath && { formPath }),
      errorType: 'ResponseError',
      httpStatus: 503,
    });
  });

  it('identifies the form whose recipient cannot be resolved without logging its data', async () => {
    const dependencies = mockDeep<ReportDependencies>();
    const form = formFor('missing-recipient');
    form.title = 'Private title';
    form.properties.mottaksadresseId = 'Private recipient ID';
    dependencies.formsService.getAll.mockResolvedValue([form]);
    dependencies.recipientService.getAll.mockResolvedValue([]);
    dependencies.formsService.get.mockResolvedValue(form);
    dependencies.staticPdfService.getAll.mockResolvedValue([]);
    const logged = vi.spyOn(logger, 'warn');

    await expect(new ReportService(dependencies).generate('all-forms-summary', new Writable())).rejects.toThrow(
      'Report recipient lookup failed',
    );

    expect(logged).toHaveBeenCalledExactlyOnceWith('Report failed', {
      reportId: 'all-forms-summary',
      rowCount: 0,
      durationMs: expect.any(Number),
      operation: 'resolve-recipient',
      formPath: 'missing-recipient',
      errorType: 'ResponseError',
      httpStatus: 500,
    });
  });

  it.each([
    { reportId: 'forms-published-languages', operation: 'list-publications', formPath: undefined },
    { reportId: 'forms-published-languages', operation: 'load-publication', formPath: 'one' },
    { reportId: 'forms-published-languages', operation: 'load-translations', formPath: 'one' },
    { reportId: 'all-forms-and-attachments', operation: 'list-forms', formPath: undefined },
    { reportId: 'all-forms-and-attachments', operation: 'load-form', formPath: 'one' },
    { reportId: 'unpublished-forms', operation: 'list-forms', formPath: undefined },
  ])('identifies $operation failures in $reportId', async ({ reportId, operation, formPath }) => {
    const dependencies = mockDeep<ReportDependencies>();
    const failure = new Error('Private upstream response');
    const logged = vi.spyOn(logger, 'warn');
    dependencies.formsService.getAll.mockResolvedValue([formFor('one')]);
    dependencies.formPublicationsService.getAll.mockResolvedValue([formFor('one')]);
    dependencies.formPublicationsService.get.mockResolvedValue(formFor('one'));
    if (operation === 'list-publications') dependencies.formPublicationsService.getAll.mockRejectedValue(failure);
    if (operation === 'load-publication') dependencies.formPublicationsService.get.mockRejectedValue(failure);
    if (operation === 'load-translations') {
      dependencies.formPublicationsService.getTranslations.mockRejectedValue(failure);
    }
    if (operation === 'list-forms') dependencies.formsService.getAll.mockRejectedValue(failure);
    if (operation === 'load-form') dependencies.formsService.get.mockRejectedValue(failure);

    await expect(new ReportService(dependencies).generate(reportId, new Writable())).rejects.toBe(failure);

    expect(logged).toHaveBeenCalledExactlyOnceWith('Report failed', {
      reportId,
      rowCount: 0,
      durationMs: expect.any(Number),
      operation,
      ...(formPath && { formPath }),
      errorType: 'Error',
    });
  });

  it('logs the failing second form rather than the last exported form', async () => {
    const dependencies = mockDeep<ReportDependencies>();
    const logged = vi.spyOn(logger, 'warn');
    dependencies.formsService.getAll.mockResolvedValue([formFor('one'), formFor('two')]);
    dependencies.recipientService.getAll.mockResolvedValue([]);
    dependencies.formsService.get.mockImplementation(async (path) => {
      if (path === 'two') throw new TypeError('Private details');
      return formFor(path);
    });
    dependencies.staticPdfService.getAll.mockResolvedValue([]);
    const destination = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    await expect(new ReportService(dependencies).generate('all-forms-summary', destination)).rejects.toThrow();

    expect(logged).toHaveBeenCalledExactlyOnceWith('Report failed', {
      reportId: 'all-forms-summary',
      rowCount: 1,
      durationMs: expect.any(Number),
      operation: 'load-form',
      formPath: 'two',
      errorType: 'TypeError',
    });
  });

  it('does not start another lookup after disconnection during an in-flight detail request', async () => {
    const dependencies = mockDeep<ReportDependencies>();
    const pendingDetail = deferred<Form>();
    const detailStarted = deferred();
    dependencies.formsService.getAll.mockResolvedValue([formFor('one'), formFor('two')]);
    dependencies.recipientService.getAll.mockResolvedValue([]);
    dependencies.formsService.get.mockImplementation(() => {
      detailStarted.resolve();
      return pendingDetail.promise;
    });
    const destination = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    const generation = new ReportService(dependencies).generate('all-forms-summary', destination);
    const cancelled = vi.spyOn(logger, 'info');
    const failed = vi.spyOn(logger, 'warn');
    const failure = generation.catch((error: unknown) => error);
    await detailStarted.promise;
    destination.destroy();
    expect(await failure).toBeInstanceOf(Error);
    pendingDetail.resolve(formFor('one'));
    await delay(10);
    expect(dependencies.formsService.get).toHaveBeenCalledTimes(1);
    expect(dependencies.staticPdfService.getAll).not.toHaveBeenCalled();
    expect(cancelled).toHaveBeenCalledWith('Report cancelled', {
      reportId: 'all-forms-summary',
      rowCount: 0,
      durationMs: expect.any(Number),
      operation: 'load-form',
      formPath: 'one',
    });
    expect(failed).not.toHaveBeenCalled();
  });

  it.each(['list', 'recipients', 'pdf'])('stops after cancellation during the %s lookup', async (pending) => {
    const dependencies = mockDeep<ReportDependencies>();
    const release = deferred();
    const started = deferred();
    const wait = async () => {
      started.resolve();
      await release.promise;
    };
    dependencies.formsService.getAll.mockImplementation(async () => {
      if (pending === 'list') await wait();
      return [formFor('one'), formFor('two')];
    });
    dependencies.recipientService.getAll.mockImplementation(async () => {
      if (pending === 'recipients') await wait();
      return [];
    });
    dependencies.formsService.get.mockImplementation(async (path) => formFor(path));
    dependencies.staticPdfService.getAll.mockImplementation(async () => {
      await wait();
      return [];
    });
    const destination = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    const failure = new ReportService(dependencies)
      .generate('all-forms-summary', destination)
      .catch((error: unknown) => error);
    await started.promise;
    destination.destroy();
    expect(await failure).toBeInstanceOf(Error);
    release.resolve();
    await delay(10);
    expect(dependencies.formsService.getAll).toHaveBeenCalledTimes(1);
    expect(dependencies.recipientService.getAll).toHaveBeenCalledTimes(pending === 'list' ? 0 : 1);
    expect(dependencies.formsService.get).toHaveBeenCalledTimes(pending === 'pdf' ? 1 : 0);
    expect(dependencies.staticPdfService.getAll).toHaveBeenCalledTimes(pending === 'pdf' ? 1 : 0);
  });

  it('stops further translation fetching after a client disconnect', async () => {
    const dependencies = mockDeep<ReportDependencies>();
    const started = deferred();
    const translations = deferred<PublishedTranslations>();
    dependencies.formPublicationsService.getAll.mockResolvedValue([formFor('one'), formFor('two')]);
    dependencies.formPublicationsService.get.mockImplementation(async (path) => formFor(path));
    dependencies.formPublicationsService.getTranslations.mockImplementation(() => {
      started.resolve();
      return translations.promise;
    });
    const destination = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    const failure = new ReportService(dependencies)
      .generate('forms-published-languages', destination)
      .catch((error: unknown) => error);
    await started.promise;
    destination.destroy();
    expect(await failure).toBeInstanceOf(Error);
    translations.resolve({ publishedAt: '2025-01-01', publishedBy: 'example', translations: { nb: {} } });
    await delay(10);
    expect(dependencies.formPublicationsService.getTranslations).toHaveBeenCalledTimes(1);
  });

  it('fetches each form and its PDF metadata sequentially', async () => {
    const dependencies = mockDeep<ReportDependencies>();
    const calls: string[] = [];
    const firstDetail = deferred<Form>();
    const detailStarted = deferred();
    const firstPdf = deferred();
    const pdfStarted = deferred();
    dependencies.formsService.getAll.mockResolvedValue([formFor('one'), formFor('two')]);
    dependencies.recipientService.getAll.mockResolvedValue([]);
    dependencies.formsService.get.mockImplementation(async (path) => {
      calls.push(`detail:${path}`);
      if (path === 'one') {
        detailStarted.resolve();
        return firstDetail.promise;
      }
      return formFor(path);
    });
    dependencies.staticPdfService.getAll.mockImplementation(async ({ formPath }) => {
      calls.push(`pdf:${formPath}`);
      if (formPath === 'one') {
        pdfStarted.resolve();
        await firstPdf.promise;
      }
      return [];
    });
    const destination = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    const generation = new ReportService(dependencies).generate('all-forms-summary', destination);
    await detailStarted.promise;
    expect(calls).toEqual(['detail:one']);
    firstDetail.resolve(formFor('one'));
    await pdfStarted.promise;
    expect(calls).toEqual(['detail:one', 'pdf:one']);
    firstPdf.resolve();
    await generation;

    expect(calls).toEqual(['detail:one', 'pdf:one', 'detail:two', 'pdf:two']);
    expect(dependencies.formsService.getAll).toHaveBeenCalledTimes(1);
    expect(dependencies.recipientService.getAll).toHaveBeenCalledTimes(1);
    expect(destination.writableFinished).toBe(true);
  });
});
