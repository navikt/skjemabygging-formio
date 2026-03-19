/*
 * Production form tests for Innlevering av tekniske hjelpemidler
 * Form: nav100763
 * Submission types: (none — print/deliver form)
 *
 * Panels tested:
 *   - Opplysninger om bruker av hjelpemidlene (opplysningerOmBrukerAvHjelpemidlene): 6 conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker (show when ja)
 *       harDuNorskFodselsnummerEllerDNummer → fodselsdatoDdMmAaaaSoker (show when nei)
 *       harDuNorskFodselsnummerEllerDNummer=nei && borDuINorge=ja → vegadresseEllerPostboksadresse (customConditional)
 *       harDuNorskFodselsnummerEllerDNummer=nei && borDuINorge=nei → navSkjemagruppeUtland (customConditional)
 *       borDuINorge=ja → bostedskommune
 *       harIkkeTelefon=true → telefonnummer hidden
 *   - Hjelpemidler som skal leveres (hjelpemidlerSomSkalLeveres): 1 datagrid row conditional
 *       erHjelpemiddeletSeriestyrt=ja → hmsSerienummer
 *   - Andre opplysninger (andreOpplysninger): 1 conditional
 *       harDuAndreOpplysningerEllerMerknaderSomErRelevanteForSaken=ja → andreOpplysninger1 textarea
 */

describe('nav100763', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Opplysninger om bruker – fnr og adresse conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100763/opplysningerOmBrukerAvHjelpemidlene');
      cy.defaultWaits();
    });

    it('shows fnr field when harDuNorskFodselsnummerEllerDNummer is ja, fødselsdato when nei', () => {
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /fødselsdato.*\(dd\.mm\.åååå\)/i }).should('not.exist');

      cy.withinComponent('Har personen norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / D-nummer').should('exist');
      cy.findByRole('textbox', { name: /fødselsdato.*\(dd\.mm\.åååå\)/i }).should('not.exist');

      cy.withinComponent('Har personen norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /fødselsdato.*\(dd\.mm\.åååå\)/i }).should('exist');
    });

    it('shows address type question when no fnr and lives in Norway', () => {
      cy.findByLabelText('Er kontaktadressen til personen en vegadresse eller postboksadresse?').should('not.exist');

      cy.withinComponent('Har personen norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er kontaktadressen til personen en vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er kontaktadressen til personen en vegadresse eller postboksadresse?').should('not.exist');
    });

    it('shows utenlandsk kontaktadresse when no fnr and not in Norway', () => {
      cy.withinComponent('Har personen norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByText('Utenlandsk kontaktadresse').should('exist');
    });

    it('shows bostedskommune when borDuINorge is ja', () => {
      cy.findByRole('textbox', { name: 'Bostedskommune' }).should('not.exist');

      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Bostedskommune' }).should('exist');

      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Bostedskommune' }).should('not.exist');
    });

    it('hides telefonnummer when harIkkeTelefon is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.findByLabelText('Telefonnummer').should('exist');
    });
  });

  describe('Hjelpemidler som skal leveres – datagrid row conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100763/hjelpemidlerSomSkalLeveres');
      cy.defaultWaits();
    });

    it('shows HMS serienummer when hjelpemiddelet har serienummer', () => {
      cy.findByRole('textbox', { name: 'HMS serienummer' }).should('not.exist');

      cy.withinComponent('Har hjelpemiddelet serienummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'HMS serienummer' }).should('exist');

      cy.withinComponent('Har hjelpemiddelet serienummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'HMS serienummer' }).should('not.exist');
    });
  });

  describe('Andre opplysninger – conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100763/andreOpplysninger');
      cy.defaultWaits();
    });

    it('shows andre opplysninger textarea when ja is selected', () => {
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('not.exist');

      cy.withinComponent('Har du andre opplysninger eller merknader som er relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('exist');

      cy.withinComponent('Har du andre opplysninger eller merknader som er relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100763');
      cy.defaultWaits();
      cy.clickNextStep(); // skip Veiledning
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep(); // skip Veiledning (informational only)

      // Opplysninger om bruker av hjelpemidlene – fnr path, lives in Norway
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har personen norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / D-nummer').type('17912099997');
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Bostedskommune' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Hvem leverer hjelpemidlene tilbake?
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Kommuneansatt');
      cy.findByRole('textbox', { name: 'Kommune' }).type('Oslo');
      cy.findByRole('textbox', { name: 'Stilling' }).type('Ergoterapeut');
      cy.findByLabelText('Telefonnummer').type('87654321');
      cy.clickNextStep();

      // Hjelpemidler som skal leveres – fill one datagrid row, no serienummer path
      cy.findByRole('textbox', { name: 'Beskrivelse av hjelpemidlet' }).type('Rullestol');
      cy.withinComponent('Har hjelpemiddelet serienummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Antall').type('1');
      cy.withinComponent('Hvor skal hjelpemidlet?', () => {
        cy.findByRole('radio', { name: 'Innleveres til NAV Hjelpemiddelsentral' }).click();
      });
      cy.clickNextStep();

      // Andre opplysninger – no extra remarks
      cy.withinComponent('Har du andre opplysninger eller merknader som er relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om bruker av hjelpemidlene', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Andre opplysninger', () => {
        cy.get('dt')
          .eq(0)
          .should('contain.text', 'Har du andre opplysninger eller merknader som er relevante for saken?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
    });
  });
});
