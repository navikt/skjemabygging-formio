/*
 * Production form tests for Enslig mor eller far som er arbeidssøker
 * Form: nav150801
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 conditionals
 *       identitet.harDuFodselsnummer → adresse visibility (customConditional row.X)
 *       blirDuRepresentertAvEnVerge → vergeopplysninger (simple conditional)
 *   - Spørsmål (sporsmal): 1 same-panel + 1 cross-panel conditional
 *       erDuVilligTilATaImotTilbud → erDetHelsemessigeArsaker (same-panel)
 *       erDetHelsemessigeArsaker → legeattest in Vedlegg (cross-panel)
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, conditional legeattest from Spørsmål
 *       annenDokumentasjon: always visible (attachmentValues: nei, leggerVedNaa)
 *       legeattest: conditional (attachmentValues: ettersender, leggerVedNaa, levertTidligere)
 */

describe('nav150801', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity and verge conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav150801/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse section when user has fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows vergeopplysninger when representert av verge', () => {
      cy.findByRole('textbox', { name: 'Vergens fornavn' }).should('not.exist');

      cy.withinComponent('Blir du representert av en verge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Vergens fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Vergens etternavn' }).should('exist');
    });

    it('hides vergeopplysninger when not representert av verge', () => {
      cy.withinComponent('Blir du representert av en verge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Vergens fornavn' }).should('not.exist');
    });
  });

  describe('Spørsmål – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav150801/sporsmal?sub=paper');
      cy.defaultWaits();
    });

    it('shows helsemessige årsaker question when not willing to work', () => {
      cy.findByLabelText(
        'Er det helsemessige årsaker til at du ikke er villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?',
      ).should('not.exist');

      cy.withinComponent('Er du villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText(
        'Er det helsemessige årsaker til at du ikke er villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?',
      ).should('exist');
    });

    it('hides helsemessige årsaker question when willing to work', () => {
      cy.withinComponent('Er du villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText(
        'Er det helsemessige årsaker til at du ikke er villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?',
      ).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditional legeattest from Spørsmål', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav150801/sporsmal?sub=paper');
      cy.defaultWaits();
    });

    it('shows legeattest in Vedlegg when health reasons given', () => {
      cy.withinComponent('Er du villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(
        'Er det helsemessige årsaker til at du ikke er villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Legeattest/ }).should('exist');
    });

    it('hides legeattest in Vedlegg when willing to work', () => {
      cy.withinComponent('Er du villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Legeattest/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav150801?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse hidden when harDuFodselsnummer = ja)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Blir du representert av en verge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Spørsmål – choose Ja for all (erDetHelsemessige stays hidden, legeattest stays hidden in Vedlegg)
      cy.withinComponent('Er du villig til å ta imot tilbud om arbeid eller arbeidsmarkedstiltak?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Kan du begynne i arbeid senest én uke etter at du har fått tilbud?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(
        'Ønsker du kun å søke arbeid i bodistriktet ditt og godtar du en times reisevei mellom hjem og arbeidssted?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Ønsker du å søke arbeid hvor som helst i landet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Ønsker du å stå som arbeidssøker til minst 50% stilling?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      // Vedlegg – isAttachmentPanel=true; sequential Next skips it. Navigate via stepper.
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      // legeattest is hidden (erDetHelsemessige not triggered); only annenDokumentasjon is shown
      // annenDokumentasjon has attachmentValues: nei, leggerVedNaa (no ettersender)
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // Erklæring – navigate via stepper (still expanded)
      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', { name: /Jeg har gjort meg kjent med vilkårene/ }).click();
      cy.findByRole('checkbox', { name: /Jeg er kjent med at jeg må legge ved dokumentasjon/ }).click();
      cy.findByRole('checkbox', { name: /Jeg er kjent med at mangelfulle/ }).click();

      // Two clickNextStep: wizard reinserts the Vedlegg step, then advances to Oppsummering
      cy.clickNextStep(); // Erklæring → Vedlegg (reinserted attachment panel)
      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Spørsmål', () => {
        cy.get('dt').eq(0).should('contain.text', 'Er du villig til å ta imot tilbud om arbeid');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
