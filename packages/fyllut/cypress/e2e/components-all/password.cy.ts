describe('Password', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/password/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Passord';
      cy.findByLabelText(label).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should render as a masked input', () => {
      cy.findByLabelText('Passord').should('have.attr', 'type', 'password');
    });

    it('should have description', () => {
      const label = 'Passord med beskrivelse';
      const additionalDescription = 'Dette er utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/password/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Passord påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('hemmelig');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Passord ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate min length', () => {
      const label = 'Passord min og max';
      const errorMessage = `${label} må ha minst 8 tegn`;
      cy.findByLabelText(`${label} (valgfritt)`).type('kort');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('langtpassord');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should validate max length', () => {
      const label = 'Passord min og max';
      const errorMessage = `${label} kan ikke ha mer enn 16 tegn`;
      cy.findByLabelText(`${label} (valgfritt)`).type('dettepassordetforlangt');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('passe');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should support custom validation', () => {
      const label = 'Passord egendefinert';
      const errorMessage = 'Kun hemmelig er tillatt';
      cy.findByLabelText(`${label} (valgfritt)`).type('feil');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('hemmelig');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/password?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByLabelText('Passord').type('hemmelig');
      cy.findByLabelText('Passord med beskrivelse').type('hemmelig');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByLabelText('Passord påkrevd').type('hemmelig');
      cy.findByLabelText('Passord ikke påkrevd (valgfritt)').type('hemmelig');
      cy.findByLabelText('Passord min og max (valgfritt)').type('langtpassord');
      cy.findByLabelText('Passord egendefinert (valgfritt)').type('hemmelig');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Passord');
        cy.get('dt').eq(1).should('contain.text', 'Passord med beskrivelse');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Passord påkrevd');
        cy.get('dt').eq(1).should('contain.text', 'Passord ikke påkrevd');
        cy.get('dt').eq(2).should('contain.text', 'Passord min og max');
        cy.get('dt').eq(3).should('contain.text', 'Passord egendefinert');
      });
      // testDownloadPdf is skipped: password fields have protected: true and are excluded from submission data
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/password/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and descriptions', () => {
      cy.withinComponent('Passord med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Dette er utvidet beskrivelse (en)').shouldBeVisible();
      });
    });
  });
});
