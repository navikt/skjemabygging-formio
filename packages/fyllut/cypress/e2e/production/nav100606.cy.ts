/*
 * Production form tests for Seksualteknisk hjelpemiddel
 * Form: nav100606
 * Submission types: none
 *
 * Panels tested:
 *   - Opplysninger om pasienten (personopplysninger): 4 same-panel conditionals
 *       borDuINorge → vegadresseEllerPostboksadresse
 *       vegadresseEllerPostboksadresse → navSkjemagruppeVegadresse / navSkjemagruppePostboksadresse
 *       borDuINorge → navSkjemagruppeUtland
 *   - Hjelpemidler (hjelpemidler): 24 same-panel conditionals
 *       pasientenHarBehovForFolgendeHjelpemiddelkategori → dilatatorsett / vakuumpumpe /
 *       vibratorForMenn / vibratorForKvinner / caresseProWand / fingervibratorForKvinner /
 *       kunstigVaginaMedVibrering / erigertPenisprotesePeecockGen4
 *       product choices / checkbox toggles → descriptive alertstripes and penisprotese follow-up fields
 */

describe('nav100606', () => {
  const helpemiddelKategoriLabel = /Pasienten har behov for følgende hjelpemiddelkategori/;

  const checkKategori = (name: string) => {
    cy.findByRole('group', { name: helpemiddelKategoriLabel }).within(() => {
      cy.findByRole('checkbox', { name }).check();
    });
  };

  const uncheckKategori = (name: string) => {
    cy.findByRole('group', { name: helpemiddelKategoriLabel }).within(() => {
      cy.findByRole('checkbox', { name }).uncheck();
    });
  };

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Opplysninger om pasienten – address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100606/personopplysninger');
      cy.defaultWaits();
    });

    it('shows Norwegian address type question only when the patient lives in Norway', () => {
      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Bor pasienten i Norge?', () => {
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

    it('shows foreign address fields when the patient does not live in Norway', () => {
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Bor pasienten i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Fra hvilken dato skal denne adressen brukes/ }).should('exist');
      cy.findByRole('textbox', { name: /Til hvilken dato skal denne adressen brukes/ }).should('exist');
    });
  });

  describe('Hjelpemidler – category conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100606/hjelpemidler');
      cy.defaultWaits();
    });

    it('shows dilatatorsett and vakuumpumpe branches when their categories are checked', () => {
      cy.findByRole('radio', { name: 'Vagiwell dilatatorsett' }).should('not.exist');
      cy.findByRole('radio', { name: 'Noogleberry manuell penispumpe' }).should('not.exist');

      checkKategori('Dilatatorsett');
      cy.findByRole('radio', { name: 'Vagiwell dilatatorsett' }).click();
      cy.findByRole('radio', { name: 'Vagiwell dilatatorsett' }).should('exist');

      uncheckKategori('Dilatatorsett');
      cy.findByRole('radio', { name: 'Vagiwell dilatatorsett' }).should('not.exist');

      checkKategori('Vakuumpumpe');
      cy.findByRole('radio', { name: 'Noogleberry manuell penispumpe' }).click();
      cy.findByRole('radio', { name: 'Noogleberry manuell penispumpe' }).should('exist');

      uncheckKategori('Vakuumpumpe');
      cy.findByRole('radio', { name: 'Noogleberry manuell penispumpe' }).should('not.exist');
    });

    it('shows vibrator branches for men and women when their categories are checked', () => {
      cy.findByRole('radio', { name: 'Manwand vibrator' }).should('not.exist');
      cy.findByRole('radio', { name: 'Calexotics trusevibrator' }).should('not.exist');

      checkKategori('Vibrator for menn');
      cy.findByRole('radio', { name: 'Manwand vibrator' }).click();
      cy.findByRole('radio', { name: 'Manwand vibrator' }).should('exist');

      uncheckKategori('Vibrator for menn');
      cy.findByRole('radio', { name: 'Manwand vibrator' }).should('not.exist');

      checkKategori('Vibrator for kvinner');
      cy.findByRole('radio', { name: 'Calexotics trusevibrator' }).click();
      cy.findByRole('radio', { name: 'Calexotics trusevibrator' }).should('exist');

      uncheckKategori('Vibrator for kvinner');
      cy.findByRole('radio', { name: 'Calexotics trusevibrator' }).should('not.exist');
    });

    it('shows caresse and fingervibrator branches when their categories are checked', () => {
      cy.findByRole('checkbox', { name: 'Caresse Pro Wand' }).should('not.exist');
      cy.findByRole('radio', { name: 'SVR fingervibrator' }).should('not.exist');

      checkKategori('Vibrator for utvendig bruk');
      cy.findByRole('checkbox', { name: 'Caresse Pro Wand' }).click();
      cy.findByRole('checkbox', { name: 'Caresse Pro Wand' }).should('be.checked');

      cy.findByRole('checkbox', { name: 'Caresse Pro Wand' }).click();
      cy.findByRole('checkbox', { name: 'Caresse Pro Wand' }).should('not.be.checked');
      uncheckKategori('Vibrator for utvendig bruk');
      cy.findByRole('checkbox', { name: 'Caresse Pro Wand' }).should('not.exist');

      checkKategori('Fingervibrator for kvinner');
      cy.findByRole('radio', { name: 'SVR fingervibrator' }).click();
      cy.findByRole('radio', { name: 'SVR fingervibrator' }).should('exist');

      uncheckKategori('Fingervibrator for kvinner');
      cy.findByRole('radio', { name: 'SVR fingervibrator' }).should('not.exist');
    });

    it('shows masturbator and penisprotese branches when their categories are checked', () => {
      cy.findByRole('radio', { name: 'Arcwave masturbator' }).should('not.exist');
      cy.findByRole('checkbox', { name: 'Erigert penisprotese, fyllbar' }).should('not.exist');

      checkKategori('Masturbator med vibrering');
      cy.findByRole('radio', { name: 'Arcwave masturbator' }).click();
      cy.findByRole('radio', { name: 'Arcwave masturbator' }).should('exist');

      uncheckKategori('Masturbator med vibrering');
      cy.findByRole('radio', { name: 'Arcwave masturbator' }).should('not.exist');

      checkKategori('Penisprotese');
      cy.findByRole('checkbox', { name: 'Erigert penisprotese, fyllbar' }).click();
      cy.findByRole('checkbox', { name: 'Erigert penisprotese, fyllbar' }).should('be.checked');
      cy.findByLabelText('Ønsket lengde på protesen').should('exist');
      cy.findByLabelText('Ønsket farge på protesen').should('exist');
      cy.findByLabelText('Er det behov for sele til penisprotesen?').should('exist');

      cy.findByRole('checkbox', { name: 'Erigert penisprotese, fyllbar' }).click();
      cy.findByRole('checkbox', { name: 'Erigert penisprotese, fyllbar' }).should('not.be.checked');
      cy.findByLabelText('Ønsket lengde på protesen').should('not.exist');
      cy.findByLabelText('Ønsket farge på protesen').should('not.exist');
      cy.findByLabelText('Er det behov for sele til penisprotesen?').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100606/personopplysninger');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      // Opplysninger om pasienten – Norway / vegadresse path
      cy.findByRole('textbox', { name: 'Pasientents fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Pasientens etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /Pasientens fødselsdato/ }).type('15.01.1990');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Bor pasienten i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
      cy.findAllByRole('textbox', { name: 'Postnummer' }).first().type('0150');
      cy.findAllByRole('textbox', { name: 'Poststed' }).first().type('Oslo');
      cy.clickNextStep();

      // Hjelpemidler – simple single-category path
      checkKategori('Dilatatorsett');
      cy.findByRole('radio', { name: 'Vagiwell dilatatorsett' }).click();
      cy.withinComponent('Hvem skal hjelpemiddelet sendes til?', () => {
        cy.findByRole('radio', { name: 'Pasient' }).click();
      });
      cy.clickNextStep();

      // Opplysninger om legen
      cy.findByRole('textbox', { name: 'Navn på legesenteret' }).type('Test legesenter');
      cy.findByRole('textbox', { name: 'Legens fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Legens etternavn' }).type('Lege');
      cy.findByRole('textbox', { name: 'Legens ID-nummer' }).type('12345');
      cy.findByLabelText('Telefonnummer').type('87654321');
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Legeveien 2');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0400');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
      cy.clickNextStep();

      // Adresse – informational panel before summary
      cy.contains('Quintet AS').should('exist');
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om pasienten', () => {
        cy.get('dt').eq(0).should('contain.text', 'Pasientents fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Hjelpemidler', () => {
        cy.get('dt').contains('Hvem skal hjelpemiddelet sendes til?').should('exist');
        cy.get('dd').contains('Pasient').should('exist');
      });
      cy.withinSummaryGroup('Opplysninger om legen', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på legesenteret');
        cy.get('dd').eq(0).should('contain.text', 'Test legesenter');
      });
    });
  });
});
