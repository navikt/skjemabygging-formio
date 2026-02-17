import { attachment, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const staticPdfForm = () => {
  const formNumber = 'pdfstatic';

  return form({
    title: 'Static PDF',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({ attachmentType: 'default', key: 'vedlegg1', label: 'Vedlegg 1', description: 'Beskrivelse 1' }),
          attachment({ attachmentType: 'default', key: 'vedlegg2', label: 'Vedlegg 2', description: 'Beskrivelse 2' }),
          attachment({ attachmentType: 'other' }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber,
      submissionTypes: ['STATIC_PDF', 'PAPER'],
    }),
  });
};

const staticPdfTranslations = () => getMockTranslationsFromForm(staticPdfForm());

export { staticPdfForm, staticPdfTranslations };
