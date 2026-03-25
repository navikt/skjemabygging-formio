/*
 * Production form tests for Søknad om tilgang til Aa-registeret for bostyrere
 * Form: nav250118
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om virksomheten som er konkurs (opplysningerOmVirksomheten): 2 conditionals
 *       jegOnskerHellerAOppgiFodselsnummerEllerDNumer (checkbox) → hides virksomhetensOrganisasjonsnummer, shows fodselsnummerDNummer
 *       hvilketFormalTrengerDuOpplysningeneTil → shows oppgiFormalene (when andreFormål)
 *   - Opplysninger om bostyrer (opplysningerOmBostyrer): 1 conditional
 *       harAdvokatfirmaetFlereUnderenheter → shows organisasjonsnummerForUnderenhet (when ja)
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, last panel — navigate via stepper + 1×clickNextStep
 *
 * introPage.enabled === true — cy.clickIntroPageConfirmation() used in summary beforeEach only.
 */

describe('nav250118', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Opplysninger om virksomheten som er konkurs – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav250118/opplysningerOmVirksomheten?sub=paper');
      cy.defaultWaits();
    });

    it('toggles organisasjonsnummer / fødselsnummer fields via checkbox', () => {
      cy.findByRole('textbox', { name: 'Virksomhetens organisasjonsnummer' }).should('exist');
      cy.findByRole('textbox', { name: /[Ff]ødselsnummer/ }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg ønsker heller/ }).check();

      cy.findByRole('textbox', { name: 'Virksomhetens organisasjonsnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: /[Ff]ødselsnummer/ }).should('exist');

      cy.findByRole('checkbox', { name: /Jeg ønsker heller/ }).uncheck();

      cy.findByRole('textbox', { name: 'Virksomhetens organisasjonsnummer' }).should('exist');
      cy.findByRole('textbox', { name: /[Ff]ødselsnummer/ }).should('not.exist');
    });

    it('shows oppgiFormalene textarea when Andre formål is selected', () => {
      cy.findByRole('textbox', { name: /Oppgi formål/ }).should('not.exist');

      cy.withinComponent('Hvilket formål trenger du opplysningene til?', () => {
        cy.findByRole('radio', { name: 'Andre formål' }).click();
      });

      cy.findByRole('textbox', { name: /Oppgi formål/ }).should('exist');

      cy.withinComponent('Hvilket formål trenger du opplysningene til?', () => {
        cy.findByRole('radio', { name: 'Lønnsgaranti' }).click();
      });

      cy.findByRole('textbox', { name: /Oppgi formål/ }).should('not.exist');
    });
  });

  describe('Opplysninger om bostyrer – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav250118/opplysningerOmBostyrer?sub=paper');
      cy.defaultWaits();
    });

    it('shows underenhet organisasjonsnummer when advokatfirmaet har flere underenheter', () => {
      cy.findByRole('textbox', { name: 'Advokatfirmaets organisasjonsnummer for underenhet' }).should('not.exist');

      cy.withinComponent('Har advokatfirmaet flere underenheter?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Advokatfirmaets organisasjonsnummer for underenhet' }).should('exist');

      cy.withinComponent('Har advokatfirmaet flere underenheter?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Advokatfirmaets organisasjonsnummer for underenhet' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav250118?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Panel 1: Opplysninger om virksomheten som er konkurs
      cy.findByRole('textbox', { name: 'Virksomhetens navn' }).type('Test Konkurs AS');
      cy.findByRole('textbox', { name: 'Virksomhetens organisasjonsnummer' }).type('123456785');
      cy.findByRole('textbox', { name: /Konkursåpning.*\(dd\.mm\.åååå\)/ }).type('01.01.2024');
      cy.findByRole('textbox', { name: /Periode fra.*\(dd\.mm\.åååå\)/ }).type('01.01.2024');
      cy.findByRole('textbox', { name: /Periode til.*\(dd\.mm\.åååå\)/ }).type('31.12.2024');
      cy.withinComponent('Hvilket formål trenger du opplysningene til?', () => {
        cy.findByRole('radio', { name: 'Lønnsgaranti' }).click();
      });
      cy.clickNextStep();

      // Panel 2: Opplysninger om bostyrer
      cy.findByRole('textbox', { name: 'Bostyrers fornavn / etternavn' }).type('Ola Nordmann');
      cy.findByRole('textbox', { name: 'Advokatfirmaets navn' }).type('Test Advokatfirma AS');
      cy.findByRole('textbox', { name: 'Advokatfirmaets organisasjonsnummer' }).type('974760673');
      cy.withinComponent('Har advokatfirmaet flere underenheter?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Telefonnummer').type('12345678');

      // Vedlegg — isAttachmentPanel=true (last panel); navigate via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // Vedlegg is the last panel — ONE clickNextStep reaches Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Opplysninger om virksomheten som er konkurs', () => {
        cy.get('dt').eq(0).should('contain.text', 'Virksomhetens navn');
        cy.get('dd').eq(0).should('contain.text', 'Test Konkurs AS');
      });

      cy.withinSummaryGroup('Opplysninger om bostyrer', () => {
        cy.get('dt').eq(1).should('contain.text', 'Advokatfirmaets navn');
        cy.get('dd').eq(1).should('contain.text', 'Test Advokatfirma AS');
      });
    });
  });
});
