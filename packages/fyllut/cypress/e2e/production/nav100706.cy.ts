/*
 * Production form tests for Søknad om tolk til døve, døvblinde og hørselshemmede
 * Form: nav100706
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 2 same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       jegHarIkkeTelefonnummer → telefonnummerSoker / hvordanOnskerDuAtNavSkalKontakteDeg
 *   - Bekreftelse fra spesialist (page6): 2 same-panel conditionals
 *       harDuTidligereGittNavDokumentasjonSomBekrefterAtDuHarNedsattHorsel → navSkjemagruppe2
 *       harDuTidligereGittNavDokumentasjonSomBekrefterAtDuHarNedsattSyn → navSkjemagruppe (syn specialist)
 *       + 1 cross-panel trigger from Erklæring om behov
 *       hvorforTrengerDuTolk=jegHarKombinertSynsOgHorseltapDovblindhet → harDuTidligereGittNavDokumentasjonSomBekrefterAtDuHarNedsattSyn
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 2 cross-panel conditionals from Tolkebehov
 *       soknadenGjelder1=tolkTilHoyereUtdanning → bekreftelsePaStudieplass
 *       soknadenGjelder1=tolkTilArbeid → dokumentasjonPaArbeidsforhold
 */

describe('nav100706', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    it('shows adresse section when harDuFodselsnummer is nei', () => {
      cy.visit('/fyllut/nav100706/personopplysninger?sub=paper');
      cy.defaultWaits();

      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('keeps adresse hidden when harDuFodselsnummer is ja', () => {
      cy.visit('/fyllut/nav100706/personopplysninger?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('toggles telefonnummer and kontakt fields when jegHarIkkeTelefonnummer is checked', () => {
      cy.visit('/fyllut/nav100706/personopplysninger?sub=paper');
      cy.defaultWaits();

      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('textbox', { name: 'Hvordan ønsker du at NAV skal kontakte deg?' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).check();

      cy.findByLabelText('Telefonnummer').should('not.exist');
      cy.findByRole('textbox', { name: 'Hvordan ønsker du at NAV skal kontakte deg?' }).should('exist');
    });
  });

  describe('Bekreftelse fra spesialist – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100706/page6?sub=paper');
      cy.defaultWaits();
    });

    it('shows specialist info form when hearing documentation is nei', () => {
      cy.findByRole('textbox', { name: 'Oppgi hvor den som gav uttalelsen jobber' }).should('not.exist');

      cy.withinComponent('Har du tidligere gitt NAV dokumentasjon som bekrefter at du har nedsatt hørsel?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Oppgi hvor den som gav uttalelsen jobber' }).should('exist');
    });

    it('hides specialist info form when hearing documentation is ja', () => {
      cy.withinComponent('Har du tidligere gitt NAV dokumentasjon som bekrefter at du har nedsatt hørsel?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Oppgi hvor den som gav uttalelsen jobber' }).should('not.exist');
    });
  });

  describe('Bekreftelse fra spesialist – cross-panel conditional from Erklæring om behov', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100706/page3?sub=paper');
      cy.defaultWaits();
    });

    it('shows vision documentation question for dovblindt users', () => {
      cy.withinComponent('Hvorfor trenger du tolk?', () => {
        cy.findByRole('radio', { name: 'Jeg har kombinert syns- og hørseltap (døvblindhet)' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Bekreftelse fra spesialist' }).click();

      cy.findByLabelText('Har du tidligere gitt NAV dokumentasjon som bekrefter at du har nedsatt syn?').should(
        'exist',
      );
    });

    it('hides vision documentation question for deaf-only users', () => {
      cy.withinComponent('Hvorfor trenger du tolk?', () => {
        cy.findByRole('radio', { name: 'Jeg er døv' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Bekreftelse fra spesialist' }).click();

      cy.findByLabelText('Har du tidligere gitt NAV dokumentasjon som bekrefter at du har nedsatt syn?').should(
        'not.exist',
      );
    });
  });

  describe('Vedlegg – cross-panel conditionals from Tolkebehov', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100706/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows studieplass attachment when tolkTilHoyereUtdanning is selected', () => {
      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('checkbox', { name: 'Tolk til høyere utdanning' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Bekreftelse på studieplass/ }).should('exist');
    });

    it('shows arbeidsforhold attachment when tolkTilArbeid is selected', () => {
      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('checkbox', { name: 'Tolk til arbeid' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon på arbeidsforhold/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100706?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger – fnr path (adresse/adresseVarighet hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('E-post').type('test@example.com');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Morsmål' }).type('Norsk');
      cy.clickNextStep();

      // Erklæring om behov – check declaration, select deaf (not dovblindt) to avoid syn fields
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg trenger tolk/ }).check();
      cy.withinComponent('Hvorfor trenger du tolk?', () => {
        cy.findByRole('radio', { name: 'Jeg er døv' }).click();
      });
      cy.clickNextStep();

      // Tolkebehov – use dagligeGjoremal to avoid conditional attachments in vedlegg
      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('checkbox', { name: 'Tolk til daglige gjøremål' }).check();
      });
      cy.withinComponent(/Ønsket tolkemetode/, () => {
        cy.findByRole('checkbox', { name: 'Tegnspråktolk' }).check();
      });
      cy.findByRole('textbox', { name: 'Beskriv behovet' }).type('Trenger tolk til hverdagslige samtaler.');
      cy.clickNextStep();

      // Bekreftelse fra spesialist – choose Ja to avoid required specialist sub-fields
      cy.withinComponent('Har du tidligere gitt NAV dokumentasjon som bekrefter at du har nedsatt hørsel?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      // Vedlegg is isAttachmentPanel=true (last panel) – use stepper to navigate there
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Only annenDokumentasjon visible (no conditional attachments triggered)
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // One clickNextStep from Vedlegg (last panel) → Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Tolkebehov', () => {
        cy.get('dt').eq(0).should('contain.text', 'Søknaden gjelder');
        cy.get('dd').eq(0).should('contain.text', 'Tolk til daglige gjøremål');
      });
    });
  });
});
