import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormValues = (): Component => ({
  type: 'datagrid',
  input: true,
  label: 'Dataverdier',
  key: 'values',
  reorder: false,
  defaultValue: [{ label: '', value: '' }],
  components: [
    {
      label: 'Ledetekst',
      key: 'label',
      input: true,
      type: 'textfield',
      validate: {
        required: true,
      },
    },
    {
      label: 'Dataverdi',
      key: 'value',
      input: true,
      type: 'textfield',
      allowCalculateOverride: true,
      calculateValue: 'value = _.camelCase(row.label);',
      validate: {
        required: false,
      },
    },
  ],
  conditional: {
    json: { '===': [{ var: 'data.dataSrc' }, 'values'] },
  },
});

export default editFormValues;
