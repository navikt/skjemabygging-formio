import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormAceEditor from '../shared/editFormAceEditor';
import editFormVariablesTable from '../shared/editFormVariablesTable';

const editFormAdvancedConditional = (): Component => {
  return {
    type: 'panel',
    title: 'Avansert betinget visning',
    key: 'advancedConditional',
    label: '',
    collapsible: true,
    collapsed: true,
    input: false,
    components: [
      {
        ...editFormAceEditor('javascript'),
        key: 'customConditional',
        hideLabel: true,
      },
      {
        type: 'htmlelement',
        tag: 'div',
        key: 'description',
        label: '',
        input: false,
        content: `
          <p>Du må tildele <strong>show</strong> variablen en boolean verdi.</p>
          <p><strong>NB:</strong> Avansert betinget visning vil overstyre enkel betinget visning.</p>
          <small>
            <h5>Eksempel:</h5>
            <pre>show = data.&lt;nøkkel&gt; === '&lt;verdi&gt;';</pre>
          </small>`,
      },
      {
        type: 'panel',
        title: 'Hjelp',
        key: 'help',
        label: '',
        collapsible: true,
        collapsed: true,
        input: false,
        components: [
          {
            ...editFormVariablesTable(),
          },
        ],
      },
    ],
  };
};

export default editFormAdvancedConditional;
