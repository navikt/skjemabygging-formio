describe('Email', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/email/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'E-post';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
      cy.findByLabelText(label).should('have.attr', 'autocomplete', 'email');
    });

    it('should have description', () => {
      const label = 'E-post med beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/email/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'E-post påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('test@nav.no');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'E-post ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate invalid email format', () => {
      const label = 'E-post ugyldig format';
      const errorMessage = 'E-post ugyldig format må være en gyldig epost-adresse (for eksempel navn@eksempel.no)';
      cy.findByLabelText(`${label} (valgfritt)`).type('ugyldig-epost');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(`${label} (valgfritt)`).should('have.focus');
      cy.focused().clear();
      cy.focused().type('test@nav.no');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should validate with custom validation', () => {
      const label = 'E-post egendefinert';
      const errorMessage = 'E-postadressen må inneholde nav';
      cy.findByLabelText(`${label} (valgfritt)`).type('annen@epost.no');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(`${label} (valgfritt)`).should('have.focus');
      cy.focused().clear();
      cy.focused().type('test@nav.no');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/email?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'E-post' }).type('test@nav.no');
      cy.findByRole('textbox', { name: 'E-post med beskrivelse' }).type('test@nav.no');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'E-post påkrevd' }).type('test@nav.no');
      cy.findByRole('textbox', { name: 'E-post ikke påkrevd (valgfritt)' }).type('test@nav.no');
      cy.findByRole('textbox', { name: 'E-post ugyldig format (valgfritt)' }).type('test@nav.no');
      cy.findByRole('textbox', { name: 'E-post egendefinert (valgfritt)' }).type('test@nav.no');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'E-post');
        cy.get('dd').eq(0).should('contain.text', 'test@nav.no');
        cy.get('dt').eq(1).should('contain.text', 'E-post med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'test@nav.no');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'E-post påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'test@nav.no');
        cy.get('dt').eq(1).should('contain.text', 'E-post ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', 'test@nav.no');
        cy.get('dt').eq(2).should('contain.text', 'E-post ugyldig format');
        cy.get('dd').eq(2).should('contain.text', 'test@nav.no');
        cy.get('dt').eq(3).should('contain.text', 'E-post egendefinert');
        cy.get('dd').eq(3).should('contain.text', 'test@nav.no');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/email/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and description', () => {
      cy.withinComponent('E-post med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
