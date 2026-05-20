import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

const parseSubmission = (requestBody: { submission: unknown }) =>
  typeof requestBody.submission === 'string' ? JSON.parse(requestBody.submission) : requestBody.submission;

const expectPdfRequestContract = (
  request: { body: { form?: unknown; submission: unknown; pdfFormData?: unknown; submissionMethod?: unknown } },
  submissionMethod?: string,
  dataLength?: number,
) => {
  const submission = parseSubmission(request.body);

  expect(request.body.form).to.exist;
  expect(submission).to.exist;
  expect(request.body.pdfFormData).to.be.undefined;

  if (submissionMethod) {
    expect(request.body.submissionMethod).to.eq(submissionMethod);
  }

  if (dataLength !== undefined) {
    expect(Object.keys(submission.data ?? {})).to.have.length(dataLength);
  }
};

const downloadPdf = (submissionType: 'digital' | 'paper' | 'digitalnologin' = 'paper') => {
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
        expectPdfRequestContract(req, 'digital', 4);
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
        expectPdfRequestContract(req, 'digital', 1);
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
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

      cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
        expectPdfRequestContract(req, 'paper', 3);
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
        cy.clickIntroPageConfirmation();
        cy.clickStart();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
        cy.clickNextStep();

        cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
          expectPdfRequestContract(req, 'paper');
        }).as('downloadPdf');

        downloadPdf();
      });

      it('All values', () => {
        cy.mocksUseRouteVariant('post-familie-pdf:success-tc03');
        const date = '20.10.2025';

        cy.clickIntroPageConfirmation();
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

        cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application').as('downloadPdf');

        downloadPdf();
        cy.findByText(/Nedlastingen er ferdig/).shouldBeVisible();
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
        cy.clickIntroPageConfirmation();
        cy.clickStart();

        cy.findByRole('link', { name: 'Andre' }).click();
        cy.findByRole('heading', { name: 'Andre' }).shouldBeVisible();
        // Not possible to set this as not required.
        cy.findByRole('group', { name: /Hvilken aktivitet søker du om støtte i forbindelse med?/ }).within(() => {
          cy.findByRole('radio', { name: 'Ingen relevant aktivitet registrert på meg' }).check();
        });

        cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
          expectPdfRequestContract(req, 'digital');
        }).as('downloadPdf');

        downloadPdf('digital');
      });

      it('All values', () => {
        const date = '20.10.2025';

        cy.clickIntroPageConfirmation();
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

        cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
          expectPdfRequestContract(req, 'digital');
        }).as('downloadPdf');

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
        cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
        cy.clickNextStep();

        cy.clickShowAllSteps();
      });

      it('Pdf does not contain signature field when submission method is digitalnologin', () => {
        cy.clickIntroPageConfirmation();
        cy.clickStart();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });

        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');

        cy.clickNextStep();

        cy.intercept('POST', '/fyllut/api/send-inn/nologin-application', (req) => {
          expectPdfRequestContract(req, 'digitalnologin');
        }).as('downloadPdf');

        downloadPdf('digitalnologin');
      });
    });
  });

  describe('Verify signatures', () => {
    describe('Default signature', () => {
      it('Check the default empty signature', () => {
        cy.intercept('GET', 'fyllut/api/forms/stpaper*', (req) => {
          req.continue((res) => {
            if (res.body) {
              expect(res.body.properties?.signatures[0]).to.be.not.undefined;
              expect(res.body.properties?.signatures[0].key).equal('e037eeae-cf54-4ece-94df-b9bc963396f1');
              expect(res.body.properties?.signatures[0].label).equal('');
              expect(res.body.properties?.signatures[0].description).equal('');
              expect(res.body.properties?.signatures[1]).to.be.undefined;
            }
          });
        }).as('getFormDefaultSignature');

        cy.visit('/fyllut/stpaperdigital?sub=paper');

        cy.wait('@getConfig');
        cy.wait('@getFormDefaultSignature');
        cy.wait('@getTranslations');

        cy.clickShowAllSteps();
        cy.clickStart();

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickNextStep();

        cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
        cy.clickNextStep();

        cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
          expectPdfRequestContract(req, 'paper');
        }).as('downloadPdf');

        downloadPdf();
      });

      it('Check the old default signature (undefined)', () => {
        cy.intercept('GET', 'fyllut/api/forms/stpaper*', (req) => {
          req.continue((res) => {
            if (res.body) {
              expect(res.body.properties?.signatures).to.be.undefined;
            }
          });
        }).as('getFormOldSignature');

        cy.visit('/fyllut/stpaper?sub=paper');

        cy.wait('@getConfig');
        cy.wait('@getFormOldSignature');
        cy.wait('@getTranslations');

        cy.clickShowAllSteps();
        cy.clickStart();

        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('asdf');
        cy.clickNextStep();

        cy.findByRole('group', { name: /Nav skjema test/ }).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.ettersender }).check();
        });
        cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.nei }).check();
        });
        cy.clickNextStep();

        cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
          expectPdfRequestContract(req, 'paper');
        }).as('downloadPdf');

        downloadPdf();
      });
    });

    describe('Multiple signatures', () => {
      it('Check for two signatures', () => {
        cy.visit('/fyllut/components?sub=paper');
        cy.defaultWaits();
        cy.clickShowAllSteps();

        cy.clickIntroPageConfirmation();
        cy.clickStart();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
        cy.clickNextStep();

        cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
          expectPdfRequestContract(req, 'paper');
        }).as('downloadPdf');

        downloadPdf();
      });

      it('Check for two signatures, english', () => {
        cy.visit('/fyllut/components?sub=paper&lang=en');
        cy.defaultWaits();
        cy.clickShowAllSteps();

        cy.findByRoleWhenAttached('checkbox', { name: /I confirm that I will answer as accurately as I can/ }).click();
        cy.clickNextStep();
        cy.findByRole('group', { name: /Do you have a Norwegian national identification number or d number?/ }).within(
          () => {
            cy.findByRole('radio', { name: 'Yes' }).check();
          },
        );
        cy.findByRole('textbox', { name: /Norwegian national identification number or D number/ }).type('20905995783');
        cy.clickNextStep();

        cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
          expectPdfRequestContract(req, 'paper');
        }).as('downloadPdf');

        downloadPdf();
      });
    });
  });

  describe('Verify attachments', () => {
    describe('paper submission', () => {
      it('Check for attachment with comment', () => {
        cy.visit('/fyllut/components?sub=paper');
        cy.defaultWaits();
        cy.clickShowAllSteps();

        cy.clickIntroPageConfirmation();
        cy.clickStart();
        cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
          cy.findByRole('radio', { name: 'Ja' }).check();
        });
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
        cy.clickNextStep();

        cy.findByRole('link', { name: /Vedlegg/ }).click();
        cy.findByRole('heading', { name: /Vedlegg/ }).shouldBeVisible();

        cy.findByRole('group', { name: /Vedlegg/ }).within(() => {
          cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).check();
        });
        cy.findByRole('textbox', { name: /Mer info/ }).type('Dette er en kommentar til vedlegget.');

        cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
          cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).check();
        });

        cy.clickNextStep();

        cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
          expectPdfRequestContract(req, 'paper');
        }).as('downloadPdf');

        downloadPdf();
      });
    });
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
        'En del tekst\n\nsom viser utgifter\\\\text{ kr}\nnextline\tog en tab til slutt\nsom skal bli erstattet med to mellomrom.\u000bDette er vertical tab unicode som skal erstattes med newline,og denne skal også bli newline.',
        {
          parseSpecialCharSequences: false,
        },
      );

      cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application').as('downloadPdf');
      downloadPdf();
      cy.findByText(/Nedlastingen er ferdig/).shouldBeVisible();
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

      it('shows error message when cover page generation fails', () => {
        cy.mocksUseRouteVariant('foersteside:failure');
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
