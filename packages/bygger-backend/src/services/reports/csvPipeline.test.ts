import { parse } from 'csv-parse/sync';
import { Writable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { logger } from '../../logging/logger';
import { CsvReport, writeCsvReport } from './csvPipeline';
import { deferred } from './testHelpers';

describe('CSV pipeline', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes UTF-8 BOM and preserves Norwegian characters for spreadsheet applications', async () => {
    const chunks: Buffer[] = [];
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });
    await writeCsvReport(
      'utf8-test',
      {
        columns: { value: 'verdi' },
        rows: async function* () {
          yield { value: 'Ærlig øvelse på Ås' };
        },
      },
      destination,
    );
    const csv = Buffer.concat(chunks);
    expect(csv.subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]));
    expect(parse(csv, { bom: true, delimiter: ';', columns: true })).toEqual([{ verdi: 'Ærlig øvelse på Ås' }]);
  });

  it('respects a blocked slow sink and waits for its final callback', async () => {
    const firstWrite = deferred();
    const finalized = deferred();
    const chunks: string[] = [];
    let unblock: () => void = () => {};
    let finish: () => void = () => {};
    let produced = 0;
    let completed = false;
    const rowCount = 200;
    const report: CsvReport<{ value: string }> = {
      columns: { value: 'value' },
      rows: async function* () {
        for (let i = 0; i < rowCount; i++) {
          produced++;
          yield { value: `${i};"${'x'.repeat(8192)}"\nend` };
        }
      },
    };
    const destination = new Writable({
      highWaterMark: 1,
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString());
        if (chunks.length === 1) {
          unblock = callback;
          firstWrite.resolve();
        } else {
          callback();
        }
      },
      final(callback) {
        finish = callback;
        finalized.resolve();
      },
    });
    const completion = writeCsvReport('slow-test', report, destination).then(() => {
      completed = true;
    });
    await firstWrite.promise;
    await delay(20);
    expect(produced).toBeGreaterThan(0);
    expect(produced).toBeLessThan(rowCount);
    expect(completed).toBe(false);
    unblock();
    await finalized.promise;
    expect(completed).toBe(false);
    finish();
    await completion;
    const rows = parse(chunks.join(''), { bom: true, delimiter: ';', columns: true }) as { value: string }[];
    expect(rows).toHaveLength(rowCount);
    expect(rows[199].value).toBe(`199;"${'x'.repeat(8192)}"\nend`);
    expect(destination.writableFinished).toBe(true);
  });

  it('propagates destination write errors and stops producing rows', async () => {
    let produced = 0;
    const failure = new Error('Sink unavailable');
    const destination = new Writable({
      write(_chunk, _encoding, callback) {
        callback(failure);
      },
    });
    await expect(
      writeCsvReport(
        'failure-test',
        {
          columns: { value: 'value' },
          rows: async function* (signal) {
            for (let i = 0; i < 1000; i++) {
              signal.throwIfAborted();
              produced++;
              yield { value: 'x'.repeat(8192) };
            }
          },
        },
        destination,
      ),
    ).rejects.toThrow('Sink unavailable');
    const afterFailure = produced;
    await delay(10);
    expect(produced).toBe(afterFailure);
    expect(produced).toBeLessThan(1000);
    expect(destination.destroyed).toBe(true);
  });

  it('propagates destination finalization errors rather than completing successfully', async () => {
    const destination = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
      final(callback) {
        callback(new Error('Finalization failed'));
      },
    });
    await expect(
      writeCsvReport(
        'final-test',
        {
          columns: { value: 'value' },
          rows: async function* () {
            yield { value: 'row' };
          },
        },
        destination,
      ),
    ).rejects.toThrow('Finalization failed');
  });

  it('propagates CSV serialization failures and destroys the destination', async () => {
    const destination = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    await expect(
      writeCsvReport(
        'serialization-test',
        {
          columns: { value: 'value' },
          rows: async function* () {
            yield {
              value: {
                toJSON: () => {
                  throw new Error('Serialization failed');
                },
              },
            };
          },
        },
        destination,
      ),
    ).rejects.toThrow('Serialization failed');
    expect(destination.destroyed).toBe(true);
  });

  it('rejects a disconnected destination and aborts the generator', async () => {
    let aborted = false;
    let produced = 0;
    const destination = new Writable({
      write(_chunk, _encoding, _callback) {
        this.destroy();
      },
    });
    await expect(
      writeCsvReport(
        'disconnect-test',
        {
          columns: { value: 'value' },
          rows: async function* (signal) {
            signal.addEventListener(
              'abort',
              () => {
                aborted = true;
              },
              { once: true },
            );
            for (let i = 0; i < 1000; i++) {
              signal.throwIfAborted();
              produced++;
              yield { value: 'x'.repeat(8192) };
            }
          },
        },
        destination,
      ),
    ).rejects.toThrow();
    expect(aborted).toBe(true);
    expect(produced).toBeLessThan(1000);
  });

  it('rejects an already destroyed destination without producing data', async () => {
    const destination = new Writable();
    destination.destroy();
    let produced = false;
    await expect(
      writeCsvReport(
        'already-disconnected-test',
        {
          columns: { value: 'value' },
          rows: async function* (signal) {
            signal.throwIfAborted();
            produced = true;
            yield { value: 'row' };
          },
        },
        destination,
      ),
    ).rejects.toThrow();
    expect(produced).toBe(false);
  });

  it('rejects an upstream failure after output starts and logs only report metadata', async () => {
    const logged = vi.spyOn(logger, 'warn');
    const chunks: string[] = [];
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });
    await expect(
      writeCsvReport(
        'source-failure-test',
        {
          columns: { value: 'value' },
          rows: async function* () {
            yield { value: 'example row' };
            throw new Error('upstream error must not be logged');
          },
        },
        destination,
      ),
    ).rejects.toThrow('upstream error must not be logged');
    expect(chunks.join('')).toContain('example row');
    expect(chunks.join('')).not.toContain('upstream');
    expect(destination.destroyed).toBe(true);
    expect(logged).toHaveBeenCalledWith('Report failed or cancelled', {
      reportId: 'source-failure-test',
      rowCount: 1,
      durationMs: expect.any(Number),
    });
  });
});
