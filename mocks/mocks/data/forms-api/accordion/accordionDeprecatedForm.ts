import { accordion, attachment, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const accordionDeprecatedForm = () =>
  form({
    title: 'Accordion test',
    formNumber: 'accordiontest',
    path: 'accordiontest',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          accordion({
            accordionValues: [
              {
                title: 'Title1',
                content: '<p>Content1</p>',
              },
              {
                title: 'Title2',
                content: '<p><strong>Content2</strong></p>',
              },
              {
                title: 'Title3',
                content: '<p><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/">Link3</a></p>',
              },
            ],
            key: 'accordion',
            label: 'Trekkspill',
          }),
          accordion({
            accordionValues: [{ title: 'DefaultOpen', content: '<p>This is open</p>', defaultOpen: true }],
            key: 'accordion1',
            label: 'Trekkspill',
          }),
        ],
      }),
      panel({
        isAttachmentPanel: true,
        key: 'vedlegg',
        title: 'Vedlegg',
        components: [
          attachment({
            attachmentType: 'other',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              ettersender: {
                enabled: true,
              },
              nei: {
                enabled: true,
              },
            },
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'accordiontest', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const accordionDeprecatedTranslations = () => getMockTranslationsFromForm(accordionDeprecatedForm());

export { accordionDeprecatedForm, accordionDeprecatedTranslations };
