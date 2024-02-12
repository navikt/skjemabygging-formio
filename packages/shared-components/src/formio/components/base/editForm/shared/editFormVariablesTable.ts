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
      '<tr><th>utils</th><td>En instans av <a href="http://formio.github.io/formio.js/docs/identifiers.html#utils" target="_blank">FormioUtils</a>, inkludert et par egendefinerte hjelpefunksjoner (se nedenfor).</td></tr>' +
      '</table><br/>' +
      '<p>Egendefinerte hjelpefunksjoner på utils.</p>' +
      '<table class="table table-bordered table-condensed table-striped">' +
      "<tr><th>isBornBeforeYear</th><td>Gitt api-key til et fødselsnummer returnerer denne funksjonen om personen er født tidligere enn oppgitt årstall.<br/><small><pre>utils.isBornBeforeYear(1964, 'fnr', submission)</pre></small></td></tr>" +
      "<tr><th>isAgeBetween</th><td>Gitt api-key til et fødselsnummer returnerer denne funksjonen om personens alder ligger innenfor et intervall.<br/><small><pre>utils.isAgeBetween([18, 67], 'fnr', submission)</pre></small></td></tr>" +
      "<tr><th>getAge</th><td>Gitt api-key til et fødselsnummer returnerer denne funksjonen personens alder.<br/><small><pre>utils.getAge('fnr', submission)</pre></small></td></tr>" +
      '</table><br/>',
  };
};

export default editFormVariablesTable;
