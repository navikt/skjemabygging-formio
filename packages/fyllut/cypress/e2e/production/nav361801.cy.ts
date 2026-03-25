/*
 * Production form tests for Innsyn i egen sak
 * Form: nav361801
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Innsyn i egen sak (innsynIEgenSak): 3 top-level conditionals on hvaGjelderHenvendelsen
 *       nyttKravOmInnsyn → hvisNyttKravOmInnsyn1 (dato + selectboxes)
 *       innsendingAvMerDokumentasjon → hvisInnsendingAvMerDokumentasjon1
 *       purring → hvisPurring1
 *       + nested conditionals on hvilkenSakBerDuOmInnsynI (arbeid/helse/familieOgBarn/pensjon/hjelpemidler)
 *       + nested annet textarea conditionals within each sak-section
 *   - Vedlegg (vedlegg): 2 cross-panel conditionals from hvaGjelderHenvendelsen
 *       innsendingAvMerDokumentasjon → dokumentasjonForInnsynIEgenSak
 *       !(innsendingAvMerDokumentasjon) → annenDokumentasjon
 *
 * Note on dineOpplysninger (4 customConditionals via row.identitet.*):
 *   In digital mode the identity component (prefillKey=sokerIdentifikasjonsnummer) and
 *   navAddress (prefillKey=sokerAdresser) are read-only because hasPrefill() is true.
 *   These conditionals are therefore not exercisable via UI interaction in digital mode.
 *
 * Note on mode split:
 *   Same-panel conditionals stay in digital mode to preserve logged-in behavior, while
 *   stepper-dependent Vedlegg and summary coverage run in paper mode because
 *   clickShowAllSteps() blanks the page in digital mode.
 */

describe('nav361801', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
  });

  describe('Innsyn i egen sak – hvaGjelderHenvendelsen conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361801/innsynIEgenSak?sub=digital');
      cy.defaultWaits();
    });

    it('shows nyttKravOmInnsyn section only when nyttKravOmInnsyn is selected', () => {
      cy.findByRole('textbox', { name: /Fra hvilken dato/ }).should('not.exist');

      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Nytt krav om innsyn' }).click();
      });
      cy.findByRole('textbox', { name: /Fra hvilken dato/ }).should('exist');

      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Purring' }).click();
      });
      cy.findByRole('textbox', { name: /Fra hvilken dato/ }).should('not.exist');
    });

    it('shows innsendingAvMerDokumentasjon section when innsendingAvMerDokumentasjon is selected', () => {
      cy.findByRole('group', { name: 'Hvilken sak skal du sende inn mer dokumentasjon på?' }).should('not.exist');

      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Innsending av mer dokumentasjon' }).click();
      });
      cy.findByRole('group', { name: 'Hvilken sak skal du sende inn mer dokumentasjon på?' }).should('exist');

      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Nytt krav om innsyn' }).click();
      });
      cy.findByRole('group', { name: 'Hvilken sak skal du sende inn mer dokumentasjon på?' }).should('not.exist');
    });

    it('shows purring section when purring is selected', () => {
      cy.findByRole('group', { name: 'Hvilken sak gjelder purringen?' }).should('not.exist');

      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Purring' }).click();
      });
      cy.findByRole('group', { name: 'Hvilken sak gjelder purringen?' }).should('exist');

      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Innsending av mer dokumentasjon' }).click();
      });
      cy.findByRole('group', { name: 'Hvilken sak gjelder purringen?' }).should('not.exist');
    });

    it('shows arbeid sak-section when arbeid is checked in nyttKravOmInnsyn', () => {
      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Nytt krav om innsyn' }).click();
      });

      cy.findByRole('group', { name: 'Hvilke saker innenfor arbeid ønsker du innsyn i?' }).should('not.exist');

      cy.findByRole('group', { name: 'Hvilken sak ber du om innsyn i?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Arbeid' }).check();
      });
      cy.findByRole('group', { name: 'Hvilke saker innenfor arbeid ønsker du innsyn i?' }).should('exist');

      cy.findByRole('group', { name: 'Hvilken sak ber du om innsyn i?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Arbeid' }).uncheck();
      });
      cy.findByRole('group', { name: 'Hvilke saker innenfor arbeid ønsker du innsyn i?' }).should('not.exist');
    });

    it('shows annet textarea within arbeid section when annet is checked', () => {
      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Nytt krav om innsyn' }).click();
      });
      cy.findByRole('group', { name: 'Hvilken sak ber du om innsyn i?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Arbeid' }).check();
      });

      cy.findByRole('textbox', { name: 'Oppgi hva du ønsker innsyn i' }).should('not.exist');

      cy.findByRole('group', { name: 'Hvilke saker innenfor arbeid ønsker du innsyn i?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet' }).check();
      });
      cy.findByRole('textbox', { name: 'Oppgi hva du ønsker innsyn i' }).should('exist');

      cy.findByRole('group', { name: 'Hvilke saker innenfor arbeid ønsker du innsyn i?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet' }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Oppgi hva du ønsker innsyn i' }).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditionals from hvaGjelderHenvendelsen', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361801/innsynIEgenSak?sub=paper');
      cy.defaultWaits();
    });

    it('shows dokumentasjonForInnsynIEgenSak when innsendingAvMerDokumentasjon is selected', () => {
      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Innsending av mer dokumentasjon' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /^Dokumentasjon til innsyn i egen sak/ }).should('exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('not.exist');
    });

    it('shows annenDokumentasjon when nyttKravOmInnsyn is selected', () => {
      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Nytt krav om innsyn' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /^Dokumentasjon til innsyn i egen sak/ }).should('not.exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });

    it('shows annenDokumentasjon when purring is selected', () => {
      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Purring' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /^Dokumentasjon til innsyn i egen sak/ }).should('not.exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361801?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // landing page → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, proceed
      cy.clickNextStep();

      // Dine opplysninger – use fnr path so adresse and adresseVarighet stay hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Innsyn i egen sak – select nyttKravOmInnsyn and fill required fields
      cy.withinComponent('Hva gjelder henvendelsen?', () => {
        cy.findByRole('radio', { name: 'Nytt krav om innsyn' }).click();
      });
      cy.findByRole('textbox', { name: /Fra hvilken dato/ }).type('01.01.2025');
      cy.findByRole('group', { name: 'Hvilken sak ber du om innsyn i?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Arbeid' }).check();
      });
      cy.findByRole('group', { name: 'Hvilke saker innenfor arbeid ønsker du innsyn i?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Dagpenger' }).check();
      });

      // Vedlegg – isAttachmentPanel=true skips this panel via sequential Next; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Innsyn i egen sak', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva gjelder henvendelsen?');
        cy.get('dd').eq(0).should('contain.text', 'Nytt krav om innsyn');
        cy.get('dd').should('contain.text', 'Arbeid');
        cy.get('dd').should('contain.text', 'Dagpenger');
      });
      cy.withinSummaryGroup('Vedlegg', () => {
        cy.get('dd').should('contain.text', 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved');
      });
    });
  });
});
