import { logger } from '../../../logger';

const stringifyPdf = (pdfData) => {
  if (pdfData) {
    try {
      return JSON.stringify(pdfData).replaceAll('\\t', '  ');
    } catch (error) {
      logger.warn('Could not stringify pdfData', pdfData, error);
      throw error;
    }
  }

  logger.warn('Could not stringify pdfData, since it is not defined');
  return pdfData;
};

export { stringifyPdf };
