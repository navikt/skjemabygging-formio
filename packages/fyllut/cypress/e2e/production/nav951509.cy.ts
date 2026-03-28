/*
 * Production form tests for Samtykke til arbeidsrettet oppfølging for barn under 18 år
 * Form: nav951509
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 5 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummer (ja)
 *       harDuNorskFodselsnummerEllerDNummer → fodselsdatoDdMmAaaa, borDuINorge (nei)
 *       borDuINorge → erKontaktadressenEnVegadresseEllerPostboksadresse (ja)
 *       erKontaktadressenEnVegadresseEllerPostboksadresse → adresse (vegadresse), adresse1 (postboksadresse)
 *       borDuINorge → adresse2 (nei)
 *   - Samtykker (samtykker): 1 customConditional
 *       instance.isSubmissionDigital() → alertstripe3
 *
 * introPage.enabled === true — cy.clickIntroPageConfirmation() is required on the root URL.
 */

describe('nav951509', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity and address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav951509/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles between Norwegian fnr input and foreign identity fields', () => {
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('shows Norwegian address variants for vegadresse and postboksadresse', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
    });

    it('shows foreign address fields when not living in Norway', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Postnummer/ }).should('not.exist');
      cy.findByRole('textbox', { name: /By \/ stedsnavn/ }).should('not.exist');
      cy.findByRole('combobox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('exist');
      cy.findByRole('textbox', { name: /Postnummer/ }).should('exist');
      cy.findByRole('textbox', { name: /By \/ stedsnavn/ }).should('exist');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
    });
  });

  describe('Samtykker – paper submission conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav951509/samtykker?sub=paper');
      cy.defaultWaits();
    });

    it('hides the digital-only alert in paper mode', () => {
      cy.contains('Du kan se samtykket på nav.no i en periode').should('not.exist');
    });
  });

  describe('Samtykker – digital submission conditional', () => {
    beforeEach(() => {
      cy.defaultInterceptsMellomlagring();
      cy.visit('/fyllut/nav951509/samtykker?sub=digital');
      cy.defaultWaits();
    });

    it('shows the digital-only alert in digital mode', () => {
      cy.contains('Du kan se samtykket på nav.no i en periode').should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav951509?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Dine opplysninger – Norwegian fnr path keeps address questions hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
      cy.clickNextStep();

      // Om barnet
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/i }).type('17912099997');
      cy.clickNextStep();

      // Samtykker
      cy.findByRole('group', { name: /Hva ønsker du å gi samtykke til/ }).within(() => {
        cy.findByRole('checkbox', { name: /Barnet kan delta i arbeidsrettet tiltak/ }).check();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });

      cy.withinSummaryGroup('Om barnet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Barnets fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });

      cy.withinSummaryGroup('Samtykker', () => {
        cy.contains('dd', 'Barnet kan delta i arbeidsrettet tiltak').should('exist');
      });
    });
  });
});
