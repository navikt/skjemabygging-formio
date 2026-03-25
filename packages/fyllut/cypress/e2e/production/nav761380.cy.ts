/*
 * Production form tests for Søknad om funksjonsassistanse
 * Form: nav761380
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Behov (behov): 4 same-panel conditional groups
 *       hvaSokerDereOm → kunFunksjonsassistanse, antallTimerMedFunksjonsassistansePerUke, arbeidsreiser
 *       harBedriftenFastprisFra3Part → hvemLevererAssistansen, harArbeidsgiverTilAssistentenFastTimepris, sporsmalVedrorendeLonn
 *       harArbeidsgiverTilAssistentenFastTimepris → hvaErTimeprisen1
 *       onskerDereASendeInnDokumentasjonPaBehovet → hvaSlagsTypeDokumentasjon
 *   - Vedlegg (vedlegg): 2 cross-panel conditionals from hvaSlagsTypeDokumentasjon
 *       arbeidsplassvurderingFraBedriftshelsetjenesteErgoterapeutFysioterapeut
 *       medisinskDokumentasjonPaBehovet
 */

describe('nav761380', () => {
  const selectHvaSokerDereOm = (option: 'Funksjonsassistanse' | 'Funksjonsassistanse på arbeidsreise') => {
    cy.findByRole('group', { name: 'Hva søker dere om?' }).within(() => {
      cy.findByRole('checkbox', { name: option }).check();
    });
  };

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Behov conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761380/behov?sub=paper');
      cy.defaultWaits();
    });

    it('toggles funksjonsassistanse and arbeidsreise fields from selectboxes', () => {
      cy.findByRole('textbox', { name: 'Beskrivelse av arbeidstakers arbeidsoppgaver' }).should('not.exist');
      cy.findByLabelText('Antall timer med funksjonsassistanse per uke').should('not.exist');
      cy.findByLabelText('Antatt månedlige kostnader for arbeidsreise').should('not.exist');

      selectHvaSokerDereOm('Funksjonsassistanse');

      cy.findByRole('textbox', { name: 'Beskrivelse av arbeidstakers arbeidsoppgaver' }).should('exist');
      cy.findByLabelText('Antall timer med funksjonsassistanse per uke').should('exist');
      cy.findByLabelText('Antatt månedlige kostnader for arbeidsreise').should('not.exist');

      cy.findByRole('group', { name: 'Hva søker dere om?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Funksjonsassistanse' }).uncheck();
        cy.findByRole('checkbox', { name: 'Funksjonsassistanse på arbeidsreise' }).check();
      });

      cy.findByRole('textbox', { name: 'Beskrivelse av arbeidstakers arbeidsoppgaver' }).should('exist');
      cy.findByLabelText('Antall timer med funksjonsassistanse per uke').should('not.exist');
      cy.findByLabelText('Antatt månedlige kostnader for arbeidsreise').should('exist');
    });

    it('toggles external supplier and salary questions when supplier type changes', () => {
      selectHvaSokerDereOm('Funksjonsassistanse');

      cy.findByRole('textbox', { name: 'Hvem leverer assistansen?' }).should('not.exist');
      cy.findByLabelText('Har arbeidsgiver til assistenten fast timepris?').should('not.exist');
      cy.findByLabelText('Brutto timesats til assistenten').should('not.exist');

      cy.withinComponent('Leveres assistansen av et eksternt firma?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvem leverer assistansen?' }).should('exist');
      cy.findByLabelText('Har arbeidsgiver til assistenten fast timepris?').should('exist');
      cy.findByLabelText('Brutto timesats til assistenten').should('not.exist');

      cy.withinComponent('Leveres assistansen av et eksternt firma?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvem leverer assistansen?' }).should('not.exist');
      cy.findByLabelText('Har arbeidsgiver til assistenten fast timepris?').should('not.exist');
      cy.findByLabelText('Brutto timesats til assistenten').should('exist');
      cy.findByLabelText('Årlig kostnad forsikringer').should('exist');
    });

    it('toggles timepris field when fast timepris changes', () => {
      selectHvaSokerDereOm('Funksjonsassistanse');
      cy.withinComponent('Leveres assistansen av et eksternt firma?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hva er timeprisen?').should('not.exist');

      cy.withinComponent('Har arbeidsgiver til assistenten fast timepris?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hva er timeprisen?').should('exist');

      cy.withinComponent('Har arbeidsgiver til assistenten fast timepris?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hva er timeprisen?').should('not.exist');
    });

    it('toggles documentation type selectboxes when documentation is requested', () => {
      cy.findByRole('group', { name: 'Hva slags type dokumentasjon?' }).should('not.exist');

      cy.withinComponent('Ønsker dere å sende inn dokumentasjon på behovet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: 'Hva slags type dokumentasjon?' }).should('exist');

      cy.withinComponent('Ønsker dere å sende inn dokumentasjon på behovet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: 'Hva slags type dokumentasjon?' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761380/behov?sub=paper');
      cy.defaultWaits();
      cy.withinComponent('Ønsker dere å sende inn dokumentasjon på behovet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
    });

    it('shows arbeidsplassvurdering attachment when that documentation type is selected', () => {
      cy.findByRole('group', { name: 'Hva slags type dokumentasjon?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Arbeidsplassvurdering' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Arbeidsplassvurdering fra bedriftshelsetjeneste/ }).should('exist');
      cy.findByRole('group', { name: /Medisinsk dokumentasjon av behovet/ }).should('not.exist');
    });

    it('shows medisinsk attachment when that documentation type is selected', () => {
      cy.findByRole('group', { name: 'Hva slags type dokumentasjon?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Medisinsk dokumentasjon' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Medisinsk dokumentasjon av behovet/ }).should('exist');
      cy.findByRole('group', { name: /Arbeidsplassvurdering fra bedriftshelsetjeneste/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761380?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Stillingsprosent hos arbeidsgiver').type('100');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Bedriftens navn' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Hovedenhetens organisasjonsnummer' }).type('889640782');
      cy.findByRole('textbox', { name: 'Underenhetens organisasjonsnummer' }).type('974760673');
      cy.findByRole('textbox', { name: 'Bankkontonummer' }).type('01234567892');
      cy.findByRole('textbox', { name: /Kontaktperson hos arbeidsgiver/ }).type('Kari Nordmann');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).type('test@example.com');
      cy.clickNextStep();

      cy.findByRole('group', { name: 'Hva søker dere om?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Funksjonsassistanse' }).check();
      });
      cy.findByRole('textbox', { name: 'Beskrivelse av arbeidstakers arbeidsoppgaver' }).type(
        'Arbeidstakeren trenger støtte til praktiske oppgaver i arbeidshverdagen.',
      );
      cy.findByRole('textbox', { name: 'Funksjonsbeskrivelse og begrunnelse for behovet' }).type(
        'Det er behov for funksjonsassistanse for å kunne utføre arbeidsoppgavene.',
      );
      cy.findByLabelText('Antall timer med funksjonsassistanse per uke').type('10');
      cy.findByRole('textbox', { name: 'Ønsket startdato (dd.mm.åååå)' }).type('01.01.2027');
      cy.findByRole('textbox', { name: 'Beskriv funksjonsassistentens oppgaver' }).type(
        'Hjelp med tilrettelegging og løft i løpet av arbeidsdagen.',
      );
      cy.withinComponent('Leveres assistansen av et eksternt firma?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvem leverer assistansen?' }).type('Assistansepartner AS');
      cy.withinComponent('Har arbeidsgiver til assistenten fast timepris?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hva er timeprisen?').type('500');
      cy.withinComponent('Ønsker dere å sende inn dokumentasjon på behovet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: 'Hva slags type dokumentasjon?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Arbeidsplassvurdering' }).check();
      });
      cy.clickNextStep();

      cy.findByRole('checkbox', {
        name: /Jeg bekrefter å ha gitt NAV riktige og fullstendige opplysninger/,
      }).click();
      cy.findByRole('checkbox', {
        name: /Jeg har informert arbeidstaker om at NAV kan dele følgende opplysninger/,
      }).click();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Arbeidsplassvurdering fra bedriftshelsetjeneste/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/i }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Arbeidstaker', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Arbeidsgiver', () => {
        cy.contains('dt', 'Bedriftens navn').next('dd').should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Behov', () => {
        cy.contains('dt', 'Hva søker dere om?').next('dd').should('contain.text', 'Funksjonsassistanse');
      });
    });
  });
});
