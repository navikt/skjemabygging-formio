/*
 * Tests datagrid component
 */
describe('Datagrid', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Optional fields in datagrid', () => {
    it('does not trigger validation error on optional fields in datagrid rows', () => {
      cy.visit('/fyllut/datagrid123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.clickSaveAndContinue();
      cy.findByText('For å gå videre må du rette opp følgende:').should('not.exist');
      cy.findByText('Dette er ikke et gyldig kontonummer').should('not.exist');
      cy.findByText('Dette er ikke et gyldig organisasjonsnummer').should('not.exist');
      cy.findByText('Dette er ikke et gyldig fødselsnummer eller D-nummer').should('not.exist');
    });

    it('does not display empty datagrid rows on summary page', () => {
      cy.visit('/fyllut/datagrid123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('be.visible');
      cy.get('.data-grid__row').should('not.exist');
    });
  });

  describe('Datagrid inside container', () => {
    it('displays fields on summary page', () => {
      cy.visit('/fyllut/containerdatagrid123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.clickSaveAndContinue();
      cy.findByRole('group', { name: 'Vis beholder med repeterende data' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).check();
      });
      cy.findByRole('textbox', { name: 'Tekstfelt i datagrid' }).type('Sjokolade');
      cy.findByRole('textbox', { name: 'Dato i datagrid' }).type('12.02.2024');
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.findByText('Sjokolade').shouldBeVisible();
      cy.findByText('12.02.2024').shouldBeVisible();
    });

    it('gets populated with values from mellomlagring', () => {
      cy.mocksUseRouteVariant('get-soknad:containerdatagrid123-complete');
      cy.visit(
        '/fyllut/containerdatagrid123/oppsummering?sub=digital&innsendingsId=b5ea6d20-cc84-4562-9051-ecd5d9a24220',
      );
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.findByText('Tekstfelt-verdi').shouldBeVisible();
      cy.findByText('31.12.2025').shouldBeVisible();
      cy.findByText('Tekstfelt-verdi2').shouldBeVisible();
      cy.findByText('31.12.2026').shouldBeVisible();
    });
  });
});
