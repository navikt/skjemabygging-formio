import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';
import { DateTime } from 'luxon';

const cleanUpRequest = (request, today?: string) => {
  const data = JSON.parse(JSON.stringify(request));
  data.pdfFormData.verdiliste.forEach((panel) => {
    if (panel.label === 'Person' && today) {
      panel.verdiliste.forEach((component) => {
        if (component.verdi.match(/^\d{2}.\d{2}.\d{4}$/)) {
          component.verdi = today;
        }
      });
    }
  });

  return {
    ...data,
    form: null, // Remove form structure for comparison so we do not need to update every time the test form is changed.
    submission: null, // Remove submission data for comparison. We mainly care about pdfFormData in these tests.
    pdfFormData: {
      ...data.pdfFormData,
      bunntekst: {
        ...data.pdfFormData.bunntekst,
        upperMiddle: null, // Remove timestamp for comparison.
      },
    },
  };
};

const downloadPdf = () => {
  cy.findByRole('link', { name: 'Oppsummering' }).click();
  cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
  cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();
  cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).click();
  cy.wait('@downloadPdf');
};

describe('Pdf', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
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
        // Add Identity values, to not fail generate front page pdf.
        cy.findByRole('link', { name: 'Person' }).click();
        cy.findByRole('heading', { name: 'Person' }).shouldBeVisible();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });
        cy.findAllByRole('textbox', { name: /Fødselsnummer eller d-nummer/ })
          .eq(1)
          .type('20905995783');
        cy.findByRole('textbox', { name: /Fornavn/ }).type('Ola');
        cy.findByRole('textbox', { name: /Etternavn/ }).type('Nordmann');

        cy.fixture('pdf/request-components-identity.json').then((fixture) => {
          cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
            // Check that timestamp is present in footer before removing it for comparison.
            expect(req.body.pdfFormData.bunntekst.upperMiddle).not.to.be.null;
            expect(cleanUpRequest(req.body)).deep.eq(fixture);
          }).as('downloadPdf');
        });

        downloadPdf();
      });

      it('All values', () => {
        const today = DateTime.now().toFormat(dateUtils.inputFormat);
        cy.findByRole('link', { name: 'Standard felter' }).click();
        cy.findByRole('heading', { name: 'Standard felter' }).shouldBeVisible();
        cy.findByRole('textbox', { name: /Tekstfelt/ }).type('Nav 1');
        cy.findByRole('textbox', { name: /Tekstområde/ }).type('Nav 2');
        cy.findByRole('textbox', { name: /Tall/ }).type('1');
        cy.findByRole('checkbox', { name: /Avkryssingsboks/ }).check();
        cy.findByRole('group', { name: /Flervalg/ }).within(() => {
          cy.findByRole('checkbox', { name: 'Ja' }).check();
        });
        cy.findByRole('combobox', { name: /Nedtrekksmeny \(navSelect\)/ }).type('{downArrow}{enter}');
        cy.findByRole('group', { name: /Radiopanel/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });

        cy.findByRole('link', { name: 'Person' }).click();
        cy.findByRole('heading', { name: 'Person' }).shouldBeVisible();
        cy.findAllByRole('textbox', { name: /Fødselsnummer eller d-nummer/ })
          .eq(0)
          .type('20905995783');
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });
        cy.findAllByRole('textbox', { name: /Fødselsnummer eller d-nummer/ })
          .eq(1)
          .type('20905995783');
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
        cy.findByRole('textbox', { name: /Gyldig fra/ }).type(today);
        cy.findByRole('textbox', { name: /Gyldig til/ }).type(today);
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
            expect(cleanUpRequest(req.body, today)).deep.eq(fixture);
          }).as('downloadPdf');
        });

        downloadPdf();
      });
    });
  });
});
