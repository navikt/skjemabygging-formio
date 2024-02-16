/*
 * Tests for when the user has ongoing mellomlagringer or ettersendinger for the form. It should display the active tasks and let the user continue or start a new task.
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const itLetsYouStartANewMellomlagring = () => {
  cy.findByRole('link', { name: TEXTS.statiske.paabegynt.startNewTask }).should('be.visible');
  cy.findByRole('link', { name: TEXTS.statiske.paabegynt.startNewTask }).click();
  cy.wait('@createMellomlagring');
  cy.findByRole('heading', { name: 'Valgfrie opplysninger' });
};

describe('Active tasks', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.intercept('GET', '/fyllut/api/send-inn/aktive-opprettede-soknader/*').as('getActiveTasks');
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('When creating mellomlagring returns with location header', () => {
    beforeEach(() => {
      cy.mocksUseRouteVariant('post-soknad:already-exists');
    });

    it('redirects to /fyllut/:skjemapath:/paabegynt', () => {
      cy.visit('/fyllut/testmellomlagring?sub=digital');
      cy.wait('@getForm');
      cy.clickStart();
      cy.wait('@getActiveTasks');
      cy.findByRole('heading', { name: TEXTS.statiske.paabegynt.oneActiveTaskHeading });
    });
  });

  describe('When user has mellomlagring and ettersending in progress for the form', () => {
    beforeEach(() => {
      cy.mocksUseRouteVariant('get-active-tasks:success');
      cy.visit('/fyllut/testmellomlagring/paabegynt?sub=digital');
      cy.wait('@getActiveTasks');
    });

    it('lets you go to the original mellomlagring and the active ettersending', () => {
      cy.findByRole('link', { name: new RegExp(`${TEXTS.statiske.paabegynt.continueTask}`) })
        .should('have.attr', 'href')
        .and('include', '/testmellomlagring/oppsummering')
        .and('include', 'sub=digital')
        .and('include', 'innsendingsId=f99dc639-add1-468f-b4bb-961cdfd1e599');
      cy.findByRole('link', { name: TEXTS.statiske.paabegynt.sendAttachment })
        .should('have.attr', 'href')
        .and('include', '/minside');
    });

    it('lets you start a new mellomlagring', itLetsYouStartANewMellomlagring);
  });

  describe('When user has a mellomlagring in progress for the form', () => {
    beforeEach(() => {
      cy.intercept('GET', '/fyllut/api/send-inn/soknad/f99dc639-add1-468f-b4bb-961cdfd1e599').as('getMellomlagring');
      cy.mocksUseRouteVariant('get-active-tasks:success-mellomlagring');
      cy.visit('/fyllut/testmellomlagring/paabegynt?sub=digital');
      cy.wait('@getActiveTasks');
    });

    it('does not display heading or link for ettersending', () => {
      cy.findByText(TEXTS.statiske.paabegynt.activeTasksBody).should('be.visible');
      cy.findByRole('heading', { name: TEXTS.statiske.paabegynt.sendAttachmentsHeading }).should('not.exist');
      cy.findByText(TEXTS.statiske.paabegynt.sendAttachmentsHeading).should('not.exist');
    });

    it('lets you go to the original mellomlagring', () => {
      const continueLink = new RegExp(`${TEXTS.statiske.paabegynt.continueTask}`);
      cy.findByRole('link', { name: continueLink }).should('be.visible');
      cy.findByRole('link', { name: continueLink }).click();
      cy.wait('@getMellomlagring');
      cy.findByRole('heading', { name: 'Oppsummering' });
    });

    it('lets you start a new mellomlagring', itLetsYouStartANewMellomlagring);
  });

  describe('When user has an active ettersending in progress for the form', () => {
    beforeEach(() => {
      cy.mocksUseRouteVariant('get-active-tasks:success-ettersending');
      cy.visit('/fyllut/testmellomlagring/paabegynt?sub=digital');
      cy.wait('@getActiveTasks');
    });

    it('does not display text for mellomlagring', () => {
      cy.findByRole('heading', { name: TEXTS.statiske.paabegynt.sendAttachmentsHeading }).should('be.visible');
      cy.findByText(TEXTS.statiske.paabegynt.activeTasksBody).should('not.exist');
    });

    it('lets you go to /minside', () => {
      cy.findByRole('link', { name: TEXTS.statiske.paabegynt.sendAttachment })
        .should('have.attr', 'href')
        .and('include', '/minside');
    });

    it('lets you start a new mellomlagring', itLetsYouStartANewMellomlagring);
  });
});
