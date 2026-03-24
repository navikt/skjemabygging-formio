import nav041603Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav041603.json';

/*
 * Production form tests for Søknad om gjenopptak av dagpenger
 * Form: nav041603
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Personalia (personalia): Norwegian ID / address branches
 *   - Din situasjon (dinSituasjon): arbeidsforhold datagrid + reason branches
 *   - Egen næring (egenNaering): farm-owner selectboxes
 *   - Andre ytelser (andreYtelser): selectboxes + payment branch
 *   - Utdanning (utdanning): study-status customConditional
 *   - Barnetillegg (barnetillegg): child ID / foreign child branches
 *   - Reell arbeidssøker (reellArbeidssoker): exception selectboxes + work-type branch
 *   - Vedlegg (vedlegg): cross-panel attachment from Barnetillegg
 */

const fillBaseVedlegg = () => {
  cy.findByRole('group', { name: /Bekreftelse på sluttårsak\/nedsatt arbeidstid/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender/i }).click();
  });

  cy.findByRole('group', { name: /Kopi av arbeidsavtale \/ sluttårsak/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender/i }).click();
  });

  cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /Nei|ingen ekstra dokumentasjon/i }).click();
  });
};

describe('nav041603', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav041603*', { body: nav041603Form });
    cy.intercept('GET', '/fyllut/api/translations/nav041603*', { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Personalia conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603/personalia?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fødselsnummer, fødselsdato and address fields based on residency answers', () => {
      cy.findByLabelText('Fødselsnummer eller d-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Fødselsnummer eller d-nummer').should('exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Fødselsnummer eller d-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
    });
  });

  describe('Din situasjon conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603/dinSituasjon?sub=paper');
      cy.defaultWaits();
    });

    it('toggles arbeidsforhold datagrid and selected reason fields', () => {
      cy.withinComponent(
        'Har du jobbet, eller hatt endringer i ett eller flere arbeidsforhold, siden sist du fikk dagpenger?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('not.exist');

      cy.withinComponent(
        'Har du jobbet, eller hatt endringer i ett eller flere arbeidsforhold, siden sist du fikk dagpenger?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('exist');

      cy.withinComponent('Hva er årsaken til endringen i arbeidsforholdet ditt?', () => {
        cy.findByRole('radio', { name: 'Jeg har sagt opp selv' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvorfor har du sagt opp?' }).should('exist');
      cy.findByRole('textbox', { name: /Hva var årsaken til at du ble sagt opp/ }).should('not.exist');

      cy.withinComponent('Hva er årsaken til endringen i arbeidsforholdet ditt?', () => {
        cy.findByRole('radio', { name: 'Arbeidsgiver har sagt meg opp' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvorfor har du sagt opp?' }).should('not.exist');
      cy.findByRole('textbox', { name: /Hva var årsaken til at du ble sagt opp/ }).should('exist');
      cy.findByLabelText(
        'Har du fått tilbud om å fortsette hos arbeidsgiveren din i en annen stilling eller et annet sted i Norge?',
      ).should('exist');
    });
  });

  describe('Egen næring conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603/egenNaering?sub=paper');
      cy.defaultWaits();
    });

    it('shows own-business fields only when the user answers yes', () => {
      cy.withinComponent('Driver du egen næringsvirksomhet?', () => {
        cy.findByRole('radio', { name: /Ja, jeg driver egen næringsvirksomhet/ }).click();
      });

      cy.findByLabelText('Næringens organisasjonsnummer').should('exist');
      cy.findByLabelText('Hvor mange timer per uke arbeider du i egen næring?').should('exist');

      cy.withinComponent('Driver du egen næringsvirksomhet?', () => {
        cy.findByRole('radio', { name: /Nei, jeg driver ikke egen næringsvirksomhet/ }).click();
      });

      cy.findByLabelText('Næringens organisasjonsnummer').should('not.exist');
      cy.findByLabelText('Hvor mange timer per uke arbeider du i egen næring?').should('not.exist');
    });
  });

  describe('Andre ytelser conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603/andreYtelser?sub=paper');
      cy.defaultWaits();
    });

    it('toggles selectbox-specific fields and economic-benefit textarea', () => {
      cy.findByRole('group', { name: /Mottar du eller har du søkt om noen av disse ytelsene/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Etterlønn fra arbeidsgiver' }).check();
      });

      cy.findByRole('textbox', { name: 'Hvem utbetaler etterlønnen og for hvilken periode?' }).should('exist');

      cy.findByRole('group', { name: /Mottar du eller har du søkt om noen av disse ytelsene/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Etterlønn fra arbeidsgiver' }).uncheck();
        cy.findByRole('checkbox', { name: 'Annen ytelse' }).check();
      });

      cy.findByRole('textbox', { name: 'Hvilken ytelse er det?' }).should('exist');
      cy.findByRole('textbox', { name: 'Hvem utbetaler etterlønnen og for hvilken periode?' }).should('not.exist');

      cy.withinComponent('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Skriv inn hva du får eller beholder' }).should('exist');

      cy.withinComponent('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Skriv inn hva du får eller beholder' }).should('not.exist');
    });
  });

  describe('Utdanning conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603/utdanning?sub=paper');
      cy.defaultWaits();
    });

    it('shows planning question only for no-education branches', () => {
      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('not.exist');

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', { name: /Ja, jeg er under utdanning eller opplæring nå/ }).click();
      });

      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('not.exist');

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', {
          name: /Nei, jeg er ikke under utdanning eller opplæring, og har ikke vært det de siste seks månedene/,
        }).click();
      });

      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('exist');
    });
  });

  describe('Barnetillegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603/barnetillegg?sub=paper');
      cy.defaultWaits();
    });

    it('toggles child identification fields based on norwegian id answer', () => {
      cy.withinComponent('Forsørger du barn under 18 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Anna');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');

      cy.withinComponent('Har barnet norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).should('exist');
      cy.findByLabelText('Oppgi barnets bostedsland').should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsnummer/ }).should('not.exist');

      cy.withinComponent('Har barnet norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Barnets fødselsnummer/ }).should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Oppgi barnets bostedsland').should('not.exist');
    });
  });

  describe('Reell arbeidssøker conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603/reellArbeidssoker?sub=paper');
      cy.defaultWaits();
    });

    it('shows exception details and restricted-work fields when answers are negative', () => {
      cy.withinComponent('Kan du jobbe både heltid og deltid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('group', { name: /Velg situasjonen som gjelder deg/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Annen situasjon' }).check();
      });
      cy.findByRole('textbox', { name: 'Skriv kort om situasjonen din' }).should('exist');

      cy.findByRole('group', { name: /Velg situasjonen som gjelder deg/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Har fylt 60 år' }).check();
      });
      cy.findByLabelText('Før opp antall timer du kan arbeide per uke').should('exist');

      cy.withinComponent('Kan du ta alle typer arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvilke typer arbeid kan du ikke ta?' }).should('exist');

      cy.withinComponent('Kan du ta alle typer arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvilke typer arbeid kan du ikke ta?' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603/verneplikt?sub=paper');
      cy.defaultWaits();
    });

    it('shows tjenestebevis attachment only when verneplikt answer is yes', () => {
      cy.withinComponent('Har du avtjent verneplikt i tre av de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Tjenestebevis/ }).should('exist');

      cy.findByRole('link', { name: 'Verneplikt' }).click();
      cy.withinComponent('Har du avtjent verneplikt i tre av de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Tjenestebevis/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041603?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg har lest og forstått denne veiledningen.',
      }).click();
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
      cy.withinComponent('Er Norge ditt bostedsland?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('textbox', { name: /Skriv årsaken til at dagpengene ble stanset/ }).type('Meldekort manglet');
      cy.findByRole('textbox', { name: /Hvilken dato søker du gjenopptak av dagpenger fra/ }).type('15.01.2025');
      cy.withinComponent(
        'Har du jobbet, eller hatt endringer i ett eller flere arbeidsforhold, siden sist du fikk dagpenger?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      cy.withinComponent(
        'Har du jobbet i et annet EØS-land, Sveits eller Storbritannia i løpet av de siste 36 månedene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      cy.withinComponent('Driver du egen næringsvirksomhet?', () => {
        cy.findByRole('radio', { name: /Nei, jeg driver ikke egen næringsvirksomhet/ }).click();
      });
      cy.withinComponent('Driver du eget gårdsbruk?', () => {
        cy.findByRole('radio', { name: /Nei, jeg driver ikke gårdsbruk/ }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Har du avtjent verneplikt i tre av de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('group', { name: /Mottar du eller har du søkt om noen av disse ytelsene/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /Nei, jeg verken mottar eller har søkt om noen av disse ytelsene/,
        }).check();
      });
      cy.withinComponent('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', {
          name: /Nei, jeg er ikke under utdanning eller opplæring, og har ikke vært det de siste seks månedene/,
        }).click();
      });
      cy.withinComponent(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      cy.withinComponent('Forsørger du barn under 18 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Kan du jobbe både heltid og deltid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Kan du jobbe i hele Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Kan du ta alle typer arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er du villig til å ta bytte yrke eller gå ned i lønn?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      cy.clickNextStep();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      fillBaseVedlegg();

      cy.clickNextStep();
      cy.get('#page-title')
        .invoke('text')
        .then((title) => {
          if (title.includes('Oppsummering')) {
            cy.findByRole('link', { name: 'Erklæring' }).click();
          }
        });
      cy.findByRole('checkbox', {
        name: /Jeg bekrefter at jeg har gitt riktige og fullstendige opplysninger/,
      }).click();
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
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.contains('dd', 'Meldekort manglet').should('exist');
      });
    });
  });
});
