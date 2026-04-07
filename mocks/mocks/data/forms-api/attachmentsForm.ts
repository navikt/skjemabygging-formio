import { attachment, panel, radio } from '../../form-builder/components';
import yourInformation from '../../form-builder/components/cutomized/yourInformation';
import form from '../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../form-builder/shared/utils';

const defaultProps = { validate: { required: true } };

const attachmentsForm = () => {
  const formNumber = 'Attach 001';
  const formPath = 'formwithattachments';

  return form({
    title: 'Form with attachments',
    formNumber: formNumber,
    path: formPath,
    components: [
      panel({
        title: 'Dine opplysninger',
        key: 'personopplysninger',
        components: [yourInformation()],
      }),
      panel({
        title: 'Diverse',
        components: [
          radio({
            label: 'Radiopanel 1',
            key: 'radiopanel1',
            values: [
              { label: 'Radiovalg 1', value: 'radiovalg1' },
              { label: 'Radiovalg 2', value: 'radiovalg2' },
              { label: 'Radiovalg 3', value: 'radiovalg3' },
              { label: 'Radiovalg 4', value: 'radiovalg4' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            ...defaultProps,
            label: 'Vedlegg 1',
            properties: { vedleggskode: 'V1', vedleggstittel: 'Vedleggstittel 1' },
          }),
          attachment({
            ...defaultProps,
            label: 'Vedlegg 2',
            properties: { vedleggskode: 'V2', vedleggstittel: 'Vedleggstittel 2' },
            customConditional: "show = data.radiopanel1 === 'radiovalg1' || data.radiopanel1 === 'radiovalg2';",
          }),
          attachment({
            key: 'vedleggUploadOnly',
            label: 'Vedlegg upload-only',
            validate: { required: false },
            properties: { vedleggskode: 'V9', vedleggstittel: 'Vedlegg upload-only' },
            customConditional: "show = data.radiopanel1 === 'radiovalg1' || data.radiopanel1 === 'radiovalg2';",
            attachmentValues: {
              nav: { enabled: false, additionalDocumentation: {} },
              andre: { enabled: false, additionalDocumentation: {} },
              harIkke: { enabled: false, additionalDocumentation: {} },
              ettersender: { enabled: false, showDeadline: false, additionalDocumentation: { enabled: false } },
              leggerVedNaa: { enabled: true, additionalDocumentation: {} },
              levertTidligere: { enabled: false, additionalDocumentation: { enabled: false } },
            },
          }),
          attachment({
            ...defaultProps,
            label: 'Vedlegg 3',
            properties: { vedleggskode: 'V3', vedleggstittel: 'Vedleggstittel 3' },
            conditional: {
              show: true,
              when: 'radiopanel1',
              eq: 'radiovalg4',
            },
          }),
          attachment({ ...defaultProps, attachmentType: 'other' }),
        ],
      }),
    ],
  });
};

const attachmentsTranslations = () => {
  return getMockTranslationsFromForm(attachmentsForm());
};

export { attachmentsForm, attachmentsTranslations };
