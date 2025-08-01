import { htmlUtils } from '@navikt/skjemadigitalisering-shared-components';
import {
  Form,
  FormsApiTranslation,
  objectUtils,
  TEXTS,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getFormTextsWithoutGloballyMaintained } from './formTextsUtils';

type CsvRow = {
  type: 'tekst' | 'html';
  order: string;
  text: string;
} & {
  [key in TranslationLang]?: string;
};

const removeLineBreaks = (text?: string) => (text ? text.replace(/(\r\n|\n|\r)/gm, ' ') : text);

const escapeQuote = (text?: string) => {
  if (typeof text === 'string' && text.includes('"')) {
    return text.replace(/"/g, '""');
  }
  return text;
};

const sanitizeForCsv = (text?: string) => escapeQuote(removeLineBreaks(text));

const getRowsForExport = (texts: string[], translations: FormsApiTranslation[]): CsvRow[] => {
  let textIndex = 0;
  return texts.flatMap((text) => {
    const translation = translations.find((translation) => translation.key === text);
    if (htmlUtils.isHtmlString(text)) {
      const nn = translation?.nn ? htmlUtils.getTexts(translation.nn) : [];
      const en = translation?.en ? htmlUtils.getTexts(translation.en) : [];
      const htmlTranslations = {
        nn: nn.filter((text) => text.trim().length > 0),
        en: en.filter((text) => text.trim().length > 0),
      };
      const htmlStrings = htmlUtils.getTexts(text);
      return createTranslationsHtmlRows(`${++textIndex}`.padStart(3, '0'), htmlStrings, htmlTranslations);
    } else {
      return createTranslationsTextRow(`${++textIndex}`.padStart(3, '0'), text, translation);
    }
  });
};

const getRowsForExportFromForm = (form: Form, translations: FormsApiTranslation[]) => {
  const formTexts = getFormTextsWithoutGloballyMaintained(form);
  return getRowsForExport(formTexts, translations);
};

const getRowsForExportFromGlobalTexts = (translations: FormsApiTranslation[]) => {
  const texts = getTranslationKeysForAllPredefinedTexts();
  return getRowsForExport(texts, translations);
};

const getTranslationKeysForAllPredefinedTexts = (): string[] => {
  const { grensesnitt, statiske, validering, common, pdfStatiske } = TEXTS;
  return [
    ...objectUtils.flattenToArray({ grensesnitt, statiske, common, pdfStatiske }, ([_key, value]) => value),
    ...objectUtils.flattenToArray(validering, ([key]) => key),
  ];
};

const getHeadersForExport = (translations: FormsApiTranslation[]) => {
  const hasNynorsk = translations.some((translation) => !!translation.nn);
  const hasEnglish = translations.some((translation) => !!translation.en);
  return [
    { label: 'Type', key: 'type' },
    { label: 'Rekkefølge', key: 'order' },
    { label: 'Skjematekster', key: 'text' },
    ...(hasNynorsk ? [{ label: 'Nynorsk', key: 'nn' }] : []),
    ...(hasEnglish ? [{ label: 'Engelsk', key: 'en' }] : []),
  ];
};

const createRow = (
  order: string,
  nb: string,
  nn?: string,
  en?: string,
  type: 'tekst' | 'html' = 'tekst',
  markAsGlobal?: boolean,
): CsvRow => {
  const sanitizedNN = sanitizeForCsv(nn)?.concat(markAsGlobal ? ' (Global Tekst)' : '');
  const sanitizedEN = sanitizeForCsv(en)?.concat(markAsGlobal ? ' (Global Tekst)' : '');

  return {
    type,
    order,
    text: sanitizeForCsv(nb)!,
    ...(sanitizedNN ? { nn: sanitizedNN } : {}),
    ...(sanitizedEN ? { en: sanitizedEN } : {}),
  };
};

const createTranslationsTextRow = (
  order: string,
  text: string,
  translation?: FormsApiTranslation,
  type: 'tekst' | 'html' = 'tekst',
): CsvRow => {
  if (!translation) {
    return createRow(order, text, undefined, undefined, type);
  }

  const markAsGlobal = !!translation.globalTranslationId;
  return createRow(order, text, translation.nn, translation.en, type, markAsGlobal);
};

const createTranslationsHtmlRows = (
  order: string,
  htmlStrings: string[],
  translations: { nn: string[]; en: string[] },
  htmlOrder: number = 0,
): CsvRow[] => {
  return htmlStrings.map((text, index) => {
    return createRow(
      `${order}-${String(++htmlOrder).padStart(3, '0')}`,
      text,
      translations.nn[index],
      translations.en[index],
      'html',
    );
  });
};

export { getHeadersForExport, getRowsForExportFromForm, getRowsForExportFromGlobalTexts };
