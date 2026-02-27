// Panel renders as a wizard step. The panel title is shown as an <h2> heading by fyllut's wizard,
// using the FormTitle component (not the EJS card-title template).
// Settings from Panel.form.ts: title, isAttachmentPanel, conditional.
//
// - title is rendered as <h2 id="page-title"> for each wizard step.
// - isAttachmentPanel: true is submission metadata — it marks the panel as an attachment panel.
//   In paper mode, visiting the 'vedlegg' route shows AttachmentsUploadPage (not panel content).
//   The panel's title and content do NOT render differently based on isAttachmentPanel alone;
//   the difference is in routing and the attachment summary flow.
//
// Note: Panel has no description, additionalDescription, or validation settings.

describe('Panel', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/panel/oversiktsside?sub=paper');
      cy.defaultWaits();
    });

    it('should render panel title as heading', () => {
      cy.findByRole('heading', { level: 2, name: 'Oversiktsside' }).should('exist');
    });

    it('should render child components', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt' }).should('exist');
    });

    it('child component should be interactable', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test verdi');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).should('have.value', 'Test verdi');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/panel/oversiktsside?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate panel title', () => {
      cy.findByRole('heading', { level: 2, name: 'Oversiktsside (en)' }).should('exist');
    });

    it('should translate child component labels', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt (en)' }).should('exist');
    });
  });
});
