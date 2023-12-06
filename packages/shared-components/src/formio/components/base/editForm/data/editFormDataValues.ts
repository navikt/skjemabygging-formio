import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormDataValues = (): Component => ({
  type: 'datagrid',
  input: true,
  label: 'Dataverdier',
  key: 'data.values',
  tooltip:
    'Tilgjengelige valg i komponenten. Ledeteksten vises til brukeren i nedtrekksmenyen, mens dataverdien brukes av systemet',
  reorder: true,
  defaultValue: [{ label: '', value: '' }],
  components: [
    {
      label: 'Ledetekst',
      key: 'label',
      input: true,
      type: 'textfield',
    },
    {
      label: 'Dataverdi',
      key: 'value',
      input: true,
      type: 'textfield',
      allowCalculateOverride: true,
      calculateValue: 'value = _.camelCase(row.label);',
    },
  ],
  conditional: {
    json: { '===': [{ var: 'data.dataSrc' }, 'values'] },
  },
});

export default editFormDataValues;
