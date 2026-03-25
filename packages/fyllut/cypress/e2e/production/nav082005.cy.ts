/*
 * Production form tests for Søknad om unntak fra arbeidsgiveransvar for sykepenger
 * Form: nav082005
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om arbeidstaker (opplysningerOmArbeidstaker): 2 same-panel conditionals
 *       harArbeidstagerNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker
 *       harArbeidstagerNorskFodselsnummerEllerDNummer → erArbeidstakerIEtArbeidsforholdIDag
 */

describe('nav082005', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Opplysninger om arbeidstaker – fnr conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082005/opplysningerOmArbeidstaker?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr and employment fields only when arbeidstaker has fnr', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByLabelText('Er arbeidstaker i et arbeidsforhold i dag?').should('not.exist');

      cy.withinComponent('Har arbeidstaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByLabelText('Er arbeidstaker i et arbeidsforhold i dag?').should('exist');
    });

    it('hides fnr and employment fields when arbeidstaker has no fnr', () => {
      cy.withinComponent('Har arbeidstaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByLabelText('Er arbeidstaker i et arbeidsforhold i dag?').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082005?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no fields, just navigate forward
      cy.clickNextStep();

      // Opplysninger om arbeidstaker – use fnr path
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har arbeidstaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Er arbeidstaker i et arbeidsforhold i dag?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Opplysninger om arbeidsgiver
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('123456785');
      cy.clickNextStep();

      // Arbeid/sykefravær – fill one row of the datagrid
      cy.findAllByRole('textbox', { name: /Sykefravær fra dato/ })
        .first()
        .type('01.01.2025');
      cy.findAllByRole('textbox', { name: /Sykefravær til dato/ })
        .first()
        .type('15.01.2025');
      cy.clickNextStep();

      // Vedlegg – handle annen dokumentasjon attachment
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om arbeidstaker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Opplysninger om arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
    });
  });
});
