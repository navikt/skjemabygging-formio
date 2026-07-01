import { checkbox, dataGrid, datePicker, navSelect, panel, radio } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const generalDatagridForm = () =>
  form({
    title: 'Egne komponenter i datagrid',
    formNumber: 'customcompsdatagrid',
    path: 'customcompsdatagrid',
    components: [
      panel({
        key: 'dineopplysninger',
        title: 'Dine opplysninger',
        components: [
          checkbox({
            key: 'avkryssingsboks',
            label: 'Avkryssingsboks',
          }),
          dataGrid({
            conditional: {
              show: true,
              when: 'avkryssingsboks',
              eq: 'true',
            },
            key: 'datagrid',
            label: 'Data Grid',
            components: [
              navSelect({
                key: 'nedtrekksmeny',
                label: 'Nedtrekksmeny',
                values: [
                  { label: 'a', value: 'a' },
                  { label: 'b', value: 'b' },
                ],
              }),
              datePicker({
                key: 'datoDdMmAaaa',
                label: 'Dato (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              radio({
                key: 'borDuINorge',
                label: 'Bor du i Norge?',
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                ],
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'customcompsdatagrid', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const generalDatagridTranslations = () => getMockTranslationsFromForm(generalDatagridForm());

export { generalDatagridForm, generalDatagridTranslations };
