import { expect } from 'chai';

describe('Form translations', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/forms/tst123456', { fixture: 'form123456.json' }).as('getForm');
    cy.intercept('GET', '/api/form-publications/tst123456', { fixture: 'form123456-published.json' }).as(
      'getPublishedForm',
    );
    cy.intercept('GET', '/api/forms/tst123456/translations', { fixture: 'form123456-translations.json' }).as(
      'getFormTranslations',
    );
    cy.intercept('GET', '/api/translations', { fixture: 'formsApiGlobalTranslations.json' }).as(
      'getGlobalTranslations',
    );
  });

  describe('When there are saved form translations', () => {
    beforeEach(() => {
      cy.visit('/forms/tst123456/oversettelser');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getPublishedForm');
      cy.wait('@getFormTranslations');
      cy.wait('@getGlobalTranslations');
    });

    it('shows timestamp when translations were last saved', () => {
      cy.findByText('Sist lagret:').should('exist').next('p').should('contain', '28.02.25, kl. 12.55');
    });
  });

  describe('Intro-page references', () => {
    beforeEach(() => {
      cy.fixture('form123456.json').then((form) => {
        cy.intercept('GET', '/api/forms/tst123456', {
          body: {
            ...form,
            components: [],
            introPage: {
              enabled: true,
              introduction: 'active-key',
              sections: {
                prerequisites: {},
                dataTreatment: { title: 'retired-title', description: 'retired-empty-key' },
              },
              selfDeclaration: 'introPage.selfDeclaration.description.alt1',
            },
          },
        });
      });
      cy.intercept('GET', '/api/forms/tst123456/translations', {
        body: [
          { id: 401, revision: 1, key: 'active-key', tag: 'introPage', nb: '' },
          { id: 402, revision: 1, key: 'retired-empty-key', tag: 'introPage', nb: '' },
          {
            id: 403,
            revision: 1,
            key: 'retired-title',
            tag: 'introPage',
            nb: 'Retired text',
            nn: 'Retired Nynorsk',
            en: 'Retired English',
          },
        ],
      }).as('getFormTranslations');
      cy.visit('/forms/tst123456/oversettelser');
      cy.wait('@getFormTranslations').its('response.statusCode').should('eq', 200);
    });

    it('moves retired translations to the unused list without losing their text', () => {
      cy.findByText('Bokmålstekst mangler for nøkkel: active-key').should('be.visible');
      cy.findByText('Bokmålstekst mangler for nøkkel: retired-empty-key').should('not.exist');
      cy.findByRole('button', { name: 'Se alle ubrukte oversettelser (2)' }).click();
      cy.findByText('Retired text').should('be.visible');
      cy.findByText('Retired Nynorsk').should('be.visible');
      cy.findByText('Retired English').should('be.visible');
      cy.findAllByRole('button', { name: 'Slett' }).should('have.length', 2);
    });

    it('keeps incomplete translations editable and saves them without requiring Bokmål', () => {
      const translation = { id: 401, revision: 1, key: 'active-key', tag: 'introPage', nb: '', nn: '' };
      cy.intercept('GET', '/api/forms/tst123456/translations', (req) => req.reply([translation])).as(
        'reloadTranslations',
      );
      cy.intercept('PUT', '/api/forms/tst123456/translations/401', (req) => {
        Object.assign(translation, { nb: req.body.nb, nn: req.body.nn, revision: translation.revision + 1 });
        req.reply(200, translation);
      }).as('saveActiveTranslation');
      cy.findByText('Bokmålstekst mangler for nøkkel: active-key').click();
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Translated');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@saveActiveTranslation').then(({ request, response }) => {
        expect(response?.statusCode).to.equal(200);
        expect(request.body).to.include({ nb: '', nn: 'Translated' });
      });
      cy.wait('@reloadTranslations')
        .its('response.body.0')
        .should('include', { id: 401, key: 'active-key', nb: '', nn: 'Translated' });
      cy.findByText(/\d+ oversettelser ble lagret\./).should('be.visible');
      cy.findByText('Bokmålstekst mangler for nøkkel: active-key').should('be.visible').click();
      cy.findByRole('textbox', { name: 'Bokmål' }).type('Welcome');
      cy.findByRole('textbox', { name: 'Bokmål' }).should('have.value', 'Welcome');
      cy.findByRole('button', { name: 'Lagre' }).focus();
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@saveActiveTranslation').then(({ request, response }) => {
        expect(response?.statusCode).to.equal(200);
        expect(request.body).to.include({ nb: 'Welcome', nn: 'Translated' });
      });
      cy.findByText('Welcome').should('be.visible');
      cy.findByText('Bokmålstekst mangler for nøkkel: active-key').should('not.exist');
    });
  });

  describe('When there are no unsaved global translations translations', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/translations', (req) => req.reply([])).as('getGlobalTranslations');
      cy.visit('/forms/tst123456/oversettelser');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getPublishedForm');
      cy.wait('@getFormTranslations');
      cy.wait('@getGlobalTranslations');
    });

    it('does not update translations with no changes', () => {
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.findByText('Ingen endringer oppdaget. Oversettelser ble ikke lagret.').should('be.visible');
    });
  });

  describe('When there are unsaved global translations', () => {
    beforeEach(() => {
      cy.visit('/forms/tst123456/oversettelser');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getPublishedForm');
      cy.wait('@getFormTranslations');
      cy.wait('@getGlobalTranslations');
    });

    it('filters translation rows with missing translations', () => {
      cy.findByText('Gitar').should('be.visible');
      cy.findByText('Trommer').should('be.visible');
      cy.findByText('Piano').should('be.visible');
      cy.findByText('Trekkspill').should('be.visible');
      cy.findByRole('checkbox', { name: 'Vis kun manglende oversettelser' }).should('exist');
      cy.findByRole('checkbox', { name: 'Vis kun manglende oversettelser' }).click();
      cy.findByText('Gitar').should('not.exist');
      cy.findByText('Trommer').should('not.exist');
      cy.findByText('Piano').should('not.exist');
      cy.findByText('Trekkspill').should('not.exist');

      // Partial translations should not be filtered out
      cy.findByText('Dine opplysninger').should('be.visible');
      cy.findByText('Ja').should('be.visible');
    });

    it('updates existing translation, adds new translation and adds global override', () => {
      cy.intercept('POST', '/api/forms/tst123456/translations', (req) => req.reply(201, req.body)).as(
        'postTranslation',
      );
      cy.intercept('PUT', '/api/forms/tst123456/translations/2', (req) => req.reply(200, req.body)).as(
        'putTranslation2',
      );
      cy.findByRole('heading', { name: 'TST-123456, Skjema for testing av diff' }).should('be.visible');
      cy.findByText('Dine opplysninger').click();
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Dine opplysninger');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('{selectall}Your information');

      cy.findByText('Fornavn2').click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(1).type('Fornavn2');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(1).type('First name2');

      cy.findByRole('button', { name: 'Lagre' }).focus();
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait(['@postTranslation', '@postTranslation', '@putTranslation2', '@getFormTranslations']).spread(
        (post1, post2, put) => {
          expect(post1.request.body).to.deep.equal({
            globalTranslationId: 6,
            key: 'Nei',
            nb: 'Nei',
            nn: 'Nei',
            en: '',
          });
          expect(post2.request.body).to.deep.equal({
            en: 'First name2',
            key: 'Fornavn2',
            nb: 'Fornavn2',
            nn: 'Fornavn2',
          });
          expect(put.request.body).to.deep.equal({
            nb: 'Dine opplysninger',
            nn: 'Dine opplysninger',
            en: 'Your information',
            revision: 3,
          });
        },
      );
      cy.findAllByRole('textbox').should('have.length', 0);
    });

    it('shows unused translations', () => {
      cy.intercept('DELETE', '/api/forms/tst123456/translations/3', (req) => req.reply(204)).as('deleteTranslation3');
      cy.intercept('DELETE', '/api/forms/tst123456/translations/5', (req) => req.reply(204)).as('deleteTranslation5');

      cy.findByRole('button', { name: 'Se alle ubrukte oversettelser (3)' }).click();
      cy.findAllByText('Ubrukte oversettelser').should('not.be.empty');
      cy.findByText('Abc').should('be.visible');
      cy.findByText('Def').should('be.visible');
      cy.findByText('Xyz').should('be.visible');
      cy.findByText('Hallo').should('be.visible');

      cy.findAllByRole('button', { name: 'Slett' }).first().click();
      cy.findAllByRole('button', { name: 'Slett' }).last().click();
      cy.wait(['@deleteTranslation3', '@deleteTranslation5']);

      cy.findByText('Oversettelse med id 3 for skjema tst123456 ble slettet').should('be.visible');
      cy.findByText('Ubrukt oversettelse').should('not.exist');
      cy.findByText('Oversettelse med id 5 for skjema tst123456 ble slettet').should('be.visible');
      cy.findByText('Hallo').should('not.exist');
      cy.findByText('Abc').should('be.visible');
      cy.findByRole('button', { name: 'Se alle ubrukte oversettelser (1)' }).should('exist');
    });
  });
});
