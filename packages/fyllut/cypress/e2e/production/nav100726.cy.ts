/*
 * Production form tests for Søknad om tilskudd til apper og programvare
 * Form: nav100726
 * Submission types: PAPER
 *
 * Panel-level conditionals (driven by hvemFyllerUtSoknaden on Veiledning):
 *   - omDenSomFyllerUtSoknaden: visible for barn or verge only
 *   - begrunner:                visible for fagperson only
 *   - utbetaling:               visible for fagperson or verge only
 *
 * Field-level conditionals tested:
 *   - Veiledning: hvemFyllerUtSoknaden → skalInnbyggerenDuSokerFor... (same-panel)
 *   - Veiledning → Om den som fyller ut søknaden:
 *       hvemFyllerUtSoknaden → fodselsnummerDNummer1 (when barn)
 *       hvemFyllerUtSoknaden → forVerge address fields (when verge)
 *   - Veiledning → Utbetaling: hvemSkalTilskuddetUtbetalesTil → navSkjemagruppe
 *   - Veiledning → Vedlegg:
 *       hvemFyllerUtSoknaden → uttalelseFraFagperson attachment
 *       skalInnbyggerenDuSokerFor... → fullmakt attachment
 *   - Dine opplysninger: identitet.harDuFodselsnummer → adresse visibility
 *
 * Note: Vedlegg has isAttachmentPanel=true; sequential clickNextStep() skips it.
 * Summary uses self-filler path (omDenSomFyllerUtSoknaden, begrunner, utbetaling hidden).
 */

describe('nav100726', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Veiledning – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100726/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows skalInnbyggerenDuSokerFor question only for fagperson', () => {
      cy.findByLabelText('Skal innbyggeren du søker for signere søknaden eller legge ved fullmaktsskjema?').should(
        'not.exist',
      );

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en innbygger' }).click();
      });
      cy.findByLabelText('Skal innbyggeren du søker for signere søknaden eller legge ved fullmaktsskjema?').should(
        'exist',
      );

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });
      cy.findByLabelText('Skal innbyggeren du søker for signere søknaden eller legge ved fullmaktsskjema?').should(
        'not.exist',
      );
    });
  });

  describe('Veiledning – panel-level conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100726/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows begrunner and utbetaling panel links for fagperson', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Begrunner' }).should('not.exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en innbygger' }).click();
      });
      cy.findByRole('link', { name: 'Begrunner' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });
      cy.findByRole('link', { name: 'Begrunner' }).should('not.exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');
    });

    it('shows omDenSomFyllerUtSoknaden panel link for barn and verge', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('not.exist');

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg søker for barn under 18 år som jeg har omsorg for' }).click();
      });
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('exist');

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg søker for en person jeg er verge for' }).click();
      });
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('exist');
    });
  });

  describe('Veiledning → Om den som fyller ut søknaden – field conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100726/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows fodselsnummerDNummer1 field when barn under 18 is selected', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg søker for barn under 18 år som jeg har omsorg for' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).click();

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
    });

    it('shows forVerge address fields when verge is selected', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg søker for en person jeg er verge for' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).click();

      cy.findByRole('textbox', { name: 'Postdresse' }).should('exist');
    });
  });

  describe('Veiledning → Utbetaling – payment recipient conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100726/veiledning?sub=paper');
      cy.defaultWaits();
      // Utbetaling is only visible when fagperson or verge – navigate via stepper
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en innbygger' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utbetaling' }).click();
    });

    it('shows recipient fields for foreldre eller foresatte and hides them for søkeren', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Hvem skal tilskuddet utbetales til?', () => {
        cy.findByRole('radio', { name: 'Foreldre eller foresatte' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');

      cy.withinComponent('Hvem skal tilskuddet utbetales til?', () => {
        cy.findByRole('radio', { name: 'Søkeren' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });

    it('shows recipient fields for verge', () => {
      cy.withinComponent('Hvem skal tilskuddet utbetales til?', () => {
        cy.findByRole('radio', { name: 'Verge' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
    });
  });

  describe('Veiledning → Vedlegg – attachment conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100726/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows uttalelseFra attachment for self-filler but hides it for fagperson', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Uttalelse fra fagperson som bekrefter behovet/ }).should('exist');

      // Stepper stays expanded – navigate back to Veiledning without calling clickShowAllSteps again
      cy.findByRole('link', { name: 'Veiledning' }).click();
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en innbygger' }).click();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Uttalelse fra fagperson som bekrefter behovet/ }).should('not.exist');
    });

    it('shows fullmakt attachment when innbygger skal signere fullmaktsskjema', () => {
      cy.findByRole('group', { name: /Fullmakt i forbindelse med søknad/ }).should('not.exist');

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en innbygger' }).click();
      });
      cy.withinComponent('Skal innbyggeren du søker for signere søknaden eller legge ved fullmaktsskjema?', () => {
        cy.findByRole('radio', { name: 'Innbygger skal signere fullmaktsskjema' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fullmakt i forbindelse med søknad/ }).should('exist');
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100726/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('keeps adresse section hidden when user has fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100726?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // cover page → Veiledning
    });

    it('fills required fields (self-filler path) and verifies summary', () => {
      // Veiledning – self-filler path hides omDenSomFyllerUtSoknaden, begrunner, utbetaling panels
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });
      cy.clickNextStep(); // → Dine opplysninger

      // Dine opplysninger – fnr path (hides adresse/adresseVarighet)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep(); // → Opplysninger om appen eller programvaren

      // Opplysninger om appen
      cy.findByRole('textbox', { name: 'Hvilken applikasjon eller programvare trenger du?' }).type('Skjermleser');
      cy.clickNextStep(); // → Begrunnelse

      // Begrunnelse – do not click Next; use stepper to reach Vedlegg (isAttachmentPanel=true)
      cy.findByRole('textbox', {
        name: 'Beskriv funksjonsproblemene og forklar hvorfor du trenger appen eller programvaren',
      }).type('Trenger hjelp til å bruke PC.');

      // Vedlegg – isAttachmentPanel=true; use stepper to fill, then clickNextStep from Vedlegg
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Uttalelse fra fagperson som bekrefter behovet/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Opplysninger om appen eller programvaren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilken applikasjon eller programvare trenger du?');
        cy.get('dd').eq(0).should('contain.text', 'Skjermleser');
      });
    });
  });
});
