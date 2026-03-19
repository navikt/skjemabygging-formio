/*
 * Production form tests for Søknad om servicehund
 * Form: nav100754
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Veiledning (veiledning): 1 same-panel conditional
 *       harDuHattServicehundTidligere → erfaringMedServicehund (2 required textareas)
 *   - Dine opplysninger (dineOpplysninger): 1 customConditional
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Bolig og arbeid (boligOgArbeid): 2 chained same-panel conditionals
 *       erDuIArbeidEllerUnderUtdanning → skalDuHaMedHundenPaArbeidsplassenUtdanningsstedet
 *       skalDuHaMedHundenPaArbeidsplassenUtdanningsstedet → hvaErArsakenTilAtHundenIkkeSkalVaereMed1
 *   - Behov (behov): 2 same-panel conditionals
 *       mottarDuKommunaleTjenester → hvilkeKommunaleTjenesterMottarDu
 *       farDuHjelpAvAndreEnnKommunen → hvemFarDuHjelpAv...
 *   - Andre opplysninger (andreOpplysninger): 1 same-panel conditional
 *       harDuAndreDyr → hvilkeDyrHarDu
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, 3 attachment fields
 */

describe('nav100754', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Veiledning – servicehund erfaring conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100754/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows erfaring fields only when harDuHattServicehundTidligere is ja', () => {
      cy.findByRole('textbox', { name: 'Når hadde du servicehund?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilken nytte hadde du av servicehunden?' }).should('not.exist');

      cy.withinComponent('Har du hatt servicehund tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Når hadde du servicehund?' }).should('exist');
      cy.findByRole('textbox', { name: 'Hvilken nytte hadde du av servicehunden?' }).should('exist');

      cy.withinComponent('Har du hatt servicehund tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Når hadde du servicehund?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilken nytte hadde du av servicehunden?' }).should('not.exist');
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100754/dineOpplysninger?sub=paper');
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
  });

  describe('Bolig og arbeid – arbeid conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100754/boligOgArbeid?sub=paper');
      cy.defaultWaits();
    });

    it('shows hund-på-jobb question only when in arbeid or utdanning', () => {
      cy.findByLabelText('Skal du ha med hunden på arbeidsplassen / utdanningsstedet?').should('not.exist');

      cy.withinComponent('Er du i arbeid eller under utdanning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Skal du ha med hunden på arbeidsplassen / utdanningsstedet?').should('exist');

      cy.withinComponent('Er du i arbeid eller under utdanning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Skal du ha med hunden på arbeidsplassen / utdanningsstedet?').should('not.exist');
    });

    it('shows årsak field when hund will not be brought to work', () => {
      cy.withinComponent('Er du i arbeid eller under utdanning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Hva er årsaken til at hunden ikke skal være med?' }).should('not.exist');

      cy.withinComponent('Skal du ha med hunden på arbeidsplassen / utdanningsstedet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Hva er årsaken til at hunden ikke skal være med?' }).should('exist');

      cy.withinComponent('Skal du ha med hunden på arbeidsplassen / utdanningsstedet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Hva er årsaken til at hunden ikke skal være med?' }).should('not.exist');
    });
  });

  describe('Behov – kommunale tjenester og hjelp conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100754/behov?sub=paper');
      cy.defaultWaits();
    });

    it('shows kommunale tjenester field when mottarDuKommunaleTjenester is ja', () => {
      cy.findByRole('textbox', { name: 'Hvilke kommunale tjenester mottar du?' }).should('not.exist');

      cy.withinComponent(
        'Mottar du kommunale tjenester, som for eksempel personlig assistent eller hjemmehjelp?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Hvilke kommunale tjenester mottar du?' }).should('exist');

      cy.withinComponent(
        'Mottar du kommunale tjenester, som for eksempel personlig assistent eller hjemmehjelp?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Hvilke kommunale tjenester mottar du?' }).should('not.exist');
    });

    it('shows hjelp detail field when farDuHjelpAvAndreEnnKommunen is ja', () => {
      cy.findByRole('textbox', { name: /Hvem får du hjelp av/ }).should('not.exist');

      cy.withinComponent('Får du hjelp av andre enn kommunen til praktiske gjøremål?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Hvem får du hjelp av/ }).should('exist');

      cy.withinComponent('Får du hjelp av andre enn kommunen til praktiske gjøremål?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Hvem får du hjelp av/ }).should('not.exist');
    });
  });

  describe('Andre opplysninger – andre dyr conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100754/andreOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows hvilke dyr field only when harDuAndreDyr is ja', () => {
      cy.findByRole('textbox', { name: 'Hvilke dyr har du?' }).should('not.exist');

      cy.withinComponent('Har du andre dyr?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvilke dyr har du?' }).should('exist');

      cy.withinComponent('Har du andre dyr?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvilke dyr har du?' }).should('not.exist');
    });
  });

  describe('Vedlegg – attachment fields', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100754/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows legeerklaering and uttalelse attachments with ettersender option, annenDokumentasjon without', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Legeerklæring/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).should('exist');
        cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).should('exist');
      });

      cy.findByRole('group', { name: /Uttalelse fra fagpersonell/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).should('exist');
        cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).should('exist');
      });

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).should('not.exist');
        cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).should('exist');
      });
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100754?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning – check required declaration, select no prior service dog
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.withinComponent('Har du hatt servicehund tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Dine opplysninger – use fnr path so adresse/adresseVarighet stay hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Bolig og arbeid – not in arbeid/utdanning to avoid filling conditional chain
      cy.withinComponent('Har du avklart at du kan ha hund der du bor?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du mulighet til å lufte hunden under trygge forhold?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er du i arbeid eller under utdanning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Behov – select Nei for conditional triggers to skip extra required textareas
      cy.findByRole('textbox', { name: 'Hvilke oppgaver har du vanskelig for å utføre uten hjelp?' }).type(
        'Trenger hjelp til daglige gjøremål.',
      );
      cy.withinComponent(
        'Mottar du kommunale tjenester, som for eksempel personlig assistent eller hjemmehjelp?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Får du hjelp av andre enn kommunen til praktiske gjøremål?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Hva vil du at hunden skal hjelpe deg med?' }).type(
        'Hjelp med praktiske gjøremål.',
      );
      cy.withinComponent('Ønsker du å søke om grunnstønad til hold av servicehund?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Andre opplysninger – select Nei for andre dyr to skip conditional textarea
      cy.withinComponent(
        'Har du mulighet for å delta på et to ukers obligatorisk treningskurs på en hundeskole?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Har du familie eller venner som kan hjelpe deg med å ta vare på hunden om nødvendig?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er det noen i nære omgivelser som er allergiske mot hund?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du andre dyr?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true is skipped by sequential clickNextStep; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Legeerklæring/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Uttalelse fra fagpersonell/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Veiledning', () => {
        // eq(0) is the checkbox; eq(1) is the radiopanel
        cy.get('dt').eq(1).should('contain.text', 'Har du hatt servicehund tidligere?');
        cy.get('dd').eq(1).should('contain.text', 'Nei');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
