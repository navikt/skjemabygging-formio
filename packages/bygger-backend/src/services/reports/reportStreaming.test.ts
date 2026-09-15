import { DeclarationType, Form, PublishedTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { parse } from 'csv-parse';
import { Writable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { getHeapStatistics } from 'node:v8';
import { mockDeep } from 'vitest-mock-extended';
import ReportService from '../ReportService';
import { deferred } from './testHelpers';
import { ReportDependencies } from './types';

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

  it.each([
    { sink: 'normal', writeDelayMs: 0 },
    { sink: 'slow', writeDelayMs: 5 },
  ])(
    'measures a synthetic sequential summary download to a $sink sink without retaining CSV output',
    async ({ sink, writeDelayMs }) => {
      const count = 300;
      const compactForms = Array.from({ length: count }, (_, i) => {
        const { components: _components, ...compact } = formFor(`example-${i}`);
        compact.properties.declarationType = DeclarationType.custom;
        compact.properties.declarationText = 'Example; "declaration"\n'.repeat(100);
        return compact;
      });
      const calls = { list: 0, recipients: 0, detail: 0, pdf: 0 };
      let inFlight = 0;
      let maxInFlight = 0;
      const request = async () => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await delay(1);
        inFlight--;
      };
      const dependencies: ReportDependencies = {
        formsService: {
          getAll: async <T extends Partial<Form>>() => {
            calls.list++;
            return compactForms as T[];
          },
          get: async (path) => {
            calls.detail++;
            await request();
            return {
              ...formFor(path),
              components: Array.from({ length: 60 }, (_, i) => ({
                type: 'textfield',
                key: `field${i}`,
                label: `Example field ${i} ${'x'.repeat(250)}`,
              })),
            };
          },
        },
        recipientService: {
          getAll: async () => {
            calls.recipients++;
            return [];
          },
        },
        staticPdfService: {
          getAll: async () => {
            calls.pdf++;
            await request();
            return [];
          },
        },
        formPublicationsService: mockDeep<ReportDependencies['formPublicationsService']>(),
      };
      const compactListBytes = Buffer.byteLength(JSON.stringify(compactForms));
      const baselineHeap = getHeapStatistics().used_heap_size;
      let peakHeap = baselineHeap;
      let firstByteMs = 0;
      let bytes = 0;
      let rowCount = 0;
      let firstRow: Record<string, string> | undefined;
      const parser = parse({ delimiter: ';', columns: true });
      parser.on('data', (row: Record<string, string>) => {
        rowCount++;
        if (!firstRow) firstRow = row;
      });
      const parsed = new Promise<void>((resolve, reject) => {
        parser.on('end', resolve);
        parser.on('error', reject);
      });
      const startedAt = performance.now();
      const destination = new Writable({
        highWaterMark: 1024,
        write(chunk, _encoding, callback) {
          if (!bytes) firstByteMs = performance.now() - startedAt;
          bytes += chunk.length;
          parser.write(chunk);
          peakHeap = Math.max(peakHeap, getHeapStatistics().used_heap_size);
          if (writeDelayMs) setTimeout(callback, writeDelayMs);
          else callback();
        },
        final(callback) {
          parser.end();
          callback();
        },
      });
      await new ReportService(dependencies).generate('all-forms-summary', destination);
      await parsed;
      expect(rowCount).toBe(count);
      expect(maxInFlight).toBe(1);
      expect(calls).toEqual({ list: 1, recipients: 1, detail: count, pdf: count });
      expect(firstRow).toMatchObject({
        path: 'example-0',
        erklæringstype: 'Tilpasset',
        'har opplastede PDF-er': 'nei',
        'STATIC_PDF aktivert': 'nei',
        'første publiseringsdato': '',
      });
      console.info('Synthetic report measurement (not production)', {
        sink,
        writeDelayMs,
        forms: count,
        serviceCalls: Object.values(calls).reduce((total, value) => total + value, 0),
        compactListBytes,
        maxInFlight,
        rows: rowCount,
        bytes,
        firstByteMs: Math.round(firstByteMs),
        durationMs: Math.round(performance.now() - startedAt),
        baselineHeapBytes: baselineHeap,
        peakHeapBytes: peakHeap,
      });
    },
    15000,
  );
});
