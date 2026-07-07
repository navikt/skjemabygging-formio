import { dataGrid, datePicker, htmlElement, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const datePickerDeprecatedForm = () =>
  form({
    title: 'NavDatepicker',
    formNumber: 'navdatepicker',
    path: 'navdatepicker',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          htmlElement({
            content: 'Brukes til å teste NavDatepicker',
            key: 'veiledningstekst',
          }),
          datePicker({
            key: 'tilfeldigDato',
            label: 'Tilfeldig dato',
            validate: {
              required: true,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            beforeDateInputKey: 'tilfeldigDato',
            key: 'datoMedValideringMotAnnetDatofelt',
            label: 'Dato med validering mot annet datofelt',
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            beforeDateInputKey: 'tilfeldigDato',
            key: 'datoMedValideringMotAnnetDatofeltKanVaereLik',
            label: 'Dato med validering mot annet datofelt (kan være lik)',
            mayBeEqual: true,
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            key: 'datoMedValideringAvTidligstOgSenest',
            label: 'Dato med validering av tidligst og senest',
            specificEarliestAllowedDate: '2023-08-01',
            specificLatestAllowedDate: '2023-08-31',
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            key: 'datoMedValideringAvAntallDagerTilbakeEllerFramover',
            label: 'Dato med validering av antall dager tilbake eller framover',
            earliestAllowedDate: -10,
            latestAllowedDate: 5,
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            key: 'datoMedIntervallTidligereEnnDagensDato',
            label: 'Dato med intervall tidligere enn dagens dato',
            earliestAllowedDate: -5000,
            latestAllowedDate: -3000,
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            key: 'datoMedIntervallSenereEnnDagensDato',
            label: 'Dato med intervall senere enn dagens dato',
            earliestAllowedDate: 3000,
            latestAllowedDate: 5000,
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          dataGrid({
            key: 'datagridDato',
            label: 'Datagrid',
            components: [
              datePicker({
                key: 'gridFrom',
                label: 'Grid fra',
                validate: {
                  required: false,
                },
              }),
              datePicker({
                beforeDateInputKey: 'datagridDato.gridFrom',
                key: 'gridTo',
                label: 'Grid til',
                validate: {
                  required: false,
                },
              }),
            ],
          }),
        ],
      }),
    ],
    introPage: formIntroPageWithoutSelfDeclaration(),
    properties: formProperties({ formNumber: 'navdatepicker', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const datePickerDeprecatedTranslations = () => getMockTranslationsFromForm(datePickerDeprecatedForm());

export { datePickerDeprecatedForm, datePickerDeprecatedTranslations };
