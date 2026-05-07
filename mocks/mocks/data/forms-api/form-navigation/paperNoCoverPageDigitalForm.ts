import { attachment, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const paperNoCoverPageDigitalForm = () => {
  const formNumber = 'papernocoverpagedigital';

  return form({
    title: 'Submission Type: Digital and Paper No Cover Page',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Dine opplysninger',
        components: [textField({ label: 'Tekstfelt' })],
      }),
      panel({
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            label: 'Vedlegg 1',
            properties: { vedleggskode: 'V1', vedleggstittel: 'Vedleggstittel 1' },
            validate: { required: true },
          }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber,
      submissionTypes: ['DIGITAL', 'PAPER_NO_COVER_PAGE'],
    }),
  });
};

const paperNoCoverPageDigitalTranslations = () => getMockTranslationsFromForm(paperNoCoverPageDigitalForm());

export { paperNoCoverPageDigitalForm, paperNoCoverPageDigitalTranslations };
