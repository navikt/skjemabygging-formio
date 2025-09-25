import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Error summary', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Panel "Dine opplysninger"', () => {
    beforeEach(() => {
      cy.visit('/fyllut/errorsummaryfocus/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    describe('Initial validation errors', () => {
      beforeEach(() => {
        cy.clickNextStep();
      });

      it('shows initial validation errors', () => {
        const validationErrors = [
          'Du må fylle ut: Fornavn',
          'Du må fylle ut: Etternavn',
          'Du må fylle ut: Har du norsk fødselsnummer eller d-nummer?',
        ];
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findAllByRole('link', { name: /^Du må fylle ut: .*/ })
              .should('have.length', 3)
              .each((link, index) => {
                cy.wrap(link).should('have.text', validationErrors[index]);
              });
          });
      });

      it('puts focus on textfield', () => {
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', { name: 'Du må fylle ut: Fornavn' }).click();
          });
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.focus');
      });

      it('puts focus on radiopanel', () => {
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', { name: 'Du må fylle ut: Har du norsk fødselsnummer eller d-nummer?' }).click();
          });
        cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).should('have.focus');
      });
    });
  });

  describe('Panel with data grid', () => {
    beforeEach(() => {
      cy.visit('/fyllut/errorsummaryfocus/tv?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('shows initial validation errors', () => {
      const validationErrors = ['Du må fylle ut: Serietittel', 'Du må fylle ut: Antall stjerner'];
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findAllByRole('link', { name: /^Du må fylle ut: .*/ })
            .should('have.length', 2)
            .each((link, index) => {
              cy.wrap(link).should('have.text', validationErrors[index]);
            });
        });
    });

    it('puts focus on textfield', () => {
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Serietittel' }).click();
        });
      cy.findByRole('textbox', { name: 'Serietittel' }).should('have.focus');
    });

    it('puts focus on radiopanel', () => {
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Antall stjerner' }).click();
        });
      cy.findByRole('group', { name: 'Antall stjerner' }).should('have.focus');
    });
  });

  describe('Panel with skjemagruppe', () => {
    beforeEach(() => {
      cy.visit('/fyllut/errorsummaryfocus/brukerundersokelse?sub=paper');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Brukerundersøkelse' }).should('exist');
      cy.clickNextStep();
    });

    it('sets focus to textfield on error message click', () => {
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findAllByRole('link', { name: /^Du må fylle ut: .*/ }).should('have.length', 1);
          cy.findByRole('link', { name: 'Du må fylle ut: Hvor mange timer per døgn bruker du på skjerm?' })
            .should('exist')
            .click();
        });
      cy.findByRole('textbox', { name: 'Hvor mange timer per døgn bruker du på skjerm?' }).should('have.focus');
    });
  });

  describe('Click on "next" button in last panel before summary renders the error summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/errorsummaryfocus/vedlegg?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // <- submit formio form
      cy.url().should('include', '/fyllut/errorsummaryfocus/vedlegg');
    });

    it('with validation errors for current page', () => {
      const validationErrors = ['Du må fylle ut: Førerkort', 'Du må fylle ut: Annen dokumentasjon'];
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findAllByRole('link', { name: /^Du må fylle ut: .*/ })
            .should('have.length', validationErrors.length)
            .each((link, index) => {
              cy.wrap(link).should('have.text', validationErrors[index]);
            });
        });
    });

    it('focus is set to the component with label Førerkort on click in error summary', () => {
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Førerkort' }).click();
        });
      cy.findByRole('heading', { name: 'Vedlegg' });
      cy.findByRole('group', { name: 'Førerkort' }).should('have.focus');
      cy.url().should('include', '/fyllut/errorsummaryfocus/vedlegg');
    });

    it('and it allows user to proceed to summary after correcting errors on current page', () => {
      cy.findByRole('group', { name: 'Førerkort' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Jeg legger det ved dette skjemaet').check();
        });
      cy.findByLabelText('Annen dokumentasjon')
        .should('exist')
        .within(() => {
          cy.findByLabelText('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved').check();
        });
      cy.clickNextStep(); // <- submit formio form
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/errorsummaryfocus/oppsummering');
      cy.findByText(new RegExp(TEXTS.statiske.summaryPage.validationMessage)).should('exist');
      cy.findByRole('button', { name: 'Gå videre' }).should('not.exist');
    });
  });
});
