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
      cy.visit('/fyllut/errorsummaryfocus/personopplysninger?sub=paper');
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
    });

    it('with all validation errors', () => {
      const validationErrors = [
        'Du må fylle ut: Fornavn',
        'Du må fylle ut: Fornavn',
        'Du må fylle ut: Etternavn',
        'Du må fylle ut: Har du norsk fødselsnummer eller d-nummer?',
        'Du må fylle ut: Serietittel',
        'Du må fylle ut: Antall stjerner',
        'Du må fylle ut: Hvor mange timer per døgn bruker du på skjerm?',
        'Du må fylle ut: Førerkort',
        'Du må fylle ut: Annen dokumentasjon',
      ];
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

    describe('and click on validation error jumps to panel containing', () => {
      it('the first component with label Fornavn', () => {
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findAllByRole('link', { name: 'Du må fylle ut: Fornavn' }).eq(0).click();
          });
        cy.findByRole('heading', { name: 'Veiledning' });
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.focus');
      });

      it('the second component with label Fornavn', () => {
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findAllByRole('link', { name: 'Du må fylle ut: Fornavn' }).eq(1).click();
          });
        cy.findByRole('heading', { name: 'Dine opplysninger' });
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.focus');
      });

      it('the component with label Serietittel', () => {
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', { name: 'Du må fylle ut: Serietittel' }).click();
          });
        cy.findByRole('heading', { name: 'TV' });
        cy.findByRole('textbox', { name: 'Serietittel' }).should('have.focus');
      });

      it('the component with label Antall stjerner', () => {
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', { name: 'Du må fylle ut: Antall stjerner' }).click();
          });
        cy.findByRole('heading', { name: 'TV' });
        cy.findByRole('group', { name: 'Antall stjerner' }).should('have.focus');
      });

      it('the component with label Hvor mange timer per døgn bruker du på skjerm?', () => {
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', { name: 'Du må fylle ut: Hvor mange timer per døgn bruker du på skjerm?' }).click();
          });
        cy.findByRole('heading', { name: 'Brukerundersøkelse' });
        cy.findByRole('textbox', { name: 'Hvor mange timer per døgn bruker du på skjerm?' }).should('have.focus');
      });

      it('the component with label Førerkort', () => {
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', { name: 'Du må fylle ut: Førerkort' }).click();
          });
        cy.findByRole('heading', { name: 'Vedlegg' });
        cy.findByRole('group', { name: 'Førerkort' }).should('have.focus');
      });
    });
  });
});
