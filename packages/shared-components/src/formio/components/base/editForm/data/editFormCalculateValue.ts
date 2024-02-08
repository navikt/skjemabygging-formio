import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormAceEditor from '../shared/editFormAceEditor';
import editFormVariablesTable from '../shared/editFormVariablesTable';

const editFormCalculateValue = (): Component => {
  return {
    type: 'panel',
    title: 'Kalkulert verdi',
    key: 'calculateValue',
    label: '',
    collapsible: true,
    collapsed: true,
    components: [
      {
        ...editFormAceEditor('javascript'),
        key: 'calculateValue',
        hideLabel: true,
      },
      {
        type: 'htmlelement',
        key: 'description',
        label: '',
        tag: 'div',
        content: `
          <small>
            <h5>Eksempel:</h5>
            <pre>value = data.a + data.b + data.c;</pre>
          </small>`,
      },
      {
        type: 'panel',
        title: 'Hjelp',
        key: 'help',
        label: '',
        collapsible: true,
        collapsed: true,
        components: [
          {
            ...editFormVariablesTable(),
          },
        ],
      },
    ],
  };
};

export default editFormCalculateValue;
