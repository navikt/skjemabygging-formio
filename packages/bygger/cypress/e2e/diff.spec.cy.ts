describe('Diff', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/form?*', { fixture: 'form123456.json' }).as('getForm');
    cy.intercept('GET', '/api/published-forms/dif123456', { fixture: 'form123456-published.json' }).as(
      'getPublishedForm',
    );
    cy.intercept('GET', '/mottaksadresse/submission', { fixture: 'mottakadresse.json' }).as('getMottakAdresse');
    cy.intercept('GET', /language\/submission?.*/, { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' }).as('getTemaKoder');
    cy.intercept('GET', '/api/countries*', { fixture: 'getCountriesLangNb.json' }).as('getCountriesLangNb');
  });

  describe('Settings page', () => {
    beforeEach(() => {
      cy.visit('forms/dif123456/settings');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getPublishedForm');
      cy.wait('@getMottakAdresse');
      cy.wait('@getTemaKoder');
      cy.wait('@getCountriesLangNb');
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
      cy.visit('forms/dif123456/edit');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getPublishedForm');
      cy.wait('@getCountriesLangNb');
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

    describe('Edit component modal', () => {
      it("Shows changes for text component :: label 'Fornavn' -> 'Fornavn2'", () => {
        cy.openEditComponentModal(cy.findByLabelText('Fornavn2'));

        cy.findByLabelText('Endringer')
          .should('exist')
          .within(() => {
            cy.get('li').should('have.length', 1);
            cy.get('li').eq(0).should('contain.text', "label: Fra 'Fornavn' til 'Fornavn2'");
          });
      });

      it('Shows changes for skjemagruppe :: legend changed and component deleted', () => {
        cy.openEditComponentModal(cy.findByText('Kontaktadresse2'));

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
        cy.openEditComponentModal(cy.findAllByText('Utenlandsk kontaktadresse').first());

        cy.findByLabelText('Endringer').should('not.exist');
        cy.findByLabelText('Slettede elementer').should('not.exist');
      });
    });
  });
});
