/*
 * Production form tests for Bekreftelse på sluttårsak/nedsatt arbeidstid (ikke permittert)
 * Form: nav040803
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om arbeidstaker (opplysningerOmArbeidstaker): 2 reachable same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse
 *       adresse.borDuINorge → adresseVarighet
 *   - Arbeidstid (arbeidstid): panel-level + same-panel conditionals
 *       hvordanHarArbeidstakersArbeidstidVaert → navSkjemagruppe, Tabell 1, Tabell 2
 *       hvaErArbeidstakersSituasjon → situation-specific date/text/radiopanel fields
 *       erDetInngattAvtaleOmOkonomiskYtelseIForbindelseMedOpphorAvArbeidsavtalen → alertstripe / Vedlegg
 *       harArbeidstakerTakketNeiTilTilbudOmAnnetArbeidIVirksomheten → redegjorNaermereForTilbudetOgAvslaget
 *       hvaVarStorrelsenPaArbeidstakersStilling → oppgiStillingsprosenten
 *       hvaVarArbeidstakersArbeidstidsordning → oppgiAntallTimerPerUke / arbeidsperiode / avspaseringsperiode
 *       erOpptjentFerieAvviklet / skalOpptjentFerieAvvikles → ferieperioder
 *   - Tabell 1 (tabell1): 1 same-panel conditional
 *       jegVilLeggeVedDetteIEtEgetVedleggIstedenforAFylleUtTabellenNedenfor → alertstripe / datagrid
 *   - Tabell 2 (tabell2): 1 same-panel conditional
 *       jegVilLeggeVedDetteIEtEgetVedleggIstedenforAFylleUtTabellenNedenfor1 → alertstripe / two datagrids
 *   - Vedlegg (vedlegg): 2 cross-panel conditionals
 *       erDetInngattAvtaleOmOkonomiskYtelseIForbindelseMedOpphorAvArbeidsavtalen → kopiAvSluttavtale
 *       table attachment checkboxes → timelister
 */

const arbeidstidHistorikkLabel = 'Hvordan har arbeidstakers arbeidstid vært?';
const arbeidstakerSituasjonLabel = 'Hva er arbeidstakers situasjon?';
const avtaleLabel = 'Er det inngått avtale om økonomisk ytelse i forbindelse med opphør av arbeidsavtalen?';
const adresseINorgeLabel = 'Bor arbeidstaker i Norge?';
const fnrLabel = /Har arbeidstaker norsk fødselsnummer eller d-nummer\?/i;
const tableAttachmentLabel = /Jeg vil legge ved dette i et eget vedlegg istedenfor å fylle ut tabellen nedenfor/;

const setArbeidstidHistorikk = (option: RegExp, checked: boolean) => {
  cy.findByRole('group', { name: arbeidstidHistorikkLabel }).within(() => {
    cy.findByRole('checkbox', { name: option })[checked ? 'check' : 'uncheck']();
  });
};

const selectArbeidstakerSituasjon = (value: string) => {
  cy.withinComponent(arbeidstakerSituasjonLabel, () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

const fillOmArbeidsgiver = () => {
  cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
  cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
  cy.findByRole('textbox', { name: 'Postadresse' }).type('Postveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByRole('textbox', { name: 'Kontaktperson ved bedriften' }).type('Kari Kontakt');
  cy.findByLabelText('Telefonnummer').type('12345678');
};

const fillOpplysningerOmArbeidstaker = () => {
  cy.findByRole('textbox', { name: 'Arbeidstakers fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Arbeidstakers etternavn' }).type('Nordmann');
  cy.withinComponent(fnrLabel, () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

const fillArbeidstidForSummary = () => {
  cy.findByRole('textbox', { name: /Arbeidstaker tiltrådte/ }).type('01.01.2024');
  cy.findByRole('textbox', { name: 'Siste arbeidsdag (dd.mm.åååå)' }).type('31.01.2025');
  setArbeidstidHistorikk(
    /^Arbeidstaker ønsker at NAV vurderer den gjennomsnittlige arbeidstiden de siste 36 månedene/,
    true,
  );
  selectArbeidstakerSituasjon('Arbeidstakeren er fortsatt ansatt uten endring av arbeidstiden');
};

describe('nav040803', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040803?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      fillOmArbeidsgiver();
      cy.clickNextStep();

      fillOpplysningerOmArbeidstaker();
      cy.clickNextStep();

      fillArbeidstidForSummary();
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: tableAttachmentLabel }).click();
      cy.findByRole('textbox', {
        name: 'Arbeidstaker har fått redusert arbeidstid fra og med dato (dd.mm.åååå)',
      }).type('01.02.2025');
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: tableAttachmentLabel }).click();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Timelister/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', {
          name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
        }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Om arbeidsgiver', () => {
        cy.contains('dt', 'Arbeidsgiver').next('dd').should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Opplysninger om arbeidstaker', () => {
        cy.contains('dt', 'Arbeidstakers fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Arbeidstid', () => {
        cy.contains('dt', arbeidstakerSituasjonLabel)
          .next('dd')
          .should('contain.text', 'Arbeidstakeren er fortsatt ansatt uten endring av arbeidstiden');
      });
    });
  });

  describe('Opplysninger om arbeidstaker conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040803/opplysningerOmArbeidstaker?sub=paper');
      cy.defaultWaits();
    });

    it('shows address fields when arbeidstaker does not have Norwegian fnr', () => {
      cy.findByLabelText(adresseINorgeLabel).should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      cy.withinComponent(fnrLabel, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(adresseINorgeLabel).should('exist');

      cy.withinComponent(adresseINorgeLabel, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      cy.withinComponent(adresseINorgeLabel, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      cy.withinComponent(fnrLabel, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(adresseINorgeLabel).should('not.exist');
    });
  });

  describe('Arbeidstid conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040803/arbeidstid?sub=paper');
      cy.defaultWaits();
    });

    it('shows skjemagruppe and table panel links for the selected worktime history', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tabell 1' }).should('not.exist');
      cy.findByRole('link', { name: 'Tabell 2' }).should('not.exist');
      cy.findByLabelText('Timer per uke').should('not.exist');

      setArbeidstidHistorikk(/^Arbeidstaker har hatt fast arbeidstid i minst seks måneder/, true);
      cy.findByLabelText('Timer per uke').should('exist');
      cy.findByRole('link', { name: 'Tabell 1' }).should('not.exist');
      cy.findByRole('link', { name: 'Tabell 2' }).should('not.exist');

      setArbeidstidHistorikk(/^Arbeidstaker har hatt fast arbeidstid i minst seks måneder/, false);
      setArbeidstidHistorikk(/^Arbeidstaker har hatt varierende arbeidstid/, true);
      cy.findByLabelText('Timer per uke').should('not.exist');
      cy.findByRole('link', { name: 'Tabell 1' }).should('exist');
      cy.findByRole('link', { name: 'Tabell 2' }).should('not.exist');

      setArbeidstidHistorikk(/^Arbeidstaker har hatt varierende arbeidstid/, false);
      setArbeidstidHistorikk(/^Arbeidstaker ønsker at NAV vurderer den gjennomsnittlige arbeidstiden/, true);
      cy.findByRole('link', { name: 'Tabell 1' }).should('exist');
      cy.findByRole('link', { name: 'Tabell 2' }).should('exist');
    });

    it('toggles situation-specific fields across delvis oppsagt, midlertidig and ekstrahjelp branches', () => {
      cy.findByLabelText('Arbeidstiden er endret fra dato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Dato for endt arbeidsavtale (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Arbeidstiden er redusert fra dato (dd.mm.åååå)').should('not.exist');

      selectArbeidstakerSituasjon('Arbeidstakeren er delvis oppsagt av arbeidsgiver');
      cy.findByLabelText('Arbeidstiden er endret fra dato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Ny arbeidstid per uke').should('exist');
      cy.findByLabelText('Oppsigelsestid i følge lov eller avtale').should('exist');
      cy.findByLabelText('Skriftlig oppsigelse/avskjed ble levert/sendt (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Ordinær lønn utbetales til og med (dd.mm.åååå)').should('exist');
      cy.findByLabelText(avtaleLabel).should('exist');
      cy.findByLabelText('Beskriv årsaken(e) til at arbeidsforholdet opphørte/arbeidstiden ble redusert').should(
        'exist',
      );
      cy.findByLabelText('Hva var størrelsen på arbeidstakers stilling?').should('exist');
      cy.findByLabelText('Hva var arbeidstakers arbeidstidsordning?').should('exist');
      cy.findByLabelText('Er opptjent ferie avviklet?').should('exist');

      selectArbeidstakerSituasjon('Midlertidig arbeidsforhold er avsluttet/har nådd sluttdato');
      cy.findByLabelText('Arbeidstiden er endret fra dato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Dato for endt arbeidsavtale (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Oppsigelsestid i følge lov eller avtale').should('not.exist');
      cy.findByLabelText('Ordinær lønn utbetales til og med (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Beskriv årsaken(e) til at arbeidsforholdet opphørte/arbeidstiden ble redusert').should(
        'not.exist',
      );

      selectArbeidstakerSituasjon(
        'Arbeidstakeren har vært ekstrahjelp/tilkallingsvikar og har fått redusert arbeidstiden',
      );
      cy.findByLabelText('Dato for endt arbeidsavtale (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Arbeidstiden er redusert fra dato (dd.mm.åååå)').should('exist');
      cy.findByLabelText(avtaleLabel).should('not.exist');
      cy.findByLabelText('Hva var størrelsen på arbeidstakers stilling?').should('not.exist');
      cy.findByLabelText('Er opptjent ferie avviklet?').should('not.exist');
    });

    it('toggles termination details, alertstripe, work arrangement details and ferie fields', () => {
      selectArbeidstakerSituasjon('Arbeidstakeren er helt oppsagt av arbeidsgiver');
      cy.findByLabelText('Arbeidsforholdet opphørte (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Oppsigelse fra arbeidstaker ble mottatt (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Har arbeidstaker sagt opp selv som alternativ til å bli sagt opp?').should('not.exist');

      selectArbeidstakerSituasjon('Arbeidstakeren har sagt opp stillingen');
      cy.findByLabelText('Arbeidsforholdet opphørte (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Oppsigelse fra arbeidstaker ble mottatt (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Har arbeidstaker sagt opp selv som alternativ til å bli sagt opp?').should('exist');

      selectArbeidstakerSituasjon('Arbeidstakeren er avskjediget');
      cy.findByLabelText('Beskriv årsaken(e) til at arbeidsforholdet opphørte/avskjedigelsen').should('exist');
      cy.findByLabelText('Utbetales det lønn i oppsigelsestid?').should('exist');
      cy.findByLabelText('Beskriv årsaken(e) til at arbeidsforholdet opphørte/arbeidstiden ble redusert').should(
        'not.exist',
      );

      selectArbeidstakerSituasjon('Arbeidstakeren er helt oppsagt av arbeidsgiver');
      cy.withinComponent(avtaleLabel, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByText('Du må legge ved kopi av avtalen').should('exist');
      cy.withinComponent(avtaleLabel, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByText('Du må legge ved kopi av avtalen').should('not.exist');

      cy.withinComponent('Har arbeidstaker takket nei til tilbud om annet arbeid i virksomheten?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Redegjør nærmere for tilbudet og avslaget').should('exist');
      cy.withinComponent('Har arbeidstaker takket nei til tilbud om annet arbeid i virksomheten?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Redegjør nærmere for tilbudet og avslaget').should('not.exist');

      cy.withinComponent('Hva var størrelsen på arbeidstakers stilling?', () => {
        cy.findByRole('radio', { name: 'Deltid' }).click();
      });
      cy.findByLabelText('Oppgi stillingsprosenten').should('exist');
      cy.withinComponent('Hva var størrelsen på arbeidstakers stilling?', () => {
        cy.findByRole('radio', { name: 'Heltid' }).click();
      });
      cy.findByLabelText('Oppgi stillingsprosenten').should('not.exist');

      cy.withinComponent('Hva var arbeidstakers arbeidstidsordning?', () => {
        cy.findByRole('radio', { name: 'Fast ukentlig arbeidstid' }).click();
      });
      cy.findByLabelText('Oppgi antall timer per uke').should('exist');
      cy.findByRole('textbox', { name: 'Arbeidsperioden gjelder fra (dd.mm.åååå)' }).should('not.exist');

      cy.withinComponent('Hva var arbeidstakers arbeidstidsordning?', () => {
        cy.findByRole('radio', { name: 'Skift/turnus/rotasjon' }).click();
      });
      cy.findByLabelText('Oppgi antall timer per uke').should('not.exist');
      cy.findByRole('textbox', { name: 'Arbeidsperioden gjelder fra (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Friperioden skal avvikles fra (dd.mm.åååå)' }).should('exist');

      cy.withinComponent('Er opptjent ferie avviklet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Skal opptjent ferie avvikles?').should('exist');
      cy.withinComponent('Skal opptjent ferie avvikles?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Ferie skal avvikles fra (dd.mm.åååå)' }).should('exist');
      cy.withinComponent('Skal opptjent ferie avvikles?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Ferie skal avvikles fra (dd.mm.åååå)' }).should('not.exist');
    });
  });

  describe('Tabell 1 conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040803/arbeidstid?sub=paper');
      cy.defaultWaits();
      setArbeidstidHistorikk(/^Arbeidstaker har hatt varierende arbeidstid/, true);
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tabell 1' }).click();
    });

    it('hides the 52-week datagrid when timelister will be attached', () => {
      cy.findByRole('textbox', { name: 'Uke/år' }).should('exist');

      cy.findByRole('checkbox', { name: tableAttachmentLabel }).click();
      cy.contains('Husk at i vedlegget').should('exist');
      cy.findByRole('textbox', { name: 'Uke/år' }).should('not.exist');
      cy.findByLabelText('Antall timer').should('not.exist');

      cy.findByRole('checkbox', { name: tableAttachmentLabel }).click();
      cy.findByRole('textbox', { name: 'Uke/år' }).should('exist');
      cy.findByLabelText('Antall timer').should('exist');
    });
  });

  describe('Tabell 2 conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040803/arbeidstid?sub=paper');
      cy.defaultWaits();
      setArbeidstidHistorikk(/^Arbeidstaker ønsker at NAV vurderer den gjennomsnittlige arbeidstiden/, true);
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tabell 2' }).click();
    });

    it('hides both 36-month datagrids when timelister will be attached', () => {
      cy.findAllByRole('textbox', { name: 'Uke/år' }).should('have.length', 2);
      cy.findAllByLabelText('Antall timer').should('have.length', 2);

      cy.findByRole('checkbox', { name: tableAttachmentLabel }).click();
      cy.contains('Husk at i vedlegget').should('exist');
      cy.findAllByRole('textbox', { name: 'Uke/år' }).should('have.length', 0);
      cy.findAllByLabelText('Antall timer').should('have.length', 0);
    });
  });

  describe('Vedlegg cross-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040803/arbeidstid?sub=paper');
      cy.defaultWaits();
    });

    it('shows kopi av sluttavtale only when economic agreement is yes', () => {
      selectArbeidstakerSituasjon('Arbeidstakeren er helt oppsagt av arbeidsgiver');
      cy.withinComponent(avtaleLabel, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av sluttavtale/ }).should('exist');
    });

    it('hides kopi av sluttavtale when economic agreement is no', () => {
      selectArbeidstakerSituasjon('Arbeidstakeren er helt oppsagt av arbeidsgiver');
      cy.withinComponent(avtaleLabel, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av sluttavtale/ }).should('not.exist');
    });

    it('shows timelister only when one of the table attachment checkboxes is checked', () => {
      setArbeidstidHistorikk(/^Arbeidstaker har hatt varierende arbeidstid/, true);
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tabell 1' }).click();
      cy.findByRole('checkbox', { name: tableAttachmentLabel }).click();

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Timelister/ }).should('exist');
    });

    it('hides timelister when no table attachment checkbox is checked', () => {
      setArbeidstidHistorikk(/^Arbeidstaker har hatt varierende arbeidstid/, true);
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Timelister/ }).should('not.exist');
    });
  });
});
