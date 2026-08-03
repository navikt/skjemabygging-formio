/*
 * Tests translations of the form work from both url params and language switcher
 */

describe('Translations', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Change translations based on url params', () => {
    it('get default bokmål', () => {
      cy.visit('/fyllut/cypress101/veiledning');
      cy.findByRole('button', { name: 'Norsk bokmål' }).should('exist');
    });

    it('get bokmål with lang param', () => {
      cy.visit('/fyllut/cypress101/veiledning?lang=nb-NO');
      cy.findByRole('button', { name: 'Norsk bokmål' }).should('exist');
    });

    it('get nynorsk with lang param', () => {
      cy.visit('/fyllut/cypress101/veiledning?lang=nn-NO');
      cy.findByRole('button', { name: 'Norsk nynorsk' }).should('exist');
    });

    it('get english with lang param', () => {
      cy.visit('/fyllut/cypress101/skjema?lang=en');
      cy.findByRole('button', { name: 'English' }).should('exist');
    });
  });

  describe('Change translation language', () => {
    beforeEach(() => {
      cy.visit('/fyllut/cypress101/skjema?sub=paper');
    });

    it('change to english and back to norwegian', () => {
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');
      cy.findByRole('button', { name: 'Norsk bokmål' }).click();
      cy.findByRole('link', { name: 'English' }).click();
      cy.findByRole('heading', { name: 'Guidance' }).should('exist');
      cy.findByRole('button', { name: 'English' }).click();
      cy.findByRole('link', { name: 'Norsk bokmål' }).click();
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');
    });

    it('retains selected language on navigation', () => {
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');
      cy.findByRole('button', { name: 'Norsk bokmål' }).click();
      cy.findByRole('link', { name: 'English' }).click();
      cy.findByRole('heading', { name: 'Guidance' }).should('exist');
      cy.clickNextStep();

      cy.findByRole('button', { name: 'English' }).should('exist');
      cy.findByRole('heading', { name: 'Your information' }).should('exist');
      cy.findByRole('combobox', { name: 'Title' }).should('be.visible').click();
      cy.findByText('Mr').should('exist').click();
      cy.findByRole('textbox', { name: 'First name' }).should('exist').type('Cyp');
      cy.findByRole('textbox', { name: 'Last name' }).should('exist').type('Ress');
      cy.get('.aksel-radio-group')
        .first()
        .should('exist')
        .within(($radio) => cy.findByLabelText('Yes').should('exist').check({ force: true }));
      cy.findByRole('textbox', { name: 'Norwegian national identification / D number' })
        .should('exist')
        .type('16020256145');
      cy.findByRole('textbox', { name: 'Velg måned' }).should('exist').type('02.2022');

      cy.clickNextStep();

      cy.findByRole('button', { name: 'English' }).should('exist');
      cy.findByRole('heading', { name: 'Attachments' }).should('exist');
      cy.get('.aksel-radio-group')
        .first()
        .should('exist')
        .within(($radio) =>
          cy.findByLabelText('No, I have no other documentation.').should('exist').check({ force: true }),
        );
      cy.clickNextStep();

      cy.findByRole('button', { name: 'English' }).should('exist');
      cy.findByRole('heading', { name: 'Summary' }).should('exist');
    });

    it('stays on current panel when changing language', () => {
      cy.clickShowAllSteps();

      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
      cy.findByRole('button', { name: 'Norsk bokmål' }).click();
      cy.findByRole('link', { name: 'English' }).click();
      cy.findByRole('heading', { name: 'Your information' }).should('exist');

      cy.findByRole('link', { name: 'Attachments' }).click();
      cy.findByRole('button', { name: 'English' }).click();
      cy.findByRole('link', { name: 'Norsk bokmål' }).click();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');

      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
    });
  });

  describe('Special cases', () => {
    beforeEach(() => {
      cy.visit('/fyllut/cypress101/skjema?sub=paper');
    });

    it('Check that translateHTMLTemplate override work', () => {
      cy.findByRole('button', { name: 'Norsk bokmål' }).click();
      cy.findByRole('link', { name: 'English' }).click();
      cy.clickNextStep();

      // This example will fail without the override in translateHTMLTemplate
      cy.get('.formio-component-alertstripe').contains('Example correct translation').should('exist');
    });
  });

  describe('Invalid url', () => {
    beforeEach(() => {
      cy.visit('/fyllut/&#cypress101/skjema?sub=paper', { failOnStatusCode: false });
    });

    it('should show error page when URL is invalid', () => {
      cy.findByRole('heading', { name: 'Beklager, fant ikke siden' }).should('exist');
    });
  });
});
