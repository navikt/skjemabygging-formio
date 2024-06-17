import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('Form Builder', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', /language\/submission?.*/, { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/countries*', { fixture: 'getCountriesLangNb.json' }).as('getCountriesLangNb');
    cy.intercept('GET', '/mottaksadresse/submission', { fixture: 'mottakadresse.json' }).as('getMottakAdresse');
    cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' }).as('getTemaKoder');
  });

  describe('Diff form', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/tst123456', { fixture: 'form123456.json' }).as('getForm');
      cy.intercept('GET', '/api/published-forms/tst123456', { statusCode: 404 }).as('getPublishedForm');

      cy.visit('forms/tst123456');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getPublishedForm');
      cy.wait('@getCountriesLangNb');
    });

    it('Trims properties "vedleggskode" and "vedleggstittel" before save', () => {
      cy.intercept('PUT', '/api/forms/tst123456', (req) => {
        const vedlegg = navFormUtils
          .flattenComponents(req.body.components)
          .find((comp) => comp.key === 'annenDokumentasjon');
        expect(vedlegg.properties.vedleggskode).to.equal('T2');
        expect(vedlegg.properties.vedleggstittel).to.equal('Last opp annen dokumentasjon');
        req.reply(200, req.body);
      }).as('putForm');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.get('[title="Rediger"]').spread((_editPanelButton, editAnnenDokumentasjonButton) =>
        editAnnenDokumentasjonButton.click({ force: true }),
      );
      cy.findByRole('tab', { name: 'API' }).click();
      cy.findByDisplayValue('N6').type('{selectall} T2   ');
      cy.findByDisplayValue('Annet').type('{selectall}  Last opp annen dokumentasjon  ');
      cy.get('[data-testid="editorSaveButton"]').click();
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@putForm');
    });

    describe('Textfield', () => {
      it('should save changes made in edit modal', () => {
        cy.intercept('PUT', '/api/forms/tst123456', (req) => {
          const fodselsdato = navFormUtils
            .flattenComponents(req.body.components)
            .find((comp) => comp.key === 'fornavnSoker');
          expect(fodselsdato.label).to.equal('Fornavn');
          req.reply(200, req.body);
        }).as('putForm');

        cy.openEditComponentModal(cy.findByRole('textbox', { name: 'Fornavn2' }));
        cy.findByDisplayValue('Fornavn2').type('{selectall}Fornavn');
        cy.get('[data-testid="editorSaveButton"]').click();
        cy.findByRole('button', { name: 'Lagre' }).click();
        cy.wait('@putForm');
      });
    });

    describe('Nav datepicker', () => {
      it('should save changes made in edit modal', () => {
        cy.intercept('PUT', '/api/forms/tst123456', (req) => {
          const fodselsdato = navFormUtils
            .flattenComponents(req.body.components)
            .find((comp) => comp.key === 'fodselsdatoDdMmAaaaSoker');
          expect(fodselsdato.label).to.equal('Din fødselsdato');
          req.reply(200, req.body);
        }).as('putForm');

        cy.openEditComponentModal(cy.findByRole('textbox', { name: 'Din fødselsdato (dd.mm.åååå)' }));
        cy.findByDisplayValue('Din fødselsdato (dd.mm.åååå)').type('{selectall}Din fødselsdato');
        cy.get('[data-testid="editorSaveButton"]').click();
        cy.findByRole('button', { name: 'Lagre' }).click();
        cy.wait('@putForm');
      });
    });
  });

  describe('Multi values form', () => {
    const val = 'first';
    const valAlt = 'firstAlternative';
    const val1 = 'second';
    const val2 = 'third';
    const labelName = 'Ledetekst';
    const valueName = 'Dataverdi (valgfritt)';
    const addAnotherName = 'Legg til';

    beforeEach(() => {
      cy.intercept('GET', '/api/forms/multi', { fixture: 'formMultiValues.json' }).as('getForm');
      cy.intercept('GET', '/api/published-forms/multi', { statusCode: 404 }).as('getPublishedForm');

      cy.visit('forms/multi');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getPublishedForm');
      cy.wait('@getCountriesLangNb');
    });

    it('Select box values', () => {
      cy.openEditComponentModal(cy.findByRole('combobox', { name: 'Nedtrekksmeny' }));
      cy.findByRole('tab', { name: 'Data' }).click();
      cy.findByRole('textbox', { name: labelName }).type(val);
      cy.findAllByDisplayValue(val).should('have.length', 2);
      cy.findByRole('textbox', { name: valueName }).type(`{selectall}${valAlt}`);
      cy.findByRole('button', { name: addAnotherName }).click();
      cy.findAllByRole('textbox', { name: labelName }).eq(1).type(val1);
      cy.findByRole('button', { name: addAnotherName }).click();
      cy.findAllByRole('textbox', { name: labelName }).eq(2).type(val2);

      cy.findAllByRole('textbox', { name: labelName }).eq(0).should('have.value', val);
      cy.findAllByRole('textbox', { name: valueName }).eq(0).should('have.value', valAlt);
      cy.findAllByRole('textbox', { name: labelName }).eq(1).should('have.value', val1);
      cy.findAllByRole('textbox', { name: labelName }).eq(2).should('have.value', val2);

      cy.get('[data-testid="editorSaveButton"]').click();
    });

    it('Checkbox group values', () => {
      cy.openEditComponentModal(cy.findByRole('group', { name: 'Flervalg' }));
      cy.findByRole('tab', { name: 'Data' }).click();
      cy.findByRole('textbox', { name: labelName }).type(val);
      cy.findAllByDisplayValue(val).should('have.length', 4);
      cy.findByRole('textbox', { name: valueName }).type(`{selectall}${valAlt}`);
      cy.findByRole('button', { name: addAnotherName }).click();
      cy.findAllByRole('textbox', { name: labelName }).eq(1).type(val1);
      cy.findByRole('button', { name: addAnotherName }).click();
      cy.findAllByRole('textbox', { name: labelName }).eq(2).type(val2);

      cy.findAllByRole('textbox', { name: labelName }).eq(0).should('have.value', val);
      cy.findAllByRole('textbox', { name: valueName }).eq(0).should('have.value', valAlt);
      cy.findAllByRole('textbox', { name: labelName }).eq(1).should('have.value', val1);
      cy.findAllByRole('textbox', { name: labelName }).eq(2).should('have.value', val2);

      cy.get('[data-testid="editorSaveButton"]').click();

      cy.findByRole('checkbox', { name: val }).should('exist');
      cy.findByRole('checkbox', { name: val1 }).should('exist');
      cy.findByRole('checkbox', { name: val2 }).should('exist');
    });

    it('Edit JSON - Change label', () => {
      cy.findByRole('group', { name: 'Flervalg' })
        .should('exist')
        .closest("[data-testid='builder-component']")
        .within(() => {
          cy.clickBuilderComponentButton('Rediger JSON');
        });
      cy.get('div').contains('"label": "Flervalg"').click({ force: true });
      cy.focused().type('{end}{leftArrow}{leftArrow} (endret)', { force: true });
      cy.get('[data-testid="editorSaveButton"]').click();
      cy.findByRole('group', { name: 'Flervalg (endret)' }).should('exist');
    });

    // TODO: Add test for radio group when it gets the new data values.
  });

  describe('Duplicate component keys', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/cypresssettings', { fixture: 'getForm.json' }).as('getForm');
      cy.intercept('GET', '/api/published-forms/*', { statusCode: 404 }).as('getPublishedForm');
      cy.visit('forms/cypresssettings');
    });

    describe('component with same API key as panel', () => {
      beforeEach(() => {
        cy.findByRole('link', { name: 'Dine opplysninger' }).click();
        cy.get('[title="Rediger"]').spread((_editPanelButton, editFornavnComponent) =>
          editFornavnComponent.click({ force: true }),
        );
        cy.findByRole('tab', { name: 'API' }).click();
        cy.findByDisplayValue('fornavnSoker').type('{selectall}personopplysninger');
        cy.get('[data-testid="editorSaveButton"]').click();
      });

      it('should show error message stating duplicate API key', () => {
        cy.findByText('API Key is not unique: personopplysninger').should('exist');
      });

      it('should not remove panel when changing components key to something else', () => {
        cy.get('[title="Rediger"]').spread((_editPanelButton, editFornavnComponent) =>
          editFornavnComponent.click({ force: true }),
        );
        cy.findByRole('tab', { name: 'API' }).click();
        cy.findByDisplayValue('personopplysninger').type('Component');
        cy.get('[data-testid="editorSaveButton"]').click();

        cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
        cy.findByLabelText('Fornavn').should('exist');
      });
    });
  });
});
