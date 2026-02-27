// Settings from OrganizationNumber.form.ts: label, description, additionalDescription, required, customValidation.

describe('OrganizationNumber', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/organizationnumber/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Organisasjonsnummer';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description', () => {
      const label = 'Organisasjonsnummer med beskrivelse';
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
      cy.visit('/fyllut/organizationnumber/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Organisasjonsnummer påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('889640782');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Organisasjonsnummer ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate organization number format', () => {
      const label = 'Organisasjonsnummer ugyldig format';
      const errorMessage = 'Dette er ikke et gyldig organisasjonsnummer. Sjekk at du har tastet riktig.';
      cy.findByLabelText(`${label} (valgfritt)`).type('123456789');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('889640782');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should support custom validation', () => {
      const label = 'Organisasjonsnummer egendefinert';
      const errorMessage = 'Kun 889640782 er tillatt';
      cy.findByLabelText(`${label} (valgfritt)`).type('974652277');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('889640782');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/organizationnumber?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer med beskrivelse' }).type('974652277');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer påkrevd' }).type('889640782');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer ikke påkrevd (valgfritt)' }).type('974652277');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer ugyldig format (valgfritt)' }).type('889640782');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer egendefinert (valgfritt)' }).type('889640782');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Organisasjonsnummer');
        cy.get('dd').eq(0).should('contain.text', '889 640 782');
        cy.get('dt').eq(1).should('contain.text', 'Organisasjonsnummer med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', '974 652 277');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Organisasjonsnummer påkrevd');
        cy.get('dd').eq(0).should('contain.text', '889 640 782');
        cy.get('dt').eq(1).should('contain.text', 'Organisasjonsnummer ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', '974 652 277');
        cy.get('dt').eq(2).should('contain.text', 'Organisasjonsnummer ugyldig format');
        cy.get('dd').eq(2).should('contain.text', '889 640 782');
        cy.get('dt').eq(3).should('contain.text', 'Organisasjonsnummer egendefinert');
        cy.get('dd').eq(3).should('contain.text', '889 640 782');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/organizationnumber/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and descriptions', () => {
      cy.withinComponent('Organisasjonsnummer med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Dette er utvidet beskrivelse (en)').shouldBeVisible();
      });
    });
  });
});
