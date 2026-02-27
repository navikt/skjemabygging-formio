// Settings from FirstName.form.ts: label, fieldSize, description, autoComplete, prefillKey (data), required.
//
// Note: fieldSize controls the visual width of the input and is not specifically tested.
// Note: autoComplete sets the HTML autocomplete attribute to 'given-name'; it is not explicitly tested here.
// Note: prefillKey ('sokerFornavn') prefills the field from PDL in digital mode and has no visible effect in paper mode.
// Note: FirstName has no additionalDescription setting.

describe('FirstName', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/firstname/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Fornavn';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
      cy.findByLabelText(label).should('have.attr', 'autocomplete', 'given-name');
    });

    it('should have description', () => {
      const label = 'Fornavn med beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/firstname/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Fornavn påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('Ola');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Fornavn ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should reject invalid characters', () => {
      const label = 'Fornavn spesialtegn';
      const errorMessage = `${label} inneholder ugyldige tegn`;
      cy.findByLabelText(`${label} (valgfritt)`).type('{{}');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(`${label} (valgfritt)`).should('have.focus');
      cy.focused().clear();
      cy.focused().type('Ola');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/firstname?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Fornavn med beskrivelse' }).type('Per');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn påkrevd' }).type('Ole');
      cy.findByRole('textbox', { name: 'Fornavn ikke påkrevd (valgfritt)' }).type('Nora');
      cy.findByRole('textbox', { name: 'Fornavn spesialtegn (valgfritt)' }).type('Kari');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
        cy.get('dt').eq(1).should('contain.text', 'Fornavn med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'Per');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'Ole');
        cy.get('dt').eq(1).should('contain.text', 'Fornavn ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', 'Nora');
        cy.get('dt').eq(2).should('contain.text', 'Fornavn spesialtegn');
        cy.get('dd').eq(2).should('contain.text', 'Kari');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/firstname/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and description', () => {
      cy.withinComponent('Fornavn med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
