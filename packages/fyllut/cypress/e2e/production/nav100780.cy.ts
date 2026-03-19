import nav100780Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav100780.json';

/*
 * Production form tests for Bekreftelse på utlån og tildeling av høreapparat / tinnitusmaskerer / tilleggsutstyr
 * Form: nav100780
 * Submission types: none (print-only confirmation form)
 *
 * Panels tested:
 *   - Opplysninger om søker (opplysningerOmSoker1): 4 same-panel conditionals
 *       borDuINorge → vegadresseEllerPostboksadresse (and navSkjemagruppeUtland)
 *       vegadresseEllerPostboksadresse → navSkjemagruppeVegadresse / navSkjemagruppePostboksadresse
 *   - Opplysninger fra avtalespesialist / høresentral (opplysningerFraAvtalespesialistHoresentral): 5 conditionals
 *       leverandor1 → leverandorensNavn
 *       bekreftelsenGjelderUtlanOgTildelingAv.horeapparat → fieldset (Høreapparat / tinnitusmaskerer)
 *       bekreftelsenGjelderUtlanOgTildelingAv.tilleggsutstyr → tillegsutstyr datagrid
 *       modellHoyreOre → serienummerHoyreOre
 *       + 2 cross-panel conditionals to Erklæring
 */

describe('nav100780', () => {
  const selectLeverandor = (optionLabel: string) => {
    cy.get('select[name="data[leverandor1]"]').parents('[role="combobox"]').first().as('leverandorCombobox');

    cy.get('@leverandorCombobox').click();
    cy.get('@leverandorCombobox').within(() => {
      cy.findByRole('option', { name: optionLabel }).click();
      cy.contains(optionLabel).should('exist');
    });
  };

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav100780*', { body: nav100780Form }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav100780*', { body: {} }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} }).as('getGlobalTranslations');
  });

  describe('Opplysninger om søker – address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100780/opplysningerOmSoker1');
      cy.defaultWaits();
    });

    it('shows Norwegian address type question when living in Norway', () => {
      cy.findByLabelText(/Er søkers kontaktadresse/).should('not.exist');

      cy.withinComponent('Bor søker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText(/Er søkers kontaktadresse/).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
    });

    it('shows foreign address section when not living in Norway', () => {
      cy.withinComponent('Bor søker i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText(/Er søkers kontaktadresse/).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });

    it('shows vegadresse fields when address type is vegadresse', () => {
      cy.withinComponent('Bor søker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent(/Er søkers kontaktadresse/, () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');
    });

    it('shows postboksadresse fields when address type is postboksadresse', () => {
      cy.withinComponent('Bor søker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent(/Er søkers kontaktadresse/, () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });
  });

  describe('Opplysninger fra avtalespesialist – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100780/opplysningerFraAvtalespesialistHoresentral');
      cy.defaultWaits();
    });

    it('shows leverandorensNavn when leverandorUtenAvtale is selected', () => {
      cy.findByRole('textbox', { name: 'Leverandørens navn' }).should('not.exist');

      selectLeverandor('Leverandør uten avtale');

      cy.findByRole('textbox', { name: 'Leverandørens navn' }).should('exist');
    });

    it('shows høreapparat fieldset when Høreapparat checkbox is checked', () => {
      cy.findByRole('textbox', { name: /Modell høyre øre/ }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Høreapparat' }).check();

      cy.findByRole('textbox', { name: /Modell høyre øre/ }).should('exist');
    });

    it('shows serienummer høyre øre when modell høyre øre is filled', () => {
      cy.findByRole('checkbox', { name: 'Høreapparat' }).check();
      cy.findByRole('textbox', { name: /Serienummer høyre øre/ }).should('not.exist');

      cy.findByRole('textbox', { name: /Modell høyre øre/ }).type('Oticon More 1');

      cy.findByRole('textbox', { name: /Serienummer høyre øre/ }).should('exist');
    });

    it('shows tilleggsutstyr datagrid when Tilleggsutstyr is checked', () => {
      cy.findByRole('textbox', { name: 'Modell / type utstyr' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Tilleggsutstyr' }).check();

      cy.findByRole('textbox', { name: 'Modell / type utstyr' }).should('exist');
    });
  });

  describe('Erklæring – cross-panel conditionals from bekreftelsenGjelderUtlanOgTildelingAv', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100780/opplysningerFraAvtalespesialistHoresentral');
      cy.defaultWaits();
    });

    it('shows stønadsgrense checkbox and kostnad field in Erklæring when Høreapparat is selected', () => {
      cy.findByRole('checkbox', { name: 'Høreapparat' }).check();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Erklæring' }).click();

      cy.findByRole('checkbox', { name: /Mottaker av hjelpemidlene er kjent med/ }).should('exist');
      cy.findByLabelText('Kostnad utover stønadsgrensen').should('exist');
    });

    it('hides stønadsgrense checkbox and kostnad field when neither Høreapparat nor Tinnitusmaskerer is selected', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Erklæring' }).click();

      cy.findByRole('checkbox', { name: /Mottaker av hjelpemidlene er kjent med/ }).should('not.exist');
      cy.findByLabelText('Kostnad utover stønadsgrensen').should('not.exist');
    });

    it('shows stønadsgrense checkbox and kostnad field in Erklæring when Tinnitusmaskerer is selected', () => {
      cy.findByRole('checkbox', { name: 'Tinnitusmaskerer' }).check();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Erklæring' }).click();

      cy.findByRole('checkbox', { name: /Mottaker av hjelpemidlene er kjent med/ }).should('exist');
      cy.findByLabelText('Kostnad utover stønadsgrensen').should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100780/veiledning');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Opplysninger om søker
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: 'Søkerens fødselsdato (dd.mm.åååå)' }).type('01.01.1980');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Bor søker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(/Er søkers kontaktadresse/, () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Storgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0101');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Opplysninger fra avtalespesialist / høresentral
      cy.findByRole('checkbox', { name: 'Høreapparat' }).check();
      selectLeverandor('Oticon AS, Postboks 404 Sentrum, 0103 Oslo');
      cy.findByRole('textbox', { name: /Modell høyre øre/ }).type('Oticon More 1');
      cy.clickNextStep();

      // Erklæring – horeapparat selected so conditional fields are shown and required
      cy.findByRole('checkbox', { name: /Mottaker av hjelpemidlene er kjent med/ }).check();
      cy.findByLabelText('Kostnad utover stønadsgrensen').type('0');
      cy.findByLabelText('Samlet forsikringsverdi på utlevert utstyr').type('5000');
      cy.findByRole('checkbox', { name: /Mottakeren bekrefter å ha fått utstyret/ }).check();
      cy.findByRole('checkbox', { name: /Høreapparatformidleren bekrefter/ }).check();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om søker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Opplysninger fra avtalespesialist / høresentral', () => {
        cy.get('dt').eq(0).should('contain.text', 'Bekreftelsen gjelder utlån og tildeling av');
        cy.contains('dt', 'Leverandør').next('dd').should('contain.text', 'Oticon AS, Postboks 404 Sentrum, 0103 Oslo');
      });
    });
  });
});
