import { attachment, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';

interface CreateDigitalNoLoginAttachmentPanelFormOptions {
  path: string;
  title: string;
}

const createDigitalNoLoginAttachmentPanelForm = ({ path, title }: CreateDigitalNoLoginAttachmentPanelFormOptions) =>
  form({
    title,
    formNumber: 'DIGITAL-NOLOGIN-ATTACHMENT-PANEL',
    path,
    components: [
      panel({
        title: 'Dine opplysninger',
        key: 'dineOpplysninger',
        components: [textField({ key: 'tekstfelt', label: 'Tekstfelt', validate: { required: true } })],
      }),
      panel({
        title: 'Vedlegg',
        key: 'vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            id: 'eiajfi8',
            navId: 'eiajfi8',
            key: 'vedlegg1',
            label: 'Informasjon om din næringsinntekt fra Norge eller utlandet',
            validate: { required: true },
            properties: {
              vedleggskode: 'r7',
              vedleggstittel: 'En vedleggstittel',
            },
            attachmentValues: {
              nav: { enabled: true, additionalDocumentation: { enabled: false } },
              andre: { enabled: true, showDeadline: false, additionalDocumentation: { enabled: false } },
              harIkke: { enabled: true, additionalDocumentation: { enabled: false } },
              ettersender: { enabled: true, showDeadline: true, additionalDocumentation: { enabled: false } },
              leggerVedNaa: { enabled: true, additionalDocumentation: { enabled: false } },
              levertTidligere: {
                enabled: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Tittel tilleggsinformasjon',
                  description: 'Beskrivelse tilleggsinformasjon',
                },
              },
            },
          }),
          attachment({
            id: 'emwijff',
            navId: 'emwijff',
            key: 'vedlegg-med-ett-valg',
            label: 'Vedlegg med ett valg',
            validate: { required: true },
            properties: {
              vedleggstittel: 'Vedlegg med ett valg',
              vedleggskode: 'V3',
            },
            attachmentValues: {
              nav: { enabled: false, additionalDocumentation: {} },
              andre: { enabled: false, additionalDocumentation: {} },
              harIkke: { enabled: false, additionalDocumentation: {} },
              ettersender: { enabled: false, showDeadline: false, additionalDocumentation: { enabled: false } },
              leggerVedNaa: { enabled: true, additionalDocumentation: { enabled: false } },
              levertTidligere: { enabled: false, additionalDocumentation: { enabled: false } },
            },
          }),
          attachment({
            id: 'ez0ub3y',
            navId: 'ez0ub3y',
            key: 'annenDokumentasjon',
            attachmentType: 'other',
            label: 'Annen dokumentasjon',
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            validate: { required: true },
          }),
        ],
      }),
    ],
    properties: {
      ...formProperties({
        formNumber: 'DIGITAL-NOLOGIN-ATTACHMENT-PANEL',
        submissionTypes: ['DIGITAL', 'DIGITAL_NO_LOGIN'],
      }),
      ettersendelsesfrist: 14,
    },
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

export { createDigitalNoLoginAttachmentPanelForm };
