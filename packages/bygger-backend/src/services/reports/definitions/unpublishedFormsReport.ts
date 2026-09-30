import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { awaitReportCall, CsvReport } from '../csvPipeline';
import { isNotTestForm, ReportDependencies } from '../types';

type UnpublishedRow = {
  formNumber: string;
  formTitle: string;
  unpublishedAt?: string;
  unpublishedBy?: string;
};

const unpublishedFormsReport = ({ formsService }: ReportDependencies): CsvReport<UnpublishedRow> => ({
  columns: {
    formNumber: 'skjemanummer',
    formTitle: 'skjematittel',
    unpublishedAt: 'avpublisert',
    unpublishedBy: 'avpublisert av',
  },
  rows: async function* (signal) {
    signal.throwIfAborted();
    const forms = await awaitReportCall(signal, () =>
      formsService.getAll<
        Pick<Form, 'skjemanummer' | 'title' | 'status' | 'publishedAt' | 'publishedBy' | 'properties'>
      >('skjemanummer,title,status,publishedAt,publishedBy,properties'),
    );
    signal.throwIfAborted();
    for (const form of forms.filter((form) => isNotTestForm(form) && form.status === 'unpublished')) {
      signal.throwIfAborted();
      yield {
        formNumber: form.skjemanummer,
        formTitle: form.title,
        unpublishedAt: form.publishedAt,
        unpublishedBy: form.publishedBy,
      };
    }
  },
});

export { unpublishedFormsReport };
