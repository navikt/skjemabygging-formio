import { SubmissionType, translationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { awaitReportCall, CsvReport } from '../csvPipeline';
import { formatSubmissionTypes, isNotTestForm, ReportDependencies } from '../types';

type PublishedLanguagesRow = {
  formNumber: string;
  languages: string;
  titleNb: string;
  titleNn: string;
  titleEn: string;
  submissionTypes: string;
};

// Published revisions can retain the legacy field after the current form has been migrated.
const getPublishedSubmissionTypes = ({
  submissionTypes,
  innsending,
}: {
  submissionTypes?: SubmissionType[];
  innsending?: unknown;
}): SubmissionType[] => {
  if (submissionTypes !== undefined) return submissionTypes;
  switch (innsending) {
    case undefined:
    case 'INGEN':
      return [];
    case 'KUN_PAPIR':
      return ['PAPER'];
    case 'KUN_DIGITAL':
      return ['DIGITAL'];
    case 'PAPIR_OG_DIGITAL':
      return ['PAPER', 'DIGITAL'];
    default:
      throw new Error('Unsupported legacy submission type in published form');
  }
};

const publishedLanguagesReport = ({
  formPublicationsService,
}: ReportDependencies): CsvReport<PublishedLanguagesRow> => ({
  columns: {
    formNumber: 'skjemanummer',
    languages: 'språk',
    titleNb: 'skjematittel (nb)',
    titleNn: 'skjematittel (nn)',
    titleEn: 'skjematittel (en)',
    submissionTypes: 'submissionTypes',
  },
  rows: async function* (signal, setContext) {
    signal.throwIfAborted();
    setContext({ operation: 'list-publications' });
    const forms = await awaitReportCall(signal, () => formPublicationsService.getAll());
    for (const form of forms.filter(
      (form) => isNotTestForm(form) && (form.status === 'published' || form.status === 'pending'),
    )) {
      signal.throwIfAborted();
      setContext({ operation: 'load-publication', formPath: form.path });
      const publishedForm = await awaitReportCall(signal, () => formPublicationsService.get(form.path));
      signal.throwIfAborted();
      if (publishedForm.status !== 'published' || !isNotTestForm(publishedForm)) continue;
      setContext({ operation: 'load-translations', formPath: form.path });
      const { translations } = await awaitReportCall(signal, () =>
        formPublicationsService.getTranslations(form.path, ['nb', 'nn', 'en']),
      );
      signal.throwIfAborted();
      setContext({ operation: 'resolve-submission-types', formPath: form.path });
      const submissionTypes = getPublishedSubmissionTypes(publishedForm.properties);
      setContext({ operation: 'map-row', formPath: form.path });
      const titleFor = (language: 'nb' | 'nn' | 'en') => {
        const dictionary = translations[language];
        // The compact list can contain a pending draft title, which is not a published translation key.
        return dictionary ? String(translationUtils.createTranslate(dictionary, language)(publishedForm.title)) : '';
      };
      yield {
        formNumber: publishedForm.skjemanummer,
        languages: Object.keys(translations).join(', '),
        titleNb: titleFor('nb'),
        titleNn: titleFor('nn'),
        titleEn: titleFor('en'),
        submissionTypes: formatSubmissionTypes(submissionTypes),
      };
    }
  },
});

export { publishedLanguagesReport };
