describe('Select', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });
  describe('Paper', () => {
    beforeEach(() => {
      cy.visit('/fyllut/selecttest/selectPage?sub=paper');
      cy.defaultWaits();
    });

    it('selects values correctly and displays them on the summary page', () => {
      cy.findByRole('combobox', {
        name: 'Nedtrekksmeny',
        description: 'Dette er foretrukket nedtrekkskomponent',
      }).click();
      cy.findAllByRole('option').should('have.length', 3);
      cy.findByRole('combobox', { name: 'Nedtrekksmeny' }).type('{downarrow}{enter}');
      cy.findByText('Appelsin').should('exist');
      cy.findByText('Eple').should('not.exist');

      //Nedtrekksmeny med standard-verdi
      cy.findByText('Rød').should('exist');
      cy.findByText('Grå').should('not.exist');
      cy.findByRole('combobox', { name: 'Nedtrekksmeny med standardverdi' }).type('B{enter}');
      cy.findByText('Blå').should('exist');
      cy.findByText('Rød').should('not.exist');

      cy.clickNextStep();

      //Nedtrekksmeny gammel type
      cy.findAllByRole('combobox').eq(0).click();
      cy.findAllByRole('combobox')
        .eq(0)
        .within(() => {
          cy.findAllByRole('option').should('have.length', 2);
          cy.findByRole('option', { name: 'Løve' }).click();
        });
      cy.findAllByText('Løve').eq(0).shouldBeVisible();
      cy.findByText('Ape').should('not.be.visible');

      // Hvilket land jobber du i?
      cy.findAllByRole('combobox').eq(1).click();
      cy.findAllByRole('combobox')
        .eq(1)
        .within(() => {
          cy.findAllByRole('option').should('have.length', 31);
          cy.findByRole('option', { name: 'Tyskland' }).click();
        });

      // Sfære (HTML5)
      cy.findAllByRole('combobox').eq(2).select('-1.00');
      cy.findAllByRole('combobox').eq(2).should('have.value', '-1.00');

      // FIXME: Fjernes når bug med oppdatering av submission fra HTML5 og ChoiceJS select er fikset
      cy.findByRole('textbox', { name: 'Tekstfelt (valgfritt)' }).type('abc');
      cy.clickNextStep();

      // Summary
      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Nedtrekksmeny');
          cy.get('dd').eq(0).should('contain.text', 'Appelsin');
          cy.get('dt').eq(1).should('contain.text', 'Nedtrekksmeny med standardverdi');
          cy.get('dd').eq(1).should('contain.text', 'Blå');
        });
      cy.get('dl')
        .eq(1)
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Nedtrekksmeny gammel type');
          cy.get('dd').eq(0).should('contain.text', 'løve');
          cy.get('dt').eq(1).should('contain.text', 'Hvilket land jobber du i? (ChoiceJS)');
          cy.get('dd').eq(1).should('contain.text', 'tyskland');
          cy.get('dt').eq(2).should('contain.text', 'Sfære (HTML5)');
          cy.get('dd').eq(2).should('contain.text', '-1.00');
        });

      cy.clickEditAnswers();

      // Verify that values are populated when navigating back to the select page
      cy.findByText('Appelsin').should('exist');
      cy.findByText('Blå').should('exist');
      cy.clickNextStep();
      cy.findAllByText('Løve').eq(0).shouldBeVisible();
      cy.findAllByText('Tyskland').eq(0).shouldBeVisible();
      cy.findAllByRole('combobox').eq(2).should('have.value', '-1.00');
    });
  });
});
