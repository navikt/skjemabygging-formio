import { awaitReportCall, CsvReport } from './csvPipeline';
import { notTestForm, ReportDependencies } from './types';

type PublishedLanguagesRow = {
  formNumber: string;
  formTitle: string;
  languages: string;
};

const publishedLanguagesReport = ({
  formPublicationsService,
}: ReportDependencies): CsvReport<PublishedLanguagesRow> => ({
  columns: {
    formNumber: 'skjemanummer',
    formTitle: 'skjematittel',
    languages: 'språk',
  },
  rows: async function* (signal) {
    signal.throwIfAborted();
    const forms = await awaitReportCall(signal, () => formPublicationsService.getAll());
    for (const form of forms.filter(notTestForm)) {
      signal.throwIfAborted();
      const { translations } = await awaitReportCall(signal, () =>
        formPublicationsService.getTranslations(form.path, ['nb', 'nn', 'en']),
      );
      signal.throwIfAborted();
      yield {
        formNumber: form.skjemanummer,
        formTitle: form.title,
        languages: Object.keys(translations).join(','),
      };
    }
  },
});

export { publishedLanguagesReport };
