import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { htmlUtils, PdfData, PdfFormData } from '@navikt/skjemadigitalisering-shared-domain';
import { Response } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import teamLogger from '../../logging/TeamLogger';
import { LogMetadata } from '../../types/log';
import { responseToError } from '../../utils/errorHandling';
import fetchWithRetry, { HeadersInit } from '../../utils/fetchWithRetry';
import { appMetrics } from '../index';

const { familiePdfGeneratorUrl } = config;

/**
 * This is only needed while we allow labels to come from frontend.
 * Delete this when it comes from backend.
 */
export const sanitizeLabel = (label?: string): string | undefined => {
  if (!label) {
    return undefined;
  }

  return htmlUtils.sanitize(label, {
    ALLOWED_TAGS: ['H2', 'H3', 'P', 'OL', 'UL', 'DIV', 'A', 'B', 'STRONG', 'BR'],
    ALLOWED_ATTR: ['href'],
  });
};

export const sanitizeValue = (value?: string | number | null) => {
  return typeof value === 'string' ? htmlUtils.sanitize(value, { ALLOWED_TAGS: ['#text'] }) : undefined;
};

const sanitizeList = (list?: PdfData[]) => {
  return list ? list.map((item) => sanitizeData(item)) : undefined;
};

const sanitizeData = (data: PdfData): PdfData => {
  const label = sanitizeLabel(data.label);
  const verdi = sanitizeValue(data.verdi);
  const verdiliste = sanitizeList(data?.verdiliste);

  return {
    ...data,
    ...(label && { label }),
    ...(verdi && { verdi }),
    ...(verdiliste && { verdiliste }),
  };
};

const sanitizePdfFormData = (pdfFormData: string): string => {
  const data: PdfFormData = JSON.parse(pdfFormData);
  if (!data || typeof data !== 'object') {
    return pdfFormData;
  }

  return JSON.stringify({
    ...data,
    label: sanitizeLabel(data.label),
    verdiliste: sanitizeList(data?.verdiliste),
  });
};

const createFormPdf = async (accessToken: string, pdfFormData: string, logMeta: LogMetadata = {}) => {
  const familiePdfUrl = `${familiePdfGeneratorUrl}/api/pdf/v3/opprett-pdf`;
  logger.info(`Creating PDF, calling ${familiePdfUrl}`, logMeta);

  appMetrics.familiePdfRequestsCounter.inc();
  let errorOccurred = false;
  const stopMetricRequestDuration = appMetrics.outgoingRequestDuration.startTimer({
    service: 'familiepdf',
    method: 'createPdf',
  });
  let response: Response | undefined;
  try {
    response = await fetchWithRetry(familiePdfUrl, {
      retry: 3,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-correlation-id': correlator.getId(),
        'Content-Type': 'application/json',
        accept: '*/*',
      } as HeadersInit,
      method: 'POST',
      body: sanitizePdfFormData(pdfFormData),
    });
  } catch (e) {
    errorOccurred = true;
    appMetrics.familiePdfFailuresCounter.inc();
    throw e;
  } finally {
    const error = errorOccurred || !response?.ok;
    const durationSeconds = stopMetricRequestDuration({ error: String(error) });
    logger.info(`Request to familie pdf service completed after ${durationSeconds} seconds`, {
      ...logMeta,
      error,
      durationSeconds,
    });
  }
  if (response?.ok) {
    return Buffer.from(await response.arrayBuffer());
  }

  appMetrics.familiePdfFailuresCounter.inc();

  const errorMessage = 'Could not create pdf';
  const isAuthError = response?.status === 401;
  if (!isAuthError) {
    await teamLogger.error(errorMessage, {
      ...logMeta,
      httpResponseStatus: response?.status,
      pdfRequestBody: pdfFormData,
    });
  }
  throw await responseToError(response, `${errorMessage}${isAuthError ? ', not authorized (401)' : ''}`, false);
};

const applicationService = {
  createFormPdf,
};

export default applicationService;
