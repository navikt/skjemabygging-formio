import { PdfData, PdfFormData } from '@navikt/skjemadigitalisering-shared-domain';
import { htmlServerUtils } from '../../util';

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

export { sanitizeLabel, sanitizePdfFormData, sanitizeValue };
