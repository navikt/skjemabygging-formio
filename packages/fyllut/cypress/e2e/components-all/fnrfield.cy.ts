describe('FnrField', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/fnrfield/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable with no spellcheck', () => {
      const label = 'Fødselsnummer eller d-nummer';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
      cy.findByLabelText(label).should('not.have.attr', 'spellcheck');
    });

    it('should have description', () => {
      const label = 'Fødselsnummer med beskrivelse';
      const additionalDescription = 'Utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });
  });

  describe('Validation', () => {
    let label;

    beforeEach(() => {
      label = 'Fødselsnummer påkrevd';
      cy.visit('/fyllut/fnrfield/validering?sub=paper');
      cy.defaultWaits();
    });

    it('validates with required', () => {
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('27908095087');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('validates invalid checksum', () => {
      cy.findByRole('textbox', { name: label }).type('18907299827');
      cy.clickNextStep();
      cy.findAllByText('Dette er ikke et gyldig fødselsnummer eller d-nummer (11 siffer)').should('have.length', 2);
    });

    it('allows test-IDs', () => {
      cy.findByRole('textbox', { name: label }).type('18907299828');
      cy.clickNextStep();
      cy.findAllByText('Dette er ikke et gyldig fødselsnummer eller d-nummer (11 siffer)').should('have.length', 0);
    });

    describe('In prod', () => {
      beforeEach(() => {
        cy.defaultIntercepts();
        cy.intercept('GET', 'fyllut/api/config*', { NAIS_CLUSTER_NAME: 'prod-gcp' }).as('getConfig');
        cy.visit('/fyllut/fnrfield/validering?sub=paper');
        cy.defaultWaits();
      });

      it('does not allow test-ID in production', () => {
        cy.findByRole('textbox', { name: label }).type('18907299828');
        cy.clickNextStep();
        cy.findAllByText('Dette er ikke et gyldig fødselsnummer eller d-nummer (11 siffer)').should('have.length', 2);
      });
    });
  });
});
