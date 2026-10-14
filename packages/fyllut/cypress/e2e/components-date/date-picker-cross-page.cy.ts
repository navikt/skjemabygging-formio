describe('Cross-page date references', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/datepickercrosspage/start?sub=paper');
    cy.defaultWaits();
  });

  it('uses the start date across pages and revalidates after it changes', () => {
    cy.findByRole('textbox', { name: 'Start date' }).type('15.01.2025{esc}');
    cy.clickNextStep();
    cy.findByRole('heading', { name: 'End', level: 2 }).should('be.visible');

    cy.findByRole('textbox', { name: /^End date/ }).type('14.01.2025{esc}');
    cy.findByRole('textbox', { name: /^Inclusive end date/ }).type('15.01.2025{esc}');
    cy.clickNextStep();
    cy.findAllByText('Datoen kan ikke være tidligere enn 16.01.2025').should('have.length', 2);
    cy.findByRole('textbox', { name: /^End date/ }).should('have.value', '14.01.2025');

    cy.findByRole('textbox', { name: /^End date/ }).type('{selectAll}16.01.2025{esc}');
    cy.clickNextStep();
    cy.findByRole('heading', { name: 'Oppsummering', level: 2 }).should('be.visible');

    cy.clickEditAnswer('Start');
    cy.findByRole('textbox', { name: 'Start date' }).type('{selectAll}20.01.2025{esc}');
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Oppsummering' }).click();
    cy.clickDownloadInstructions();
    cy.findByRole('link', { name: 'Datoen kan ikke være tidligere enn 21.01.2025' }).should('be.visible');
    cy.findByRole('link', { name: 'Datoen kan ikke være tidligere enn 20.01.2025' }).should('be.visible');

    cy.findByRole('link', { name: 'Datoen kan ikke være tidligere enn 21.01.2025' }).click();
    cy.findByRole('textbox', { name: /^End date/ })
      .should('have.focus')
      .and('have.value', '16.01.2025');
    cy.findByRole('textbox', { name: /^End date/ }).type('{selectAll}21.01.2025{esc}');
    cy.findByRole('textbox', { name: /^Inclusive end date/ }).type('{selectAll}20.01.2025{esc}');
    cy.clickNextStep();
    cy.findByRole('heading', { name: 'Oppsummering', level: 2 }).should('be.visible');
  });
});
