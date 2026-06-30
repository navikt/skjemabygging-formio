import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const textfieldMainForm = () =>
  form({
    title: 'Test tekstfelt',
    formNumber: 'testtekstfelt',
    path: 'testtekstfelt',
    components: [
      panel({
        key: 'panelMedTekstfelt',
        title: 'Panel med tekstfelt',
        components: [
          textField({
            key: 'pakrevdTekstfelt',
            label: 'Påkrevd tekstfelt',
          }),
          textField({
            key: 'tekstfeltKunSiffer',
            label: 'Tekstfelt kun siffer og lengde mellom 8 og 10',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'testtekstfelt', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const textfieldMainTranslations = () => getMockTranslationsFromForm(textfieldMainForm());

export { textfieldMainForm, textfieldMainTranslations };
