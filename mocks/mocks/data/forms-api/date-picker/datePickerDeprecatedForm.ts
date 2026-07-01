import { dataGrid, datePicker, htmlElement, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
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
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            key: 'datoMedValideringAvAntallDagerTilbakeEllerFramover',
            label: 'Dato med validering av antall dager tilbake eller framover',
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            key: 'datoMedIntervallTidligereEnnDagensDato',
            label: 'Dato med intervall tidligere enn dagens dato',
            validate: {
              required: false,
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            key: 'datoMedIntervallSenereEnnDagensDato',
            label: 'Dato med intervall senere enn dagens dato',
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
              }),
              datePicker({
                beforeDateInputKey: 'datagridDato.gridFrom',
                key: 'gridTo',
                label: 'Grid til',
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'navdatepicker', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const datePickerDeprecatedTranslations = () => getMockTranslationsFromForm(datePickerDeprecatedForm());

export { datePickerDeprecatedForm, datePickerDeprecatedTranslations };
