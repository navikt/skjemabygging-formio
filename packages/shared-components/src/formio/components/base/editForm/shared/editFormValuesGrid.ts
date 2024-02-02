import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormValuesGrid = (): Component => ({
  key: '',
  type: 'datagrid',
  input: true,
  label: 'Dataverdier',
  reorder: true,
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

export default editFormValuesGrid;
