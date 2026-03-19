/*
 * Production form tests for Refusjonskrav - mentor
 * Form: nav761385
 * Submission types: PAPER
 *
 * Panels:
 *   - Veiledning (veiledning): HTML only, no conditionals
 *   - Arbeidsgiver (arbeidsgiver): 9 required fields, no conditionals
 *   - Deltaker (deltaker): 3 required fields, no conditionals
 *   - Tilskudd til mentor (tilskuddTilMentor): 13 required fields, 2 conditionals
 *       harMentorenFattUtbetaltFeriepengerIPerioden → hvorMangeDagerErDetUtbetaltFeriepengerFor1 (show when 'ja')
 *       harMentorenFattUtbetaltFeriepengerIPerioden → erDeUtbetalteFeriepengeneRegnetMedISumRefusjonsbelop (show when 'ja')
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 conditional
 *       harDuTilleggsopplysningerSomErRelevanteForSoknaden → tilleggsopplysninger textarea (show when 'ja')
 *   - Erklæring (erklaering): 1 required checkbox, no conditionals
 *   - Vedlegg (vedlegg): isAttachmentPanel=true (last panel), 2 required attachments
 */

describe('nav761385', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Tilskudd til mentor – feriepenger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761385/tilskuddTilMentor?sub=paper');
      cy.defaultWaits();
    });

    it('shows extra fields when mentor has received holiday pay', () => {
      cy.findByLabelText('Hvor mange dager er det utbetalt feriepenger for?').should('not.exist');
      cy.findByLabelText('Er de utbetalte feriepengene regnet med i sum refusjonsbeløp?').should('not.exist');

      cy.withinComponent('Har mentoren fått utbetalt feriepenger i perioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hvor mange dager er det utbetalt feriepenger for?').should('exist');
      cy.findByLabelText('Er de utbetalte feriepengene regnet med i sum refusjonsbeløp?').should('exist');
    });

    it('hides extra fields when mentor has not received holiday pay', () => {
      cy.withinComponent('Har mentoren fått utbetalt feriepenger i perioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hvor mange dager er det utbetalt feriepenger for?').should('exist');

      cy.withinComponent('Har mentoren fått utbetalt feriepenger i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hvor mange dager er det utbetalt feriepenger for?').should('not.exist');
      cy.findByLabelText('Er de utbetalte feriepengene regnet med i sum refusjonsbeløp?').should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – textarea conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761385/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows textarea when tilleggsopplysninger is ja', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Har du tilleggsopplysninger som er relevante for søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');
    });

    it('hides textarea when tilleggsopplysninger is nei', () => {
      cy.withinComponent('Har du tilleggsopplysninger som er relevante for søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Har du tilleggsopplysninger som er relevante for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761385?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – HTML only, no required fields
      cy.clickNextStep();

      // Arbeidsgiver
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Postadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0181');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: 'E-post' }).type('test@example.com');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Hovedenhetens organisasjonsnummer' }).type('123456789');
      cy.findByRole('textbox', { name: 'Underenhetens organisasjonsnummer' }).type('987654321');
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
      cy.clickNextStep();

      // Deltaker
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.clickNextStep();

      // Tilskudd til mentor
      cy.findByRole('textbox', { name: 'Tilsagnsnummer' }).type('12345');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Mentor');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Testesen');
      cy.findByRole('textbox', { name: /Mentorperiode fra dato/ }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Mentorperiode sluttdato/ }).type('31.03.2025');
      cy.findByRole('textbox', { name: 'Lønn til mentoroppgaver i perioden' }).type('50000');
      cy.findByLabelText('Prosent feriepenger').type('12');
      cy.findByLabelText('Prosent obligatorisk tjenestepensjon').type('2');
      cy.findByLabelText('Prosent arbeidsgiveravgift').type('14.1');
      cy.withinComponent('Har mentoren fått utbetalt feriepenger i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger – choose nei (no extra textarea needed)
      cy.withinComponent('Har du tilleggsopplysninger som er relevante for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Erklæring
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter å ha gitt NAV riktige og fullstendige opplysninger og at det er betalt ut lønn.',
      }).check();

      // Vedlegg – isAttachmentPanel=true (last panel); navigate via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon på mentors faktiske lønnsutgifter/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/i }).click();
      });

      // One clickNextStep – Vedlegg is the last panel, goes directly to Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Deltaker', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
      });
    });
  });
});
