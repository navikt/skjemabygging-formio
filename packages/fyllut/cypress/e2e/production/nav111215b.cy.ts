/*
 * Production form tests for Tilleggsstønad - støtte til pass av barn
 * Form: nav111215b
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 4 same-panel customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       identitet.harDuFodselsnummer === "ja" → folkeregistrert-adresse alert
 *       adresse.borDuINorge / vegadresseEllerPostboksadresse → adresseVarighet visibility
 *   - Din situasjon (dinSituasjon): 5 same-panel conditionals
 *       mottarDuEllerHarDuNyligSoktOmNoeAvDette → three international follow-up questions
 *       jobberDuIEtAnnetLandEnnNorge / mottarDuPengestotteFraEtAnnetLandEnnNorge2 / planleggerDuAOppholdeDegUtenforNorgeDeNeste12Manedene → follow-up fields
 *   - Arbeidsrettet aktivitet (page8): 1 same-panel conditional
 *       hvilkenArbeidsrettetAktivitetHarDu → warning alert
 *   - Barn (page5): 5 same-panel/datagrid conditionals
 *       jegSokerOmStonadTilPassAvDetteBarnet → child details container
 *       harBarnetFullfortFjerdeSkolear → reasons + info text
 *       hvaErArsakenTilAtBarnetDittTrengerPass → three conditional info alerts
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 4 cross-panel conditional attachments from Barn
 *       hvemPasserBarnet → Faktura fra SFO/AKS/barnehage / Dokumentasjon av utgifter til privat pass
 *       hvaErArsakenTilAtBarnetDittTrengerPass → Dokumentasjon fra tiltakssted eller utdanningssted / Skriftlig uttalelse fra helsepersonell
 */

describe('nav111215b', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111215b/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address fields when the applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('shows the folkeregister alert and hides address fields when the applicant has a Norwegian identity number', () => {
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows address validity fields when the applicant lives outside Norway', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
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

  describe('Din situasjon – international follow-up conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111215b/dinSituasjon?sub=paper');
      cy.defaultWaits();
    });

    it('shows the international follow-up questions for tiltakspenger and hides them for AAP', () => {
      cy.findByLabelText('Jobber du i et annet land enn Norge?').should('not.exist');
      cy.findByLabelText('Mottar du pengestøtte fra et annet land enn Norge?').should('not.exist');
      cy.findByLabelText('Har du oppholdt deg utenfor Norge i løpet av de siste 12 månedene?').should('not.exist');

      cy.findByRole('checkbox', { name: /Tiltakspenger/ }).check();

      cy.findByLabelText('Jobber du i et annet land enn Norge?').should('exist');
      cy.findByLabelText('Mottar du pengestøtte fra et annet land enn Norge?').should('exist');
      cy.findByLabelText('Har du oppholdt deg utenfor Norge i løpet av de siste 12 månedene?').should('exist');

      cy.findByRole('checkbox', { name: /Arbeidsavklaringspenger/ }).check();

      cy.findByLabelText('Jobber du i et annet land enn Norge?').should('not.exist');
      cy.findByLabelText('Mottar du pengestøtte fra et annet land enn Norge?').should('not.exist');
      cy.findByLabelText('Har du oppholdt deg utenfor Norge i løpet av de siste 12 månedene?').should('not.exist');
    });

    it('shows country fields when the follow-up questions are answered yes', () => {
      cy.findByRole('checkbox', { name: /Tiltakspenger/ }).check();
      cy.findByRole('textbox', { name: /Hvilket land jobber du i/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilket land har du oppholdt deg i?' }).should('not.exist');

      cy.withinComponent('Jobber du i et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Hvilket land jobber du i/ }).should('exist');

      cy.withinComponent('Har du oppholdt deg utenfor Norge i løpet av de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilket land har du oppholdt deg i?' }).should('exist');
      cy.findByRole('group', { name: 'Hva gjorde du i dette landet?' }).should('exist');
      cy.findByLabelText('Planlegger du å oppholde deg utenfor Norge de neste 12 månedene?').should('exist');

      cy.withinComponent('Planlegger du å oppholde deg utenfor Norge de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilket land skal du oppholde deg i?' }).should('exist');
      cy.findByRole('group', { name: 'Hva skal du gjøre i dette landet?' }).should('exist');
    });
  });

  describe('Arbeidsrettet aktivitet – warning conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111215b/page8?sub=paper');
      cy.defaultWaits();
    });

    it('shows the warning when the applicant has no work-oriented activity', () => {
      cy.contains('Ingen arbeidsrettet aktivitet?').should('not.exist');

      cy.findByRole('checkbox', { name: 'Har ingen arbeidsrettet aktivitet' }).check();
      cy.contains('Ingen arbeidsrettet aktivitet?').should('exist');

      cy.findByRole('checkbox', { name: 'Har ingen arbeidsrettet aktivitet' }).uncheck();
      cy.contains('Ingen arbeidsrettet aktivitet?').should('not.exist');
    });
  });

  describe('Barn – datagrid conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111215b/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows child support details when the child is included in the application', () => {
      cy.findByLabelText('Hvem passer barnet?').should('not.exist');

      cy.findByRole('checkbox', { name: 'Jeg søker om stønad til pass av dette barnet.' }).click();

      cy.findByLabelText('Hvem passer barnet?').should('exist');
      cy.findByLabelText('Har barnet startet i 5. klasse i perioden du søker for?').should('exist');
    });

    it('shows the fifth-grade reasons when the child has started fifth grade', () => {
      cy.findByRole('checkbox', { name: 'Jeg søker om stønad til pass av dette barnet.' }).click();
      cy.findByLabelText('Hva er årsaken til at barnet ditt trenger pass etter at han har begynt i 5. klasse?').should(
        'not.exist',
      );

      cy.withinComponent('Har barnet startet i 5. klasse i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Som hovedregel gis det bare støtte til pass av barn til og med 4. klasse').should('exist');
      cy.findByLabelText('Hva er årsaken til at barnet ditt trenger pass etter at han har begynt i 5. klasse?').should(
        'exist',
      );
    });

    it('shows the evening-activity information for the evening branch', () => {
      cy.findByRole('checkbox', { name: 'Jeg søker om stønad til pass av dette barnet.' }).click();
      cy.withinComponent('Har barnet startet i 5. klasse i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains(
        'På neste siden vil du bli bedt om å dokumentere med avtale/bekreftelse fra tiltakssted/utdanningssted.',
      ).should('not.exist');

      cy.withinComponent('Hva er årsaken til at barnet ditt trenger pass etter at han har begynt i 5. klasse?', () => {
        cy.findByRole('radio', {
          name: 'Jeg må være borte fra hjemmet på kvelden, natta, i helgen eller mer enn 10 timer per dag',
        }).click();
      });

      cy.contains(
        'På neste siden vil du bli bedt om å dokumentere med avtale/bekreftelse fra tiltakssted/utdanningssted.',
      ).should('exist');
    });

    it('shows the health-personnel information for the care branch', () => {
      cy.findByRole('checkbox', { name: 'Jeg søker om stønad til pass av dette barnet.' }).click();
      cy.withinComponent('Har barnet startet i 5. klasse i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Behovet må dokumenteres med skriftlig uttalelse').should('not.exist');

      cy.withinComponent('Hva er årsaken til at barnet ditt trenger pass etter at han har begynt i 5. klasse?', () => {
        cy.findByRole('radio', {
          name: 'Trenger mer pleie eller tilsyn enn det som er vanlig for jevnaldrende',
        }).click();
      });

      cy.contains('Behovet må dokumenteres med skriftlig uttalelse').should('exist');
    });
  });

  describe('Vedlegg – conditional attachments from Barn', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111215b/page5?sub=paper');
      cy.defaultWaits();
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Barn');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Testesen');
      cy.findAllByRole('textbox', { name: /fødselsnummer/i })
        .first()
        .type('17912099997');
      cy.findByRole('checkbox', { name: 'Jeg søker om stønad til pass av dette barnet.' }).click();
    });

    it('shows the SFO attachment for the SFO childcare path', () => {
      cy.withinComponent('Hvem passer barnet?', () => {
        cy.findByRole('radio', {
          name: 'Barnehage, skolefritidsordning (SFO) eller aktivitetsskole (AKS)',
        }).click();
      });
      cy.withinComponent('Har barnet startet i 5. klasse i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Faktura fra SFO\/AKS\/barnehage/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av utgifter til privat pass/ }).should('not.exist');
    });

    it('shows the private childcare attachment for the private-pass path', () => {
      cy.withinComponent('Hvem passer barnet?', () => {
        cy.findByRole('radio', { name: 'Dagmamma, praktikant eller annen privat ordning' }).click();
      });
      cy.withinComponent('Har barnet startet i 5. klasse i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av utgifter til privat pass/ }).should('exist');
      cy.findByRole('group', { name: /Faktura fra SFO\/AKS\/barnehage/ }).should('not.exist');
    });

    it('shows the activity documentation attachment for the evening branch', () => {
      cy.withinComponent('Hvem passer barnet?', () => {
        cy.findByRole('radio', { name: 'Dagmamma, praktikant eller annen privat ordning' }).click();
      });
      cy.withinComponent('Har barnet startet i 5. klasse i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hva er årsaken til at barnet ditt trenger pass etter at han har begynt i 5. klasse?', () => {
        cy.findByRole('radio', {
          name: 'Jeg må være borte fra hjemmet på kvelden, natta, i helgen eller mer enn 10 timer per dag',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon fra tiltakssted eller utdanningssted/ }).should('exist');
      cy.findByRole('group', { name: /Skriftlig uttalelse fra helsepersonell/ }).should('not.exist');
    });

    it('shows the health-personnel attachment for the care branch', () => {
      cy.withinComponent('Hvem passer barnet?', () => {
        cy.findByRole('radio', {
          name: 'Barnehage, skolefritidsordning (SFO) eller aktivitetsskole (AKS)',
        }).click();
      });
      cy.withinComponent('Har barnet startet i 5. klasse i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hva er årsaken til at barnet ditt trenger pass etter at han har begynt i 5. klasse?', () => {
        cy.findByRole('radio', {
          name: 'Trenger mer pleie eller tilsyn enn det som er vanlig for jevnaldrende',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Skriftlig uttalelse fra helsepersonell/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon fra tiltakssted eller utdanningssted/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111215b?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Om søknaden
      cy.findByRole('checkbox', {
        name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/,
      }).click();
      cy.clickNextStep();

      // Dine opplysninger – Norwegian identity path keeps address fields hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Din situasjon – choose a path without extra international follow-ups
      cy.findByRole('checkbox', { name: /Arbeidsavklaringspenger/ }).check();
      cy.clickNextStep();

      // Arbeidsrettet aktivitet
      cy.findByRole('checkbox', { name: 'Jeg er arbeidssøker' }).check();
      cy.clickNextStep();

      // Periode
      cy.findByLabelText('Startdato (dd.mm.åååå)').type('01.01.2026');
      cy.findByLabelText('Sluttdato (dd.mm.åååå)').type('31.01.2026');
      cy.clickNextStep();

      // Barn – SFO path, no fifth-grade exception reason needed
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Kari');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Nordmann');
      cy.findAllByRole('textbox', { name: /fødselsnummer/i })
        .first()
        .type('17912099997');
      cy.findByRole('checkbox', { name: 'Jeg søker om stønad til pass av dette barnet.' }).click();
      cy.withinComponent('Hvem passer barnet?', () => {
        cy.findByRole('radio', {
          name: 'Barnehage, skolefritidsordning (SFO) eller aktivitetsskole (AKS)',
        }).click();
      });
      cy.withinComponent('Har barnet startet i 5. klasse i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg – last panel, then one clickNextStep to summary
      cy.findByRole('group', { name: /Faktura fra SFO\/AKS\/barnehage/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.get('dt').eq(0).should('contain.text', 'Mottar du eller har du nylig søkt om noe av dette?');
        cy.get('dd').eq(0).should('contain.text', 'Arbeidsavklaringspenger (AAP)');
      });
      cy.contains('Kari').should('exist');
      cy.contains('Barnehage, skolefritidsordning (SFO) eller aktivitetsskole (AKS)').should('exist');
    });
  });
});
