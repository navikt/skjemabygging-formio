import { attachment, checkbox, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const checkboxDeprecatedForm = () =>
  form({
    title: 'checkbox-test',
    formNumber: 'checkboxtest',
    path: 'checkboxtest',
    components: [
      panel({
        key: 'checkboxPage',
        title: 'Checkbox page',
        components: [
          checkbox({
            key: 'normalCheckbox',
            label: 'Normal checkbox',
            validate: { required: false },
          }),
          checkbox({
            key: 'requiredCheckbox',
            label: 'Required checkbox',
            validate: { required: true },
          }),
          {
            ...checkbox({
              key: 'readOnlyCheckbox',
              label: 'ReadOnly checkbox',
              validate: { required: false },
            }),
            readOnly: true,
          },
          {
            ...checkbox({
              key: 'readOnlyCheckboxChecked',
              label: 'ReadOnly checkbox checked',
              validate: { required: false },
            }),
            readOnly: true,
            defaultValue: true,
          },
          checkbox({
            additionalDescriptionLabel: 'Extended description',
            additionalDescriptionText: '<p>Extended description text</p>',
            description: '<p>Normal description text</p>',
            key: 'checkboxDescription',
            label: 'Checkbox description',
            validate: { required: false },
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
            validate: { required: true },
          }),
        ],
      }),
    ],
    introPage: formIntroPageWithoutSelfDeclaration(),
    properties: formProperties({ formNumber: 'checkboxtest', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const checkboxDeprecatedTranslations = () => getMockTranslationsFromForm(checkboxDeprecatedForm());

export { checkboxDeprecatedForm, checkboxDeprecatedTranslations };
