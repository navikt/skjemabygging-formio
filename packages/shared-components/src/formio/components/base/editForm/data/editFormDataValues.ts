import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormDataValues = (): Component => ({
  type: 'datagrid',
  input: true,
  label: 'Dataverdier',
  key: 'data.values',
  reorder: false,
  defaultValue: [{ label: '', value: '' }],
  components: [
    {
      label: 'Ledetekst',
      key: 'label',
      input: true,
      type: 'textfield',
      dataGridLabel: false,
      validate: {
        required: true,
      },
    },
    {
      label: 'Dataverdi',
      key: 'value',
      input: true,
      type: 'textfield',
      dataGridLabel: false,
      allowCalculateOverride: true,
      calculateValue: 'value = _.camelCase(row.label);',
    },
  ],
  conditional: {
    json: { '===': [{ var: 'data.dataSrc' }, 'values'] },
  },
});

export default editFormDataValues;
