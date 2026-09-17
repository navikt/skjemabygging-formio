describe('Initial submission values', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/initial-submission-values/defaults?sub=paper');
    cy.defaultWaits();
  });

  it('renders authored defaults from submission state', () => {
    cy.withinComponent('Default radio', () => {
      cy.findByRole('radio', { name: 'Second option' }).should('be.checked');
    });
    cy.findByRole('checkbox', { name: 'Default checkbox' }).should('be.checked');
    cy.findByRole('combobox', { name: 'Default select' }).should('have.value', 'second');
    cy.withinComponent('Default select boxes', () => {
      cy.findByRole('checkbox', { name: 'First option' }).should('be.checked');
      cy.findByRole('checkbox', { name: 'Second option' }).should('not.be.checked');
    });
  });

  it('includes a default from an unvisited page in the summary', () => {
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Oppsummering' }).click();

    cy.withinSummaryGroup('Unvisited defaults', () => {
      cy.get('dt').should('contain.text', 'Unvisited default');
      cy.get('dd').should('contain.text', 'Second option');
    });
  });

  it('clears a hidden default and restores it when shown again', () => {
    cy.withinComponent('Conditional default', () => {
      cy.findByRole('radio', { name: 'Second option' }).should('be.checked');
    });

    cy.findByRole('checkbox', { name: 'Show conditional default' }).uncheck();
    cy.findByRole('group', { name: 'Conditional default' }).should('not.exist');

    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Oppsummering' }).click();
    cy.contains('Conditional default').should('not.exist');

    cy.findByRole('link', { name: 'Defaults' }).click();
    cy.findByRole('checkbox', { name: 'Show conditional default' }).check();
    cy.withinComponent('Conditional default', () => {
      cy.findByRole('radio', { name: 'Second option' }).should('be.checked');
    });
  });
});
