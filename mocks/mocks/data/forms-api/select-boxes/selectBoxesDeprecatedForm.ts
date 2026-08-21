import { attachment, panel, selectBoxes } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const selectBoxesDeprecatedForm = () =>
  form({
    title: 'Select boxes test',
    formNumber: 'selectboxestest',
    path: 'selectboxestest',
    components: [
      panel({
        key: 'veiledning',
        title: 'Selectboxes',
        components: [
          selectBoxes({
            key: 'selectBoxes',
            label: 'Select boxes',
            values: [
              { label: 'Choice 1', value: 'choice1' },
              { label: 'Choice 2', value: 'choice2' },
              { label: 'Choice 3', value: 'choice3' },
            ],
          }),
          selectBoxes({
            key: 'selectBoxesWithDefaultValue',
            label: 'Select boxes with defaultValue',
            defaultValue: {
              choice1: true,
              choice2: true,
              choice3: false,
            },
            values: [
              { label: 'Choice 1', value: 'choice1' },
              { label: 'Choice 2', value: 'choice2' },
              { label: 'Choice 3', value: 'choice3' },
            ],
          }),
          selectBoxes({
            description: '<p>Normal description</p>',
            additionalDescriptionLabel: 'Extended description',
            additionalDescriptionText: '<p>Extended description text</p>',
            defaultValue: {
              choice1: false,
              choice2: false,
              choice3: false,
              choice4: false,
              choice5: false,
            },
            key: 'selectBoxesWithDescription',
            label: 'Select boxes with description',
            values: [
              { label: 'Choice 1', value: 'choice1', description: 'Description 1' },
              { label: 'Choice 2', value: 'choice2', description: 'Description 2' },
              { label: 'Choice 3', value: 'choice3', description: 'Description 3' },
              { label: 'Choice 4', value: 'choice4', description: 'Description 4' },
              { label: 'Choice 5', value: 'choice5' },
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
    introPage: formIntroPageWithoutSelfDeclaration(),
    properties: formProperties({ formNumber: 'selectboxestest', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const selectBoxesDeprecatedTranslations = () => getMockTranslationsFromForm(selectBoxesDeprecatedForm());

export { selectBoxesDeprecatedForm, selectBoxesDeprecatedTranslations };
