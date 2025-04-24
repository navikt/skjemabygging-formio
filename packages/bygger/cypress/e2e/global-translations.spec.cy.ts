import { expect } from 'chai';

describe('Global translations', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/translations', { fixture: 'formsApiGlobalTranslations.json' }).as(
      'getGlobalTranslations',
    );
    cy.visit('/oversettelser');
    cy.wait('@getGlobalTranslations');
  });

  describe('Skjematekster', () => {
    it('filters on rows with missing translations', () => {
      cy.findByText('Ny').should('be.visible');
      cy.findByText('Nyere').should('be.visible');
      cy.findByText('Abc').should('be.visible');
      cy.findByText('Hei').should('be.visible');
      cy.findByRole('checkbox', { name: 'Vis kun manglende oversettelser' }).should('exist');
      cy.findByRole('checkbox', { name: 'Vis kun manglende oversettelser' }).click();
      cy.findByText('Ny').should('not.exist');
      cy.findByText('Nyere').should('not.exist');
      cy.findByText('Abc').should('not.exist');
      cy.findByText('Hei').should('be.visible');
    });

    it('does not update translations if no changes', () => {
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.findByText('Ingen endringer oppdaget. Oversettelser ble ikke lagret.').should('be.visible');
    });

    it('adds new translation', () => {
      cy.intercept('POST', '/api/translations', (req) => {
        expect(req.body).to.deep.equal({
          key: 'Ny tekst',
          nb: 'Ny tekst',
          nn: 'Ny tekst (nynorsk)',
          en: 'New text',
          tag: 'skjematekster',
        });
        req.reply(201, req.body);
      }).as('postGlobalTranslation');
      cy.findByRole('textbox', { name: 'Bokmål' }).type('Ny tekst');
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Ny tekst (nynorsk)');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('New text');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@postGlobalTranslation');
      cy.findByRole('textbox', { name: 'Bokmål' }).should('have.value', '');
      cy.findByRole('textbox', { name: 'Nynorsk' }).should('have.value', '');
      cy.findByRole('textbox', { name: 'Engelsk' }).should('have.value', '');
    });

    it('halts with validation error if bokmål text is empty', () => {
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Ny tekst (nynorsk)');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('New text');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.findByText('Ny oversettelse: Legg til bokmålstekst for å opprette ny oversettelse').should('be.visible');
      cy.findByRole('textbox', { name: 'Nynorsk' }).should('have.value', 'Ny tekst (nynorsk)');
      cy.findByRole('textbox', { name: 'Engelsk' }).should('have.value', 'New text');
    });

    it('displays error message if new translation has existing key', () => {
      cy.intercept('POST', '/api/translations', (req) => {
        req.reply(409, req.body);
      }).as('postGlobalTranslation');
      cy.findByRole('textbox', { name: 'Bokmål' }).type('Abc');
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Abc');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('Abc');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@postGlobalTranslation');
      cy.findByText(
        '1 oversettelse ble ikke lagret fordi en nyere versjon allerede eksisterer. Last siden på nytt for å endre oversettelsen.',
      ).should('be.visible');
      cy.findByRole('textbox', { name: 'Bokmål' }).should('have.value', 'Abc');
      cy.findByRole('textbox', { name: 'Nynorsk' }).should('have.value', 'Abc');
      cy.findByRole('textbox', { name: 'Engelsk' }).should('have.value', 'Abc');
    });

    it('edits existing and adds new translation', () => {
      cy.intercept('POST', '/api/translations', (req) => {
        expect(req.body).to.deep.equal({
          key: 'Test',
          nb: 'Test',
          nn: 'Test',
          en: 'Test',
          tag: 'skjematekster',
        });
        req.reply(201, req.body);
      }).as('postGlobalTranslation');
      cy.intercept('PUT', '/api/translations/4', (req) => {
        expect(req.body).to.deep.equal({
          nb: 'Hei',
          nn: 'Hei',
          en: 'Hello',
          revision: 6,
        });
        req.reply(200, req.body);
      }).as('putGlobalTranslation4');
      cy.intercept('PUT', '/api/translations/2', (req) => {
        console.log(JSON.stringify(req.body));
        expect(req.body).to.deep.equal({
          nb: 'Nyere',
          nn: 'Gamal',
          en: 'Old',
          revision: 3,
        });
        req.reply(200, req.body);
      }).as('putGlobalTranslation2');
      cy.findByRole('textbox', { name: 'Bokmål' }).type('Test');
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Test');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('Test');
      cy.get('tr').eq(2).click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(1).type('Hei');
      cy.get('tr').eq(4).click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(2).type('{selectall}Gamal');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(2).type('{selectall}Old');
      cy.findByRole('button', { name: 'Lagre' }).focus();
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@postGlobalTranslation');
      cy.wait('@putGlobalTranslation4');
      cy.wait('@putGlobalTranslation2');
      cy.findAllByRole('textbox').should('have.length', 3);
      cy.wait('@getGlobalTranslations');
    });

    it('keeps translations open if they were not successful in saving', () => {
      cy.intercept('PUT', '/api/translations/4', (req) => {
        req.reply(200, req.body);
      }).as('putGlobalTranslation4');
      cy.intercept('PUT', '/api/translations/2', (req) => {
        req.reply(409, req.body);
      }).as('putGlobalTranslation2');
      cy.findByText('Hei').click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(1).type('Hei');
      cy.findByText('Nyere').click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(2).type('{selectall}Gamal');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(2).type('{selectall}Old');
      cy.findByRole('button', { name: 'Lagre' }).focus();
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@putGlobalTranslation4');
      cy.wait('@putGlobalTranslation2');
      cy.findAllByRole('textbox').should('have.length', 5);
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(1).should('have.value', 'Gamal');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(1).should('have.value', 'Old');
      cy.findByText(
        '1 oversettelse ble ikke lagret fordi en nyere versjon allerede eksisterer. Last siden på nytt for å endre oversettelsen.',
      ).should('be.visible');
      cy.wait('@getGlobalTranslations');
    });
  });

  describe('Grensesnitt', () => {
    it('updates new and existing translations', () => {
      cy.intercept('POST', '/api/translations', (req) => {
        expect(req.body).to.deep.equal({
          key: 'valgfritt',
          nb: 'valgfritt',
          nn: 'valfritt',
          en: null,
          tag: 'grensesnitt',
        });
        req.reply(201, req.body);
      }).as('postGlobalTranslation');
      cy.intercept('PUT', '/api/translations/5', (req) => {
        console.log(req.body);
        expect(req.body).to.deep.equal({
          nb: 'Ja',
          nn: 'Yeah',
          en: 'Yes',
          revision: 2,
        });
        req.reply(200, req.body);
      }).as('putGlobalTranslation5');
      cy.intercept('PUT', '/api/translations/6', (req) => {
        expect(req.body).to.deep.equal({
          nb: 'Nei',
          nn: 'Nei',
          en: 'No',
          revision: 1,
        });
        req.reply(200, req.body);
      }).as('putGlobalTranslation6');
      cy.findByRole('link', { name: 'Grensesnitt' }).click();
      cy.findByRole('heading', { name: 'Globale grensesnittekster' }).should('be.visible');
      cy.findAllByText('Ja').eq(0).click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(0).type('{selectall}Yeah');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(0).type('Yes');
      cy.findAllByText('Nei').eq(0).click();
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(1).type('No');
      cy.findByText('valgfritt').click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(2).type('valfritt');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@putGlobalTranslation6');
      cy.wait('@putGlobalTranslation5');
      cy.wait('@postGlobalTranslation');
    });

    it('shows unused translations', () => {
      cy.intercept('DELETE', '/api/translations/8', (req) => {
        req.reply(204);
      }).as('deleteGlobalTranslation8');
      cy.intercept('DELETE', '/api/translations/10', (req) => {
        req.reply(204);
      }).as('deleteGlobalTranslation10');

      cy.findByRole('link', { name: 'Grensesnitt' }).click();
      cy.findByRole('heading', { name: 'Globale grensesnittekster' }).should('be.visible');

      cy.findByRole('button', { name: 'Se alle ubrukte oversettelser (3)' }).click();
      cy.findAllByText('Ubrukt oversettelse').should('not.be.empty');
      cy.findAllByText('Gammel tekst').should('not.be.empty');

      cy.findAllByRole('button', { name: 'Slett' }).first().click();
      cy.findAllByRole('button', { name: 'Slett' }).last().click();

      cy.wait(['@deleteGlobalTranslation8', '@deleteGlobalTranslation10']);
      cy.findByText('Global oversettelse med id 8 ble slettet').should('be.visible');
      cy.findByText('Ubrukt oversettelse').should('not.exist');
      cy.findByText('Global oversettelse med id 10 ble slettet').should('be.visible');
      cy.findByText('Gammel tekst').should('not.exist');
      cy.findByRole('button', { name: 'Se alle ubrukte oversettelser (1)' }).should('exist');
    });
  });

  describe('Validering', () => {
    it('updates new and existing translations', () => {
      cy.intercept('POST', '/api/translations', (req) => {
        expect(req.body).to.deep.equal({
          key: 'required',
          nb: 'Du må fylle ut: {{field}}',
          nn: 'Du må fylle ut: {{field}}',
          en: 'You must fill in: {{field}}',
          tag: 'validering',
        });
        req.reply(201, req.body);
      }).as('postGlobalTranslation');
      cy.intercept('PUT', '/api/translations/7', (req) => {
        console.log(req.body);
        expect(req.body).to.deep.equal({
          nb: 'For å gå videre må du rette opp følgende:',
          nn: 'Ny nynorsk tekst her',
          en: 'To proceed you must correct the following errors:',
          revision: 1,
        });
        req.reply(200, req.body);
      }).as('putGlobalTranslation7');
      cy.findByRole('link', { name: 'Validering' }).click();
      cy.findByRole('heading', { name: 'Globale valideringstekster' }).should('be.visible');
      cy.findByText('For å gå videre må du rette opp følgende:').click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(0).type('{selectall}Ny nynorsk tekst her');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(0).type('To proceed you must correct the following errors:');
      cy.findByText('Du må fylle ut: {{field}}').click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' })
        .eq(1)
        .type('Du må fylle ut: {{field}}', { parseSpecialCharSequences: false });
      cy.findAllByRole('textbox', { name: 'Engelsk' })
        .eq(1)
        .type('You must fill in: {{field}}', { parseSpecialCharSequences: false });
      cy.findByRole('button', { name: 'Lagre' }).focus();
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@putGlobalTranslation7');
      cy.wait('@postGlobalTranslation');
    });
  });
});
