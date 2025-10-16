import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

const removeTimestampFromRequest = (request) => {
  return {
    ...request,
    pdfFormData: {
      ...request.pdfFormData,
      bunntekst: {
        ...request.pdfFormData.bunntekst,
        upperMiddle: null,
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

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Html content is as expected with digital submission', () => {
    it('bokmaal', () => {
      cy.mocksUseRouteVariant('post-familie-pdf:verify-nav111221b-nb');
      cy.mocksUseRouteVariant('get-activities:success');
      cy.submitMellomlagring((req) => {
        expect(req.body.attachments).to.have.length(0);
        expect(req.body.otherDocumentation).to.eq(true);
      });

      cy.visit('/fyllut/nav111221b?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('heading', { name: 'Veiledning' }).shouldBeVisible();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).shouldBeVisible();
      cy.clickSaveAndContinue();

      cy.findByRole('group', { name: 'Hvilken aktivitet søker du om støtte i forbindelse med?' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: /Arbeidstrening:.*/ })
            .should('exist')
            .click();
        });
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Reiseperiode' }).shouldBeVisible();
      cy.findByRole('textbox', { name: /Startdato.*/ })
        .should('exist')
        .type('02.01.2024');
      cy.findByRole('textbox', { name: /Sluttdato.*/ })
        .should('exist')
        .type('31.01.2024');
      cy.findByRole('textbox', { name: 'Hvor mange reisedager har du per uke?' }).should('exist').type('3');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Reiseavstand' }).shouldBeVisible();
      cy.findByRole('group', { name: 'Har du en reisevei på seks kilometer eller mer?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
        });
      cy.findByRole('textbox', { name: 'Hvor lang reisevei har du?' }).should('exist').type('12');
      cy.findByRole('textbox', { name: 'Gateadresse' }).should('exist').type('Veien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist').type('1234');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist').type('Plassen');

      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Transportbehov' }).shouldBeVisible();
      cy.findByRole('group', { name: 'Kan du reise kollektivt?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Hva er hovedårsaken til at du ikke kan reise kollektivt?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).should('exist').click();
        });
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      })
        .should('exist')
        .type('Ingen buss kjører her i nærheten');
      cy.findByRole('group', { name: 'Kan du benytte egen bil?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Kommer du til å ha utgifter til parkering på aktivitetsstedet?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).should('exist').click();
        });
      cy.findByLabelText('Hvor ofte ønsker du å sende inn kjøreliste?')
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: /.*gang i uken.*/ })
            .should('exist')
            .click();
        });

      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Tilleggsopplysninger' }).shouldBeVisible();
      cy.clickSaveAndContinue();

      // Submit
      cy.clickSaveAndContinue();
      // When failure, see mocks/routes/skjemabygging-proxy.js where the html content is verified (id='verify-nav111221b-nb')
      cy.wait('@submitMellomlagring');
      cy.verifySendInnRedirect();
    });

    it('nynorsk', () => {
      cy.mocksUseRouteVariant('post-familie-pdf:verify-nav111221b-nn');
      cy.mocksUseRouteVariant('get-activities:success');
      cy.submitMellomlagring((req) => {
        expect(req.body.attachments).to.have.length(0);
        expect(req.body.otherDocumentation).to.eq(true);
      });

      cy.visit('/fyllut/nav111221b?sub=digital&lang=nn-NO');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('heading', { name: 'Veiledning' }).shouldBeVisible();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Dine opplysningar' }).shouldBeVisible();
      cy.clickSaveAndContinue();

      cy.findByRole('group', { name: 'Hvilken aktivitet søker du om støtte i forbindelse med?' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: /Arbeidstrening:.*/ })
            .should('exist')
            .click();
        });
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Reiseperiode' }).shouldBeVisible();
      cy.findByRole('textbox', { name: /Startdato.*/ })
        .should('exist')
        .type('02.01.2024');
      cy.findByRole('textbox', { name: /Sluttdato.*/ })
        .should('exist')
        .type('31.01.2024');
      cy.findByRole('textbox', { name: 'Kor mange reisedagar har du per veke?' }).should('exist').type('3');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Reiseavstand' }).shouldBeVisible();
      cy.findByRole('group', { name: 'Har du ein reiseveg på seks kilometer eller meir?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
        });
      cy.findByRole('textbox', { name: 'Kor lang reiseveg har du?' }).should('exist').type('12');
      cy.findByRole('textbox', { name: 'Gateadresse' }).should('exist').type('Veien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist').type('1234');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist').type('Plassen');

      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Transportbehov' }).shouldBeVisible();
      cy.findByRole('group', { name: 'Kan du reisa kollektivt?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Kva er hovudårsaka til at du ikkje kan reisa kollektivt?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Dårleg transporttilbod' }).should('exist').click();
        });
      cy.findByRole('textbox', {
        name: 'Beskriv dei spesielle forholda ved reisevegen som gjer at du ikkje kan reisa kollektivt',
      })
        .should('exist')
        .type('Ingen buss køyrer her i nærleiken');
      cy.findByRole('group', { name: 'Kan du nytta eigen bil?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Kjem du til å ha utgifter til parkering på aktivitetsstaden?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).should('exist').click();
        });
      cy.findByLabelText('Kor ofte ønskjer du å senda inn køyreliste?')
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: /.*gong i veka.*/ })
            .should('exist')
            .click();
        });

      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Tilleggsopplysninger' }).shouldBeVisible();
      cy.clickSaveAndContinue();

      // Submit
      cy.clickSaveAndContinue();
      // When failure, see mocks/routes/skjemabygging-proxy.js where the html content is verified (id='verify-nav111221b-nn')
      cy.wait('@submitMellomlagring');
      cy.verifySendInnRedirect();
    });
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

      it('No values', () => {
        cy.fixture('pdf/request-components-empty.json').then((fixture) => {
          cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
            // Check that timestamp is present in footer before removing it for comparison.
            expect(req.body.pdfFormData.bunntekst.upperMiddle).not.to.be.null;
            expect(removeTimestampFromRequest(req.body)).deep.eq(fixture);
          }).as('downloadPdf');
        });

        downloadPdf();
      });
    });
  });
});
