import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormVariablesTable = (additional?: string): Component => {
  return {
    type: 'htmlelement',
    key: 'variablesTable',
    tag: 'div',
    label: '',
    input: false,
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
      "<tr><th>dataFetcher</th><td>Gitt api-key (API-nøkkel) til en komponent med type <small>dataFetcher</small> kan denne funksjonen brukes til å sjekke status. Dersom komponent ligger inne i container må path oppgis, f.eks. 'container.aktiviteter'. Se hvilke sjekker som er tilgjengelige i tabell nedenfor.</td></tr>" +
      "<tr><th>isBornBeforeYear</th><td>Gitt api-key (API-nøkkel) til et fødselsnummer eller datofelt returnerer denne funksjonen om personen er født tidligere enn oppgitt årstall.<br/><small><pre>utils.isBornBeforeYear(1964, 'apiKey', submission)</pre></small></td></tr>" +
      "<tr><th>isAgeBetween</th><td>Gitt api-key (API-nøkkel) til et fødselsnummer eller datofelt returnerer denne funksjonen om personens alder ligger innenfor et intervall.<br/><small><pre>utils.isAgeBetween([18, 67], 'apiKey', submission)</pre></small></td></tr>" +
      "<tr><th>getAge</th><td>Gitt api-key (API-nøkkel) til et fødselsnummer eller datofelt returnerer denne funksjonen personens alder.<br/><small><pre>utils.getAge('apiKey', submission)</pre></small></td></tr>" +
      '</table><br/>' +
      '<table class="table table-bordered table-condensed table-striped">' +
      '<tr><th scope="col" colspan="2">dataFetcher hjelpefunksjon</tr>' +
      "<tr><th>fetchDone</th><td><small><pre>utils.dataFetcher('aktiviteter', submission).fetchDone</pre></small></td><td>Returnerer <small>true</small> etter at kallet for å hente data er utført</td></tr>" +
      "<tr><th>success</th><td><small><pre>utils.dataFetcher('aktiviteter', submission).success</pre></small></td><td>Returnerer <small>true</small> dersom kallet for å hente data lyktes</td></tr>" +
      "<tr><th>failure</th><td><small><pre>utils.dataFetcher('aktiviteter', submission).failure</pre></small></td><td>Returnerer <small>true</small> dersom kallet for å hente data feilet</td></tr>" +
      "<tr><th>empty</th><td><small><pre>utils.dataFetcher('aktiviteter', submission).empty</pre></small></td><td>Returnerer <small>true</small> dersom API returnerte tom liste. Returnerer <small>undefined</small> før data er klare.</td></tr>" +
      "<tr><th>fetchDisabled</th><td><small><pre>utils.dataFetcher('aktiviteter', submission).fetchDisabled</pre></small></td><td>Returnerer <small>true</small> dersom data ikke skal hentes (f.eks. når bruker har valgt papirinnsending)</td></tr>" +
      "<tr><th>selected (matcher)</th><td><small><pre>utils.dataFetcher('aktiviteter', submission).selected({antallBarn: 4})</pre></small><small><pre>utils.dataFetcher('aktiviteter', submission).selected({type: 'TILTAK'})</pre></small></td><td>Returnerer <small>true</small> dersom bruker har valgt et eller flere elementer med gitte kriterier. Returnerer <small>undefined</small> før data er klare.</td></tr>" +
      "<tr><th>selected (count)</th><td><small><pre>utils.dataFetcher('aktiviteter', submission).selected('COUNT')</pre></small></td><td>Returnerer antall elementer som bruker har valgt (utenom 'annet'). Returnerer <small>undefined</small> før data er klare.</td></tr>" +
      "<tr><th>selected (other)</th><td><small><pre>utils.dataFetcher('aktiviteter', submission).selected('OTHER')</pre></small></td><td>Returnerer <small>true</small> dersom bruker har valgt 'annet', <small>false</small> hvis ikke, og <small>undefined</small> før data er klare.</td></tr>" +
      '</table>' +
      '<br/>',
  };
};

export default editFormVariablesTable;
