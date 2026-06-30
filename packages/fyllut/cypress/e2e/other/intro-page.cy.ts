import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const privacyLinkText = /hvordan Nav behandler personopplysninger på nav.no/i;

describe('Intro page', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Submission type "paper"', () => {
    beforeEach(() => {
      cy.visit('/fyllut/intropagepaper?sub=paper');
      cy.defaultWaits();
    });

    it('should show validation error is shown when selfDeclaration is not checked', () => {
      cy.clickStart();
      cy.findByText('Du må bekrefte at du vil svare så riktig som du kan.').should('exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('not.exist');
    });

    it('should render form when selfDeclaration is checked', () => {
      cy.clickIntroPageConfirmation();
      cy.clickStart();
      cy.findByText('Du må bekrefte at du vil svare så riktig som du kan.').should('not.exist');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
    });

    it('should render privacy link in data disclosure and hide standalone privacy section', () => {
      cy.findByRole('button', { name: 'Hvordan vi behandler personopplysninger' }).should('not.exist');
      cy.findByRole('button', { name: 'Informasjon vi henter om deg' }).click();
      cy.contains('Du kan lese mer om').should('exist');
      cy.contains('a', privacyLinkText)
        .should('have.attr', 'href', 'https://www.nav.no/personvernerklaering')
        .and('have.attr', 'target', '_blank');
    });
  });

  describe('Submission type "digitalnologin"', () => {
    it('should display the deadline by which the user must complete the application', () => {
      cy.visit('/fyllut/intropagedigitalnologindeadline/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
      cy.clickNextStep();

      cy.findByRole('heading', { name: /Introduksjon/ }).should('exist');
      cy.findByText(/Du må fullføre innen kl. \d\d\.\d\d/).should('exist');
    });
  });

  describe('Submission type "papernocoverpage"', () => {
    const onlypapernocoverpageFormPath = 'onlypapernocoverpage';

    it('should render intro page when only paper-no-cover-page is supported', () => {
      cy.visit(`/fyllut/${onlypapernocoverpageFormPath}`);
      cy.defaultWaits();
      cy.findByRole('heading', { name: TEXTS.grensesnitt.introPage.title }).shouldBeVisible();
      cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalLoggedIn }).should('not.exist');
      cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('not.exist');
    });
  });

  describe('Submission type combinations', () => {
    describe('Form with paper, digital and papernocoverpage', () => {
      const multiplesubtypesFormPath = 'multiplesubtypes';

      it('should render page for selecting submission type', () => {
        cy.visit(`/fyllut/${multiplesubtypesFormPath}`);
        cy.defaultWaits();
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalLoggedIn }).should('exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('exist');
      });

      it('should render paper intro page', () => {
        cy.visit(`/fyllut/${multiplesubtypesFormPath}?sub=paper`);
        cy.defaultWaits();
        cy.findByRole('heading', { name: TEXTS.grensesnitt.introPage.title }).shouldBeVisible();
        cy.contains('Du må fylle ut skjemaet digitalt, og så sende det i posten.').should('exist');
        cy.findByRole('button', { name: 'Vi lagrer svar underveis' }).should('not.exist');
        cy.clickIntroPageConfirmation();
        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Dine opplysninger' }).shouldBeVisible();
      });

      it('should render digital intro page', () => {
        cy.visit(`/fyllut/${multiplesubtypesFormPath}?sub=digital`);
        cy.defaultWaits();
        cy.findByRole('heading', { name: TEXTS.grensesnitt.introPage.title }).shouldBeVisible();
        cy.findByRole('button', { name: 'Vi lagrer svar underveis' }).click();
        cy.contains('Vi lagrer et utkast av skjemaet automatisk').should('exist');
        cy.clickIntroPageConfirmation();
        cy.clickSaveAndContinue();
        cy.findByRole('heading', { name: 'Dine opplysninger' }).shouldBeVisible();
      });
    });

    describe('Form with papernocoverpage and staticpdf', () => {
      const papernocoverpagestaticpdfFormPath = 'papernocoverpagestaticpdf';

      it('should render intro page correctly even if staticpdf', () => {
        cy.visit(`/fyllut/${papernocoverpagestaticpdfFormPath}`);
        cy.defaultWaits();
        cy.findByRole('heading', { name: TEXTS.grensesnitt.introPage.title }).shouldBeVisible();
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalLoggedIn }).should('not.exist');
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('not.exist');
      });
    });
  });
});
