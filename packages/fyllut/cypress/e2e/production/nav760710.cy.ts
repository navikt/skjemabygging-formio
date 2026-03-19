/*
 * Production form tests for Registreringsskjema for tilskudd til utdanning
 * Form: nav760710
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility (row.X scoped)
 *       adresse.borDuINorge → adresseVarighet visibility (row.X scoped)
 *   - Informasjon om utdanningssted (informasjonOmUtdanningssted): 3 conditionals
 *       liggerUtdanningsstedetINorge=nei → postnummerUtdanningssted hidden (show=false)
 *       liggerUtdanningsstedetINorge=nei → utenlandskPostkodeUtdanningssted shown (show=true)
 *       liggerUtdanningsstedetINorge=nei → landUtdanningssted shown (show=true)
 *   - Informasjon om utdanning / studieretning (informasjonOmUtdanningStudieretning): 4 conditionals
 *       skalDetBetalesSkolepengerKursavgift=ja → skolepengerKursavgift
 *       skalDetBetalesEksamensavgift=ja → eksamensavgift
 *       skalDetBetalesSemesteravgift=ja → semesteravgift
 *       harDuSelvLagtUtForNoenAvDisseUtgiftene=ja → kontonummerForRefusjon
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, 2 required attachments (all options enabled)
 */

describe('nav760710', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – adresse conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav760710/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when harDuFodselsnummer is nei', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows adresseVarighet when borDuINorge is nei', () => {
      // Make adresse visible first
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // adresseVarighet (addressValidity component) renders "Gyldig fra" date field when visible
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');
    });
  });

  describe('Informasjon om utdanningssted – norsk / utenlandsk address', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav760710/informasjonOmUtdanningssted?sub=paper');
      cy.defaultWaits();
    });

    it('shows foreign address fields when utdanningssted is abroad', () => {
      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Ligger utdanningsstedet i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('not.exist');
    });

    it('shows Norwegian postal code when utdanningssted is in Norway', () => {
      cy.withinComponent('Ligger utdanningsstedet i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
    });
  });

  describe('Informasjon om utdanning – fee conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav760710/informasjonOmUtdanningStudieretning?sub=paper');
      cy.defaultWaits();
    });

    it('shows fee amount fields when fees are selected', () => {
      cy.findByLabelText('Skolepenger / kursavgift').should('not.exist');
      cy.findByLabelText('Eksamensavgift').should('not.exist');
      cy.findByLabelText('Semesteravgift').should('not.exist');

      cy.withinComponent(/Skal det betales skolepenger \/ kursavgift\?/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Skolepenger / kursavgift').should('exist');

      cy.withinComponent('Skal det betales eksamensavgift?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Eksamensavgift').should('exist');

      cy.withinComponent('Skal det betales semesteravgift?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Semesteravgift').should('exist');
    });

    it('hides fee amount fields when no fees apply', () => {
      cy.withinComponent(/Skal det betales skolepenger \/ kursavgift\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Skolepenger / kursavgift').should('not.exist');

      cy.withinComponent('Skal det betales eksamensavgift?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Eksamensavgift').should('not.exist');

      cy.withinComponent('Skal det betales semesteravgift?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Semesteravgift').should('not.exist');
    });

    it('shows kontonummer for refusjon when self-paid', () => {
      cy.findByLabelText('Kontonummer for refusjon').should('not.exist');

      cy.withinComponent('Har du selv lagt ut for noen av disse utgiftene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Kontonummer for refusjon').should('exist');

      cy.withinComponent('Har du selv lagt ut for noen av disse utgiftene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Kontonummer for refusjon').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav760710?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, skip
      cy.clickNextStep();

      // Dine opplysninger – fnr path (adresse section hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Informasjon om utdanningssted – Norwegian path
      cy.findByRole('textbox', { name: 'Utdanningssted' }).type('Universitetet i Oslo');
      cy.withinComponent('Ligger utdanningsstedet i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Problemveien 7');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0315');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.contains('label', 'Telefonnummer til utdanningssted')
        .closest('.form-group')
        .find('input[type="tel"]')
        .type('22850050');
      cy.clickNextStep();

      // Informasjon om utdanning – skolepenger ja to ensure totalsum (calculated) is non-zero
      cy.findByRole('textbox', { name: 'Studieretning' }).type('Informatikk');
      cy.findByRole('textbox', { name: 'Fra dato' }).type('01.01.2025');
      cy.findByRole('textbox', { name: 'Til dato' }).type('31.05.2025');
      cy.withinComponent(/Skal det betales skolepenger \/ kursavgift\?/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Skolepenger / kursavgift').type('5000');
      cy.withinComponent('Skal det betales eksamensavgift?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Skal det betales semesteravgift?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du selv lagt ut for noen av disse utgiftene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true; use stepper to navigate there
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Skriftlig bekreftelse på studieplass/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Faktura fra utdanningsinstitusjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Informasjon om utdanningssted', () => {
        cy.get('dt').eq(0).should('contain.text', 'Utdanningssted');
        cy.get('dd').eq(0).should('contain.text', 'Universitetet i Oslo');
        cy.contains('dt', 'Telefonnummer til utdanningssted').next('dd').should('contain.text', '22850050');
      });
    });
  });
});
