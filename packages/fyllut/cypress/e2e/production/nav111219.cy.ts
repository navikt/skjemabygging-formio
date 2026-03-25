/*
 * Production form tests for Pengestøtte til bolig eller overnatting
 * Form: nav111219
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Personalia (personopplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       adresse.borDuINorge → adresseVarighet visibility
 *   - Din situasjon (dinSituasjonPanel): 5 same-panel conditionals
 *       hovedytelse → harNedsattArbeidsevne
 *       jobberIAnnetLand → jobbAnnetLand
 *       harPengestotteAnnetLand → pengestotteAnnetLand
 *       harOppholdUtenforNorgeSiste12mnd → previous-stay container + next-12-month question
 *       harOppholdUtenforNorgeNeste12mnd → future-stay container
 *   - Arbeidsrettet aktivitet (arbeidsrettetAktivitetPanel, digital): 4 same-panel conditionals
 *       aktiviteterOgMaalgruppe.aktivitet → arbeidsrettetAktivitet
 *       arbeidsrettetAktivitet → no-activity alert / mottarLonnGjennomTiltak
 *       mottarLonnGjennomTiltak → salary alert
 *   - Bolig eller overnatting (boligEllerOvernattingPanel): 4 same-panel conditionals
 *       typeUtgifter → fasteUtgifter / samling branches
 *       harUtgifterTilBoligToSteder → utgifterFlereSteder / utgifterNyBolig
 *       utgifterNyBolig.delerBoutgifter → andelUtgifterBolig
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 3 cross-panel attachment conditionals
 *       typeUtgifter=midlertidigUtgift → temporary-expense attachments
 *       typeUtgifter=fastUtgift → housing attachments
 *       harSaerligStoreUtgifterPaGrunnAvFunksjonsnedsettelse → health attachment
 */

const selectHasNorwegianIdentityNumber = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectExpenseType = (
  answer:
    | 'Faste utgifter til bolig ved aktivitetssted'
    | 'Utgifter til overnatting i forbindelse med studiesamling, kortvarig kurs, eksamen eller opptaksprøve',
) => {
  cy.withinComponent('Hva slags utgifter søker du om å få støtte til?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const visitWithFreshState = (url: string) => {
  cy.clearCookies();
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.defaultWaits();
};

describe('nav111219', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Personalia conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav111219/personopplysninger?sub=paper');
    });

    it('toggles address fields and the folkeregister alert when the identity answer changes', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );

      selectHasNorwegianIdentityNumber('Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectHasNorwegianIdentityNumber('Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should('exist');
    });

    it('shows address validity fields when the applicant lives outside Norway', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectHasNorwegianIdentityNumber('Nei');
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Din situasjon conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav111219/dinSituasjonPanel?sub=paper');
    });

    it('shows reduced work ability only for the relevant benefit combinations', () => {
      cy.findByLabelText('Har du nedsatt arbeidsevne på grunn av sykdom, skade eller medfødt tilstand?').should(
        'not.exist',
      );

      cy.findByRole('group', { name: /Mottar du eller har du nylig søkt om noe av dette/ }).within(() => {
        cy.findByRole('checkbox', { name: /Tiltakspenger/ }).check();
      });
      cy.findByLabelText('Har du nedsatt arbeidsevne på grunn av sykdom, skade eller medfødt tilstand?').should(
        'exist',
      );

      cy.findByRole('group', { name: /Mottar du eller har du nylig søkt om noe av dette/ }).within(() => {
        cy.findByRole('checkbox', { name: /Arbeidsavklaringspenger/ }).check();
      });
      cy.findByLabelText('Har du nedsatt arbeidsevne på grunn av sykdom, skade eller medfødt tilstand?').should(
        'not.exist',
      );
    });

    it('toggles the foreign work and foreign support country fields', () => {
      cy.findByRole('group', { name: /Mottar du eller har du nylig søkt om noe av dette/ }).within(() => {
        cy.findByRole('checkbox', { name: /Tiltakspenger/ }).check();
      });

      cy.findByLabelText('Jobber du i et annet land enn Norge?').should('exist');
      cy.findByRole('combobox', { name: 'Hvilket land jobber du i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land mottar du pengestøtte fra?' }).should('not.exist');

      cy.withinComponent('Jobber du i et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land jobber du i?' }).should('exist');

      cy.findByRole('group', { name: /Mottar du pengestøtte fra et annet land enn Norge/ }).within(() => {
        cy.findByRole('checkbox', { name: /Sykepenger/ }).check();
      });
      cy.findByRole('combobox', { name: 'Hvilket land mottar du pengestøtte fra?' }).should('exist');

      cy.findByRole('group', { name: /Mottar du pengestøtte fra et annet land enn Norge/ }).within(() => {
        cy.findByRole('checkbox', { name: /Sykepenger/ }).uncheck();
      });
      cy.findByRole('combobox', { name: 'Hvilket land mottar du pengestøtte fra?' }).should('not.exist');
    });

    it('shows stay details for past and future stays outside Norway', () => {
      cy.findByRole('group', { name: /Mottar du eller har du nylig søkt om noe av dette/ }).within(() => {
        cy.findByRole('checkbox', { name: /Tiltakspenger/ }).check();
      });

      cy.findByLabelText('Har du oppholdt deg utenfor Norge i løpet av de siste 12 månedene?').should('exist');
      cy.findByRole('combobox', { name: 'Hvilket land har du oppholdt deg i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land skal du oppholde deg i?' }).should('not.exist');

      cy.withinComponent('Har du oppholdt deg utenfor Norge i løpet av de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land har du oppholdt deg i?' }).should('exist');
      cy.findByLabelText('Planlegger du å oppholde deg utenfor Norge de neste 12 månedene?').should('exist');

      cy.withinComponent('Planlegger du å oppholde deg utenfor Norge de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du oppholde deg i?' }).should('exist');

      cy.withinComponent('Planlegger du å oppholde deg utenfor Norge de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du oppholde deg i?' }).should('not.exist');
    });
  });

  describe('Arbeidsrettet aktivitet conditionals (digital)', () => {
    beforeEach(() => {
      cy.defaultInterceptsMellomlagring();
      visitWithFreshState('/fyllut/nav111219/arbeidsrettetAktivitetPanel?sub=digital');
      cy.wait('@getActivities');
    });

    it('shows the arbeidsrettetAktivitet follow-up and no-activity alert for the default activity option', () => {
      cy.findByLabelText('Hvilken arbeidsrettet aktivitet har du?').should('not.exist');

      cy.findByLabelText('Ingen relevant aktivitet registrert på meg').click({ force: true });
      cy.findByLabelText('Hvilken arbeidsrettet aktivitet har du?').should('exist');

      cy.withinComponent('Hvilken arbeidsrettet aktivitet har du?', () => {
        cy.findByRole('radio', { name: 'Har ingen arbeidsrettet aktivitet' }).click();
      });
      cy.contains('Ingen arbeidsrettet aktivitet?').should('exist');
    });

    it('shows salary follow-up and alert for the tiltak path', () => {
      cy.findByLabelText('Mottar du lønn gjennom et tiltak?').should('not.exist');

      cy.findByLabelText('Ingen relevant aktivitet registrert på meg').click({ force: true });
      cy.withinComponent('Hvilken arbeidsrettet aktivitet har du?', () => {
        cy.findByRole('radio', { name: 'Tiltak / arbeidsrettet utredning' }).click();
      });
      cy.findByLabelText('Mottar du lønn gjennom et tiltak?').should('exist');

      cy.withinComponent('Mottar du lønn gjennom et tiltak?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Hvis du mottar lønn i tiltaket kan du fortsatt søke, men det kan hende du får avslag.').should(
        'exist',
      );
    });
  });

  describe('Bolig eller overnatting conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav111219/boligEllerOvernattingPanel?sub=paper');
    });

    it('switches between the fast housing and temporary lodging branches', () => {
      cy.findByLabelText('Har du utgifter til bolig både på hjemstedet ditt og aktivitetsstedet?').should('not.exist');
      cy.findByLabelText('Fra og med (dd.mm.åååå)').should('not.exist');

      selectExpenseType('Faste utgifter til bolig ved aktivitetssted');
      cy.findByLabelText('Har du utgifter til bolig både på hjemstedet ditt og aktivitetsstedet?').should('exist');
      cy.findByLabelText('Fra og med (dd.mm.åååå)').should('not.exist');

      selectExpenseType(
        'Utgifter til overnatting i forbindelse med studiesamling, kortvarig kurs, eksamen eller opptaksprøve',
      );
      cy.findByLabelText('Har du utgifter til bolig både på hjemstedet ditt og aktivitetsstedet?').should('not.exist');
      cy.findByLabelText('Fra og med (dd.mm.åååå)').should('exist');
    });

    it('shows the shared housing amount only when a new housing branch is shared', () => {
      selectExpenseType('Faste utgifter til bolig ved aktivitetssted');
      cy.findByLabelText('Hvor mye er din andel (i kroner) av de månedlige utgiftene til bolig?').should('not.exist');

      cy.withinComponent('Har du utgifter til bolig både på hjemstedet ditt og aktivitetsstedet?', () => {
        cy.findByRole('radio', { name: 'Nei, jeg har utgift til bolig bare ved aktivitetsstedet' }).click();
      });
      cy.findByLabelText('Deler du utgiftene til boligen på aktivitetsstedet med andre?').should('exist');

      cy.withinComponent('Deler du utgiftene til boligen på aktivitetsstedet med andre?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hvor mye er din andel (i kroner) av de månedlige utgiftene til bolig?').should('exist');

      cy.withinComponent('Deler du utgiftene til boligen på aktivitetsstedet med andre?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hvor mye er din andel (i kroner) av de månedlige utgiftene til bolig?').should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the temporary lodging attachments for the temporary expense path', () => {
      visitWithFreshState('/fyllut/nav111219/boligEllerOvernattingPanel?sub=paper');

      selectExpenseType(
        'Utgifter til overnatting i forbindelse med studiesamling, kortvarig kurs, eksamen eller opptaksprøve',
      );

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon på utgifter til overnatting/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på samlinger, kurs, eksamen eller opptaksprøve/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av utgifter til boligen på nåværende\/tidligere hjemsted/ }).should(
        'not.exist',
      );
    });

    it('shows the medical attachment when tailored housing is needed', () => {
      visitWithFreshState('/fyllut/nav111219/boligEllerOvernattingPanel?sub=paper');

      selectExpenseType('Faste utgifter til bolig ved aktivitetssted');
      cy.withinComponent('Trenger du tilpasset bolig på grunn av fysiske eller psykiske helseutfordringer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Uttalelse fra helsepersonell/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav111219?sub=paper');
    });

    it('fills required fields and verifies summary', () => {
      // Om søknaden
      cy.clickNextStep();
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      // Personalia
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectHasNorwegianIdentityNumber('Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Din situasjon
      cy.findByRole('group', { name: /Mottar du eller har du nylig søkt om noe av dette/ }).within(() => {
        cy.findByRole('checkbox', { name: /Arbeidsavklaringspenger/ }).check();
      });
      cy.findByLabelText('Har du nedsatt arbeidsevne på grunn av sykdom, skade eller medfødt tilstand?').should(
        'not.exist',
      );
      cy.clickNextStep();

      // Arbeidsrettet aktivitet (paper mode has no visible required follow-ups)
      cy.clickNextStep();

      // Bolig eller overnatting
      selectExpenseType('Faste utgifter til bolig ved aktivitetssted');
      cy.withinComponent('Har du utgifter til bolig både på hjemstedet ditt og aktivitetsstedet?', () => {
        cy.findByRole('radio', { name: 'Nei, jeg har utgift til bolig bare ved aktivitetsstedet' }).click();
      });
      cy.withinComponent('Deler du utgiftene til boligen på aktivitetsstedet med andre?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du høyere utgifter til bolig på ditt nye bosted?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(/Mottar du eller har du søkt om bostøtte\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Trenger du tilpasset bolig på grunn av fysiske eller psykiske helseutfordringer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Dokumentasjon av utgifter til boligen på nåværende\/tidligere hjemsted/ }).within(
        () => {
          cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
        },
      );
      cy.findByRole('group', { name: /Dokumentasjon av utgifter til ny bolig/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personalia', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Bolig eller overnatting', () => {
        cy.get('dd').should('contain.text', 'Faste utgifter til bolig ved aktivitetssted');
      });
    });
  });
});
