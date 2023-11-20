import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormAceEditor from '../shared/editFormAceEditor';
import editFormVariablesTable from '../shared/editFormVariablesTable';

const editFormCustomValidation = (): Component => {
  return {
    type: 'panel',
    title: 'Egendefinert validering',
    collapsible: true,
    collapsed: true,
    components: [
      {
        ...editFormAceEditor('javascript'),
        key: 'validate.custom',
        hideLabel: true,
      },
      {
        type: 'htmlelement',
        tag: 'div',
        content: `
          <small>
            <p>Du må tildele <strong>valid</strong> variablen, enten som <strong>true</strong> eller en feilmelding.</p>
            <h5>Eksempel:</h5>
            <pre>valid = (input === 'Joe') ? true : 'Navnet ditt må være "Joe"';</pre>
          </small>`,
      },
      {
        type: 'panel',
        title: 'Hjelp',
        collapsible: true,
        collapsed: true,
        components: [
          {
            ...editFormVariablesTable('<tr><th>form</th><td>Skjemaet sitt objekt.</td></tr>'),
          },
        ],
      },
    ],
  };
};

export default editFormCustomValidation;
