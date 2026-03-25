/*
 * Production form tests for Krav om sykepenger – midlertidig ute av inntektsgivende arbeid
 * Form: nav084705
 * Submission type: PAPER
 *
 * Panels:
 *   - Veiledning (veiledning): no conditionals, no required fields
 *   - Dine opplysninger (dineOpplysninger): required fields only
 *   - Arbeidsforhold (arbeidsforhold): 6 same-panel conditionals
 *       harDuNyligBegyntINyttArbeidsforhold → harDuVaertSammenhengende... (1 conditional)
 *       harDuVaertIUtdanningspermisjon... → matteDuAvbryte... (1 conditional)
 *       hvilkeTypeAktivitetHarDuVaertI (selectboxes) → 3 conditional sections
 *   - Andre opplysninger (andreOpplysninger): 3 same-panel conditionals
 *       harDuForsoktASkaffeDegNyttArbeid1 → harDuForsoktASkaffeDegNyttArbeid (textarea)
 *       harDuAvtaleOmNyttArbeid → nyttArbeid (container)
 *       harDuAndreOpplysningerSomErRelevantForSoknaden → andreOpplysninger1 (textarea)
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, annenDokumentasjon attachment
 */

describe('nav084705', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Arbeidsforhold – arbeidsstart conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav084705/arbeidsforhold?sub=paper');
      cy.defaultWaits();
    });

    it('shows sammenhengende arbeid question only when nylig begynt', () => {
      cy.findByRole('group', { name: /sammenhengende i arbeid hos samme arbeidsgiver/i }).should('not.exist');

      cy.withinComponent('Har du nylig begynt i nytt arbeidsforhold?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: /sammenhengende i arbeid hos samme arbeidsgiver/i }).should('exist');

      cy.withinComponent('Har du nylig begynt i nytt arbeidsforhold?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /sammenhengende i arbeid hos samme arbeidsgiver/i }).should('not.exist');
    });

    it('shows utdanningspermisjon follow-up only when utdanningspermisjon under 12 mnd', () => {
      cy.findByRole('group', { name: /avbryte utdanningspermisjonen/i }).should('not.exist');

      cy.withinComponent('Har du vært i utdanningspermisjon i under 12 måneder?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: /avbryte utdanningspermisjonen/i }).should('exist');

      cy.withinComponent('Har du vært i utdanningspermisjon i under 12 måneder?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /avbryte utdanningspermisjonen/i }).should('not.exist');
    });

    it('shows activity-specific sections based on aktivitet checkboxes', () => {
      cy.findByRole('textbox', { name: 'Arbeidsgivers navn' }).should('not.exist');
      cy.findByRole('textbox', { name: /Når opphørte denne virksomheten/i }).should('not.exist');
      cy.findByRole('textbox', { name: 'Beskriv annen aktivitet' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Arbeidstaker / frilanser' }).check();
      cy.findByRole('textbox', { name: 'Arbeidsgivers navn' }).should('exist');

      cy.findByRole('checkbox', { name: 'Arbeidstaker / frilanser' }).uncheck();
      cy.findByRole('textbox', { name: 'Arbeidsgivers navn' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Selvstendig næringsdrivende' }).check();
      cy.findByRole('textbox', { name: /Når opphørte denne virksomheten/i }).should('exist');

      cy.findByRole('checkbox', { name: 'Selvstendig næringsdrivende' }).uncheck();
      cy.findByRole('textbox', { name: /Når opphørte denne virksomheten/i }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Annet' }).check();
      cy.findByRole('textbox', { name: 'Beskriv annen aktivitet' }).should('exist');

      cy.findByRole('checkbox', { name: 'Annet' }).uncheck();
      cy.findByRole('textbox', { name: 'Beskriv annen aktivitet' }).should('not.exist');
    });
  });

  describe('Andre opplysninger – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav084705/andreOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows søkeaktivitet description when forsøkt å skaffe nytt arbeid', () => {
      cy.findByRole('textbox', { name: 'Beskriv hva har du gjort for å skaffe deg nytt arbeid' }).should('not.exist');

      cy.withinComponent('Har du forsøkt å skaffe deg nytt arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv hva har du gjort for å skaffe deg nytt arbeid' }).should('exist');

      cy.withinComponent('Har du forsøkt å skaffe deg nytt arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv hva har du gjort for å skaffe deg nytt arbeid' }).should('not.exist');
    });

    it('shows nytt arbeid details when avtale om nytt arbeid', () => {
      cy.findByRole('textbox', { name: 'Startdato for nytt arbeid (dd.mm.åååå)' }).should('not.exist');

      cy.withinComponent('Har du avtale om nytt arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Startdato for nytt arbeid (dd.mm.åååå)' }).should('exist');

      cy.withinComponent('Har du avtale om nytt arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Startdato for nytt arbeid (dd.mm.åååå)' }).should('not.exist');
    });

    it('shows andre opplysninger textarea when relevant for søknaden', () => {
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('not.exist');

      cy.withinComponent('Har du andre opplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('exist');

      cy.withinComponent('Har du andre opplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav084705?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, advance to Dine opplysninger
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: /Sykmeldt fra dato/i }).type('01.01.2025');
      cy.clickNextStep();

      // Arbeidsforhold – choose paths that minimise required fields
      cy.withinComponent('Har du nylig begynt i nytt arbeidsforhold?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Ble ditt arbeidsforhold avsluttet for under en måned siden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Mottar du etterlønn/sluttvederlag?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du vært i utdanningspermisjon i under 12 måneder?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      // Select arbeidstaker to satisfy required selectboxes and fill datagrid row
      cy.findByRole('checkbox', { name: 'Arbeidstaker / frilanser' }).check();
      cy.findByRole('textbox', { name: 'Arbeidsgivers navn' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Underenhet' }).type('889640782');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).type('01.01.2024');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type('31.12.2024');
      cy.clickNextStep();

      // Andre opplysninger
      cy.findByRole('textbox', { name: /Hvorfor sluttet du/i }).type('Permittering.');
      cy.findByRole('textbox', { name: /Hva har du gjort i den tiden/i }).type('Jobbet freelance.');
      cy.withinComponent('Har du forsøkt å skaffe deg nytt arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du avtale om nytt arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du andre opplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg (isAttachmentPanel=true, last panel – Case A: use stepper, one clickNextStep)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Arbeidsforhold', () => {
        cy.get('dt').eq(0).should('contain.text', 'Har du nylig begynt i nytt arbeidsforhold?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
    });
  });
});
