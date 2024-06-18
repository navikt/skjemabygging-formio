import { Component } from '@navikt/skjemadigitalisering-shared-domain';

// withDescription: Adds description textfield to the datagrid
// minLength: Minimum number of rows in the datagrid (will hide delete button until this number of rows is reached)
interface Options {
  withDescription?: boolean;
  minLength?: number;
}

const editFormValuesGrid = (options: Options = { withDescription: false, minLength: 1 }): Component => {
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
    validate: {
      minLength: options.minLength,
    },
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
