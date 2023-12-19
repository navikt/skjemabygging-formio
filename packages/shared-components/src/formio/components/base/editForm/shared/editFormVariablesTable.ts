import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormVariablesTable = (additional?: string): Component => {
  return {
    type: 'htmlelement',
    key: 'variablesTable',
    tag: 'div',
    label: '',
    content:
      '<p>Følgende variabler er tilgjengelig.</p>' +
      '<table class="table table-bordered table-condensed table-striped">' +
      (additional ?? '') +
      '<tr><th>form</th><td>Skjemaet sitt objekt.</td></tr>' +
      '<tr><th>submission</th><td>Hele submission objektet.</td></tr>' +
      '<tr><th>data</th><td>Alle utfylte data.</td></tr>' +
      '<tr><th>row</th><td>Konseptet rad, i sammenheng med DataGrid, EditGrid, og Container komponentene</td></tr>' +
      '<tr><th>component</th><td>Komponenten.</td></tr>' +
      '<tr><th>instance</th><td>Komponent instansen.</td></tr>' +
      '<tr><th>value</th><td>Den nåværende verdien på komponenten.</td></tr>' +
      '<tr><th>moment</th><td>Moment.js biblioteket for datomanipulasjon.</td></tr>' +
      '<tr><th>_</th><td>En instans av <a href="https://lodash.com/docs/" target="_blank">Lodash</a>.</td></tr>' +
      '<tr><th>utils</th><td>En instans av <a href="http://formio.github.io/formio.js/docs/identifiers.html#utils" target="_blank">FormioUtils</a>.</td></tr>' +
      '</table><br/>',
  };
};

export default editFormVariablesTable;
