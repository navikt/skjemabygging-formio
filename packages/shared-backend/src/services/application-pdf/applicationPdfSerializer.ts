import { PdfData, PdfFormData } from '@navikt/skjemadigitalisering-shared-domain';
import { htmlServerUtils } from '../../util';

const sanitizeValue = (value?: string | number | null) => {
  return typeof value === 'string' ? htmlServerUtils.sanitize(value, { ALLOWED_TAGS: ['#text'] }) : undefined;
};

const sanitizeList = (list?: PdfData[]) => {
  return list ? list.map((item) => sanitizeData(item)) : undefined;
};

const sanitizeData = (data: PdfData): PdfData => {
  const verdi = sanitizeValue(data.verdi);
  const verdiliste = sanitizeList(data.verdiliste);

  return {
    ...data,
    ...(verdi !== undefined && { verdi }),
    ...(verdiliste && { verdiliste }),
  };
};

const sanitizePdfFormData = (pdfFormData: PdfFormData): PdfFormData => {
  return {
    ...pdfFormData,
    verdiliste: sanitizeList(pdfFormData.verdiliste),
  };
};

export { sanitizePdfFormData, sanitizeValue };
