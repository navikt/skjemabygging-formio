import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormValues = (): Component => ({
  type: 'datagrid',
  input: true,
  label: 'Dataverdier',
  key: 'values',
  reorder: false,
  hasHeader: true,
  defaultValue: [{ label: '', value: '' }],
  components: [
    {
      label: 'Ledetekst',
      key: 'label',
      input: true,
      type: 'textfield',
      hideLabel: true,
      validate: {
        required: true,
      },
    },
    {
      label: 'Dataverdi',
      key: 'value',
      input: true,
      type: 'textfield',
      hideLabel: true,
      allowCalculateOverride: true,
      calculateValue: 'value = _.camelCase(row.label);',
    },
  ],
  conditional: {
    json: { '===': [{ var: 'data.dataSrc' }, 'values'] },
  },
});

export default editFormValues;
