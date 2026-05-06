import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const downloadPdf = (submissionType: 'paper' | 'digital' | 'digitalnologin' = 'paper') => {
  cy.findByRole('link', { name: /Oppsummering|Summary/ }).click();
  cy.findByRole('heading', { name: /Oppsummering|Summary/ }).shouldBeVisible();

  if (submissionType === 'digital') {
    cy.clickSaveAndContinue();
  } else if (submissionType === 'digitalnologin') {
    cy.clickSendNav();
  } else {
    cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
    cy.findByRole('button', { name: /Last ned skjema|Download form/ }).click();
  }

  cy.wait('@downloadPdf');
};

describe('Pdf', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  describe('Verify escaped characters', () => {
    beforeEach(() => {
      cy.visit('/fyllut/components?sub=paper');
      cy.defaultWaits();
      cy.clickShowAllSteps();
    });

    it('replaces tab', () => {
      cy.mocksUseRouteVariant('post-familie-pdf:success-tc04');
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
      cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).check();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
      cy.clickNextStep();

      cy.findByRole('link', { name: 'Standard felter' }).click();
      cy.findByRole('heading', { name: 'Standard felter' }).shouldBeVisible();
      cy.findByRole('textbox', { name: /Tekstfelt/ }).type('Navn med\ttab');
      cy.findByRole('textbox', { name: /Tekstområde/ }).type(
        'En del tekst\n\nsom viser utgifter\\\\text{ kr}\nnextline\tog en tab til slutt\nsom skal bli erstattet med to mellomrom.\u000bDette er vertical tab unicode som skal erstattes med newline,\u000bog denne skal også bli newline.',
        {
          parseSpecialCharSequences: false,
        },
      );

      cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application').as('downloadPdf');
      downloadPdf();
    });
  });

  describe('Failure to generate PDF', () => {
    describe('paper submission', () => {
      beforeEach(() => {
        cy.visit('/fyllut/components?sub=paper');
        cy.defaultWaits();
        cy.clickShowAllSteps();
      });

      const fillFormAndDownloadPdf = (expectedHttpStatusCode: number = 200) => {
        cy.clickIntroPageConfirmation();
        cy.clickStart();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
        cy.clickNextStep();
        cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
          req.on('response', (res) => {
            expect(res.statusCode).to.eq(expectedHttpStatusCode);
          });
        }).as('downloadPdf');
        downloadPdf('paper');
      };

      it('shows error message when application PDF generation fails', () => {
        cy.mocksUseRouteVariant('post-familie-pdf:failure');
        fillFormAndDownloadPdf(500);
        cy.findByText(TEXTS.statiske.prepareLetterPage.downloadError).should('exist');
      });

      it('shows error message when pdf merge of application and cover page fails', () => {
        cy.mocksUseRouteVariant('merge-files:failure');
        fillFormAndDownloadPdf(500);
        cy.findByText(TEXTS.statiske.prepareLetterPage.downloadError).should('exist');
      });
    });
  });
});
