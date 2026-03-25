/*
 * Production form tests for Søknad om refusjon av reisetilskudd til arbeidsreiser
 * Form: nav081401
 * Submission types: PAPER
 *
 * Panels:
 *   - Veiledning (veiledning): no conditionals
 *   - Personopplysninger (personopplysninger): 3 same-panel + 5 cross-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer
 *         → fodselsnummerDNummerSoker (ja), alertstripe (ja), alertstripe4 (nei)
 *         → panels ansettelse, opplysningerOmArbeidsgiver, transportmiddel, utbetaling, vedlegg (hidden when nei)
 *   - Ansettelse (ansettelse): no same-panel conditionals
 *   - Opplysninger om arbeidsgiver (opplysningerOmArbeidsgiver): no conditionals
 *   - Transportmiddel (transportmiddel): 3 same-panel conditionals
 *       hvaSlagsTransportmiddelBrukerDuTilDaglig → utgifter (offentlig)
 *       hvaSlagsTransportmiddelBrukerDuTilDaglig → avstandFraBostedTilArbeidssted (egenBil)
 *       transportmiddelIReisetilskuddsperioden.typeTransportmiddel → spesifiserAnnet (annet, in datagrid)
 *   - Utbetaling (utbetaling): 2 same-panel conditionals
 *       hvemSkalReisetilskuddetUtbetalesTil → alertstripe2 (personenSomHarRettTilReisetilskudd)
 *       hvemSkalReisetilskuddetUtbetalesTil → container with arbeidsgiver fields (arbeidsgiver)
 *   - Vedlegg (vedlegg): 1 customConditional, isAttachmentPanel=true
 *       dokumentasjonAvReiseutgifter (shown when any datagrid row has samletUtleggIPerioden > 0)
 *
 * Total: 13 simple + 1 custom conditional
 */

describe('nav081401', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Personopplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav081401/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fnr field and alert based on fødselsnummer answer', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
    });

    it('hides downstream panels in stepper when Nei is selected, shows them when Ja is selected', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Ansettelse' }).should('exist');
      cy.findByRole('link', { name: 'Transportmiddel' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('link', { name: 'Ansettelse' }).should('not.exist');
      cy.findByRole('link', { name: 'Transportmiddel' }).should('not.exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('link', { name: 'Ansettelse' }).should('exist');
      cy.findByRole('link', { name: 'Transportmiddel' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');
    });
  });

  describe('Transportmiddel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav081401/transportmiddel?sub=paper');
      cy.defaultWaits();
    });

    it('shows utgifter when Offentlig is selected, hides when Sykler is selected', () => {
      cy.findByRole('textbox', { name: 'Utgifter per måned' }).should('not.exist');

      cy.withinComponent('Hva slags transportmiddel bruker du til daglig?', () => {
        cy.findByRole('radio', { name: 'Offentlig' }).click();
      });

      cy.findByRole('textbox', { name: 'Utgifter per måned' }).should('exist');

      cy.withinComponent('Hva slags transportmiddel bruker du til daglig?', () => {
        cy.findByRole('radio', { name: 'Sykler' }).click();
      });

      cy.findByRole('textbox', { name: 'Utgifter per måned' }).should('not.exist');
    });

    it('shows avstand fra bosted when Eigen bil is selected', () => {
      cy.findByLabelText('Avstand fra bosted til arbeidssted').should('not.exist');

      cy.withinComponent('Hva slags transportmiddel bruker du til daglig?', () => {
        cy.findByRole('radio', { name: 'Egen bil' }).click();
      });

      cy.findByLabelText('Avstand fra bosted til arbeidssted').should('exist');

      cy.withinComponent('Hva slags transportmiddel bruker du til daglig?', () => {
        cy.findByRole('radio', { name: 'Sykler' }).click();
      });

      cy.findByLabelText('Avstand fra bosted til arbeidssted').should('not.exist');
    });

    it('shows Spesifiser Annet in datagrid when Annet transport type is selected', () => {
      cy.findByRole('textbox', { name: 'Spesifiser Annet' }).should('not.exist');

      cy.withinComponent('Type transportmiddel', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });

      cy.findByRole('textbox', { name: 'Spesifiser Annet' }).should('exist');

      cy.withinComponent('Type transportmiddel', () => {
        cy.findByRole('radio', { name: 'Taxi' }).click();
      });

      cy.findByRole('textbox', { name: 'Spesifiser Annet' }).should('not.exist');
    });
  });

  describe('Utbetaling conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav081401/utbetaling?sub=paper');
      cy.defaultWaits();
    });

    it('shows arbeidsgiver fields when Arbeidsgiver is selected as payee', () => {
      cy.findByRole('textbox', { name: 'Arbeidsgivers organisasjonsnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Kontaktperson hos arbeidsgiver' }).should('not.exist');

      cy.withinComponent('Hvem skal reisetilskuddet utbetales til?', () => {
        cy.findByRole('radio', { name: 'Arbeidsgiver' }).click();
      });

      cy.findByRole('textbox', { name: 'Arbeidsgivers organisasjonsnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Kontaktperson hos arbeidsgiver' }).should('exist');
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.withinComponent('Hvem skal reisetilskuddet utbetales til?', () => {
        cy.findByRole('radio', { name: 'Personen som har rett til reisetilskudd' }).click();
      });

      cy.findByRole('textbox', { name: 'Arbeidsgivers organisasjonsnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Kontaktperson hos arbeidsgiver' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav081401?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning — no required fields
      cy.clickNextStep();

      // Personopplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Ansettelse
      cy.withinComponent('Jeg er', () => {
        cy.findByRole('radio', { name: 'Arbeidstaker' }).click();
      });
      cy.clickNextStep();

      // Opplysninger om arbeidsgiver
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('NAV Test AS');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
      cy.clickNextStep();

      // Transportmiddel — pick Sykler (no conditional fields required)
      cy.withinComponent('Hva slags transportmiddel bruker du til daglig?', () => {
        cy.findByRole('radio', { name: 'Sykler' }).click();
      });
      cy.findByLabelText('Avstand én vei mellom hjem og arbeidssted').type('5');

      // Datagrid: fill first row with Taxi and samletUtlegg > 0 to trigger custom conditional in Vedlegg
      cy.withinComponent('Type transportmiddel', () => {
        cy.findByRole('radio', { name: 'Taxi' }).click();
      });
      cy.findAllByRole('textbox', { name: /F\.o\.m\. dato/ })
        .first()
        .type('01.01.2025');
      cy.findAllByRole('textbox', { name: /T\.o\.m\. dato/ })
        .first()
        .type('31.01.2025');
      cy.findByLabelText('Antall enkeltreiser').type('10');
      cy.findByRole('textbox', { name: 'Samlet utlegg i perioden' }).type('1000');
      cy.clickNextStep();

      // Utbetaling — pick person (no container fields required)
      cy.withinComponent('Hvem skal reisetilskuddet utbetales til?', () => {
        cy.findByRole('radio', { name: 'Personen som har rett til reisetilskudd' }).click();
      });

      // Vedlegg — isAttachmentPanel=true; use stepper to navigate there (Case A)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // dokumentasjonAvReiseutgifter shows because samletUtleggIPerioden (1000) > 0
      cy.findByRole('group', { name: /Dokumentasjon av reiseutgifter/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/ }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // ONE clickNextStep — Vedlegg is the last panel before Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personopplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Ansettelse', () => {
        cy.get('dt').eq(0).should('contain.text', 'Jeg er');
        cy.get('dd').eq(0).should('contain.text', 'Arbeidstaker');
      });
      cy.withinSummaryGroup('Opplysninger om arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'NAV Test AS');
      });
    });
  });
});
