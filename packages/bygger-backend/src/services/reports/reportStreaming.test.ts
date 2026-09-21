import { Form, PublishedTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { Writable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { mockDeep } from 'vitest-mock-extended';
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
  components: [],
  properties: { skjemanummer: path, tema: 'TEST', submissionTypes: [], subsequentSubmissionTypes: [] },
});

describe('Report streaming orchestration', () => {
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
    const failure = generation.catch((error: unknown) => error);
    await detailStarted.promise;
    destination.destroy();
    expect(await failure).toBeInstanceOf(Error);
    pendingDetail.resolve(formFor('one'));
    await delay(10);
    expect(dependencies.formsService.get).toHaveBeenCalledTimes(1);
    expect(dependencies.staticPdfService.getAll).not.toHaveBeenCalled();
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
