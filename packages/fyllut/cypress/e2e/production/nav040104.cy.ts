import nav040104Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav040104.json';

/*
 * Production form tests for Søknad om dagpenger ved permittering
 * Form: nav040104
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Personalia (personalia): 9 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fnr / fødselsdato / borDuINorge / alertstripe
 *       erNorgeDittBostedsland → bostedsland container
 *       harDuReistTilbakeTilBostedslandetDittEtterAtDuBlePermittert → retur-datoer / årsak
 *   - Din situasjon (dinSituasjon): 9 conditionals
 *       velgDetAlternativetSomPasserBestForDeg → no-jobb textarea / hides arbeidsforhold
 *       arbeidsforhold row toggles sluttdato / timer / rotasjon alert
 *   - Egen næring (egenNaering): 4 same-panel conditionals
 *       driverDuEgenNaeringsvirksomhet → egenNaeringsvirksomhet container
 *       hvemEierGardsbruket → prosentfelter
 *   - Andre ytelser (andreYtelser): 2 same-panel conditionals
 *       farDuEllerVilDuFaLonnEllerAndreOkonomiskeGoderFraTidligereArbeidsgiver → textarea + alert
 *   - Utdanning (utdanning): 4 same-panel conditionals
 *       tarDuUtdanningEllerOpplaering → alerts / planning question
 *       planleggerDuAStarte... → alert
 *   - Barnetillegg (barnetillegg): 3 same-panel conditionals
 *       forsorgerDuBarnUnder18Ar → child datagrid
 *       harBarnetNorskFodselsnummerEllerDNummer → fnr / fødselsdato
 *   - Reell arbeidssøker (reellArbeidssoker): 12 same-panel conditionals
 *       work-availability answers → selectboxes / textareas / alerts / number field
 *   - Vedlegg (vedlegg): cross-panel conditionals
 *       verneplikt / utdanning / tidligere arbeidsgiver → conditional attachments
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const fillPersonaliaWithoutFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('01.01.1990');
  cy.withinComponent('Bor du i Norge?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
    cy.findByRole('radio', { name: 'Vegadresse' }).click();
  });
  cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
  cy.findAllByRole('textbox', { name: 'Postnummer' }).first().type('0150');
  cy.findAllByRole('textbox', { name: 'Poststed' }).first().type('Oslo');
  cy.findByRole('textbox', { name: /Fra hvilken dato skal denne adressen brukes/ }).type(addDays(-14));
  cy.get('body').then(($body) => {
    if ($body.text().includes('Er Norge ditt bostedsland?')) {
      cy.withinComponent('Er Norge ditt bostedsland?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
    }
  });
};

const fillMinimalVisibleAttachments = () => {
  cy.findByRole('group', { name: /Permitteringsvarsel/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender/i }).click();
  });
  cy.findByRole('group', { name: /Bekreftelse på arbeidsforhold og permittering/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender/i }).click();
  });
  cy.findByRole('group', { name: /Kopi av arbeidsavtale/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender/i }).click();
  });
  cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
  });
};

const completeDeclarations = () => {
  cy.get('#page-title')
    .invoke('text')
    .then((title) => {
      if (title.trim() === 'Oppsummering') {
        return;
      }

      cy.findByRole('checkbox', {
        name: /Jeg bekrefter at jeg har gitt riktige og fullstendige opplysninger/,
      }).click();
      cy.clickNextStep();
      cy.get('#page-title')
        .invoke('text')
        .then((nextTitle) => {
          if (nextTitle.trim() === 'Vedlegg' || nextTitle.trim() === 'Erklæring') {
            cy.clickNextStep();
          }
        });
    });
};

describe('nav040104', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav040104*', { body: nav040104Form });
    cy.intercept('GET', '/fyllut/api/translations/nav040104*', { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Personalia conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040104/personalia?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fnr, date, address and bostedsland questions from the fnr answer', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er Norge ditt bostedsland?').should('exist');

      cy.withinComponent('Er Norge ditt bostedsland?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land bor du i?' }).should('exist');
      cy.findByLabelText('Har du reist tilbake til bostedslandet ditt etter at du ble permittert?').should('exist');

      cy.withinComponent('Har du reist tilbake til bostedslandet ditt etter at du ble permittert?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Hvilken dato reiste du tilbake til bostedslandet ditt/ }).should('exist');
      cy.findByRole('textbox', { name: /Hvilken dato har du returnert til Norge/ }).should('exist');
      cy.findByRole('textbox', { name: 'Hva er årsaken til at du reiste fra Norge?' }).should('exist');
    });
  });

  describe('Din situasjon conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040104/dinSituasjon?sub=paper');
      cy.defaultWaits();
    });

    it('shows no-job explanation and hides arbeidsforhold when the applicant has not worked', () => {
      cy.findByRole('textbox', { name: 'Hvis du ikke har vært i jobb, hva er da din situasjon?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Navnet på bedriften' }).should('exist');

      cy.withinComponent('Velg det alternativet som passer best for deg', () => {
        cy.findByRole('radio', { name: 'Jeg har ikke vært i jobb' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvis du ikke har vært i jobb, hva er da din situasjon?' }).should('exist');
      cy.findByRole('textbox', { name: 'Navnet på bedriften' }).should('not.exist');
    });

    it('toggles arbeidsforhold row fields for contract, hours and rotation', () => {
      cy.withinComponent('Er dette et midlertidig arbeidsforhold med en kontraktfestet sluttdato?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Oppgi den kontraktfestede sluttdatoen/ }).should('exist');

      cy.withinComponent('Vet du hvor mange timer du har jobbet i uka før du ble permittert?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Skriv inn hvor mange timer du har jobbet per uke i dette arbeidsforholdet').should('exist');

      cy.withinComponent('Arbeidet du skift, turnus eller rotasjon?', () => {
        cy.findByRole('radio', { name: 'Ja, jeg arbeidet rotasjon' }).click();
      });
      cy.findByLabelText('Oppgi type rotasjon').should('exist');
      cy.findByRole('textbox', { name: /Oppgi første dag i siste arbeidsperiode/ }).should('exist');
    });
  });

  describe('Egen næring conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040104/egenNaering?sub=paper');
      cy.defaultWaits();
    });

    it('shows own-business fields and farm ownership percentage fields on demand', () => {
      cy.findByRole('textbox', { name: 'Næringens organisasjonsnummer' }).should('not.exist');

      cy.withinComponent('Driver du egen næringsvirksomhet?', () => {
        cy.findByRole('radio', { name: 'Ja, jeg driver egen næringsvirksomhet' }).click();
      });
      cy.findByRole('textbox', { name: 'Næringens organisasjonsnummer' }).should('exist');
      cy.findByLabelText('Hvor mange timer per uke arbeider du i egen næring?').should('exist');

      cy.withinComponent('Driver du eget gårdsbruk?', () => {
        cy.findByRole('radio', { name: 'Ja, driver gårdsbruk' }).click();
      });
      cy.findByRole('group', { name: /Hvem eier gårdsbruket/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Ektefelle/samboer' }).check();
        cy.findByRole('checkbox', { name: 'Andre' }).check();
      });
      cy.findByLabelText('Hvor mange prosent av inntekten går til ektefelle/samboer?').should('exist');
      cy.findByLabelText('Hvor mange prosent av inntekten går til andre?').should('exist');
    });
  });

  describe('Andre ytelser conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040104/andreYtelser?sub=paper');
      cy.defaultWaits();
    });

    it('shows details when the applicant gets money or benefits from a former employer', () => {
      cy.findByRole('textbox', { name: 'Skriv inn hva du får eller beholder' }).should('not.exist');

      cy.withinComponent('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Skriv inn hva du får eller beholder' }).should('exist');
    });
  });

  describe('Utdanning conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040104/utdanning?sub=paper');
      cy.defaultWaits();
    });

    it('switches between education alerts and planning question', () => {
      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('not.exist');

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', { name: 'Ja, jeg er under utdanning eller opplæring nå' }).click();
      });
      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('not.exist');

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', {
          name: 'Nei, men jeg har avsluttet utdanning eller opplæring i løpet av de siste seks månedene',
        }).click();
      });
      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('exist');

      cy.withinComponent(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByRole('link', {
        name: /NAV 04-06.05 Søknad om å beholde dagpengene mens du tar utdanning eller opplæring/,
      }).should('exist');
    });
  });

  describe('Barnetillegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040104/barnetillegg?sub=paper');
      cy.defaultWaits();
    });

    it('shows child row and switches between fnr and birthdate inputs', () => {
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');

      cy.withinComponent('Forsørger du barn under 18 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('exist');

      cy.withinComponent('Har barnet norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Barnets fødselsnummer/ }).should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).should('not.exist');

      cy.withinComponent('Har barnet norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Barnets fødselsnummer/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).should('exist');
    });
  });

  describe('Reell arbeidssøker conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040104/reellArbeidssoker?sub=paper');
      cy.defaultWaits();
    });

    it('shows follow-up questions and alerts when work availability is limited', () => {
      cy.findByRole('textbox', { name: 'Hvilke typer arbeid kan du ikke ta?' }).should('not.exist');

      cy.withinComponent('Kan du jobbe både heltid og deltid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /Velg situasjonen som gjelder deg/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Redusert helse, fysisk eller psykisk' }).check();
      });
      cy.findByLabelText('Før opp antall timer du kan arbeide per uke').should('exist');

      cy.withinComponent('Kan du jobbe i hele Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findAllByRole('group', { name: /Velg situasjonen som gjelder deg/ })
        .eq(1)
        .within(() => {
          cy.findByRole('checkbox', { name: 'Jeg er permittert' }).check();
        });
      cy.findAllByRole('textbox', { name: 'Skriv kort om situasjonen din' }).last().should('exist');

      cy.withinComponent('Kan du ta alle typer arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilke typer arbeid kan du ikke ta?' }).should('exist');

      cy.withinComponent('Er du villig til å bytte yrke eller gå ned i lønn?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByText(/villig til å bytte yrke eller gå ned i lønn/i).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows Tjenestebevis when verneplikt is answered yes', () => {
      cy.visit('/fyllut/nav040104/verneplikt?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Har du avtjent verneplikt i tre av de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Tjenestebevis/ }).should('exist');
    });

    it('shows education and previous-employer attachments for matching answers', () => {
      cy.visit('/fyllut/nav040104/utdanning?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', {
          name: 'Nei, men jeg har avsluttet utdanning eller opplæring i løpet av de siste seks månedene',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Andre ytelser' }).click();
      cy.withinComponent('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Elevdokumentasjon fra lærested/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av sluttavtale/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040104/personalia?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      fillPersonaliaWithoutFnr();
      cy.clickNextStep();

      cy.get('#page-title').should('contain.text', 'Din situasjon');
      cy.findByLabelText(/Hvilken dato søker du dagpenger fra/).type(addDays(-7));
      cy.withinComponent('Velg det alternativet som passer best for deg', () => {
        cy.findByRole('radio', { name: 'Jeg har ikke vært i jobb' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvis du ikke har vært i jobb, hva er da din situasjon?' }).type(
        'Har vært hjemmeværende',
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
        cy.findByRole('radio', { name: 'Nei, jeg driver ikke egen næringsvirksomhet' }).click();
      });
      cy.withinComponent('Driver du eget gårdsbruk?', () => {
        cy.findByRole('radio', { name: 'Nei, jeg driver ikke gårdsbruk' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Har du avtjent verneplikt i tre av de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('group', { name: /Mottar du eller har du søkt om noen av disse ytelsene/ }).within(() => {
        cy.findByRole('checkbox', {
          name: 'Nei, jeg verken mottar eller har søkt om noen av disse ytelsene',
        }).check();
      });
      cy.withinComponent('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', {
          name: 'Nei, jeg er ikke under utdanning eller opplæring nå, og har ikke vært det de siste seks månedene',
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
      cy.withinComponent('Er du villig til å bytte yrke eller gå ned i lønn?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Tilleggsopplysninger' }).should('exist');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      fillMinimalVisibleAttachments();
      cy.clickNextStep();

      completeDeclarations();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personalia', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
        cy.contains('dt', 'Etternavn').next('dd').should('contain.text', 'Nordmann');
      });
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.contains('dt', 'Hvis du ikke har vært i jobb, hva er da din situasjon?')
          .next('dd')
          .should('contain.text', 'Har vært hjemmeværende');
      });
    });
  });
});
