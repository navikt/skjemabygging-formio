describe('Diff', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/forms/tst123456', { fixture: 'form123456.json' }).as('getForm');
    cy.intercept('GET', '/api/forms/tst123456/translations', { fixture: 'form123456-translations.json' }).as(
      'getFormTranslations',
    );
    cy.intercept('GET', '/api/form-publications/tst123456', { fixture: 'form123456-published.json' }).as(
      'getPublishedForm',
    );
    cy.intercept('GET', '/api/recipients', { fixture: 'recipients.json' }).as('getRecipients');
    cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' }).as('getTemaKoder');
  });

  describe('Settings page', () => {
    beforeEach(() => {
      cy.visit('forms/tst123456/settings');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getFormTranslations');
      cy.wait('@getPublishedForm');
      cy.wait('@getRecipients');
      cy.wait('@getTemaKoder');
      cy.wait('@getTranslations');
    });

    it('Renders settings page without any diffs', () => {
      cy.findByRole('heading', { name: 'Skjema for testing av diff' });
      cy.findAllByText('Endring').should('have.length', 0);
    });

    it('Renders tags when data is changed', () => {
      cy.findByRole('textbox', { name: 'Tittel' }).should('exist').type(' og sånt');
      cy.findAllByTestId('signatures')
        .should('exist')
        .within(() => {
          cy.findByRole('textbox', { name: 'Hvem skal signere?' }).should('exist').type('{selectall}Doktor');
        });
      cy.findByRole('button', { name: 'Legg til signatur' }).should('exist').click();
      cy.findAllByTestId('signatures')
        .eq(1)
        .should('exist')
        .within(() => {
          cy.findByRole('textbox', { name: 'Hvem skal signere?' }).should('exist').type('Advokat');
        });

      cy.findAllByText('Endring').should('have.length', 2);
      cy.findAllByText('Ny').should('have.length', 1);
    });
  });

  describe('Form builder page', () => {
    beforeEach(() => {
      cy.visit('forms/tst123456/edit');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getFormTranslations');
      cy.wait('@getPublishedForm');
      cy.wait('@getTranslations');
    });

    describe('Tags', () => {
      const diffSincePublishedVersion = {
        changes: 2,
        deletions: 1,
      };

      it('are visible for components that have changed', () => {
        cy.findAllByText('Endring').should('have.length', diffSincePublishedVersion.changes);
        cy.findAllByText('Slettede elementer').should('have.length', diffSincePublishedVersion.deletions);
      });

      it('occur when component is deleted', () => {
        cy.findByLabelText('Etternavn')
          .should('exist')
          .closest("[data-testid='builder-component']")
          .within(() => {
            cy.clickBuilderComponentButton('Slett');
          });

        cy.findAllByText('Endring').should('have.length', diffSincePublishedVersion.changes);
        cy.findAllByText('Slettede elementer').should('have.length', diffSincePublishedVersion.deletions + 1);
      });

      it("are hidden when button 'Skjul endringer' is pressed", () => {
        cy.findAllByText('Endring').should('have.length', diffSincePublishedVersion.changes);
        cy.findAllByText('Slettede elementer').should('have.length', diffSincePublishedVersion.deletions);

        cy.findByRole('button', { name: 'Skjul endringer' }).should('exist').click();
        cy.findAllByText('Endring').should('have.length', 0);
        cy.findAllByText('Slettede elementer').should('have.length', 0);
      });
    });

    describe('New component with same key as deleted component', () => {
      beforeEach(() => {
        cy.findByRole('link', { name: 'Mer informasjon' }).click();
      });

      it('is rendered with tag "Ny"', () => {
        cy.findByLabelText(/Nytt tekstfelt/)
          .should('exist')
          .parent()
          .within(() => {
            cy.findByTestId('diff-tag').should('exist').should('contain.text', 'Ny');
          });
      });

      it('shows no changes in component modal', () => {
        cy.openEditComponentModal(cy.findByLabelText(/Nytt tekstfelt/));
        cy.findByLabelText('Endringer').should('not.exist');
        cy.findByLabelText('Slettede elementer').should('not.exist');
      });
    });

    describe('Edit component modal', () => {
      it("Shows changes for text component :: label 'Fornavn' -> 'Fornavn2'", () => {
        cy.findByRole('textbox', { name: 'Fornavn2 Endring', timeout: 10000 }).should('be.visible');
        cy.openEditComponentModal(cy.findByRole('textbox', { name: 'Fornavn2 Endring' }));

        cy.findByLabelText('Endringer')
          .should('exist')
          .within(() => {
            cy.get('li').should('have.length', 1);
            cy.get('li').eq(0).should('contain.text', "label: Fra 'Fornavn' til 'Fornavn2'");
          });
      });

      it('Shows changes for skjemagruppe :: legend changed and component deleted', () => {
        cy.openEditComponentModal(cy.findByText('Slettede elementer')); // <-- legend Kontaktadresse2
        // cy.openEditComponentModal(cy.findByText('Kontaktadresse2'));

        cy.findByLabelText('Endringer')
          .should('exist')
          .within(() => {
            cy.get('li').should('have.length', 1);
            cy.get('li').eq(0).should('contain.text', "legend: Fra 'Kontaktadresse' til 'Kontaktadresse2'");
          });

        cy.findByLabelText('Slettede elementer')
          .should('exist')
          .within(() => {
            cy.get('li').should('have.length', 2);
            cy.get('li').eq(0).should('contain.text', 'navDatepicker: ');
            cy.get('li').eq(1).should('contain.text', 'navDatepicker: ');
          });
      });

      it('Shows no changes for skjemagruppe', () => {
        cy.findByLabelText('Bygning (valgfritt)').should('exist'); // wait for label inside kontaktadresse...
        cy.openEditComponentModal(cy.findAllByText('Utenlandsk kontaktadresse').first());

        cy.findByLabelText('Endringer').should('not.exist');
        cy.findByLabelText('Slettede elementer').should('not.exist');
      });
    });
  });
});
