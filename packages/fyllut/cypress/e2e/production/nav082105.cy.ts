/*
 * Production form tests for Forsikring mot ansvar for sykepenger i arbeidsgiverperioden for små bedrifter
 * Form: nav082105
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Lønnsutbetalinger (lonnsutbetalinger): 4 same-panel conditionals
 *       erBedriftenNyetablert → samledeLonnsutbetalingerIKalenderaret (nei),
 *                               alleParegnedeLonnsutbetalingeneIKalenderaret (ja),
 *                               harBedriftenTidligereVaertMedIForsikringsordningen (nei)
 *       harBedriftenTidligereVaertMedIForsikringsordningen → sluttdatoDdMmAaaaForTidligereDeltagelseIOrdningen (ja)
 *   - Annet (annet): 1 same-panel conditional
 *       harDuAndreOpplysningerTilSoknaden → andreOpplysninger1 (ja)
 */

describe('nav082105', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Lønnsutbetalinger – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082105/lonnsutbetalinger?sub=paper');
      cy.defaultWaits();
    });

    it('shows correct lønnsutbetaling field based on nyetablert status', () => {
      cy.findByRole('textbox', { name: 'Samlede lønnsutbetalinger i kalenderåret' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Alle påregnede lønnsutbetalinger i kalenderåret' }).should('not.exist');
      cy.findByLabelText('Har bedriften tidligere vært med i forsikringsordningen?').should('not.exist');

      // Nei → shows samlede lønnsutbetalinger and harBedriften question
      cy.withinComponent('Er bedriften nyetablert?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Samlede lønnsutbetalinger i kalenderåret' }).should('exist');
      cy.findByRole('textbox', { name: 'Alle påregnede lønnsutbetalinger i kalenderåret' }).should('not.exist');
      cy.findByLabelText('Har bedriften tidligere vært med i forsikringsordningen?').should('exist');

      // Ja → shows alle påregnede, hides samlede and harBedriften
      cy.withinComponent('Er bedriften nyetablert?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Alle påregnede lønnsutbetalinger i kalenderåret' }).should('exist');
      cy.findByRole('textbox', { name: 'Samlede lønnsutbetalinger i kalenderåret' }).should('not.exist');
      cy.findByLabelText('Har bedriften tidligere vært med i forsikringsordningen?').should('not.exist');
    });

    it('shows sluttdato when bedriften previously was in forsikringsordningen', () => {
      cy.findByRole('textbox', { name: /Sluttdato/ }).should('not.exist');

      cy.withinComponent('Er bedriften nyetablert?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.withinComponent('Har bedriften tidligere vært med i forsikringsordningen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Sluttdato/ }).should('exist');

      cy.withinComponent('Har bedriften tidligere vært med i forsikringsordningen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Sluttdato/ }).should('not.exist');
    });
  });

  describe('Annet – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082105/annet?sub=paper');
      cy.defaultWaits();
    });

    it('shows additional information textarea when har andre opplysninger', () => {
      cy.findByRole('textbox', { name: 'Andre opplysninger til søknaden' }).should('not.exist');

      cy.withinComponent('Har du andre opplysninger til søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Andre opplysninger til søknaden' }).should('exist');

      cy.withinComponent('Har du andre opplysninger til søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Andre opplysninger til søknaden' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082105/omArbeidsgiver?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      // Om arbeidsgiver
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
      cy.findByRole('textbox', { name: 'Underenhet' }).type('974652277');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Antall ansatte' }).type('10');
      cy.clickNextStep();

      // Lønnsutbetalinger – not newly established
      cy.withinComponent('Er bedriften nyetablert?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Samlede lønnsutbetalinger i kalenderåret' }).type('500000');
      cy.findByRole('textbox', { name: 'År' }).type('2025');
      cy.withinComponent('Har bedriften tidligere vært med i forsikringsordningen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Annet – nei
      cy.withinComponent('Har du andre opplysninger til søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg – annenDokumentasjon has two options (nei, leggerVedNaa)
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Om arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Lønnsutbetalinger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Er bedriften nyetablert?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
    });
  });
});
