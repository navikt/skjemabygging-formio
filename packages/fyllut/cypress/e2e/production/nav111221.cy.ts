/*
 * Production form tests for Pengestøtte til daglige reiser
 * Form: nav111221
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Personalia (personopplysninger): 3 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       identitet.harDuFodselsnummer=ja → folkeregister alert
 *       adresse.borDuINorge → adresseVarighet visibility
 *   - Din situasjon (dinSituasjonPanel): 5 same-panel conditionals
 *       hovedytelse → alert + arbeidOgOpphold container
 *       jobberIAnnetLand → jobbAnnetLand
 *       harPengestotteAnnetLand → pengestotteAnnetLand
 *       harOppholdUtenforNorgeSiste12mnd → previous-stay container + next-12-month question
 *       harOppholdUtenforNorgeNeste12mnd → future-stay container
 *   - Arbeidsrettet aktivitet (arbeidsrettetAktivitet): 3 same-panel conditionals
 *       arbeidsrettetAktivitet → no-activity alert / type question
 *       garDuPaVideregaendeEllerGrunnskole=videregaendeSkole → learner follow-up
 *       garDuPaVideregaendeEllerGrunnskole=opplaeringForVoksne → school-transport alert
 *   - Dine reiser (dinReise): grouped travel conditionals in the first datagrid row
 *       harDu6KmReisevei → medical-transport question
 *       kanDuReiseMedOffentligTransport=yes → ticket-type fields
 *       kanDuReiseMedOffentligTransport=no → nav111221b redirect guidance
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): cross-panel attachment coverage for the reachable short-distance medical branch
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const selectHasNorwegianIdentityNumber = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const chooseMainBenefit = (answer: RegExp) => {
  cy.contains('legend', /Mottar du eller har du nylig søkt om noe av dette/)
    .closest('fieldset')
    .within(() => {
      cy.findByRole('checkbox', { name: answer }).check();
    });
};

const chooseForeignSupport = (answer: RegExp) => {
  cy.findByRole('group', { name: /Mottar du pengestøtte fra et annet land enn Norge/ }).within(() => {
    cy.findByRole('checkbox', { name: answer }).check();
  });
};

const fillTravelBaseRow = () => {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 14);

  cy.findByRole('textbox', { name: 'Gateadresse til oppmøtestedet' }).type('Testgata 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).first().type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).first().type('Oslo');
  cy.findByRole('textbox', { name: 'Fra og med (dd.mm.åååå)' }).type(formatDate(start));
  cy.findByRole('textbox', { name: 'Til og med (dd.mm.åååå)' }).type(formatDate(end));
  cy.findByRole('combobox', { name: /Hvor mange dager i uken skal du reise hit/ }).click();
  cy.findByRole('option', { name: '5' }).click();
};

const chooseDistance = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Er reiseavstanden mellom der du bor og aktivitetsstedet 6 kilometer eller mer én vei?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const choosePublicTransport = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Kan du reise med offentlig transport hele veien?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const goToVedleggFromTravel = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

describe('nav111221', () => {
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
      cy.visit('/fyllut/nav111221/personopplysninger?sub=paper');
      cy.get('#page-title').should('contain.text', 'Personalia');
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
      cy.visit('/fyllut/nav111221/dinSituasjonPanel?sub=paper');
      cy.defaultWaits();
    });

    it('shows the eligibility alert and arbeid/opphold follow-ups for the fallback benefit answers', () => {
      cy.contains('Ingen av alternativene passer for meg').should('exist');
      cy.findByLabelText('Jobber du i et annet land enn Norge?').should('not.exist');
      cy.contains('har du mest sannsynlig ikke rett på støtte til daglig reise').should('not.exist');

      chooseMainBenefit(/Ingen av alternativene passer for meg/);
      cy.findByLabelText('Jobber du i et annet land enn Norge?').should('exist');
      cy.contains('har du mest sannsynlig ikke rett på støtte til daglig reise').should('exist');
    });

    it('toggles foreign work, foreign support and stay follow-ups inside arbeid/opphold', () => {
      chooseMainBenefit(/Mottar ingen pengestøtte fra Nav/);

      cy.findByRole('combobox', { name: 'Hvilket land jobber du i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land mottar du pengestøtte fra?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land har du oppholdt deg i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land skal du oppholde deg i?' }).should('not.exist');

      cy.withinComponent('Jobber du i et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land jobber du i?' }).should('exist');

      chooseForeignSupport(/Sykepenger/);
      cy.findByRole('combobox', { name: 'Hvilket land mottar du pengestøtte fra?' }).should('exist');

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

  describe('Arbeidsrettet aktivitet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111221/arbeidsrettetAktivitet?sub=paper');
      cy.defaultWaits();
    });

    it('shows manual activity follow-ups for the no-activity branch', () => {
      cy.findByLabelText('Hvilken arbeidsrettet aktivitet har du?').should('exist');

      cy.withinComponent('Hvilken arbeidsrettet aktivitet har du?', () => {
        cy.findByRole('radio', { name: 'Har ingen arbeidsrettet aktivitet' }).click();
      });
      cy.contains('Ingen arbeidsrettet aktivitet?').should('exist');

      cy.withinComponent('Hvilken arbeidsrettet aktivitet har du?', () => {
        cy.findByRole('radio', { name: 'Tiltak / arbeidsrettet utredning' }).click();
      });
      cy.findByLabelText('Hva slags type arbeidsrettet aktivitet går du på?').should('exist');
    });

    it('shows learner and school-transport follow-ups for the education branches', () => {
      cy.findByLabelText('Hvilken arbeidsrettet aktivitet har du?').should('exist');
      cy.withinComponent('Hvilken arbeidsrettet aktivitet har du?', () => {
        cy.findByRole('radio', { name: 'Utdanning godkjent av Nav' }).click();
      });
      cy.findByLabelText('Hva slags type arbeidsrettet aktivitet går du på?').should('exist');

      cy.withinComponent('Hva slags type arbeidsrettet aktivitet går du på?', () => {
        cy.findByRole('radio', { name: 'Videregående skole' }).click();
      });
      cy.findByLabelText('Er du lærling, lærekandidat, praksisbrevkandidat eller kandidat for fagbrev på jobb?').should(
        'exist',
      );

      cy.withinComponent('Hva slags type arbeidsrettet aktivitet går du på?', () => {
        cy.findByRole('radio', { name: 'Forberedende opplæring for voksne (Tidl. grunnskole for voksne)' }).click();
      });
      cy.contains('kommunen dekke dine utgifter til skoleskyss').should('exist');
    });
  });

  describe('Dine reiser conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111221/dinReise?sub=paper');
      cy.defaultWaits();
      fillTravelBaseRow();
    });

    it('shows the short-distance medical branch only when the distance is under six kilometers', () => {
      cy.findByLabelText(
        'Har du funksjonsnedsettelse, midlertidig skade eller sykdom som gjør at du må ha transport til aktivitetsstedet?',
      ).should('not.exist');
      cy.contains('Hvis reiseavstand er under 6 kilometer').should('not.exist');

      chooseDistance('Nei');
      cy.findByLabelText(
        'Har du funksjonsnedsettelse, midlertidig skade eller sykdom som gjør at du må ha transport til aktivitetsstedet?',
      ).should('exist');

      cy.withinComponent(
        'Har du funksjonsnedsettelse, midlertidig skade eller sykdom som gjør at du må ha transport til aktivitetsstedet?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.contains('Hvis reiseavstand er under 6 kilometer').should('exist');

      chooseDistance('Ja');
      cy.findByLabelText(
        'Har du funksjonsnedsettelse, midlertidig skade eller sykdom som gjør at du må ha transport til aktivitetsstedet?',
      ).should('not.exist');
    });

    it('switches between the offentlig-transport ticket fields and the nav111221b guidance branch', () => {
      chooseDistance('Ja');
      cy.findByRole('textbox', { name: 'Hvor lang er reiseveien din?' }).type('12');
      cy.findByLabelText('Hva koster reisen med offentlig transport?').should('not.exist');

      choosePublicTransport('Ja');
      cy.findByLabelText('Hva koster reisen med offentlig transport?').should('exist');

      cy.findByRole('checkbox', { name: /Enkeltbillett/ }).check();
      cy.findByLabelText('Hvor mye koster én enkeltbillett?').should('exist');

      choosePublicTransport('Nei');
      cy.findByLabelText('Hva koster reisen med offentlig transport?').should('not.exist');
      cy.contains('Hvis du ikke skal reise med offentlig transport').should('exist');
      cy.findByRole('link', { name: 'dette skjemaet (åpnes i ny fane)' }).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the medical attachment for the reachable short-distance branch', () => {
      cy.visit('/fyllut/nav111221/dinReise?sub=paper');
      cy.defaultWaits();
      fillTravelBaseRow();
      chooseDistance('Nei');
      cy.withinComponent(
        'Har du funksjonsnedsettelse, midlertidig skade eller sykdom som gjør at du må ha transport til aktivitetsstedet?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      goToVedleggFromTravel();

      cy.findByRole('group', { name: /Uttalelse fra helsepersonell/ }).should('exist');
      cy.findByRole('group', { name: /Kvittering for drosje/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111221?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      cy.get('#page-title').should('contain.text', 'Introduksjon');
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickNextStep();

      cy.get('#page-title')
        .invoke('text')
        .then((title) => {
          if (title.includes('Hvem fyller ut søknaden?')) {
            cy.clickNextStep();
          }
        });

      cy.findByRole('textbox', { name: 'Fornavn' }).clear();
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).clear();
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectHasNorwegianIdentityNumber('Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).clear();
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Hjemveien 2');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      chooseMainBenefit(/Arbeidsavklaringspenger/);
      cy.clickNextStep();

      cy.withinComponent('Hvilken arbeidsrettet aktivitet har du?', () => {
        cy.findByRole('radio', { name: 'Har ingen arbeidsrettet aktivitet' }).click();
      });
      cy.clickNextStep();

      fillTravelBaseRow();
      chooseDistance('Ja');
      cy.findByRole('textbox', { name: 'Hvor lang er reiseveien din?' }).type('10');
      choosePublicTransport('Ja');
      cy.findByRole('checkbox', { name: /Enkeltbillett/ }).check();
      cy.findByLabelText('Hvor mye koster én enkeltbillett?').type('50');
      cy.clickNextStep();

      cy.get('#page-title')
        .invoke('text')
        .then((title) => {
          if (title.includes('Vedlegg')) {
            cy.clickNextStep();
          }
        });

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personalia', () => {
        cy.get('dt').contains('Fornavn');
        cy.get('dd').contains('Ola');
      });
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.get('dd').contains('Arbeidsavklaringspenger (AAP)');
      });
      cy.withinSummaryGroup('Dine reiser', () => {
        cy.get('dd').contains('Testgata 1');
      });
    });
  });
});
