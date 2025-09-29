import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const digitalLinkNames = [TEXTS.grensesnitt.introPage.sendDigital, TEXTS.grensesnitt.introPage.sendDigitalLoggedIn];

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

        cy.clickShowAllSteps();
        cy.findByRole('link', { name: TEXTS.statiske.summaryPage.title }).click();

        cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).should('not.exist');
        cy.findAllByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).first().click();

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickNextStep();

        cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
        cy.clickNextStep();

        cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();

        cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).should('exist');
      });

      it('Show attachments', () => {
        cy.clickStart();

        cy.clickShowAllSteps();
        cy.findByRole('link', { name: 'Vedlegg' }).should('exist');
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

        cy.clickShowAllSteps();
        cy.findByRole('link', { name: TEXTS.statiske.summaryPage.title }).click();

        cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.submitToNavPrompt.open }).should('not.exist');
        cy.findAllByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).first().click();

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickSaveAndContinue();

        cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('exist');
      });

      it('Do not show attachments', () => {
        cy.clickStart();

        cy.clickShowAllSteps();
        cy.findByRole('link', { name: 'Vedlegg' }).should('not.exist');
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

  describe('Type: Digital No Login', () => {
    it('goes to upload page', () => {
      cy.skipIfNoIncludeDistTests();
      cy.visit('/fyllut/stnologin?sub=digitalnologin');
      cy.defaultWaits();
      cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
    });

    it('Use paper submission type on digital no login only', () => {
      cy.visit('/fyllut/stnologin?sub=paper');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Ugyldig innsendingsvalg' }).should('exist');
    });

    it('Add sub if missing (INCLUDE_DIST_TESTS)', () => {
      cy.skipIfNoIncludeDistTests();
      cy.visit('/fyllut/stnologin');
      cy.defaultWaits();
      cy.url().should('include', 'sub=digitalnologin');
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

        cy.findAllByRole('link')
          .filter((_, el) => digitalLinkNames.includes(el.textContent?.trim()))
          .first()
          .click();
        cy.url().should('include', 'sub=digital');
      });

      it('Select paper', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).click();
        cy.clickStart();

        cy.url().should('include', 'sub=paper');

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickNextStep();

        cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
        cy.clickNextStep();

        cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();

        cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).should('exist');
      });

      it('Select digital', () => {
        cy.findAllByRole('link')
          .filter((_, el) => digitalLinkNames.includes(el.textContent?.trim()))
          .first()
          .click();
        cy.clickStart();

        cy.url().should('include', 'sub=digital');

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickSaveAndContinue();

        cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('exist');
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

  describe('Type: Digital and Digital No Login', () => {
    describe('Go to intro page', () => {
      beforeEach(() => {
        cy.visit('/fyllut/stdigitalnologin');
        cy.defaultWaits();
      });

      it('Check that the correct link panels are shown', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigital }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.noLogin }).should('not.exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('not.exist');
      });

      it('Select digtal no login', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).click();
        cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');

        cy.url().should('include', 'sub=digitalnologin');
      });

      it('Select digital', () => {
        cy.findAllByRole('link')
          .filter((_, el) => digitalLinkNames.includes(el.textContent?.trim()))
          .first()
          .click();
        cy.clickStart();

        cy.url().should('include', 'sub=digital');
      });
    });
  });

  describe('Type: Paper and Digital No Login', () => {
    describe('Go to intro page', () => {
      beforeEach(() => {
        cy.visit('/fyllut/stpapernologin');
        cy.defaultWaits();
      });

      it('Check that the correct link panels are shown', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigital }).should('not.exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.noLogin }).should('not.exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('exist');
      });

      it('Select paper', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).click();
        cy.clickStart();

        cy.url().should('include', 'sub=paper');
      });

      it('Select digtal no login', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).click();
        cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');

        cy.url().should('include', 'sub=digitalnologin');
      });
    });
  });

  describe('Type: Digital, Digital No Login and Paper', () => {
    describe('Go to intro page', () => {
      beforeEach(() => {
        cy.visit('/fyllut/stpaperdigitalnologin');
        cy.defaultWaits();
      });

      it('Check that the correct link panels are shown', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigital }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.noLogin }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).should('not.exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('not.exist');

        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.noLogin }).click();

        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigital }).should('not.exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.noLogin }).should('not.exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('exist');
      });
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

      cy.clickShowAllSteps();
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

  describe('Other', () => {
    it('Make sure the url is correct when you already have search params.', () => {
      cy.visit('/fyllut/stpaperdigital?lang=en');
      cy.defaultWaits();
      cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).click();

      cy.url().should('include', 'fyllut/stpaperdigital?lang=en&sub=paper');
    });
  });
});
