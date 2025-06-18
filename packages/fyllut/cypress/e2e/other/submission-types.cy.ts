import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Submission Type', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Type: Paper', () => {
    describe('Go to intro page', () => {
      beforeEach(() => {
        // sub=paper gets automatically added when running on build code
        cy.visit('/fyllut/stpaper?sub=paper');
        cy.defaultWaits();
      });

      it('Only allow user to continue from summary page if form is valid', () => {
        cy.clickStart();

        cy.findByRole('link', { name: TEXTS.statiske.summaryPage.title }).click();

        cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).should('not.exist');
        cy.findAllByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).first().click();

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickNextStep();

        cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();

        cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).should('exist');
      });
    });

    it('Use digital submission type on paper only', () => {
      cy.visit('/fyllut/stpaper?sub=digital');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Ugyldig innsendingsvalg' }).should('exist');
    });

    it('Add sub if missing (INCLUDE_DIST_TESTS)', () => {
      cy.skipIfNoIncludeDistTests();

      cy.visit('/fyllut/stpaper');
      cy.defaultWaits();
      cy.url().should('include', 'sub=paper');
    });
  });

  describe('Type: Digital', () => {
    describe('Go to intro page', () => {
      beforeEach(() => {
        // sub=digital gets automatically added when running on build code
        cy.visit('/fyllut/stdigital?sub=digital');
        cy.defaultWaits();
      });

      it('Only allow user to continue from summary page if form is valid', () => {
        cy.clickStart();

        cy.findByRole('link', { name: TEXTS.statiske.summaryPage.title }).click();

        cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.submitToNavPrompt.open }).should('not.exist');
        cy.findAllByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).first().click();

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickSaveAndContinue();

        cy.findByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.open }).should('exist');
      });
    });

    it('Use paper submission type on digital only', () => {
      cy.visit('/fyllut/stdigital?sub=paper');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Ugyldig innsendingsvalg' }).should('exist');
    });

    it('Add sub if missing (INCLUDE_DIST_TESTS)', () => {
      cy.skipIfNoIncludeDistTests();
      cy.visit('/fyllut/stdigital');
      cy.defaultWaits();
      cy.url().should('include', 'sub=digital');
    });
  });

  describe('Type: Digital and Paper', () => {
    describe('Go to intro page', () => {
      beforeEach(() => {
        cy.visit('/fyllut/stpaperdigital');
        cy.defaultWaits();
      });

      it('Change between paper and digital', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigital }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('exist');

        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).click();
        cy.url().should('include', 'sub=paper');

        cy.findByRole('button', { name: TEXTS.grensesnitt.goBack }).click();

        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigital }).click();
        cy.url().should('include', 'sub=digital');
      });

      it('Select paper', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).click();
        cy.clickStart();

        cy.url().should('include', 'sub=paper');

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickNextStep();

        cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();

        cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).should('exist');
      });

      it('Select digital', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigital }).click();
        cy.clickStart();

        cy.url().should('include', 'sub=digital');

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickSaveAndContinue();

        cy.findByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.open }).should('exist');
      });
    });

    it('Missing sub paper or digital (INCLUDE_DIST_TESTS)', () => {
      cy.skipIfNoIncludeDistTests();

      cy.visit('/fyllut/stpaperdigital/dineOpplysninger');
      cy.defaultWaits();

      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('not.exist');
      cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigital }).should('exist');
      cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('exist');
    });
  });

  describe('Type: None', () => {
    beforeEach(() => {
      cy.visit('/fyllut/stnone');
      cy.defaultWaits();
    });

    it('Only allow user to continue from summary page if form is valid', () => {
      cy.clickStart();
      cy.url().should('not.include', '?');

      cy.findByRole('link', { name: TEXTS.statiske.summaryPage.title }).click();

      cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
      cy.findByRole('link', { name: TEXTS.grensesnitt.submitToNavPrompt.open }).should('not.exist');
      cy.findAllByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).first().click();

      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
      cy.clickNextStep();
      cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();

      cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).should('exist');
    });
  });
});
