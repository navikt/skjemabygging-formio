/*
 * Production form tests for Søknad om dekning av utgifter til irislinser
 * Form: nav100715
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Søknad (soknad): 3 same-panel conditionals
 *       hvaGjelderSoknaden → arsakTilBehovForEnAnnenTypeIrislinse
 *       erDetBruktEkstraTidVedTilpasning1 → container (begrunnelse, antallTimer, totalSumEksMva)
 *       + 1 cross-panel trigger to Vedlegg (bekreftelseFraOyespesialist)
 *   - Søkers opplysninger (sokersOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse
 *       adresse.borDuINorge → adresseVarighet
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from hvaGjelderSoknaden
 *       bekreftelseFraOyespesialist (shown only for forstegangssoknad)
 *
 * Note: Vedlegg has isAttachmentPanel=true; sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper to navigate there, then one clickNextStep() to reach Oppsummering.
 */

describe('nav100715', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Søknad – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100715/soknad?sub=paper');
      cy.defaultWaits();
    });

    it('shows årsak for annen type irislinse only when selected', () => {
      cy.findByLabelText('Årsak til behov for en annen type irislinse').should('not.exist');

      cy.withinComponent('Hva gjelder søknaden?', () => {
        cy.findByRole('radio', {
          name: 'Behov for en annen type irislinse enn det tidligere er gitt stønad til',
        }).click();
      });
      cy.findByLabelText('Årsak til behov for en annen type irislinse').should('exist');

      cy.withinComponent('Hva gjelder søknaden?', () => {
        cy.findByRole('radio', { name: 'Førstegangssøknad' }).click();
      });
      cy.findByLabelText('Årsak til behov for en annen type irislinse').should('not.exist');
    });

    it('shows tilpasning fields when ekstra tid er Ja', () => {
      cy.findByLabelText('Begrunnelse for dekning av utgifter til tilpasning').should('not.exist');

      cy.withinComponent('Er det brukt ekstra tid ved tilpasning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Begrunnelse for dekning av utgifter til tilpasning').should('exist');
      cy.findByLabelText('Antall timer').should('exist');

      cy.withinComponent('Er det brukt ekstra tid ved tilpasning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Begrunnelse for dekning av utgifter til tilpasning').should('not.exist');
    });
  });

  describe('Søkers opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100715/sokersOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor søkeren i Norge?').should('not.exist');

      cy.withinComponent('Har søkeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor søkeren i Norge?').should('exist');
    });

    it('keeps adresse hidden when user has fnr', () => {
      cy.withinComponent('Har søkeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor søkeren i Norge?').should('not.exist');
    });

    it('shows adresseVarighet when bor ikke i Norge', () => {
      cy.withinComponent('Har søkeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor søkeren i Norge?').should('exist');
      cy.withinComponent('Bor søkeren i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');
    });
  });

  describe('Vedlegg – cross-panel conditional from hvaGjelderSoknaden', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100715/soknad?sub=paper');
      cy.defaultWaits();
    });

    it('shows dokumentasjon fra øyelege for førstegangssøknad', () => {
      cy.withinComponent('Hva gjelder søknaden?', () => {
        cy.findByRole('radio', { name: 'Førstegangssøknad' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon fra øyelege/ }).should('exist');
    });

    it('hides dokumentasjon fra øyelege for annen søknadstype', () => {
      cy.withinComponent('Hva gjelder søknaden?', () => {
        cy.findByRole('radio', { name: /Søker har betalt for irislinsene selv/ }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon fra øyelege/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100715?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, advance
      cy.clickNextStep();

      // Søkers opplysninger – fnr path (adresse hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Har søkeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Søknad – forstegangssoknad path, no ekstra tid
      cy.withinComponent('Hva gjelder søknaden?', () => {
        cy.findByRole('radio', { name: 'Førstegangssøknad' }).click();
      });
      cy.findByRole('textbox', { name: 'Diagnose' }).type('Aniridia');
      cy.findByLabelText('Beskriv deformiteten eller skaden på øyet/øynene').type('Medfødt manglende regnbuhinne.');
      cy.withinComponent('Er det brukt ekstra tid ved tilpasning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Begrunner av søknaden – fill required fields (no clickNextStep; vedlegg is isAttachmentPanel)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Optiker');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).type('Optikerkjeden AS');
      cy.findByLabelText('Telefonnummer').type('98765432');
      cy.findByRole('textbox', { name: 'E-postadresse' }).type('test@example.com');

      // Vedlegg – isAttachmentPanel=true; use stepper to navigate there
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // bekreftelseFraOyespesialist shown for forstegangssoknad
      cy.findByRole('group', { name: /Dokumentasjon fra øyelege/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Pristilbud fra optiker/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });

      // One clickNextStep from vedlegg (last panel) → Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søkers opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknad', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva gjelder søknaden?');
        cy.get('dd').eq(0).should('contain.text', 'Førstegangssøknad');
      });
    });
  });
});
