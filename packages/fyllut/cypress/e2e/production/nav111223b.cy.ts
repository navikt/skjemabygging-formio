/*
 * Production form tests for Tilleggsstønad - støtte til flytting
 * Form: nav111223b
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 1 customConditional
 *       identitet.harDuFodselsnummer → adresse (navAddress) visibility
 *   - Søknad (page4): 3 same-panel conditionals
 *       hvorforFlytterDu → oppgiForsteDagINyJobbDdMmAaaa
 *       ordnerDuFlyttingen → jegFlytterSelv container (km field)
 *       ordnerDuFlyttingen → jegVilBrukeFlyttebyra container (moving company fields)
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 3 cross-panel conditionals from page4
 *       hvorforFlytterDu → dokumentasjonAvArsakerTilAtDuFlytter1
 *       ordnerDuFlyttingen → dokumentasjonPaUtgifterKnyttetTilBrukAvEgenBil
 *       ordnerDuFlyttingen → dokumentasjonPaInnhentedeTilbud
 */

describe('nav111223b', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111223b/personopplysninger?sub=paper');
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

  describe('Søknad – moving reason and method conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111223b/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows first work day date only for nyJobb', () => {
      cy.findByLabelText(/Oppgi første dag i ny jobb/).should('not.exist');

      cy.withinComponent('Hvorfor flytter du?', () => {
        cy.findByRole('radio', { name: 'Jeg flytter fordi jeg har fått ny jobb' }).click();
      });

      cy.findByLabelText(/Oppgi første dag i ny jobb/).should('exist');

      cy.withinComponent('Hvorfor flytter du?', () => {
        cy.findByRole('radio', {
          name: 'Jeg flytter i forbindelse med at jeg skal gjennomføre en aktivitet',
        }).click();
      });

      cy.findByLabelText(/Oppgi første dag i ny jobb/).should('not.exist');
    });

    it('shows jegFlytterSelv cost fields when moving self', () => {
      cy.findByLabelText('Hvor langt skal du flytte (km)?').should('not.exist');

      cy.withinComponent('Ordner du flyttingen selv eller kommer du til å bruke flyttebyrå?', () => {
        cy.findByRole('radio', { name: 'Jeg flytter selv' }).click();
      });

      cy.findByLabelText('Hvor langt skal du flytte (km)?').should('exist');

      cy.withinComponent('Ordner du flyttingen selv eller kommer du til å bruke flyttebyrå?', () => {
        cy.findByRole('radio', { name: 'Jeg vil bruke flyttebyrå' }).click();
      });

      cy.findByLabelText('Hvor langt skal du flytte (km)?').should('not.exist');
    });

    it('shows moving company fields when using a company', () => {
      cy.findByRole('textbox', { name: 'Navn på flyttebyrå 1' }).should('not.exist');

      cy.withinComponent('Ordner du flyttingen selv eller kommer du til å bruke flyttebyrå?', () => {
        cy.findByRole('radio', { name: 'Jeg vil bruke flyttebyrå' }).click();
      });

      cy.findByRole('textbox', { name: 'Navn på flyttebyrå 1' }).should('exist');

      cy.withinComponent('Ordner du flyttingen selv eller kommer du til å bruke flyttebyrå?', () => {
        cy.findByRole('radio', { name: 'Jeg flytter selv' }).click();
      });

      cy.findByRole('textbox', { name: 'Navn på flyttebyrå 1' }).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditionals from Søknad', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111223b/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows arsak attachment for nyJobb', () => {
      cy.withinComponent('Hvorfor flytter du?', () => {
        cy.findByRole('radio', { name: 'Jeg flytter fordi jeg har fått ny jobb' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av årsaken til at du flytter/ }).should('exist');
    });

    it('hides arsak attachment when not nyJobb', () => {
      cy.withinComponent('Hvorfor flytter du?', () => {
        cy.findByRole('radio', {
          name: 'Jeg flytter i forbindelse med at jeg skal gjennomføre en aktivitet',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av årsaken til at du flytter/ }).should('not.exist');
    });

    it('shows egenbil attachment for jegFlytterSelv', () => {
      cy.withinComponent('Ordner du flyttingen selv eller kommer du til å bruke flyttebyrå?', () => {
        cy.findByRole('radio', { name: 'Jeg flytter selv' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon på utgifter knyttet til bruk av egen bil/ }).should('exist');
    });

    it('shows innhentede tilbud attachment for jegVilBrukeFlyttebyra', () => {
      cy.withinComponent('Ordner du flyttingen selv eller kommer du til å bruke flyttebyrå?', () => {
        cy.findByRole('radio', { name: 'Jeg vil bruke flyttebyrå' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av alle innhentede tilbud fra flyttebyrå/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111223b?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Din situasjon – select at least one option in flervalg (selectboxes)
      cy.findByRole('checkbox', { name: /Mottar arbeidsavklaringspenger/ }).click();
      cy.clickNextStep();

      // Søknad – nyJobb + jegFlytterSelv path
      cy.withinComponent('Hvorfor flytter du?', () => {
        cy.findByRole('radio', { name: 'Jeg flytter fordi jeg har fått ny jobb' }).click();
      });
      cy.findByLabelText(/Når flytter du/).type('01.06.2025');
      cy.findByLabelText(/Oppgi første dag i ny jobb/).type('01.06.2025');
      cy.findByRole('combobox', { name: /Velg land/ }).should('have.attr', 'aria-expanded', 'false');
      cy.withinComponent('Velg land', () => {
        cy.contains('Norge').should('exist');
      });
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Testgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist').type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.withinComponent('Ordner du flyttingen selv eller kommer du til å bruke flyttebyrå?', () => {
        cy.findByRole('radio', { name: 'Jeg flytter selv' }).click();
      });
      cy.findByLabelText('Hvor langt skal du flytte (km)?').type('100');
      cy.withinComponent('Får du dekket utgiftene dine til flytting på annen måte enn med stønad fra NAV?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger – no required fields
      cy.clickNextStep();

      // Vedlegg (isAttachmentPanel=true) – navigate sequentially
      cy.findByRole('group', { name: /Dokumentasjon av årsaken til at du flytter/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon på utgifter knyttet til bruk av egen bil/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', {
          name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
        }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknad', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvorfor flytter du?');
        cy.get('dd').eq(0).should('contain.text', 'Jeg flytter fordi jeg har fått ny jobb');
      });
    });
  });
});
