describe('Nested condition scope', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.visit('/fyllut/nestedconditions?sub=digital');
    cy.defaultWaits();
    cy.clickStart();
    cy.wait('@createMellomlagring');
    cy.findByRole('heading', { name: 'Expenses', level: 2 }).should('be.visible');
  });

  it('uses the nested row for visibility, validation, summary and saved answers', () => {
    cy.findByRole('checkbox', { name: /^Root toggle/ }).check();
    cy.findByRole('textbox', { name: 'Expense details' }).should('not.exist');
    cy.findByText('Include documentation for these expenses.').should('not.exist');

    cy.findByRole('checkbox', { name: /^Include expense details/ }).click();
    cy.findByRole('textbox', { name: 'Expense details' }).should('be.visible');
    cy.findByText('Include documentation for these expenses.').should('be.visible');
    cy.findByRole('checkbox', { name: /^Include expense details/ }).should('have.focus');

    cy.clickSaveAndContinue();
    cy.findByRole('link', { name: 'Du må fylle ut: Expense details' }).should('be.visible');
    cy.findByRole('textbox', { name: 'Expense details' }).type('Parking receipt');
    cy.clickSaveAndContinue();
    cy.wait('@updateMellomlagring')
      .its('request.body.submission.data.journey.expenses.details')
      .should('equal', 'Parking receipt');
    cy.findByRole('heading', { name: 'Oppsummering', level: 2 }).should('be.visible');
    cy.findByText('Parking receipt').should('be.visible');

    cy.clickEditAnswer('Expenses');
    cy.findByRole('textbox', { name: 'Expense details' }).should('have.value', 'Parking receipt');
    cy.findByRole('checkbox', { name: /^Include expense details/ }).click();
    cy.findByRole('textbox', { name: 'Expense details' }).should('not.exist');
    cy.findByText('Include documentation for these expenses.').should('not.exist');
    cy.findByRole('checkbox', { name: /^Include expense details/ }).should('have.focus');

    cy.findByRole('checkbox', { name: /^Include expense details/ }).check();
    cy.findByRole('textbox', { name: 'Expense details' }).should('have.value', '');
    cy.clickSaveAndContinue();
    cy.findByRole('link', { name: 'Du må fylle ut: Expense details' }).should('be.visible');
    cy.findByRole('checkbox', { name: /^Include expense details/ }).uncheck();
    cy.findByRole('link', { name: 'Du må fylle ut: Expense details' }).should('not.exist');

    cy.clickSaveAndContinue();
    cy.wait('@updateMellomlagring')
      .its('request.body.submission.data.journey.expenses')
      .should('not.have.property', 'details');
    cy.findByRole('heading', { name: 'Oppsummering', level: 2 }).should('be.visible');
    cy.findByText('Parking receipt').should('not.exist');
  });
});
