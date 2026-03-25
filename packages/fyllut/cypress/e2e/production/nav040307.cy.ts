/*
 * Production form tests for Egenerklæring - overdragelse av lønnskrav
 * Form: nav040307
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 3 customConditionals
 *       identitet.harDuFodselsnummer → adresse (show when "nei"), alertstripe (show when "ja")
 *       adresse.borDuINorge → adresseVarighet
 *   - Konkursåpningen (konkursapningen): 1 simple conditional
 *       skalDuAvvikleFerie → ferieperioder datagrid (show when "ja")
 */

describe('nav040307', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040307/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse section and shows alertstripe when user has fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByText(/Nav sender svar på søknad/).should('exist');
    });
  });

  describe('Konkursåpningen – ferieperioder conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040307/konkursapningen?sub=paper');
      cy.defaultWaits();
    });

    it('shows ferieperioder datagrid when skalDuAvvikleFerie is ja', () => {
      cy.findByRole('textbox', { name: /ferie fra og med/i }).should('not.exist');

      cy.withinComponent('Skal du avvikle ferie?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /ferie fra og med/i }).should('exist');
    });

    it('hides ferieperioder datagrid when skalDuAvvikleFerie is nei', () => {
      cy.withinComponent('Skal du avvikle ferie?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /ferie fra og med/i }).should('exist');

      cy.withinComponent('Skal du avvikle ferie?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /ferie fra og med/i }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040307?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // landing page → Veiledning (first panel)
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, just navigate forward
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse/adresseVarighet not required)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Konkursåpningen – fill required fields; choose nei for ferie (no datagrid needed)
      cy.findByRole('textbox', { name: 'Arbeidsgivers eller bedriftens navn' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Bostyrers navn' }).type('Bobestyrer Testesen');
      cy.withinComponent('Er lønnskravet ditt berettiget til dekning over lønnsgarantiordningen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(
        'Har du søkt eller skal du søke om dekning fra lønnsgarantiordningen for lønnskravet ditt for perioden etter konkursåpningstidspunktet?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent(
        'Samtykker du i at NAV kan trekke fra utbetalte ordinære dagpenger for perioden etter konkursåpning dersom det er midler i boet til å dekke lønnskrav for denne perioden helt eller delvis (dividende)?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent(
        'Har du fått utbetalt lønn for dager etter datoen arbeidsgiveren din gikk konkurs eller ble tvangsavviklet?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Skal du avvikle ferie?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Samtykke og erklæring – check all three required checkboxes
      cy.findAllByRole('checkbox').each(($cb) => {
        ($cb[0] as HTMLInputElement).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Konkursåpningen', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgivers eller bedriftens navn');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
    });
  });
});
