import { stringify } from 'csv-stringify';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { logger } from '../../logging/logger';

type CsvReport<Row extends object> = {
  columns: Record<keyof Row, string>;
  rows: (signal: AbortSignal) => AsyncIterable<Row>;
};

const awaitReportCall = async <T>(signal: AbortSignal, call: () => Promise<T>): Promise<T> => {
  signal.throwIfAborted();
  let onAbort: () => void = () => {};
  const cancelled = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
  });
  try {
    // Existing services cannot cancel HTTP requests. Stop waiting and fetching further data on disconnect.
    return await Promise.race([call(), cancelled]);
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
};

const writeCsvReport = async <Row extends object>(reportId: string, report: CsvReport<Row>, destination: Writable) => {
  const startedAt = performance.now();
  let rowCount = 0;
  const controller = new AbortController();
  const cancelOnClose = () => {
    if (!destination.writableFinished) controller.abort();
  };
  destination.once('close', cancelOnClose);
  if (destination.destroyed) controller.abort();
  try {
    const rows = async function* () {
      for await (const row of report.rows(controller.signal)) {
        controller.signal.throwIfAborted();
        rowCount++;
        yield row;
      }
    };
    await pipeline(
      Readable.from(rows(), { objectMode: true, highWaterMark: 1 }),
      stringify({
        bom: true,
        header: true,
        delimiter: ';',
        columns: Object.entries(report.columns).map(([key, header]) => ({ key, header: String(header) })),
      }),
      destination,
    );
    logger.info('Report completed', { reportId, rowCount, durationMs: Math.round(performance.now() - startedAt) });
  } catch (error) {
    controller.abort();
    logger.warn('Report failed or cancelled', {
      reportId,
      rowCount,
      durationMs: Math.round(performance.now() - startedAt),
    });
    throw error;
  } finally {
    destination.off('close', cancelOnClose);
  }
};

export { awaitReportCall, writeCsvReport };
export type { CsvReport };
