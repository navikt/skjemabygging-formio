/*
 * Production form tests for Bekreftelse på vedtak om uføretrygd for utstedelse av honnørkort
 * Form: nav120615
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 3 same-panel conditionals
 *       harDuBostedsEllerOppholdsadresseINorge → vegadresseEllerPostboksadresse (show when ja)
 *       vegadresseEllerPostboksadresse → navSkjemagruppeVegadresse (show when vegadresse)
 *       vegadresseEllerPostboksadresse → navSkjemagruppePostboksadresse (show when postboksadresse)
 */

describe('nav120615', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120615/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address-type question only when user has Norwegian address', () => {
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');

      cy.withinComponent('Har du bosteds- eller oppholdsadresse i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Har du bosteds- eller oppholdsadresse i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
    });

    it('shows vegadresse fields when vegadresse is selected and postboks fields when postboksadresse is selected', () => {
      cy.withinComponent('Har du bosteds- eller oppholdsadresse i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120615?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger – choose "Nei" for Norwegian address to avoid extra required fields
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: 'Utenlandsk identitetsnummer / fødselsnummer' }).type('123456789');
      cy.findByRole('textbox', { name: 'Nasjonalitet' }).type('Tysk');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).type('Testgata 1');
      cy.findByRole('textbox', { name: 'Land' }).type('Tyskland');
      cy.withinComponent('Har du bosteds- eller oppholdsadresse i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Bekreftelse på stønad tilsvarende norsk uføretrygd
      cy.findByRole('textbox', { name: 'Stønadstype' }).type('Uføretrygd');
      cy.findByRole('textbox', { name: 'Grad av uførhet' }).type('50');
      cy.clickNextStep();

      // Vedlegg – annen dokumentasjon has 2 options (leggerVedNaa, nei)
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Bekreftelse på stønad tilsvarende norsk uføretrygd', () => {
        cy.get('dt').eq(0).should('contain.text', 'Stønadstype');
        cy.get('dd').eq(0).should('contain.text', 'Uføretrygd');
      });
    });
  });
});
