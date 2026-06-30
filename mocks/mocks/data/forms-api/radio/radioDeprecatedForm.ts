import { attachment, panel, radio } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const radioDeprecatedForm = () =>
  form({
    title: 'Radio test',
    formNumber: 'radiotest',
    path: 'radiotest',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          radio({
            key: 'simple',
            label: 'Simple',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          radio({
            description: '<p>Normal description</p>',
            key: 'withDescription',
            label: 'With description',
            values: [
              { label: 'First', value: 'first', description: 'This is the first option' },
              { label: 'Second', value: 'second', description: 'This is the second option' },
              { label: 'Third', value: 'third' },
            ],
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
    properties: formProperties({ formNumber: 'radiotest', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const radioDeprecatedTranslations = () => getMockTranslationsFromForm(radioDeprecatedForm());

export { radioDeprecatedForm, radioDeprecatedTranslations };
