import { PdfData, PdfFormData, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import { htmlServerUtils } from '../../util';
import applicationPdfApiService from './applicationPdfApiService';

/**
 * This is only needed while we allow labels to come from frontend.
 * Delete this when it comes from backend.
 */
const sanitizeLabel = (label?: string): string | undefined => {
  if (!label) {
    return undefined;
  }

  return htmlServerUtils.sanitize(label, {
    ALLOWED_TAGS: ['H2', 'H3', 'P', 'OL', 'UL', 'DIV', 'A', 'B', 'STRONG', 'BR'],
    ALLOWED_ATTR: ['href'],
  });
};

const sanitizeValue = (value?: string | number | null) => {
  return typeof value === 'string' ? htmlServerUtils.sanitize(value, { ALLOWED_TAGS: ['#text'] }) : undefined;
};

const sanitizeList = (list?: PdfData[]) => {
  return list ? list.map((item) => sanitizeData(item)) : undefined;
};

const sanitizeData = (data: PdfData): PdfData => {
  const label = sanitizeLabel(data.label);
  const verdi = sanitizeValue(data.verdi);
  const verdiliste = sanitizeList(data.verdiliste);

  return {
    ...data,
    ...(label && { label }),
    ...(verdi !== undefined && { verdi }),
    ...(verdiliste && { verdiliste }),
  };
};

const sanitizePdfFormData = (pdfFormData: PdfFormData): PdfFormData => {
  return {
    ...pdfFormData,
    label: sanitizeLabel(pdfFormData.label),
    verdiliste: sanitizeList(pdfFormData.verdiliste),
  };
};

interface CreatePdfProps {
  baseUrl: string;
  accessToken: string;
  pdfFormData?: PdfFormData;
}

const createPdf = async (props: CreatePdfProps) => {
  const { baseUrl, accessToken, pdfFormData } = props;

  if (!pdfFormData || typeof pdfFormData !== 'object') {
    const error = new ResponseError('BAD_REQUEST', 'Missing pdfFormData to generate PDF');
    logger.warn(error.message, { pdfFormData });
    throw error;
  }

  try {
    return await applicationPdfApiService.createPdf({
      baseUrl,
      accessToken,
      body: sanitizePdfFormData(pdfFormData),
    });
  } catch (error) {
    logger.warn('Could not create pdf', { error });
    throw error;
  }
};

const applicationPdfService = {
  createPdf,
};

export { sanitizeLabel, sanitizeValue };
export default applicationPdfService;
