/*
 * Production form tests for Tilleggsstønad - støtte til læremidler
 * Form: nav111216b
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 3 same-panel customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       identitet.harDuFodselsnummer === "ja" → folkeregister alert
 *       adresse.borDuINorge / vegadresseEllerPostboksadresse → adresseVarighet visibility
 *   - Din situasjon (dinSituasjon): 5 same-panel conditionals
 *       mottarDuEllerHarDuNyligSoktOmNoeAvDette → three international follow-up questions
 *       jobberDuIEtAnnetLandEnnNorge / mottarDuPengestotteFraEtAnnetLandEnnNorge1 /
 *       harDuOppholdtDegUtenforNorgeILopetAvDeSiste12Manedene /
 *       planleggerDuAOppholdeDegUtenforNorgeDeNeste12Manedene1 → country/selectboxes follow-ups
 *   - Utdanning og opplæring (page5): 5 same-panel conditionals
 *       hvaSlagsUtdanningEllerOpplaeringSkalDuTa → ikke-utdanning alert / lærling question
 *       erDuLaerlingLaerekandidatPraksisbrevkandidatEllerKandidatForFagbrevPaJobb → tidligere fullført vgs
 *       harDuTidligereFullfortVideregaendeSkole → utstyrsstipend alert
 *       harDuEnFunksjonshemningSomGirDegStorreUtgifterTilLaeremidler → vedleggsalert
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 2 cross-panel conditional attachments from page5
 *       harDuEnFunksjonshemningSomGirDegStorreUtgifterTilLaeremidler
 *       → dokumentasjonAvFunksjonshemningenDin
 *       → dokumentasjonAvSaerligStoreUtgifterPaGrunnAvFunksjonshemning
 */

describe('nav111216b', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111216b/personopplysninger?sub=paper');
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
      cy.visit('/fyllut/nav111216b/dinSituasjon?sub=paper');
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

    it('shows country and activity fields when the follow-up questions are answered yes', () => {
      cy.findByRole('checkbox', { name: /Tiltakspenger/ }).check();
      cy.findByRole('textbox', { name: /Hvilket land jobber du i/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Hvilket land mottar du pengestøtte fra/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilket land har du oppholdt deg i?' }).should('not.exist');

      cy.withinComponent('Jobber du i et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Hvilket land jobber du i/ }).should('exist');

      cy.withinComponent('Mottar du pengestøtte fra et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Hvilket land mottar du pengestøtte fra/ }).should('exist');

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

  describe('Utdanning og opplæring – study conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111216b/page5?sub=paper');
      cy.defaultWaits();
    });

    it('toggles the no-education alert and the videregående question based on education type', () => {
      cy.contains('Hvis du ikke gjennomfører utdanning').should('not.exist');
      cy.findByLabelText('Er du lærling, lærekandidat, praksisbrevkandidat eller kandidat for fagbrev på jobb?').should(
        'not.exist',
      );

      cy.withinComponent('Hva slags utdanning eller opplæring skal du ta?', () => {
        cy.findByRole('radio', { name: 'Jeg skal ikke ta utdanning eller opplæring' }).click();
      });

      cy.contains('Hvis du ikke gjennomfører utdanning').should('exist');

      cy.withinComponent('Hva slags utdanning eller opplæring skal du ta?', () => {
        cy.findByRole('radio', { name: 'Videregående utdanning' }).click();
      });

      cy.contains('Hvis du ikke gjennomfører utdanning').should('not.exist');
      cy.findByLabelText('Er du lærling, lærekandidat, praksisbrevkandidat eller kandidat for fagbrev på jobb?').should(
        'exist',
      );
    });

    it('shows the prior-school question and warning for the non-apprentice branch', () => {
      cy.findByLabelText('Har du tidligere fullført videregående skole?').should('not.exist');
      cy.contains('utstyrsstipend fra lånekassa').should('not.exist');

      cy.withinComponent('Hva slags utdanning eller opplæring skal du ta?', () => {
        cy.findByRole('radio', { name: 'Videregående utdanning' }).click();
      });
      cy.withinComponent('Er du lærling, lærekandidat, praksisbrevkandidat eller kandidat for fagbrev på jobb?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Har du tidligere fullført videregående skole?').should('exist');

      cy.withinComponent('Har du tidligere fullført videregående skole?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.contains('utstyrsstipend fra lånekassa').should('exist');
    });
  });

  describe('Vedlegg – conditional attachments from Utdanning og opplæring', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111216b/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows the attachment instructions and both attachments for the funksjonsnedsettelse branch', () => {
      cy.contains('Du må legge ved:').should('not.exist');

      cy.withinComponent('Har du særlig store utgifter til læremidler på grunn av en funksjonsnedsettelse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Du må legge ved:').should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av funksjonshemningen din|Medisinsk dokumentasjon/ }).should(
        'exist',
      );
      cy.findByRole('group', { name: /Dokumentasjon av særlig store utgifter/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111216b?sub=paper');
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

      // Utdanning og opplæring – choose a path without attachment requirements
      cy.withinComponent('Hva slags utdanning eller opplæring skal du ta?', () => {
        cy.findByRole('radio', { name: 'Kurs eller lignende' }).click();
      });
      cy.withinComponent('Har du særlig store utgifter til læremidler på grunn av en funksjonsnedsettelse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
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
      cy.withinSummaryGroup('Utdanning og opplæring', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva slags utdanning eller opplæring skal du ta?');
        cy.get('dd').eq(0).should('contain.text', 'Kurs eller lignende');
      });
    });
  });
});
