// Settings from Surname.form.ts: label, fieldSize, description, autoComplete, prefillKey (data), required.
//
// Note: fieldSize controls the visual width of the input and is not specifically tested.
// Note: autoComplete sets the HTML autocomplete attribute to 'family-name'; it is not explicitly tested here.
// Note: prefillKey ('sokerEtternavn') prefills the field from PDL in digital mode and has no visible effect in paper mode.
// Note: Surname has no additionalDescription setting.

describe('Surname', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/surname/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Etternavn';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
      cy.findByLabelText(label).should('have.attr', 'autocomplete', 'family-name');
    });

    it('should have description', () => {
      const label = 'Etternavn med beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/surname/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Etternavn påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('Hansen');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Etternavn ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should reject invalid characters', () => {
      const label = 'Etternavn spesialtegn';
      const errorMessage = `${label} inneholder ugyldige tegn`;
      cy.findByLabelText(`${label} (valgfritt)`).type('{{}');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(`${label} (valgfritt)`).should('have.focus');
      cy.focused().clear();
      cy.focused().type('Hansen');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/surname?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Olsen');
      cy.findByRole('textbox', { name: 'Etternavn med beskrivelse' }).type('Hansen');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn påkrevd' }).type('Nilsen');
      cy.findByRole('textbox', { name: 'Etternavn ikke påkrevd (valgfritt)' }).type('Berg');
      cy.findByRole('textbox', { name: 'Etternavn spesialtegn (valgfritt)' }).type('Dahl');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Etternavn');
        cy.get('dd').eq(0).should('contain.text', 'Olsen');
        cy.get('dt').eq(1).should('contain.text', 'Etternavn med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'Hansen');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Etternavn påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'Nilsen');
        cy.get('dt').eq(1).should('contain.text', 'Etternavn ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', 'Berg');
        cy.get('dt').eq(2).should('contain.text', 'Etternavn spesialtegn');
        cy.get('dd').eq(2).should('contain.text', 'Dahl');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/surname/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and description', () => {
      cy.withinComponent('Etternavn med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
