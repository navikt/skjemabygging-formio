import {
  checkbox,
  dataGrid,
  datePicker,
  iban,
  navSelect,
  panel,
  radio,
  textArea,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const datagridReactForm = () =>
  form({
    title: 'Testskjema med datagrid og react-komponenter',
    formNumber: 'datagridreact',
    path: 'datagridreact',
    components: [
      panel({
        key: 'datagridMedReact',
        title: 'Datagrid med react',
        components: [
          dataGrid({
            key: 'datagrid',
            label: 'Repeterende data',
            validate: { required: true },
            components: [
              checkbox({
                key: 'avkryssingsboksInniDatagrid',
                label: 'Avkryssingsboks inni datagrid',
                validate: { required: false },
              }),
              datePicker({
                key: 'datoInniDatagrid',
                label: 'Dato inni datagrid',
                validate: {
                  required: true,
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              navSelect({
                key: 'nedtrekksmenyInniDatagrid',
                label: 'Nedtrekksmeny inni datagrid',
                validate: { required: true, onlyAvailableItems: true },
                values: [
                  { label: 'Buss', value: 'buss' },
                  { label: 'Bil', value: 'bil' },
                  { label: 'Ferge', value: 'ferge' },
                ],
              }),
              radio({
                key: 'radiopanelInniDatagrid',
                label: 'Radiopanel inni datagrid',
                validate: { required: true },
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                ],
              }),
              textArea({
                key: 'tekstomradeInniDatagrid',
                label: 'Tekstområde inni datagrid',
                validate: { required: true },
              }),
              textField({
                key: 'tekstfelt-inni-datagrd',
                label: 'Tekstfelt inni datagrid',
                validate: { required: true },
              }),
              iban({
                key: 'iban',
                label: 'IBAN',
                validate: { required: true },
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'datagridreact', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const datagridReactTranslations = () => getMockTranslationsFromForm(datagridReactForm());

export { datagridReactForm, datagridReactTranslations };
