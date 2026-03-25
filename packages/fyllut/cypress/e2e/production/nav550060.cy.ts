/*
 * Production form tests for Avtale om barnebidrag
 * Form: nav550060
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om bidragsmottaker (opplysningerOmBidragsmottaker): 4 conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsdatoDdMmAaaaSoker, borDuINorge
 *       borDuINorge → vegadresseEllerPostboksadresse, navSkjemagruppeUtland
 *   - Opplysninger om bidragpliktige (opplysningerOmBidragspliktige): 4 conditionals (same pattern)
 *       harGiverFodselsnummerEllerDNummer → fodselsdatoDdMmAaaaSoker1, borDuINorge1
 *       borDuINorge1 → vegadresseEllerPostboksadresse1, navSkjemagruppeUtland1
 *   - Opplysninger om barn og bidrag (opplysningerOmBarnOgBidrag): 2 datagrid row conditionals
 *       barnetHarIkkeNorskFodselsnummerDNummer → hides fnr, shows fødselsdato
 *   - Oppgjør (oppgjor): 1 conditional
 *       erDetteEnNyAvtale → dagensOppgjorsform
 *   - Andre bestemmelser (andreBestemmelser): 1 conditional
 *       erDetAndreBestemmelserTilknytningTilAvtalen → textarea
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 1 cross-panel conditional
 *       erDetAndreBestemmelserTilknytningTilAvtalen → andreBestemmelserTilknyttetAvtalen attachment
 */

describe('nav550060', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Opplysninger om bidragsmottaker – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550060/opplysningerOmBidragsmottaker?sub=paper');
      cy.defaultWaits();
    });

    it('shows fødselsdato and borDuINorge when bidragsmottaker has no fnr', () => {
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('not.exist');
      cy.findByLabelText(/Bor bidragsmottaker i Norge\?/).should('not.exist');

      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /bidragsmottakers\s+fødselsdato/i }).should('exist');
      cy.findByLabelText(/Bor bidragsmottaker i Norge\?/).should('exist');
    });

    it('hides fødselsdato and borDuINorge when bidragsmottaker has fnr', () => {
      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsdato/i }).should('not.exist');
      cy.findByLabelText(/Bor bidragsmottaker i Norge\?/).should('not.exist');
    });

    it('shows vegadressevalg when bidragsmottaker bor i Norge', () => {
      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Bor bidragsmottaker i Norge\?/).should('exist');

      cy.withinComponent('Bor bidragsmottaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er kontaktadressen til bidragsmottaker en vegadresse eller postboksadresse?').should('exist');
    });

    it('shows utenlandsk adresse when bidragsmottaker bor i utlandet', () => {
      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.withinComponent('Bor bidragsmottaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
    });
  });

  describe('Opplysninger om bidragpliktige – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550060/opplysningerOmBidragspliktige?sub=paper');
      cy.defaultWaits();
    });

    it('shows fødselsdato and borDuINorge when bidragpliktige has no fnr', () => {
      cy.findByRole('textbox', { name: /Den bidragspliktiges fødselsdato/i }).should('not.exist');
      cy.findByLabelText(/Bor\s+den bidragspliktige i Norge\?/).should('not.exist');

      cy.withinComponent(/Har den\s+bidragspliktige norsk fødselsnummer/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Den bidragspliktiges fødselsdato/i }).should('exist');
      cy.findByLabelText(/Bor\s+den bidragspliktige i Norge\?/).should('exist');
    });

    it('shows vegadressevalg when bidragpliktige bor i Norge', () => {
      cy.withinComponent(/Har den\s+bidragspliktige norsk fødselsnummer/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.withinComponent(/Bor\s+den bidragspliktige i Norge\?/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er kontaktadressen til den bidragspliktige en vegadresse eller postboksadresse?').should(
        'exist',
      );
    });
  });

  describe('Opplysninger om barn og bidrag – datagrid conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550060/opplysningerOmBarnOgBidrag?sub=paper');
      cy.defaultWaits();
    });

    it('hides fnr and shows fødselsdato when barnet har ikke fnr is checked', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Fødselsdato \(dd\.mm\.åååå\)/ }).should('not.exist');

      cy.findByRole('checkbox', {
        name: /Barnet har ikke norsk fødselsnummer/,
      }).click();

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato \(dd\.mm\.åååå\)/ }).should('exist');
    });
  });

  describe('Oppgjør – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550060/oppgjor?sub=paper');
      cy.defaultWaits();
    });

    it('shows dagensOppgjorsform when avtale is an endring', () => {
      cy.findByLabelText('Hvilken oppgjørsform har dere i dag?').should('not.exist');

      cy.withinComponent('Er dette en ny avtale?', () => {
        cy.findByRole('radio', { name: 'Nei, det er en endring av eksisterende avtale.' }).click();
      });

      cy.findByLabelText('Hvilken oppgjørsform har dere i dag?').should('exist');
    });

    it('hides dagensOppgjorsform when avtale is new', () => {
      cy.withinComponent('Er dette en ny avtale?', () => {
        cy.findByRole('radio', { name: 'Ja.' }).click();
      });

      cy.findByLabelText('Hvilken oppgjørsform har dere i dag?').should('not.exist');
    });
  });

  describe('Andre bestemmelser – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550060/andreBestemmelser?sub=paper');
      cy.defaultWaits();
    });

    it('shows textarea when there are andre bestemmelser', () => {
      cy.findByRole('textbox', { name: 'Andre bestemmelser tilknyttet avtalen' }).should('not.exist');

      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Andre bestemmelser tilknyttet avtalen' }).should('exist');
    });

    it('hides textarea when there are no andre bestemmelser', () => {
      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Andre bestemmelser tilknyttet avtalen' }).should('not.exist');
    });
  });

  describe('Vedlegg – conditional attachment from andre bestemmelser', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550060/andreBestemmelser?sub=paper');
      cy.defaultWaits();
    });

    it('shows andreBestemmelser attachment on Vedlegg when andre bestemmelser is Ja', () => {
      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Andre bestemmelser tilknyttet avtalen/ }).should('exist');
    });

    it('hides andreBestemmelser attachment on Vedlegg when andre bestemmelser is Nei', () => {
      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Andre bestemmelser tilknyttet avtalen/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550060?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, skip
      cy.clickNextStep();

      // Opplysninger om bidragsmottaker – Ja path (fnr, no address)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Opplysninger om bidragpliktige – Ja path (fnr, no address)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Hansen');
      cy.withinComponent(/Har den\s+bidragspliktige norsk fødselsnummer/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Opplysninger om barn og bidrag – datagrid first row, no checkbox (fnr shows)
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Barn');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barnesen');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Bidrag per måned').type('2000');
      cy.findByRole('textbox', { name: /Fra dato \(dd\.mm\.åååå\)/ }).type('01.01.2025');
      cy.clickNextStep();

      // Oppgjør – new agreement, pick settlement method
      cy.withinComponent('Er dette en ny avtale?', () => {
        cy.findByRole('radio', { name: 'Ja.' }).click();
      });
      cy.withinComponent('Hvilken oppgjørsform ønskes?', () => {
        cy.findByRole('radio', {
          name: 'Vi ønsker å gjøre opp bidraget oss i mellom (privat).',
        }).click();
      });
      cy.clickNextStep();

      // Andre bestemmelser – Nei (hides textarea and conditional attachment)
      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg (isAttachmentPanel=true) – navigate via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om bidragsmottaker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Opplysninger om bidragpliktige', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
    });
  });
});
