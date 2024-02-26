import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormValuesGrid = (): Component => ({
  key: '',
  type: 'datagrid',
  label: 'Dataverdier',
  reorder: true,
  components: [
    {
      label: 'Ledetekst',
      key: 'label',
      type: 'textfield',
      hideLabel: true,
      validate: {
        required: true,
      },
    },
    {
      label: 'Dataverdi',
      key: 'value',
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
