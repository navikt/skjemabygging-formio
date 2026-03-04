/*
 * Tests that the select boxes component (react) renders and functions correctly
 */

import { expect } from 'chai';

describe('Select boxes', () => {
  before(() => {
    cy.configMocksServer();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Paper', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/selectboxestest/selectBoxes?sub=paper');
      cy.defaultWaits();
    });

    it('should check 2 select boxes and show correct values in summary', () => {
      cy.findByRole('group', { name: 'Select boxes' }).within(() => {
        cy.findByRole('checkbox', { name: 'Choice 1' }).check();
      });

      cy.findByLabelText('Select boxes with description').within(() => {
        cy.findByRole('checkbox', { name: 'Choice 2' }).check();
      });

      cy.clickNextStep();

      cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).check();

      cy.clickNextStep();

      // Summary
      cy.get('dl')
        .first()
        .within(() => {
          // Select boxes
          cy.get('li').eq(0).should('contain.text', 'Choice 1');

          // Select boxes with defaultValue
          cy.get('li').eq(1).should('contain.text', 'Choice 1');
          cy.get('li').eq(2).should('contain.text', 'Choice 2');

          // Select boxes with description
          cy.get('li').eq(3).should('contain.text', 'Choice 2');
        });
    });

    it('should show error for required select boxes', () => {
      cy.clickNextStep();

      // Error summary
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Select boxes' }).should('exist');
        });

      // Component error
      cy.findAllByText('Du må fylle ut: Select boxes').should('have.length', 2);
    });

    it('should show description', () => {
      cy.findByText('Normal description').should('exist');
      cy.findByRole('button', { name: 'Extended description' }).should('exist');
      cy.findByRole('button', { name: 'Extended description' }).click();
      cy.findByText('Extended description text').should('exist');
    });
  });

  describe('Digital', () => {
    it('should have correct submission values', () => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/selectboxestest/selectBoxes?sub=digital');
      cy.defaultWaits();

      cy.findByRole('group', { name: 'Select boxes' }).within(() => {
        cy.findByRole('checkbox', { name: 'Choice 3' }).check();
      });

      cy.findByLabelText('Select boxes with description').within(() => {
        cy.findByRole('checkbox', { name: 'Choice 4' }).check();
      });

      cy.clickSaveAndContinue();

      cy.submitMellomlagring((req) => {
        const {
          submission: { data },
        } = req.body;

        // Select boxes
        expect(data.selectBoxes.choice1).to.equal(false);
        expect(data.selectBoxes.choice2).to.equal(false);
        expect(data.selectBoxes.choice3).to.equal(true);

        // Select boxes with defaultValue
        expect(data.selectBoxesWithDefaultValue.choice1).to.equal(true);
        expect(data.selectBoxesWithDefaultValue.choice2).to.equal(true);
        expect(data.selectBoxesWithDefaultValue.choice3).to.equal(false);

        // Select boxes with description
        expect(data.selectBoxesWithDescription.choice1).to.equal(false);
        expect(data.selectBoxesWithDescription.choice2).to.equal(false);
        expect(data.selectBoxesWithDescription.choice3).to.equal(false);
        expect(data.selectBoxesWithDescription.choice4).to.equal(true);
        expect(data.selectBoxesWithDescription.choice5).to.equal(false);
      });

      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
    });

    it('should load mellomlagring', () => {
      cy.mocksUseRouteVariant('get-soknad:success-select-boxes');

      cy.defaultIntercepts();
      cy.visit('/fyllut/selectboxestest/selectBoxes?sub=digital&innsendingsId=e5a341ee-810d-4138-9550-b96d5c307cb6');
      cy.defaultWaits();

      cy.findByRole('group', { name: 'Select boxes' }).within(() => {
        cy.findByRole('checkbox', { name: 'Choice 1' }).should('be.checked');
        cy.findByRole('checkbox', { name: 'Choice 2' }).should('not.be.checked');
        cy.findByRole('checkbox', { name: 'Choice 3' }).should('not.be.checked');
      });

      cy.findByRole('group', { name: 'Select boxes with defaultValue' }).within(() => {
        cy.findByRole('checkbox', { name: 'Choice 1' }).should('be.checked');
        cy.findByRole('checkbox', { name: 'Choice 2' }).should('be.checked');
        cy.findByRole('checkbox', { name: 'Choice 3' }).should('not.be.checked');
      });

      cy.findByLabelText('Select boxes with description').within(() => {
        cy.findByRole('checkbox', { name: 'Choice 1' }).should('be.checked');
        cy.findByRole('checkbox', { name: 'Choice 2' }).should('not.be.checked');
        cy.findByRole('checkbox', { name: 'Choice 3' }).should('not.be.checked');
        cy.findByRole('checkbox', { name: 'Choice 4' }).should('not.be.checked');
        cy.findByRole('checkbox', { name: 'Choice 5' }).should('not.be.checked');
      });
    });
  });
});
