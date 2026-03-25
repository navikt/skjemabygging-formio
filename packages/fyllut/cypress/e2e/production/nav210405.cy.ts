/*
 * Production form tests for Melding til Nav om elevs fravær fra skolen som kan skyldes utenlandsopphold
 * Form: nav210405
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Elevens opplysninger (elevensOpplysninger): 2 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker (ja)
 *       harDuNorskFodselsnummerEllerDNummer → fodselsdatoDdMmAaaaSoker + navSkjemagruppeVegadresse (nei)
 *   - Om skolen og fraværet (omSkolenOgFravaret): 2 same-panel conditionals
 *       vetSkolenHvilketLandElevenOppholderSegI → land1 (ja)
 *       harSkolenKjennskapTilNarElevenFamilienFlyttetReiste → utfyllendeInformasjon (ja)
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       erDetAndreOpplysningerDereTenkerErAktuelleForSaken → tilleggsopplysninger1 (ja)
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, annenDokumentasjon (nei, leggerVedNaa)
 */

describe('nav210405', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Elevens opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav210405/elevensOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field when Ja is selected', () => {
      cy.findByLabelText('Fødselsnummer / d-nummer').should('not.exist');

      cy.withinComponent('Har eleven norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / d-nummer').should('exist');

      cy.withinComponent('Har eleven norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Fødselsnummer / d-nummer').should('not.exist');
    });

    it('shows birthdate and address when Nei is selected', () => {
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.withinComponent('Har eleven norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');

      cy.withinComponent('Har eleven norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });
  });

  describe('Om skolen og fraværet – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav210405/omSkolenOgFravaret?sub=paper');
      cy.defaultWaits();
    });

    it('shows land field when school knows which country', () => {
      cy.findByRole('textbox', { name: 'Hvilket land oppholder eleven seg i?' }).should('not.exist');

      cy.withinComponent('Vet skolen hvilket land eleven oppholder seg i?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilket land oppholder eleven seg i?' }).should('exist');

      cy.withinComponent('Vet skolen hvilket land eleven oppholder seg i?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilket land oppholder eleven seg i?' }).should('not.exist');
    });

    it('shows utfyllende informasjon when school knows when family moved', () => {
      cy.findByRole('textbox', { name: 'Utfyllende informasjon' }).should('not.exist');

      cy.withinComponent('Har skolen kjennskap til når eleven / familien flyttet eller reiste?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Utfyllende informasjon' }).should('exist');

      cy.withinComponent('Har skolen kjennskap til når eleven / familien flyttet eller reiste?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Utfyllende informasjon' }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav210405/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows tilleggsopplysninger textarea when Ja is selected', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Er det andre opplysninger dere tenker er aktuelle for saken?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Er det andre opplysninger dere tenker er aktuelle for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav210405?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // root screen → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Elevens opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har eleven norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / d-nummer').type('17912099997');
      cy.clickNextStep();

      // Om skolen og fraværet
      cy.findByRole('textbox', { name: /Eleven har ikke vært til stede/ }).type('01.01.2025');
      cy.findByRole('checkbox', { name: 'Vi har grunn til å tro at eleven oppholder seg i utlandet' }).click();
      cy.withinComponent('Vet skolen hvilket land eleven oppholder seg i?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilket land oppholder eleven seg i?' }).type('Frankrike');
      cy.findByRole('textbox', { name: 'Skolens navn' }).type('Testskolen');
      cy.findByRole('textbox', { name: 'Kontaktperson ved skolen' }).type('Test Kontakt');
      cy.contains('label', 'Telefonnummer til kontaktpersonen')
        .closest('.form-group')
        .find('input[type="tel"]')
        .type('12345678');
      cy.withinComponent('Har skolen kjennskap til når eleven / familien flyttet eller reiste?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.withinComponent('Er det andre opplysninger dere tenker er aktuelle for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true, navigate via stepper then clickNextStep to summary
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Elevens opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Om skolen og fraværet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Eleven har ikke vært til stede');
        cy.get('dd').eq(0).should('contain.text', '01.01.2025');
      });
    });
  });
});
