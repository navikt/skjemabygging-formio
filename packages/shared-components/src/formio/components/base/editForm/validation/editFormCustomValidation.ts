import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormAceEditor from '../shared/editFormAceEditor';
import editFormVariablesTable from '../shared/editFormVariablesTable';

const editFormCustomValidation = (): Component => {
  return {
    type: 'panel',
    title: 'Egendefinert validering',
    key: 'customValidation',
    label: '',
    collapsible: true,
    collapsed: true,
    components: [
      {
        ...editFormAceEditor('javascript'),
        key: 'validate.custom',
        hideLabel: true,
        validate: {
          required: false,
        },
      },
      {
        type: 'htmlelement',
        key: 'description',
        label: '',
        tag: 'div',
        content: `
          <small>
            <h5>Eksempel:</h5>
            <pre>valid = (input === 'Joe') ? true : 'Navnet ditt må være "Joe"';</pre>
          </small>`,
      },
      {
        type: 'panel',
        key: 'help',
        label: '',
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
