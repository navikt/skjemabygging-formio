import {
  container,
  dataGrid,
  datePicker,
  htmlElement,
  panel,
  radio,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const datagridContainerForm = () =>
  form({
    title: 'Container med datagrid',
    formNumber: 'containerdatagrid123',
    path: 'containerdatagrid123',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          htmlElement({
            content: 'Her skal det stå en veiledningstekst for søknaden',
            key: 'veiledningstekst',
          }),
        ],
      }),
      panel({
        key: 'page3',
        title: 'Betinget beholder med repeterende data',
        components: [
          radio({
            key: 'visBeholderMedRepeterendeData',
            label: 'Vis beholder med repeterende data',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'visBeholderMedRepeterendeData',
              eq: 'ja',
            },
            hideLabel: true,
            key: 'beholderMedRepeterendeData',
            label: 'Beholder med repeterende data',
            components: [
              dataGrid({
                key: 'repeterendeFelter',
                label: 'Repeterende felter',
                components: [
                  textField({
                    key: 'tekstfeltIDatagrid1',
                    label: 'Tekstfelt i datagrid',
                  }),
                  datePicker({
                    key: 'datoIDatagrid',
                    label: 'Dato i datagrid',
                    validate: {
                      custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'containerdatagrid123', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const datagridContainerTranslations = () => getMockTranslationsFromForm(datagridContainerForm());

export { datagridContainerForm, datagridContainerTranslations };
