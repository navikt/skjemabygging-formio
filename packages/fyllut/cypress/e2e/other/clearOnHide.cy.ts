const visitClearOnHideForm = () => {
  cy.visit('/fyllut/clearonhide?sub=paper');
  cy.defaultWaits();
  cy.clickIntroPageConfirmation();
  cy.clickStart();
};

describe('clearOnHide', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Basic', () => {
    beforeEach(() => {
      visitClearOnHideForm();
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
      cy.findByRole('textbox', { name: 'TextField' }).shouldBeVisible();
      cy.findByRole('textbox', { name: 'TextField' }).should('have.value', '');
    });
  });

  describe('Basic rerender regression', () => {
    beforeEach(() => {
      visitClearOnHideForm();
      cy.findByRole('heading', { name: 'Basic' }).shouldBeVisible();
      cy.clickShowAllSteps();
    });

    it('does not add extra rerenders when clearOnHide emits submissionChanged', () => {
      cy.findByRole('checkbox', { name: 'Show TextField' }).check();
      cy.findByRole('textbox', { name: 'TextField' }).type('Hello world');
      cy.findByRole('textbox', { name: 'TextField' }).then(($input) => {
        const componentElement = $input
          .parents()
          .toArray()
          .find(
            (element) =>
              'component' in element &&
              typeof (element as HTMLElement & { component?: { rerender?: () => void } }).component?.rerender ===
                'function',
          );

        if (!componentElement) {
          throw new Error('Expected to find the TextField Form.io component element');
        }
        cy.spy((componentElement as HTMLElement & { component: { rerender: () => void } }).component, 'rerender').as(
          'textFieldRerender',
        );
      });
      cy.get('@textFieldRerender').invoke('resetHistory');

      cy.findByRole('checkbox', { name: 'Show TextField' }).uncheck();
      cy.findByRole('textbox', { name: 'TextField' }).should('not.exist');
      cy.get('@textFieldRerender').should('have.callCount', 1);
    });
  });

  describe('Within Container', () => {
    beforeEach(() => {
      visitClearOnHideForm();
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
      cy.findByRole('textbox', { name: 'TextField' }).shouldBeVisible();
      cy.findByRole('textbox', { name: 'TextField' }).should('have.value', '');
    });
  });

  describe('Within DataGrid', () => {
    beforeEach(() => {
      visitClearOnHideForm();
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
      cy.findByRole('textbox', { name: 'TextField' }).shouldBeVisible();
      cy.findByRole('textbox', { name: 'TextField' }).should('have.value', '');
    });
  });
});
