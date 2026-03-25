/*
 * Production form tests for Søknad om endret inntektsgrense
 * Form: nav120901
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Endring av inntektsgrense (endringAvInntektsgrense): chained conditionals
 *       harDuGradertUforetrygd → alertstripe1 (when nei) / erDuArbeidstaker (when ja)
 *       erDuArbeidstaker → alertstripe2 (when nei) / skyldesInntektsokningenOktStillingsandelEllerOktArbeidsinnsats (when ja)
 *       skyldesInntektsokningenOktStillingsandelEllerOktArbeidsinnsats → alertstripe3 (when ja) / arbeidsforhold datagrid (when nei)
 *   - Vedlegg (vedlegg): no conditional attachments, both always visible
 */

describe('nav120901', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Endring av inntektsgrense – conditional chain from harDuGradertUforetrygd', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120901/endringAvInntektsgrense?sub=paper');
      cy.defaultWaits();
    });

    it('shows alert and hides further questions when not on gradert uføretrygd', () => {
      cy.findByLabelText('Er du arbeidstaker?').should('not.exist');

      cy.withinComponent('Har du gradert uføretrygd?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByText('Det er bare personer med gradert uføretrygd som kan få økt inntektsgrensen.').should('exist');
      cy.findByLabelText('Er du arbeidstaker?').should('not.exist');
    });

    it('shows erDuArbeidstaker when har gradert uføretrygd', () => {
      cy.withinComponent('Har du gradert uføretrygd?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByText('Det er bare personer med gradert uføretrygd som kan få økt inntektsgrensen.').should('not.exist');
      cy.findByLabelText('Er du arbeidstaker?').should('exist');
    });

    it('shows alert and hides skyldes-question when not arbeidstaker', () => {
      cy.withinComponent('Har du gradert uføretrygd?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er du arbeidstaker?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByText('Det er bare arbeidstakere som kan få økt inntektsgrensen.').should('exist');
      cy.findByLabelText('Skyldes inntektsøkningen økt stillingsandel eller økt arbeidsinnsats?').should('not.exist');
    });

    it('shows skyldes-question when arbeidstaker and alertstripe3 when svar is ja', () => {
      cy.withinComponent('Har du gradert uføretrygd?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er du arbeidstaker?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Skyldes inntektsøkningen økt stillingsandel eller økt arbeidsinnsats?').should('exist');

      cy.withinComponent('Skyldes inntektsøkningen økt stillingsandel eller økt arbeidsinnsats?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByText(
        'Du kan bare få økt inntektsgrensen hvis inntektsøkningen ikke skyldes økt stillingsandel eller økt arbeidsinnsats.',
      ).should('exist');
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('not.exist');
    });

    it('shows arbeidsforhold datagrid when skyldes-question is nei', () => {
      cy.withinComponent('Har du gradert uføretrygd?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er du arbeidstaker?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Skyldes inntektsøkningen økt stillingsandel eller økt arbeidsinnsats?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('exist');
      cy.findByText(
        'Du kan bare få økt inntektsgrensen hvis inntektsøkningen ikke skyldes økt stillingsandel eller økt arbeidsinnsats.',
      ).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120901?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // Skip past root pre-panel screen
      cy.clickNextStep(); // Skip Veiledning (no required fields)
    });

    it('fills required fields and verifies summary', () => {
      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Endring av inntektsgrense – happy path: ja / ja / nei → datagrid
      cy.withinComponent('Har du gradert uføretrygd?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er du arbeidstaker?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Skyldes inntektsøkningen økt stillingsandel eller økt arbeidsinnsats?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Fill datagrid row 1 (income change details)
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).type('Testbedriften AS');
      cy.findByLabelText('Stillingsprosent').type('50');
      cy.findByRole('textbox', { name: 'Ny årlig brutto arbeidsinntekt etter inntektsendringen' }).type('500000');
      cy.findByRole('textbox', { name: /Fra hvilket tidspunkt endret arbeidsinntekten seg/ }).type('01.2025');
      cy.clickNextStep();

      // Vedlegg – dokumentasjonFraArbeidsgiver: ettersend; annenDokumentasjon: nei (no ettersender option)
      cy.findByRole('group', { name: /Dokumentasjon fra arbeidsgiver/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Endring av inntektsgrense', () => {
        cy.get('dt').eq(0).should('contain.text', 'Har du gradert uføretrygd?');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
