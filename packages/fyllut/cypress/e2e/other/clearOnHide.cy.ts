describe('clearOnHide', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Basic', () => {
    beforeEach(() => {
      cy.visit('/fyllut/clearonhide?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickStart();
      cy.findByRole('heading', { name: 'Basic' }).shouldBeVisible();
      cy.clickShowAllSteps();
    });

    it('clears value when field is hidden and shown again', () => {
      cy.findByRole('checkbox', { name: 'Show TextField' }).check();
      cy.findByRole('textbox', { name: 'TextField' }).type('Hello world');

      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();

      cy.withinSummaryGroup(/Basic/, () => {
        cy.contains('TextField').should('exist');
      });

      cy.findByRole('link', { name: 'Basic' }).click();
      cy.findByRole('heading', { name: 'Basic' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: 'Show TextField' }).uncheck();

      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();

      cy.withinSummaryGroup(/Basic/, () => {
        cy.contains('TextField').should('not.exist');
      });

      cy.findByRole('link', { name: 'Basic' }).click();
      cy.findByRole('heading', { name: 'Basic' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: 'Show TextField' }).check();
      //cy.findByRole('textbox', { name: 'TextField' }).should('have.value', '');
    });
  });

  describe('Within Container', () => {
    beforeEach(() => {
      cy.visit('/fyllut/clearonhide?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickStart();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Within Container' }).click();
      cy.findByRole('heading', { name: 'Within Container' }).shouldBeVisible();
    });

    it('clears value when field is hidden inside container and shown again', () => {
      cy.findByRole('checkbox', { name: 'Show TextField in Container' }).check();
      cy.findByRole('textbox', { name: 'TextField' }).type('Hello container');

      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.withinSummaryGroup(/Within Container/, () => {
        cy.contains('TextField').should('exist');
      });

      cy.findByRole('link', { name: 'Within Container' }).click();
      cy.findByRole('heading', { name: 'Within Container' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: 'Show TextField in Container' }).uncheck();

      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();

      cy.withinSummaryGroup(/Within Container/, () => {
        cy.contains('TextField').should('not.exist');
      });

      cy.findByRole('link', { name: 'Within Container' }).click();
      cy.findByRole('heading', { name: 'Within Container' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: 'Show TextField in Container' }).check();
      cy.findByRole('textbox', { name: 'TextField' }).should('have.value', '');
    });
  });

  describe('Within DataGrid', () => {
    beforeEach(() => {
      cy.visit('/fyllut/clearonhide?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickStart();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Within DataGrid' }).click();
      cy.findByRole('heading', { name: 'Within DataGrid' }).shouldBeVisible();
    });

    it('clears value when field is hidden inside datagrid and shown again', () => {
      cy.findByRole('checkbox', { name: 'Show TextField in DataGrid' }).check();
      cy.findByRole('textbox', { name: 'TextField' }).type('Hello datagrid');

      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.withinSummaryGroup(/Within DataGrid/, () => {
        cy.contains('TextField').should('exist');
      });

      cy.findByRole('link', { name: 'Within DataGrid' }).click();
      cy.findByRole('heading', { name: 'Within DataGrid' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: 'Show TextField in DataGrid' }).uncheck();

      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.withinSummaryGroup(/Within DataGrid/, () => {
        cy.contains('TextField').should('not.exist');
      });

      cy.findByRole('link', { name: 'Within DataGrid' }).click();
      cy.findByRole('heading', { name: 'Within DataGrid' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: 'Show TextField in DataGrid' }).check();
      cy.findByRole('textbox', { name: 'TextField' }).should('have.value', '');
    });
  });
});
