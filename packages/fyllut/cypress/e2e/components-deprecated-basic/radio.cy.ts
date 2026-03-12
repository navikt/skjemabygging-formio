/*
 * Tests that the radio component (react) renders correctly
 */

describe('Radio', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  describe('Paper', () => {
    beforeEach(() => {
      cy.visit('/fyllut/radiotest/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('should render simple radio correctly', () => {
      cy.findAllByRole('group', { name: 'Simple' }).within(() => {
        cy.findAllByRole('radio', { name: 'Ja' }).should('exist');
        cy.findAllByRole('radio', { name: 'Nei' }).should('exist');
      });
    });

    it('should render radio with decriptions correctly', () => {
      // Description for each radio option
      cy.findByLabelText('With description').within(() => {
        cy.findAllByRole('radio', { name: 'First', description: 'This is the first option' }).should('exist');
        cy.findAllByRole('radio', { name: 'Second', description: 'This is the second option' }).should('exist');
        cy.findAllByRole('radio', { name: 'Third' }).should('exist');
      });

      // Normal and extended description
      cy.findByText('Normal description').should('exist');
      cy.findByRole('button', { name: 'Extended description header' }).should('exist');
      cy.findByRole('button', { name: 'Extended description header' }).click();
      cy.findByText('Extended description').should('exist');
    });
  });

  describe('Digital', () => {
    beforeEach(() => {
      cy.defaultInterceptsMellomlagring();
      cy.mocksUseRouteVariant('get-soknad:success-radio');
      cy.visit('/fyllut/radiotest/veiledning?sub=digital&innsendingsId=62a75280-2a85-4e56-9de2-84faa63a2111');
      cy.defaultWaits();
      cy.wait('@getMellomlagring');
    });

    it('should populate values from "mellomlagring"', () => {
      cy.findAllByRole('group', { name: 'Simple' }).within(() => {
        cy.findAllByRole('radio', { name: 'Nei' }).should('be.checked');
      });

      cy.findByLabelText('With description').within(() => {
        cy.findAllByRole('radio', { name: /^First/ }).should('be.checked');
      });
    });
  });
});
