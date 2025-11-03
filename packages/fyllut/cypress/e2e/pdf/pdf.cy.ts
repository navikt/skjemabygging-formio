import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

const getCleanedUpPdfFormData = (request, date?: string) => {
  const pdfFormData = JSON.parse(JSON.stringify(request.body.pdfFormData));
  pdfFormData.verdiliste.forEach((panel, index, object) => {
    if (panel.label === 'Person' && date) {
      panel.verdiliste.forEach((component) => {
        if (component.verdi.match(/^\d{2}.\d{2}.\d{4}$/)) {
          component.verdi = date;
        }
      });
    } else if (panel.label === 'Underskrift' && request.submissionMethod === 'digital') {
      object.splice(index, 1);
    }
  });

  return {
    ...pdfFormData,
    bunntekst: {
      ...pdfFormData.bunntekst,
      upperMiddle: null, // Remove timestamp for comparison.
    },
  };
};

const downloadPdf = (submissionType: 'digital' | 'paper' | 'digitalnologin' = 'paper') => {
  cy.findByRole('link', { name: 'Oppsummering' }).click();
  cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
  if (submissionType === 'digital') {
    cy.findByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.open }).click();
    cy.findByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.confirm }).click();
  } else if (submissionType === 'digitalnologin') {
    cy.findByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.open }).click();
  } else {
    cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();
    cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).click();
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

  describe('Conditional rendering of pages', () => {
    it('pdfFormData get populated with the all conditional pages', () => {
      cy.visit('/fyllut/conditionalpage?sub=digital');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickStart();
      cy.findByRole('heading', { name: 'Page 1' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: /Avkryssingsboks/ }).click();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Page 2' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: /Avkryssingsboks 1/ }).click();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Page 3' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: /Avkryssingsboks 2/ }).click();
      cy.findByRole('checkbox', { name: /Avkryssingsboks 3/ }).click();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();

      cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
        const { submission, pdfFormData } = req.body;
        expect(Object.keys(submission.data)).to.have.length(4);
        expect(Object.keys(pdfFormData.verdiliste)).to.have.length(4);
        expect(Object.keys(pdfFormData.verdiliste[3].verdiliste)).to.have.length(3);
      }).as('submitMellomlagring');

      cy.clickSendNav();

      cy.wait('@submitMellomlagring');
    });

    it('pdfFormData get populated with the correct number of pages', () => {
      cy.visit('/fyllut/conditionalpage?sub=digital');
      cy.defaultWaits();

      cy.clickIntroPageConfirmation();
      cy.clickStart();

      cy.findByRole('heading', { name: 'Page 1' }).shouldBeVisible();
      cy.clickSaveAndContinue();

      cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
        const { submission, pdfFormData } = req.body;
        expect(Object.keys(submission.data)).to.have.length(1);
        // This is 1 and not 2, because the conditional page (page 2) is not shown in pdf since it have no values.
        // It is shown in summary page since it there have an edit link.
        expect(Object.keys(pdfFormData.verdiliste)).to.have.length(1);
      }).as('submitMellomlagring');
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.clickSendNav();

      cy.wait('@submitMellomlagring');
    });

    it('pdfFormData get populated with the correct number of pages, paper', () => {
      cy.visit('/fyllut/conditionalpage?sub=paper');
      cy.defaultWaits();

      cy.clickIntroPageConfirmation();
      cy.clickStart();

      cy.findByRole('heading', { name: 'Page 1' }).shouldBeVisible();
      cy.findByRole('checkbox', { name: /Avkryssingsboks/ }).click();
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Page 2' }).shouldBeVisible();
      cy.findByRole('textbox', { name: /Tekstfelt/ }).type('Nav 1');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();

      cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
        const { submission, pdfFormData } = req.body;
        expect(Object.keys(JSON.parse(submission).data)).to.have.length(3);
        expect(Object.keys(pdfFormData.verdiliste)).to.have.length(3);
      }).as('downloadPdf');

      cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).click();

      cy.wait('@downloadPdf');
    });
  });

  describe('Check components', () => {
    describe('Paper', () => {
      beforeEach(() => {
        cy.visit('/fyllut/components?sub=paper');
        cy.defaultWaits();
        cy.clickShowAllSteps();
      });

      it('Only identity', () => {
        cy.clickStart();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
        cy.clickNextStep();

        cy.fixture('pdf/request-components-identity.json').then((fixture) => {
          cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
            // Check that timestamp is present in footer before removing it for comparison.
            expect(req.body.pdfFormData.bunntekst.upperMiddle).not.to.be.null;
            expect(getCleanedUpPdfFormData(req)).deep.eq(fixture);
          }).as('downloadPdf');
        });

        downloadPdf();
      });

      it('All values', () => {
        const date = '20.10.2025';

        cy.clickStart();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Standard felter' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Tekstfelt/ }).type('Nav 1');
        cy.findByRole('textbox', { name: /Tekstområde/ }).type('Nav 2');
        cy.findByRole('textbox', { name: /Tall/ }).type('1');
        cy.findByRole('checkbox', { name: /Avkryssingsboks/ }).check();
        cy.findByRole('group', { name: /Flervalg/ }).within(() => {
          cy.findByRole('checkbox', { name: 'Ja' }).check();
        });
        // Select react
        cy.findByRole('combobox', { name: /Nedtrekksmeny \(navSelect\)/ }).type('{downArrow}{enter}');
        // Select formio (ChoiceJS)
        cy.findAllByRole('combobox').eq(1).click();
        cy.findAllByRole('combobox')
          .eq(1)
          .within(() => {
            cy.findByRole('option', { name: 'Ja' }).click();
          });
        // Select formio (HTML5)
        cy.findAllByRole('combobox').eq(2).select('0,50');
        cy.findByRole('group', { name: /Radiopanel/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });

        cy.findByRole('link', { name: 'Person' }).click();
        cy.findByRole('heading', { name: 'Person' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
        cy.findByRole('textbox', { name: /Fornavn/ }).type('Ola');
        cy.findByRole('textbox', { name: /Etternavn/ }).type('Nordmann');
        cy.findByRole('textbox', { name: /C\/O/ }).type('Annen person');
        cy.findAllByRole('textbox', { name: /Vegadresse/ })
          .eq(0)
          .type('Fyrstikkalléen 1');
        cy.findAllByRole('textbox', { name: /Postnummer/ })
          .eq(0)
          .type('0661');
        cy.findAllByRole('textbox', { name: /Poststed/ })
          .eq(0)
          .type('Oslo');
        cy.findByRole('textbox', { name: /Gyldig fra/ }).type(date);
        cy.findByRole('textbox', { name: /Gyldig til/ }).type(date);
        cy.findAllByRole('textbox', { name: /Vegadresse/ })
          .eq(1)
          .type('Fyrstikkalléen 2');
        cy.findAllByRole('textbox', { name: /Postnummer/ })
          .eq(1)
          .type('0662');
        cy.findAllByRole('textbox', { name: /Poststed/ })
          .eq(1)
          .type('Oslo2');
        cy.findByRole('combobox', { name: /Velg land/ }).type('Norg{downArrow}{enter}');
        cy.findByRole('textbox', { name: /E-post/ }).type('test@nav.no');
        cy.findByRole('textbox', { name: /Telefonnummer/ }).type('21070000');
        cy.findByRole('textbox', { name: /Statsborgerskap/ }).type('Norsk');

        cy.findByRole('link', { name: 'Penger og konto' }).click();
        cy.findByRole('heading', { name: 'Penger og konto' }).shouldBeVisible();
        cy.findAllByRole('textbox', { name: /Beløp/ }).eq(0).type('1000');
        cy.findAllByRole('combobox', { name: /Velg valuta/ })
          .eq(0)
          .type('{downArrow}{enter}');
        cy.findAllByRole('textbox', { name: /Beløp/ }).eq(1).type('2000');
        cy.findByRole('textbox', { name: /Kontonummer/ }).type('76586005479');
        cy.findByRole('textbox', { name: /IBAN/ }).type('NO8330001234567');
        cy.findAllByRole('combobox', { name: /Velg valuta/ })
          .eq(1)
          .type('{downArrow}{downArrow}{enter}');

        cy.findByRole('link', { name: 'Bedrift / organisasjon' }).click();
        cy.findByRole('heading', { name: 'Bedrift / organisasjon' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Organisasjonsnummer/ }).type('889640782');
        cy.findByRole('textbox', { name: /Arbeidsgiver/ }).type('Nav');

        cy.findByRole('link', { name: 'Dato og tid' }).click();
        cy.findByRole('heading', { name: 'Dato og tid' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Dato/ }).type('01.01.2025');
        cy.findByRole('textbox', { name: /Klokkeslett/ }).type('01:01');
        cy.findByRole('textbox', { name: /Månedsvelger/ }).type('01.2025');
        cy.findByRole('textbox', { name: /År/ }).type('2025');

        cy.findByRole('link', { name: 'Gruppering' }).click();
        cy.findByRole('heading', { name: 'Gruppering' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Tekstfelt skjemagruppe 1 / }).type('Skjema 1');
        cy.findByRole('textbox', { name: /Tekstfelt skjemagruppe 2 / }).type('Skjema 2a');
        cy.findAllByRole('button', { name: 'Legg til' }).eq(0).click();
        cy.findAllByRole('textbox', { name: /Tekstfelt skjemagruppe 2 / })
          .eq(1)
          .type('Skjema 2b');
        cy.findByRole('textbox', { name: /Tekstfelt repeterende data/ }).type('Repeat 1');
        cy.findAllByRole('button', { name: 'Legg til' }).eq(1).click();
        cy.findAllByRole('button', { name: 'Legg til' }).eq(1).click();
        cy.findAllByRole('textbox', { name: /Tekstfelt repeterende data/ })
          .eq(1)
          .type('Repeat 2');
        cy.findAllByRole('textbox', { name: /Tekstfelt repeterende data/ })
          .eq(2)
          .type('Repeat 3');

        cy.findByRole('link', { name: 'Andre' }).click();
        cy.findByRole('heading', { name: 'Andre' }).shouldBeVisible();
        cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();

        cy.findByRole('link', { name: 'Vedlegg' }).click();
        cy.findByRole('heading', { name: 'Vedlegg' }).shouldBeVisible();
        cy.findByRole('group', { name: /Vedlegg/ }).within(() => {
          cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).check();
        });
        cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
          cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).check();
        });

        cy.fixture('pdf/request-components-all.json').then((fixture) => {
          cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
            expect(getCleanedUpPdfFormData(req, date)).deep.eq(fixture);
          }).as('downloadPdf');
        });

        downloadPdf();
      });
    });

    describe('Digital', () => {
      beforeEach(() => {
        cy.defaultInterceptsMellomlagring();
        cy.visit('/fyllut/components?sub=digital');
        cy.defaultWaits();
        cy.clickShowAllSteps();
      });

      it('Only identity', () => {
        cy.clickStart();

        cy.findByRole('link', { name: 'Andre' }).click();
        cy.findByRole('heading', { name: 'Andre' }).shouldBeVisible();
        // Not possible to set this as not required.
        cy.findByRole('group', { name: /Hvilken aktivitet søker du om støtte i forbindelse med?/ }).within(() => {
          cy.findByRole('radio', { name: 'Ingen relevant aktivitet registrert på meg' }).check();
        });

        cy.fixture('pdf/request-components-identity-digital.json').then((fixture) => {
          cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
            // Check that timestamp is present in footer before removing it for comparison.
            expect(req.body.pdfFormData.bunntekst.upperMiddle).not.to.be.null;
            expect(getCleanedUpPdfFormData(req)).deep.eq(fixture);
          }).as('downloadPdf');
        });

        downloadPdf('digital');
      });

      it('All values', () => {
        const date = '20.10.2025';

        cy.clickStart();
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Standard felter' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Tekstfelt/ }).type('Nav 1');
        cy.findByRole('textbox', { name: /Tekstområde/ }).type('Nav 2');
        cy.findByRole('textbox', { name: /Tall/ }).type('1');
        cy.findByRole('checkbox', { name: /Avkryssingsboks/ }).check();
        cy.findByRole('group', { name: /Flervalg/ }).within(() => {
          cy.findByRole('checkbox', { name: 'Ja' }).check();
        });
        // Select React
        cy.findByRole('combobox', { name: /Nedtrekksmeny \(navSelect\)/ }).type('{downArrow}{enter}');
        // Select formio (ChoiceJS)
        cy.findAllByRole('combobox').eq(1).click();
        cy.findAllByRole('combobox')
          .eq(1)
          .within(() => {
            cy.findByRole('option', { name: 'Ja' }).click();
          });
        // Select formio (HTML5)
        cy.findAllByRole('combobox').eq(2).select('-0,50');
        cy.findByRole('group', { name: /Radiopanel/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });

        cy.findByRole('link', { name: 'Person' }).click();
        cy.findByRole('heading', { name: 'Person' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
        cy.findByRole('textbox', { name: /Fornavn/ }).type('Ola');
        cy.findByRole('textbox', { name: /Etternavn/ }).type('Nordmann');
        cy.findByRole('textbox', { name: /C\/O/ }).type('Annen person');
        cy.findAllByRole('textbox', { name: /Vegadresse/ })
          .eq(0)
          .type('Fyrstikkalléen 1');
        cy.findAllByRole('textbox', { name: /Postnummer/ })
          .eq(0)
          .type('0661');
        cy.findAllByRole('textbox', { name: /Poststed/ })
          .eq(0)
          .type('Oslo');
        cy.findByRole('textbox', { name: /Gyldig fra/ }).type(date);
        cy.findByRole('textbox', { name: /Gyldig til/ }).type(date);
        cy.findAllByRole('textbox', { name: /Vegadresse/ })
          .eq(1)
          .type('Fyrstikkalléen 2');
        cy.findAllByRole('textbox', { name: /Postnummer/ })
          .eq(1)
          .type('0662');
        cy.findAllByRole('textbox', { name: /Poststed/ })
          .eq(1)
          .type('Oslo2');
        cy.findByRole('combobox', { name: /Velg land/ }).type('Norg{downArrow}{enter}');
        cy.findByRole('textbox', { name: /E-post/ }).type('test@nav.no');
        cy.findByRole('textbox', { name: /Telefonnummer/ }).type('21070000');
        cy.findByRole('textbox', { name: /Statsborgerskap/ }).type('Norsk');

        cy.findByRole('link', { name: 'Penger og konto' }).click();
        cy.findByRole('heading', { name: 'Penger og konto' }).shouldBeVisible();
        cy.findAllByRole('textbox', { name: /Beløp/ }).eq(0).type('1000');
        cy.findAllByRole('combobox', { name: /Velg valuta/ })
          .eq(0)
          .type('{downArrow}{enter}');
        cy.findAllByRole('textbox', { name: /Beløp/ }).eq(1).type('2000');
        cy.findByRole('textbox', { name: /Kontonummer/ }).type('76586005479');
        cy.findByRole('textbox', { name: /IBAN/ }).type('NO8330001234567');
        cy.findAllByRole('combobox', { name: /Velg valuta/ })
          .eq(1)
          .type('{downArrow}{downArrow}{enter}');

        cy.findByRole('link', { name: 'Bedrift / organisasjon' }).click();
        cy.findByRole('heading', { name: 'Bedrift / organisasjon' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Organisasjonsnummer/ }).type('889640782');
        cy.findByRole('textbox', { name: /Arbeidsgiver/ }).type('Nav');

        cy.findByRole('link', { name: 'Dato og tid' }).click();
        cy.findByRole('heading', { name: 'Dato og tid' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Dato/ }).type('01.01.2025');
        cy.findByRole('textbox', { name: /Klokkeslett/ }).type('01:01');
        cy.findByRole('textbox', { name: /Månedsvelger/ }).type('01.2025');
        cy.findByRole('textbox', { name: /År/ }).type('2025');

        cy.findByRole('link', { name: 'Gruppering' }).click();
        cy.findByRole('heading', { name: 'Gruppering' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Tekstfelt skjemagruppe 1 / }).type('Skjema 1');
        cy.findByRole('textbox', { name: /Tekstfelt skjemagruppe 2 / }).type('Skjema 2a');
        cy.findAllByRole('button', { name: 'Legg til' }).eq(0).click();
        cy.findAllByRole('textbox', { name: /Tekstfelt skjemagruppe 2 / })
          .eq(1)
          .type('Skjema 2b');
        cy.findByRole('textbox', { name: /Tekstfelt repeterende data/ }).type('Repeat 1');
        cy.findAllByRole('button', { name: 'Legg til' }).eq(1).click();
        cy.findAllByRole('button', { name: 'Legg til' }).eq(1).click();
        cy.findAllByRole('textbox', { name: /Tekstfelt repeterende data/ })
          .eq(1)
          .type('Repeat 2');
        cy.findAllByRole('textbox', { name: /Tekstfelt repeterende data/ })
          .eq(2)
          .type('Repeat 3');

        cy.findByRole('link', { name: 'Andre' }).click();
        cy.findByRole('heading', { name: 'Andre' }).shouldBeVisible();
        cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();
        cy.findByRole('group', { name: /Hvilken aktivitet søker du om støtte i forbindelse med?/ }).within(() => {
          cy.findByRole('radio', { name: 'Ingen relevant aktivitet registrert på meg' }).check();
        });

        cy.findByRole('link', { name: 'Vedlegg' }).click();
        cy.findByRole('heading', { name: 'Vedlegg' }).shouldBeVisible();
        cy.findByRole('group', { name: /Vedlegg/ }).within(() => {
          cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).check();
        });
        cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
          cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).check();
        });

        cy.fixture('pdf/request-components-all-digital.json').then((fixture) => {
          cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
            expect(getCleanedUpPdfFormData(req, date)).deep.eq(fixture);
          }).as('downloadPdf');
        });

        downloadPdf('digital');
      });
    });

    describe('Nologin', () => {
      beforeEach(() => {
        cy.visit('/fyllut/components');
        cy.defaultWaits();

        cy.findByRole('link', { name: 'Kan ikke logge inn' }).click();
        cy.findByRole('link', { name: 'Send digitalt uten å logge inn' }).click();
        cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

        cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
          cy.findByLabelText('Norsk pass').check(),
        );
        cy.get('input[type=file]').selectFile('cypress/fixtures/files/id-billy-bruker.jpg', { force: true });
        cy.clickNextStep();

        cy.clickShowAllSteps();
      });

      it('Pdf does not contain signature field when submission method is digitalnologin', () => {
        cy.clickStart();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });

        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');

        cy.clickNextStep();

        cy.fixture('pdf/request-components-identity-nologin.json').then((fixture) => {
          cy.intercept('POST', '/fyllut/api/send-inn/nologin-soknad', (req) => {
            // Check that timestamp is present in footer before removing it for comparison.
            expect(req.body.pdfFormData.bunntekst.upperMiddle).not.to.be.null;
            const actual = getCleanedUpPdfFormData(req);
            expect(actual, 'PDF form data should match fixture for nologin submission').deep.eq(fixture);
          }).as('downloadPdf');
        });

        downloadPdf('digitalnologin');
      });
    });
  });
});
