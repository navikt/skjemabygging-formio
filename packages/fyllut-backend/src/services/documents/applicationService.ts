import correlator from 'express-correlation-id';
import { Response } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { synchronousResponseToError } from '../../utils/errorHandling';
import fetchWithRetry, { HeadersInit } from '../../utils/fetchWithRetry';
import { appMetrics } from '../index';

const { familiePdfGeneratorUrl } = config;

const createFormPdf = async (accessToken: string, pdfFormData?: any) => {
  logger.info(`Creating PDF, calling ${familiePdfGeneratorUrl}/api/pdf/v3/opprett-pdf`);

  appMetrics.familiePdfRequestsCounter.inc();
  let errorOccurred = false;
  const stopMetricRequestDuration = appMetrics.outgoingRequestDuration.startTimer({
    service: 'familiepdf',
    method: 'createPdf',
  });
  let response: Response | undefined;
  try {
    response = await fetchWithRetry(`${familiePdfGeneratorUrl}/api/pdf/v3/opprett-pdf`, {
      retry: 3,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-correlation-id': correlator.getId(),
        'Content-Type': 'application/json',
        accept: '*/*',
      } as HeadersInit,
      method: 'POST',
      body: pdfFormData,
    });
  } catch (e) {
    errorOccurred = true;
    appMetrics.familiePdfFailuresCounter.inc();
    throw e;
  } finally {
    const error = errorOccurred || !response?.ok;
    const durationSeconds = stopMetricRequestDuration({ error: String(error) });
    logger.info(`Request to familie pdf service completed after ${durationSeconds} seconds`, {
      error,
      durationSeconds,
    });
  }
  if (response?.ok) {
    return Buffer.from(await response.arrayBuffer());
  }

  appMetrics.familiePdfFailuresCounter.inc();

  throw synchronousResponseToError(
    `Could not create pdf${response?.status === 401 ? ', not authorized (401)' : `, response: ${JSON.stringify(response)}`}`,
    {},
    response?.status,
    response?.url,
    true,
  );
};

const applicationService = {
  createFormPdf,
};

export default applicationService;
