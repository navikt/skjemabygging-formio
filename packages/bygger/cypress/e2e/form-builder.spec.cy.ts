import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('Form Builder', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' }).as('getTemaKoder');
    cy.intercept('GET', /\/api\/forms\?select=.*/, { fixture: 'allForms.json' }).as('getAllForms');
  });

  describe('Form list', () => {
    beforeEach(() => {
      cy.visit('/forms');
      cy.wait('@getConfig');
      cy.wait('@getAllForms');
    });

    it('show all forms', () => {
      cy.findAllByRole('link', { name: /^NAV.*/ }).should('have.length', 5);
    });

    describe('sort order', () => {
      it('is default by changedAt or publishedAt (whichever is most recent)', () => {
        const orderedLinkTexts = ['NAV 07-02.08', 'NAV 54-00.06', 'NAV 16-01.05', 'NAV 04-01.04', 'NAV 08-36.06'];
        cy.findAllByRole('link', { name: /^NAV.*/ }).each((link, index) => {
          cy.wrap(link).should('have.text', orderedLinkTexts[index]);
        });
      });

      it('changes sort order to form skjemanr ascending or descending', () => {
        // ascending on first click
        cy.findByRole('button', { name: 'Skjemanr.' }).click();
        const ascending = ['NAV 04-01.04', 'NAV 07-02.08', 'NAV 08-36.06', 'NAV 16-01.05', 'NAV 54-00.06'];
        cy.findAllByRole('link', { name: /^NAV.*/ }).each((link, index) => {
          cy.wrap(link).should('have.text', ascending[index]);
        });

        // descending on second click
        cy.findByRole('button', { name: 'Skjemanr.' }).click();
        const descending = ['NAV 54-00.06', 'NAV 16-01.05', 'NAV 08-36.06', 'NAV 07-02.08', 'NAV 04-01.04'];
        cy.findAllByRole('link', { name: /^NAV.*/ }).each((link, index) => {
          cy.wrap(link).should('have.text', descending[index]);
        });
      });
    });
  });

  describe('Diff form', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/tst123456', { fixture: 'form123456.json' }).as('getForm');
      cy.intercept('GET', '/api/form-publications/tst123456', { fixture: 'form123456.json' }).as('getPublishedForm');
      cy.intercept('GET', '/api/forms/tst123456/translations', { fixture: 'form123456-translations.json' }).as(
        'getFormTranslations',
      );

      cy.visit('forms/tst123456');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getFormTranslations');
      cy.wait('@getTranslations');
      cy.wait('@getPublishedForm');
    });

    it('Trims properties "vedleggskode" and "vedleggstittel" before save', () => {
      cy.intercept('PUT', '/api/forms/tst123456', (req) => {
        const vedlegg = navFormUtils
          .flattenComponents<Component>(req.body.components)
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
      cy.findByRole('button', { name: 'Ok' }).click();
      cy.wait('@putForm');
    });

    describe('Textfield', () => {
      it('should save changes made in edit modal', () => {
        cy.intercept('PUT', '/api/forms/tst123456', (req) => {
          const fodselsdato = navFormUtils
            .flattenComponents<Component>(req.body.components)
            .find((comp) => comp.key === 'fornavnSoker');
          expect(fodselsdato.label).to.equal('Fornavn');
          req.reply(200, req.body);
        }).as('putForm');

        cy.openEditComponentModal(cy.findByRole('textbox', { name: 'Fornavn2' }));
        cy.findByDisplayValue('Fornavn2').type('{selectall}Fornavn');
        cy.get('[data-testid="editorSaveButton"]').click();
        cy.findByRole('button', { name: 'Ok' }).click();
        cy.wait('@putForm');
        cy.findByText('Lagret skjema Skjema for testing av diff').should('be.visible');
      });
    });

    describe('Nav datepicker', () => {
      it('should save changes made in edit modal', () => {
        cy.intercept('PUT', '/api/forms/tst123456', (req) => {
          const fodselsdato = navFormUtils
            .flattenComponents<Component>(req.body.components)
            .find((comp) => comp.key === 'fodselsdatoDdMmAaaaSoker');
          expect(fodselsdato.label).to.equal('Din fødselsdato');
          req.reply(200, req.body);
        }).as('putForm');

        cy.openEditComponentModal(cy.findByRole('textbox', { name: 'Din fødselsdato (dd.mm.åååå)' }));
        cy.findByDisplayValue('Din fødselsdato (dd.mm.åååå)').type('{selectall}Din fødselsdato');
        cy.get('[data-testid="editorSaveButton"]').click();
        cy.findByRole('button', { name: 'Ok' }).click();
        cy.wait('@putForm');
        cy.findByText('Lagret skjema Skjema for testing av diff').should('be.visible');
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
      cy.intercept('GET', '/api/forms/multi', { fixture: 'formMultiValues.json' }).as('getMultiForm');
      cy.intercept('GET', '/api/forms/multi/translations', { fixture: 'form123456-translations.json' }).as(
        'getMultiFormTranslations',
      );

      cy.visit('forms/multi');
      cy.wait('@getConfig');
      cy.wait('@getMultiForm');
      cy.wait('@getMultiFormTranslations');
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
      cy.intercept('GET', '/api/forms/cypresssettings', { fixture: 'getForm.json' }).as('getCypressForm');
      cy.intercept('GET', '/api/forms/cypresssettings/translations', { fixture: 'form123456-translations.json' }).as(
        'getCypressFormTranslations',
      );
      cy.visit('forms/cypresssettings');

      cy.wait('@getConfig');
      cy.wait('@getCypressForm');
      cy.wait('@getCypressFormTranslations');
      cy.wait('@getTranslations');
    });

    describe('component with same API key as panel', () => {
      beforeEach(() => {
        cy.findByRole('link', { name: 'Dine opplysninger' }).click();
        cy.get('[title="Rediger"]').spread((_editPanelButton, editFornavnComponent) =>
          editFornavnComponent.click({ force: true }),
        );
        cy.findByRole('tab', { name: 'API' }).click();
        cy.findByDisplayValue('fornavnSoker').type('{selectall}dineOpplysninger');
        cy.get('[data-testid="editorSaveButton"]').click();
      });

      // This error comes from Component.highlightInvalidComponents in Formio
      it('should show error message stating duplicate API key', () => {
        // We get one error message on TextField and one from formio in Panel.
        // The Panel component uses old templates, that is the reason the error is not correct format.
        cy.findAllByText('API Key is not unique: dineOpplysninger').should('have.length', 2);
      });

      it('should not remove panel when changing components key to something else', () => {
        cy.get('[title="Rediger"]').spread((_editPanelButton, editFornavnComponent) =>
          editFornavnComponent.click({ force: true }),
        );
        cy.findByRole('tab', { name: 'API' }).click();
        cy.findByDisplayValue('dineOpplysninger').type('Component');
        cy.get('[data-testid="editorSaveButton"]').click();

        cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
        cy.findByLabelText('Fornavn').should('exist');
      });
    });
  });

  describe('Locked form', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/tst123456', { fixture: 'form123456.json' }).as('getForm');
      cy.fixture('form123456.json').then((form) => {
        form.lock = {
          lockedBy: 'testuser',
          lockedAt: '2025-08-18T12:05:47.123Z',
          reason: 'Testing locked form',
        };
        form.status = 'draft';
        form.title = 'Tester lagring av låst skjema';
        cy.intercept('GET', '/api/forms/tst123456', { body: form }).as('getForm');
      });
      cy.intercept('GET', '/api/forms/tst123456/translations', { fixture: 'form123456-translations.json' }).as(
        'getFormTranslations',
      );
      cy.intercept('PUT', '/api/forms/tst123456', (req) => req.reply(200, req.body)).as('putForm');

      cy.visit('forms/tst123456');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getFormTranslations');
      cy.wait('@getTranslations');
    });

    it('should show lock icon on buttons', () => {
      cy.findByRole('button', { name: /Lagre/ }).should('exist').should('contain.text', 'Skjemaet er låst');
      cy.findByRole('button', { name: /Publiser/ })
        .should('exist')
        .should('contain.text', 'Skjemaet er låst');
    });

    it('should reject save action', () => {
      cy.findByRole('button', { name: /Lagre/ }).click();
      cy.get('@putForm.all').should('have.length', 0);
      cy.findByRole('heading', { name: 'Skjemaet er låst for redigering' }).should('exist');
    });

    it('should reject publish action', () => {
      cy.findByRole('button', { name: /Publiser/ }).click();
      cy.findByRole('heading', { name: 'Skjemaet er låst for redigering' }).should('exist');
    });

    describe('can be edited, but...', () => {
      beforeEach(() => {
        cy.openEditComponentModal(cy.findByRole('textbox', { name: 'Fornavn2' }));
        cy.findByDisplayValue('Fornavn2').type('{selectall}Fornavn');
        cy.get('[data-testid="editorSaveButton"]').click();
      });

      it('should still show lock icon on buttons', () => {
        cy.findByRole('button', { name: /Lagre/ }).should('exist').should('contain.text', 'Skjemaet er låst');
        cy.findByRole('button', { name: /Publiser/ })
          .should('exist')
          .should('contain.text', 'Skjemaet er låst');
      });

      it('should still reject save action', () => {
        cy.findByRole('button', { name: /Lagre/ }).should('exist').click();
        cy.get('@putForm.all').should('have.length', 0);
        cy.findByRole('heading', { name: 'Skjemaet er låst for redigering' }).should('exist');
      });

      it('should still reject publish action', () => {
        cy.findByRole('button', { name: /Publiser/ })
          .should('exist')
          .click();
        cy.findByRole('heading', { name: 'Skjemaet er låst for redigering' }).should('exist');
      });
    });
  });
});
