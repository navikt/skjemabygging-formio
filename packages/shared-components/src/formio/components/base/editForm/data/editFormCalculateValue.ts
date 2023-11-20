import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { Components } from 'formiojs';
import editFormAceEditor from '../shared/editFormAceEditor';
import editFormVariablesTable from '../shared/editFormVariablesTable';
import EditFormUtils = Components.EditFormUtils;

const editFormCalculateValue = (): Component => {
  return {
    type: 'panel',
    title: 'Kalkulert verdi',
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
