import { Form, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { awaitReportCall, CsvReport } from '../csvPipeline';
import { isNotTestForm, ReportDependencies } from '../types';

type AttachmentRow = {
  formNumber: string;
  formTitle: string;
  attachmentTitle?: string;
  attachmentCode?: string;
  label?: string;
};

const attachmentsReport = ({ formsService }: ReportDependencies): CsvReport<AttachmentRow> => ({
  columns: {
    formNumber: 'skjemanummer',
    formTitle: 'skjematittel',
    attachmentTitle: 'vedleggstittel',
    attachmentCode: 'vedleggskode',
    label: 'label',
  },
  rows: async function* (signal) {
    signal.throwIfAborted();
    const forms = await awaitReportCall(signal, () =>
      formsService.getAll<Pick<Form, 'path' | 'title' | 'skjemanummer' | 'properties'>>(
        'path,title,skjemanummer,properties',
      ),
    );
    for (const compact of forms.filter(isNotTestForm)) {
      signal.throwIfAborted();
      const form = await awaitReportCall(signal, () => formsService.get(compact.path));
      signal.throwIfAborted();
      for (const attachment of navFormUtils.getAttachmentProperties(form)) {
        signal.throwIfAborted();
        yield {
          formNumber: compact.skjemanummer,
          formTitle: compact.title,
          attachmentTitle: attachment.vedleggstittel,
          attachmentCode: attachment.vedleggskode,
          label: attachment.label,
        };
      }
    }
  },
});

export { attachmentsReport };
