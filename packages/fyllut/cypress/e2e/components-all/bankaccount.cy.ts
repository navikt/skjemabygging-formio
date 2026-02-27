describe('BankAccount', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/bankaccount/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Kontonummer';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description', () => {
      const label = 'Kontonummer med beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
        cy.contains('Dette er utvidet beskrivelse').should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains('Dette er utvidet beskrivelse').shouldBeVisible();
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/bankaccount/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Kontonummer påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('01234567892');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Kontonummer ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate invalid account number', () => {
      const label = 'Kontonummer ugyldig';
      const errorMessage = 'Dette er ikke et gyldig kontonummer. Sjekk at du har tastet riktig.';
      cy.findByLabelText(`${label} (valgfritt)`).type('12345678901');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(`${label} (valgfritt)`).should('have.focus');
      cy.focused().clear();
      cy.focused().type('01234567892');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/bankaccount?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
      cy.findByRole('textbox', { name: 'Kontonummer med beskrivelse' }).type('01234567892');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Kontonummer påkrevd' }).type('01234567892');
      cy.findByRole('textbox', { name: 'Kontonummer ikke påkrevd (valgfritt)' }).type('01234567892');
      cy.findByRole('textbox', { name: 'Kontonummer ugyldig (valgfritt)' }).type('01234567892');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Kontonummer');
        cy.get('dd').eq(0).should('contain.text', '0123 45 67892');
        cy.get('dt').eq(1).should('contain.text', 'Kontonummer med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', '0123 45 67892');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Kontonummer påkrevd');
        cy.get('dd').eq(0).should('contain.text', '0123 45 67892');
        cy.get('dt').eq(1).should('contain.text', 'Kontonummer ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', '0123 45 67892');
        cy.get('dt').eq(2).should('contain.text', 'Kontonummer ugyldig');
        cy.get('dd').eq(2).should('contain.text', '0123 45 67892');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/bankaccount/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and description', () => {
      cy.withinComponent('Kontonummer med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
