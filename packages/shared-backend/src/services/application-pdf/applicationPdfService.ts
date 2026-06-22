import { PdfFormData, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import { teamLogger } from '../../shared/logger/teamLogger';
import { MetricServiceConfig } from '../metrics/metricService';
import applicationPdfClient from './applicationPdfClient';
import { createApplicationPdfMetrics } from './applicationPdfMetrics';
import { sanitizePdfFormData } from './applicationPdfSerializer';

interface CreatePdfProps {
  accessToken: string;
  pdfFormData?: PdfFormData;
}

type ApplicationPdfClient = Pick<typeof applicationPdfClient, 'createPdf'>;

type ApplicationPdfService = {
  createPdf: (props: CreatePdfProps) => Promise<string>;
};

interface CreateApplicationPdfServiceProps {
  baseUrl: string;
  metrics?: MetricServiceConfig;
  client?: ApplicationPdfClient;
}

const requirePdfFormData = (pdfFormData?: PdfFormData): PdfFormData => {
  if (pdfFormData && typeof pdfFormData === 'object') {
    return pdfFormData;
  }

  const error = new ResponseError('BAD_REQUEST', 'Missing pdfFormData to generate PDF');
  logger.warn(error.message, { pdfFormData });
  throw error;
};

const createApplicationPdfService = ({
  baseUrl,
  metrics,
  client = applicationPdfClient,
}: CreateApplicationPdfServiceProps): ApplicationPdfService => {
  const applicationPdfMetrics = createApplicationPdfMetrics(metrics);

  const createPdf = async (props: CreatePdfProps) => {
    const { accessToken, pdfFormData } = props;
    const validatedPdfFormData = requirePdfFormData(pdfFormData);
    const sanitizedPdfFormData = sanitizePdfFormData(validatedPdfFormData);

    applicationPdfMetrics.requests.increment();
    const timer = applicationPdfMetrics.duration.start();

    try {
      const pdf = await client.createPdf({
        baseUrl,
        accessToken,
        body: sanitizedPdfFormData,
      });

      timer.success();
      return pdf;
    } catch (error) {
      applicationPdfMetrics.failures.increment();
      timer.failure();
      const isUnauthorized = error instanceof ResponseError && error.errorCode === 'UNAUTHORIZED';
      if (!isUnauthorized) {
        teamLogger.error('Could not create pdf', {
          skjemanummer: validatedPdfFormData.skjemanummer ?? undefined,
          httpResponseStatus: undefined,
          pdfRequestBody: JSON.stringify(sanitizedPdfFormData),
        });
      }
      logger.warn('Could not create pdf', { error });
      throw error;
    }
  };

  return {
    createPdf,
  };
};

export { createApplicationPdfService };
export type { ApplicationPdfService };
