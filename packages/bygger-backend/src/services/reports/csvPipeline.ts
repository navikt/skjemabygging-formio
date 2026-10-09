import { getStatusFromErrorCode, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { stringify } from 'csv-stringify';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { HttpError } from '../../fetchUtils';
import { logger } from '../../logging/logger';

type ReportContext = {
  operation:
    | 'generate-rows'
    | 'list-forms'
    | 'list-publications'
    | 'list-recipients'
    | 'load-form'
    | 'load-publication'
    | 'list-pdfs'
    | 'load-translations'
    | 'resolve-recipient'
    | 'resolve-submission-types'
    | 'map-row';
  formPath?: string;
};

type CsvReport<Row extends object> = {
  columns: Record<keyof Row, string>;
  rows: (signal: AbortSignal, setContext: (context: ReportContext) => void) => AsyncIterable<Row>;
};

const errorMetadata = (error: unknown) => {
  if (error instanceof ResponseError) {
    return { errorType: 'ResponseError', httpStatus: getStatusFromErrorCode(error.errorCode) };
  }
  if (error instanceof HttpError) return { errorType: 'HttpError', httpStatus: error.response.status };
  if (error instanceof TypeError) return { errorType: 'TypeError' };
  if (error instanceof SyntaxError) return { errorType: 'SyntaxError' };
  return { errorType: error instanceof Error ? 'Error' : 'NonError' };
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
  let context: ReportContext = { operation: 'generate-rows' };
  let sourceFailure: { error: unknown; context: ReportContext } | undefined;
  const controller = new AbortController();
  const cancelOnClose = () => {
    if (!destination.writableFinished) controller.abort();
  };
  destination.once('close', cancelOnClose);
  if (destination.destroyed) controller.abort();
  try {
    const rows = async function* () {
      try {
        for await (const row of report.rows(controller.signal, (nextContext) => {
          context = nextContext;
        })) {
          controller.signal.throwIfAborted();
          rowCount++;
          yield { ...row, rowNumber: rowCount };
        }
      } catch (error) {
        // Pipeline destruction can throw a destination error back into the row generator.
        if (!destination.destroyed) sourceFailure = { error, context };
        throw error;
      }
    };
    await pipeline(
      Readable.from(rows(), { objectMode: true, highWaterMark: 1 }),
      stringify({
        bom: true,
        header: true,
        delimiter: ';',
        columns: [
          ...Object.entries(report.columns).map(([key, header]) => ({ key, header: String(header) })),
          // A numeric column helps Excel recognize headers in otherwise text-only reports.
          { key: 'rowNumber', header: 'radnummer' },
        ],
      }),
      destination,
    );
    logger.info('Report completed', { reportId, rowCount, durationMs: Math.round(performance.now() - startedAt) });
  } catch (error) {
    const cancelled =
      (controller.signal.aborted && error === controller.signal.reason) ||
      (sourceFailure?.error !== error &&
        error instanceof Error &&
        'code' in error &&
        error.code === 'ERR_STREAM_PREMATURE_CLOSE');
    controller.abort();
    const metadata = {
      reportId,
      rowCount,
      durationMs: Math.round(performance.now() - startedAt),
    };
    if (cancelled) {
      logger.info('Report cancelled', { ...metadata, ...context });
    } else {
      logger.warn('Report failed', {
        ...metadata,
        ...(sourceFailure && sourceFailure.error === error ? sourceFailure.context : { operation: 'write-csv' }),
        ...errorMetadata(error),
      });
    }
    throw error;
  } finally {
    destination.off('close', cancelOnClose);
  }
};

export { awaitReportCall, writeCsvReport };
export type { CsvReport };
