import { PdfFormData, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import { MetricServiceConfig } from '../metrics/metricService';
import applicationPdfApiService from './applicationPdfApiService';
import { createApplicationPdfMetrics } from './applicationPdfMetrics';
import { sanitizePdfFormData } from './applicationPdfSerializer';

interface CreatePdfProps {
  accessToken: string;
  pdfFormData?: PdfFormData;
}

type ApplicationPdfApiService = Pick<typeof applicationPdfApiService, 'createPdf'>;

type ApplicationPdfService = {
  createPdf: (props: CreatePdfProps) => Promise<string>;
};

interface CreateApplicationPdfServiceProps {
  baseUrl: string;
  metrics?: MetricServiceConfig;
  apiService?: ApplicationPdfApiService;
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
  apiService = applicationPdfApiService,
}: CreateApplicationPdfServiceProps): ApplicationPdfService => {
  const applicationPdfMetrics = createApplicationPdfMetrics(metrics);

  const createPdf = async (props: CreatePdfProps) => {
    const { accessToken, pdfFormData } = props;
    const validatedPdfFormData = requirePdfFormData(pdfFormData);

    applicationPdfMetrics.requests.increment();
    const timer = applicationPdfMetrics.duration.start();

    try {
      const pdf = await apiService.createPdf({
        baseUrl,
        accessToken,
        body: sanitizePdfFormData(validatedPdfFormData),
      });

      timer.success();
      return pdf;
    } catch (error) {
      applicationPdfMetrics.failures.increment();
      timer.failure();
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
