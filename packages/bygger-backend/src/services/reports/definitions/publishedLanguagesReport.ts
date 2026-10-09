import { translationUtils } from '@navikt/skjemadigitalisering-shared-domain';
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
  rows: async function* (signal) {
    signal.throwIfAborted();
    const forms = await awaitReportCall(signal, () => formPublicationsService.getAll());
    for (const form of forms.filter(
      (form) => isNotTestForm(form) && (form.status === 'published' || form.status === 'pending'),
    )) {
      signal.throwIfAborted();
      const publishedForm = await awaitReportCall(signal, () => formPublicationsService.get(form.path));
      signal.throwIfAborted();
      if (publishedForm.status !== 'published' || !isNotTestForm(publishedForm)) continue;
      const { translations } = await awaitReportCall(signal, () =>
        formPublicationsService.getTranslations(form.path, ['nb', 'nn', 'en']),
      );
      signal.throwIfAborted();
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
        submissionTypes: formatSubmissionTypes(publishedForm.properties.submissionTypes ?? []),
      };
    }
  },
});

export { publishedLanguagesReport };
