/*
 * Production form tests for Bestilling av tekniske hjelpemidler
 * Form: nav100705
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om innbygger (opplysningerOmInnbygger): 2 customConditionals
 *       identitet.harDuFodselsnummer === 'nei' → adresse (navAddress shown)
 *       adresse.borDuINorge === 'ja' + vegadresseEllerPostboksadresse → adresseVarighet (shown)
 *   - Bestiller (bestiller): 2 same-panel conditionals
 *       erBestillersVegadresseEllerPostboksadresse1 = 'vegadresse' → norskVegadresse2 (Kontaktadresse)
 *       erBestillersVegadresseEllerPostboksadresse1 = 'postboksadresse' → norskPostboksadresse2
 *   - Utlevering (utlevering): 1 same-panel conditional
 *       skalHjelpemiddeletUtleveresTilBrukerensFolkeregistrerteAdresse = 'nei' → navSkjemagruppe (Leveringsadresse)
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from Veiledning
 *       leggerDuVedEnSignertFullmakt = 'ja' → fullmakt attachment shown
 *
 * Note: Vedlegg has isAttachmentPanel=true (last panel, Case A):
 *       navigate via cy.clickShowAllSteps() + stepper link, then ONE cy.clickNextStep() to Oppsummering.
 */

describe('nav100705', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Opplysninger om innbygger – address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100705/opplysningerOmInnbygger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when innbygger has no fnr', () => {
      cy.findByLabelText('Bor innbygger i Norge?').should('not.exist');

      cy.withinComponent('Har innbygger norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor innbygger i Norge?').should('exist');

      cy.withinComponent('Har innbygger norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor innbygger i Norge?').should('not.exist');
    });

    it('shows adresseVarighet when Norwegian address type is selected', () => {
      cy.withinComponent('Har innbygger norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      cy.withinComponent('Bor innbygger i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });
  });

  describe('Bestiller – address type conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100705/bestiller?sub=paper');
      cy.defaultWaits();
    });

    it('shows vegadresse fields when vegadresse is selected', () => {
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.withinComponent('Er bestillers kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er bestillers kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });

    it('shows postboks fields when postboksadresse is selected', () => {
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er bestillers kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.withinComponent('Er bestillers kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');
    });
  });

  describe('Utlevering – leveringsadresse conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100705/utlevering?sub=paper');
      cy.defaultWaits();
    });

    it('shows leveringsadresse fields when not delivering to registered address', () => {
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.withinComponent('Skal hjelpemiddelet utleveres til innbyggerens folkeregistrerte adresse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');

      cy.withinComponent('Skal hjelpemiddelet utleveres til innbyggerens folkeregistrerte adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel fullmakt conditional from Veiledning', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100705/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows fullmakt attachment when leggerDuVedEnSignertFullmakt is ja', () => {
      cy.withinComponent('Legger du ved en signert fullmakt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fullmakt i forbindelse med søknad/ }).should('exist');
    });

    it('hides fullmakt attachment when leggerDuVedEnSignertFullmakt is nei', () => {
      cy.withinComponent('Legger du ved en signert fullmakt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fullmakt i forbindelse med søknad/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100705?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – select Nei for fullmakt (no attachment needed), check all 6 required declarations
      cy.withinComponent('Legger du ved en signert fullmakt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('checkbox', { name: /Jeg er godkjent bestiller/ }).check();
      cy.findByRole('checkbox', { name: /Innbygger har tidligere fått innvilget/ }).check();
      cy.findByRole('checkbox', { name: /Jeg har informert innbygger om retten/ }).check();
      cy.findByRole('checkbox', { name: /Hjelpemidlene er nødvendige for å avhjelpe/ }).check();
      cy.findByRole('checkbox', { name: /Hjelpemidlene skal ikke brukes til korttidsutlån/ }).check();
      cy.findByRole('checkbox', { name: /Jeg har ansvaret for at hjelpemidlene blir levert/ }).check();
      cy.clickNextStep();

      // Opplysninger om innbygger – select Ja for fnr (hides address/addressValidity, simpler path)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Bruker');
      cy.withinComponent('Har innbygger norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('17912099997');
      cy.clickNextStep();

      // Bestiller – fill all required fields using vegadresse path
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ole');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Bestiller');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).type('NAV Hjelpemiddelsentral');
      cy.findByRole('textbox', { name: 'Stilling' }).type('Ergoterapeut');
      cy.withinComponent('Er bestillers kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Arbeidsveien 5');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0660');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('22334455');
      cy.findByRole('textbox', { name: 'E-post' }).type('test@example.com');
      cy.findByRole('textbox', { name: 'Treffes enklest (dag/klokken)' }).type('Hverdager 09-15');
      cy.clickNextStep();

      // Hjelpemidler – fill the initial datagrid row (initEmpty=false)
      cy.findByLabelText('Antall').type('1');
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).type('123456');
      cy.findByRole('textbox', { name: 'Hjelpemiddelbeskrivelse' }).type('Test hjelpemiddel');
      cy.clickNextStep();

      // Utlevering – deliver to registered address (no extra address fields needed)
      cy.withinComponent('Skal hjelpemiddelet utleveres til innbyggerens folkeregistrerte adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Bruker');
      cy.findByLabelText('Telefonnummer').type('12345678');

      // Vedlegg – isAttachmentPanel=true, last panel (Case A): use stepper, then ONE clickNextStep
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Bestiller', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ole');
      });
      cy.withinSummaryGroup('Utlevering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Skal hjelpemiddelet utleveres');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
