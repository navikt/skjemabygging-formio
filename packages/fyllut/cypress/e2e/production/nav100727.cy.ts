/*
 * Production form tests for Søknad om tilskudd til rimelige hjelpemidler
 * Form: nav100727
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): 3 same-panel conditionals
 *       hvemFyllerUtSoknaden → skalInnbyggerenDuSoker... (fagperson only)
 *       + 3 cross-panel panel-level triggers: omDenSomFyllerUtSoknaden, begrunner, utbetaling
 *   - Dine opplysninger (personopplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Utbetaling (utbetaling): 1 customConditional (panel-level conditional)
 *       hvemSkalTilskuddetUtbetalesTil → recipient info fields (navSkjemagruppe2)
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuAndreTilleggsopplysninger → tilleggsopplysninger1 textarea
 *   - Vedlegg (vedlegg): 3 cross-panel conditionals from hvemFyllerUtSoknaden
 *       uttalelseFra..., fullmakt, kopiAvVerge...
 */

describe('nav100727', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Veiledning – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100727/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows signering question only when fagperson is selected', () => {
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
      cy.visit('/fyllut/nav100727/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows Om den som fyller ut søknaden panel for barn/verge, hides for selv', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('not.exist');

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg søker for barn under 18 år som jeg har omsorg for' }).click();
      });
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('exist');
    });

    it('shows Begrunner panel only for fagperson', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Begrunner' }).should('not.exist');

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en innbygger' }).click();
      });
      cy.findByRole('link', { name: 'Begrunner' }).should('exist');
    });

    it('shows Utbetaling panel for fagperson and verge, hides for selv', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg søker for en person som jeg er verge for' }).click();
      });
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100727/personopplysninger?sub=paper');
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

  describe('Utbetaling – payment recipient conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100727/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows recipient info fields when verge or foreldre receives payment', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg søker for en person som jeg er verge for' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utbetaling' }).click();

      // navSkjemagruppe2 is conditionally shown; assert via its first child field
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Hvem skal tilskuddet utbetales til?', () => {
        cy.findByRole('radio', { name: 'Verge' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');

      cy.withinComponent('Hvem skal tilskuddet utbetales til?', () => {
        cy.findByRole('radio', { name: 'Søkeren' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100727/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows tilleggsopplysninger textarea only when ja is selected', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Har du andre tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Har du andre tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Vedlegg – attachment conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100727/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows uttalelse attachment for selvfiller, hides for fagperson', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Uttalelse fra fagperson som bekrefter behovet/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av verge- eller hjelpevergeattest/ }).should('not.exist');
    });

    it('shows kopiAvVerge attachment and hides uttalelse for verge', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg søker for en person som jeg er verge for' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av verge- eller hjelpevergeattest/ }).should('exist');
    });

    it('shows fullmakt attachment when fagperson selects innbygger signerer fullmaktsskjema', () => {
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

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100727?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields for self-filler and verifies summary', () => {
      // Veiledning – self-filler path (omDenSomFyllerUtSoknaden, begrunner, utbetaling panels hidden)
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg fyller ut på vegne av meg selv' }).click();
      });
      cy.clickNextStep();

      // Dine opplysninger – fnr path (adresse hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Begrunnelse
      cy.findByRole('textbox', { name: /Beskriv funksjonsproblemene/ }).type('Trenger hjelpemiddel til daglig bruk.');
      cy.clickNextStep();

      // Tilleggsopplysninger – no extra info; don't click Next sequentially (isAttachmentPanel skips Vedlegg)
      cy.withinComponent('Har du andre tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg (isAttachmentPanel=true – use stepper to navigate there)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Uttalelse fra fagperson som bekrefter behovet/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/i }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Veiledning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvem fyller ut søknaden?');
        cy.get('dd').eq(0).should('contain.text', 'Jeg fyller ut på vegne av meg selv');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
