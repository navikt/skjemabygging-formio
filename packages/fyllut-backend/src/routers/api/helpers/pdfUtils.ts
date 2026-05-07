import { PdfFormData } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../../logger';

const stringifyPdf = (pdfData?: PdfFormData) => {
  if (!pdfData || typeof pdfData !== 'object') {
    const error = new Error('Missing pdfFormData to generate PDF');
    logger.warn(error.message, { pdfData });
    throw error;
  }

  try {
    return JSON.stringify(pdfData);
  } catch (error) {
    logger.warn('Could not stringify pdfData', pdfData, error);
    throw error;
  }
};

export { stringifyPdf };
