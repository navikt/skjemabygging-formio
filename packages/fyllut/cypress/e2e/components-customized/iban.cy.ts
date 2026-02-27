describe('IBAN', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/iban/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'IBAN';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description', () => {
      const label = 'IBAN med beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/iban/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'IBAN påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('NO9386011117947');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'IBAN ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate invalid IBAN', () => {
      const label = 'IBAN ugyldig';
      const errorMessage = 'Oppgitt IBAN har feil lengde.';
      cy.findByLabelText(`${label} (valgfritt)`).type('NO1234');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(`${label} (valgfritt)`).should('have.focus');
      cy.focused().clear();
      cy.focused().type('NO9386011117947');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/iban?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'IBAN' }).type('NO9386011117947');
      cy.findByRole('textbox', { name: 'IBAN med beskrivelse' }).type('NO9386011117947');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'IBAN påkrevd' }).type('NO9386011117947');
      cy.findByRole('textbox', { name: 'IBAN ikke påkrevd (valgfritt)' }).type('NO9386011117947');
      cy.findByRole('textbox', { name: 'IBAN ugyldig (valgfritt)' }).type('NO9386011117947');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'IBAN');
        cy.get('dd').eq(0).should('contain.text', 'NO93 8601 1117 947');
        cy.get('dt').eq(1).should('contain.text', 'IBAN med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'NO93 8601 1117 947');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'IBAN påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'NO93 8601 1117 947');
        cy.get('dt').eq(1).should('contain.text', 'IBAN ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', 'NO93 8601 1117 947');
        cy.get('dt').eq(2).should('contain.text', 'IBAN ugyldig');
        cy.get('dd').eq(2).should('contain.text', 'NO93 8601 1117 947');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/iban/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and description', () => {
      cy.withinComponent('IBAN med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
