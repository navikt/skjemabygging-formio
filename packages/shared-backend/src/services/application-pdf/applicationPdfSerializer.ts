import { PdfData, PdfFormData } from '@navikt/skjemadigitalisering-shared-domain';
import { htmlServerUtils } from '../../util';

// See https://trello.com/c/HaHNjy1n. Replace em dash (U+2014) with hyphen-minus (U+002D) for Familie-pdf.
const normalizeText = (value: string) => value.replaceAll('—', '-');

const sanitizeValue = (value?: string | number | null) => {
  return typeof value === 'string'
    ? normalizeText(htmlServerUtils.sanitize(value, { ALLOWED_TAGS: ['#text'] }))
    : undefined;
};

const sanitizeList = (list?: PdfData[]) => {
  return list ? list.map((item) => sanitizeData(item)) : undefined;
};

const sanitizeData = (data: PdfData): PdfData => {
  const label = data.label ? normalizeText(data.label) : undefined;
  const verdi = sanitizeValue(data.verdi);
  const verdiliste = sanitizeList(data.verdiliste);

  return {
    ...data,
    ...(label !== undefined && { label }),
    ...(verdi !== undefined && { verdi }),
    ...(verdiliste && { verdiliste }),
  };
};

const sanitizePdfFormData = (pdfFormData: PdfFormData): PdfFormData => {
  return {
    ...pdfFormData,
    ...(pdfFormData.label && { label: normalizeText(pdfFormData.label) }),
    verdiliste: sanitizeList(pdfFormData.verdiliste),
  };
};

export { sanitizePdfFormData, sanitizeValue };
