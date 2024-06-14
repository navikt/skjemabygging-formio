import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface Options {
  withDescription?: boolean;
}

const editFormValuesGrid = (options: Options = { withDescription: false }): Component => {
  const description = {
    label: 'Beskrivelse',
    key: 'description',
    type: 'textfield',
    hideLabel: true,
    validate: {
      required: false,
    },
  };

  const datagrid = {
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
  };

  if (options.withDescription) {
    datagrid.components.push(description);
  }

  return datagrid;
};

export default editFormValuesGrid;
