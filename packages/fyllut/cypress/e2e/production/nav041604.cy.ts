import nav041604Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav041604.json';

/*
 * Production form tests for Søknad om gjenopptak av dagpenger ved permittering
 * Form: nav041604
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Personalia (personalia): ID, address and bostedsland branches
 *   - Din situasjon (dinSituasjon): arbeidsforhold datagrid + row conditionals
 *   - Arbeidsforhold i EØS-området (arbeidsforholdIEOSOmradet): EØS datagrid branch
 *   - Egen næring (egenNaering): own-business and farm-owner branches
 *   - Andre ytelser (andreYtelser): selectboxes + prior-employer branch
 *   - Utdanning (utdanning): study-status branches
 *   - Barnetillegg (barnetillegg): child ID / foreign-child branches
 *   - Reell arbeidssøker (reellArbeidssoker): exception selectboxes + restricted-work branch
 *   - Vedlegg (vedlegg): cross-panel attachments from verneplikt, andre ytelser and reell arbeidssøker
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav041604/${panelKey}?sub=paper`);
  cy.defaultWaits();
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const fillBaseVedlegg = () => {
  cy.findByRole('group', { name: /Permitteringsvarsel/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender/i }).click();
  });

  cy.findByRole('group', { name: /Bekreftelse på arbeidsforhold og permittering/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender/i }).click();
  });

  cy.findByRole('group', { name: /Kopi av arbeidsavtale \/ sluttårsak/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender/i }).click();
  });

  cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /Nei|ingen ekstra dokumentasjon/i }).click();
  });
};

describe('nav041604', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', '/fyllut/api/forms/nav041604*', { body: nav041604Form }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav041604*', { body: { 'nb-NO': {} } }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: { 'nb-NO': {} } });
  });

  describe('Personalia conditionals', () => {
    beforeEach(() => {
      visitPanel('personalia');
    });

    it('toggles identity, address and bostedsland fields from residency answers', () => {
      cy.findByLabelText('Fødselsnummer eller d-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.findByLabelText('Fødselsnummer eller d-nummer').should('exist');
      cy.contains('Nav sender svar på søknad').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');

      cy.findByLabelText('Fødselsnummer eller d-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Ja');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Vegadresse');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Postboksadresse');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');

      selectRadio('Er Norge ditt bostedsland?', 'Nei');
      cy.findByRole('combobox', { name: 'Hvilket land bor du i?' }).should('exist');
      cy.findByLabelText('Har du reist tilbake til bostedslandet ditt etter at du ble arbeidsledig?').should('exist');

      selectRadio('Har du reist tilbake til bostedslandet ditt etter at du ble arbeidsledig?', 'Ja');
      cy.findByRole('textbox', { name: /Hvilken dato reiste du tilbake/ }).should('exist');
      cy.findByRole('textbox', { name: /Hva er årsaken til at du reiste fra Norge/ }).should('exist');
    });
  });

  describe('Din situasjon conditionals', () => {
    beforeEach(() => {
      visitPanel('dinSituasjon');
    });

    it('toggles arbeidsforhold grid and row-specific permittering fields', () => {
      selectRadio(
        'Har du jobbet, eller hatt endringer i ett eller flere arbeidsforhold, siden sist du fikk dagpenger?',
        'Nei',
      );
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('not.exist');

      selectRadio(
        'Har du jobbet, eller hatt endringer i ett eller flere arbeidsforhold, siden sist du fikk dagpenger?',
        'Ja',
      );

      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('exist');
      cy.findByRole('textbox', { name: /Oppgi den kontraktsfestede sluttdatoen/ }).should('not.exist');
      cy.findByLabelText('Skriv inn hvor mange timer du har jobbet per uke i dette arbeidsforholdet').should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi type rotasjon' }).should('not.exist');

      selectRadio('Er dette et midlertidig arbeidsforhold med en kontraktfestet sluttdato?', 'Ja');
      cy.findByRole('textbox', { name: /Oppgi den kontraktsfestede sluttdatoen/ }).should('exist');

      selectRadio('Vet du hvor mange timer du har jobbet i uka før du ble permittert?', 'Ja');
      cy.findByLabelText('Skriv inn hvor mange timer du har jobbet per uke i dette arbeidsforholdet').should('exist');

      selectRadio('Vet du når lønnspliktperioden til arbeidsgiveren din er?', 'Ja');
      cy.findAllByRole('textbox', { name: /Fra dato \(dd\.mm\.åååå\)/ }).should('have.length.at.least', 1);
      cy.findAllByRole('textbox', { name: /Til dato \(dd\.mm\.åååå\)/ }).should('have.length.at.least', 1);

      selectRadio('Arbeidet du skift, turnus eller rotasjon?', 'Ja, jeg arbeidet rotasjon');
      cy.findByRole('textbox', { name: 'Oppgi type rotasjon' }).should('exist');
      cy.findByRole('textbox', { name: /Oppgi første dag i siste arbeidsperiode/ }).should('exist');

      selectRadio('Arbeidet du skift, turnus eller rotasjon?', 'Nei, jeg arbeidet ikke skift, turnus eller rotasjon');
      cy.findByRole('textbox', { name: 'Oppgi type rotasjon' }).should('not.exist');
    });
  });

  describe('Arbeidsforhold i EØS-området conditionals', () => {
    beforeEach(() => {
      visitPanel('arbeidsforholdIEOSOmradet');
    });

    it('shows EØS arbeidsforhold fields only when the user answers yes', () => {
      cy.findByRole('group', { name: 'Arbeidsforhold i EØS-området' }).should('not.exist');

      selectRadio(
        'Har du jobbet i et annet EØS-land, Sveits eller Storbritannia i løpet av de siste 36 månedene?',
        'Ja',
      );

      cy.findByRole('group', { name: 'Arbeidsforhold i EØS-området' }).should('exist');
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('exist');

      selectRadio(
        'Har du jobbet i et annet EØS-land, Sveits eller Storbritannia i løpet av de siste 36 månedene?',
        'Nei',
      );

      cy.findByRole('group', { name: 'Arbeidsforhold i EØS-området' }).should('not.exist');
    });
  });

  describe('Egen næring conditionals', () => {
    beforeEach(() => {
      visitPanel('egenNaering');
    });

    it('toggles own-business fields and farm-owner percentages', () => {
      selectRadio('Driver du egen næringsvirksomhet?', 'Ja, jeg driver egen næringsvirksomhet');
      cy.findByLabelText('Næringens organisasjonsnummer').should('exist');
      cy.findByLabelText('Hvor mange timer per uke arbeider du i egen næring?').should('exist');

      selectRadio('Driver du egen næringsvirksomhet?', 'Nei, jeg driver ikke egen næringsvirksomhet');
      cy.findByLabelText('Næringens organisasjonsnummer').should('not.exist');

      selectRadio('Driver du eget gårdsbruk?', 'Ja, jeg driver gårdsbruk');
      cy.findByRole('group', { name: /Hvem eier gårdsbruket/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Ektefelle/samboer' }).check();
      });
      cy.findByLabelText('Hvor mange prosent av inntekten går til deg?').should('exist');
      cy.findByLabelText('Hvor mange prosent av inntekten går til ektefelle/samboer?').should('exist');

      cy.findByRole('group', { name: /Hvem eier gårdsbruket/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Andre' }).check();
      });
      cy.findByLabelText('Hvor mange prosent av inntekten går til andre?').should('exist');
    });
  });

  describe('Andre ytelser conditionals', () => {
    beforeEach(() => {
      visitPanel('andreYtelser');
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

      selectRadio('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', 'Ja');
      cy.findByRole('textbox', { name: 'Skriv inn hva du får eller beholder' }).should('exist');

      selectRadio('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', 'Nei');
      cy.findByRole('textbox', { name: 'Skriv inn hva du får eller beholder' }).should('not.exist');
    });
  });

  describe('Utdanning conditionals', () => {
    beforeEach(() => {
      visitPanel('utdanning');
    });

    it('shows planning question only for no-education branches', () => {
      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('not.exist');

      selectRadio('Tar du utdanning eller opplæring?', 'Ja, jeg er under utdanning eller opplæring nå');
      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('not.exist');

      selectRadio(
        'Tar du utdanning eller opplæring?',
        'Nei, men jeg har avsluttet utdanning eller opplæring i løpet av de siste seks månedene',
      );
      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('exist');
    });
  });

  describe('Barnetillegg conditionals', () => {
    beforeEach(() => {
      visitPanel('barnetillegg');
    });

    it('toggles child identification fields based on Norwegian ID answer', () => {
      selectRadio('Forsørger du barn under 18 år?', 'Ja');
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Anna');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');

      selectRadio('Har barnet norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).should('exist');
      cy.findByLabelText('Oppgi barnets bostedsland').should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsnummer/ }).should('not.exist');

      selectRadio('Har barnet norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Barnets fødselsnummer/ }).should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Oppgi barnets bostedsland').should('not.exist');
    });
  });

  describe('Reell arbeidssøker conditionals', () => {
    beforeEach(() => {
      visitPanel('reellArbeidssoker');
    });

    it('shows exception details, hour limit and restricted-work fields on negative answers', () => {
      selectRadio('Kan du jobbe både heltid og deltid?', 'Nei');

      cy.findAllByRole('group', { name: /Velg situasjonen som gjelder deg/ })
        .first()
        .within(() => {
          cy.findByRole('checkbox', { name: 'Annen situasjon' }).check();
          cy.findByRole('checkbox', { name: 'Har fylt 60 år' }).check();
        });

      cy.findAllByRole('textbox', { name: 'Skriv kort om situasjonen din' }).should('have.length.at.least', 1);
      cy.findByLabelText('Før opp antall timer du kan arbeide per uke').should('exist');

      selectRadio('Kan du jobbe i hele Norge?', 'Nei');
      cy.findAllByRole('group', { name: /Velg situasjonen som gjelder deg/ })
        .eq(1)
        .within(() => {
          cy.findByRole('checkbox', { name: 'Annen situasjon' }).check();
        });
      cy.findAllByRole('group', { name: /Velg situasjonen som gjelder deg/ }).should('have.length', 2);

      selectRadio('Kan du ta alle typer arbeid?', 'Nei');
      cy.findByRole('textbox', { name: 'Hvilke typer arbeid kan du ikke ta?' }).should('exist');

      selectRadio('Kan du ta alle typer arbeid?', 'Ja');
      cy.findByRole('textbox', { name: 'Hvilke typer arbeid kan du ikke ta?' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows tjenestebevis only when verneplikt answer is yes', () => {
      visitPanel('verneplikt');
      selectRadio('Har du avtjent verneplikt i tre av de siste 12 månedene?', 'Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Tjenestebevis/ }).should('exist');

      cy.findByRole('link', { name: 'Verneplikt' }).click();
      selectRadio('Har du avtjent verneplikt i tre av de siste 12 månedene?', 'Nei');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Tjenestebevis/ }).should('not.exist');
    });

    it('shows other-benefit attachments only for matching ytelse answers', () => {
      visitPanel('andreYtelser');
      cy.findByRole('group', { name: /Mottar du eller har du søkt om noen av disse ytelsene/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Etterlønn fra arbeidsgiver' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av etterlønn/ }).should('exist');

      cy.findByRole('link', { name: 'Andre ytelser' }).click();
      cy.findByRole('group', { name: /Mottar du eller har du søkt om noen av disse ytelsene/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Etterlønn fra arbeidsgiver' }).uncheck();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av etterlønn/ }).should('not.exist');
    });

    it('shows medical attachment when work restrictions require documentation', () => {
      visitPanel('reellArbeidssoker');
      selectRadio('Kan du ta alle typer arbeid?', 'Nei');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /bekreftelse fra lege eller annen behandler/i }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav041604?sub=paper');
      cy.defaultWaits();
    });

    it('fills minimum required fields and verifies summary', () => {
      cy.clickNextStep();

      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg har lest og forstått denne veiledningen.',
      }).click();
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
      selectRadio('Er Norge ditt bostedsland?', 'Ja');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: /Skriv årsaken til at dagpengene ble stanset/ }).type('Permittering');
      cy.findByRole('textbox', { name: /Hvilken dato søker du gjenopptak av dagpenger fra/ }).type(daysFromNow(7));
      selectRadio(
        'Har du jobbet, eller hatt endringer i ett eller flere arbeidsforhold, siden sist du fikk dagpenger?',
        'Nei',
      );
      cy.clickNextStep();

      selectRadio(
        'Har du jobbet i et annet EØS-land, Sveits eller Storbritannia i løpet av de siste 36 månedene?',
        'Nei',
      );
      cy.clickNextStep();

      selectRadio('Driver du egen næringsvirksomhet?', 'Nei, jeg driver ikke egen næringsvirksomhet');
      selectRadio('Driver du eget gårdsbruk?', 'Nei, jeg driver ikke gårdsbruk');
      cy.clickNextStep();

      selectRadio('Har du avtjent verneplikt i tre av de siste 12 månedene?', 'Nei');
      cy.clickNextStep();

      cy.findByRole('group', { name: /Mottar du eller har du søkt om noen av disse ytelsene/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /Nei, jeg verken mottar eller har søkt om noen av disse ytelsene/,
        }).check();
      });
      selectRadio('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', 'Nei');
      cy.clickNextStep();

      selectRadio(
        'Tar du utdanning eller opplæring?',
        'Nei, jeg er ikke under utdanning eller opplæring, og har ikke vært det de siste seks månedene',
      );
      selectRadio(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
        'Nei',
      );
      cy.clickNextStep();

      selectRadio('Forsørger du barn under 18 år?', 'Nei');
      cy.clickNextStep();

      selectRadio('Kan du jobbe både heltid og deltid?', 'Ja');
      selectRadio('Kan du jobbe i hele Norge?', 'Ja');
      selectRadio('Kan du ta alle typer arbeid?', 'Ja');
      selectRadio('Er du villig til å ta bytte yrke eller gå ned i lønn?', 'Ja');
      cy.clickNextStep();

      cy.clickNextStep();

      fillBaseVedlegg();
      cy.get('body').then(($body) => {
        if ($body.text().includes('Elevdokumentasjon fra lærested')) {
          cy.findByRole('group', { name: /Elevdokumentasjon fra lærested/ }).within(() => {
            cy.findByRole('radio', { name: /ettersender/i }).click();
          });
        }
      });
      cy.clickNextStep();

      cy.get('#page-title')
        .invoke('text')
        .then((title) => {
          if (title.includes('Erklæring')) {
            cy.findByRole('checkbox', {
              name: /Jeg bekrefter at jeg har gitt riktige og fullstendige opplysninger/,
            }).click();
            cy.clickNextStep();
          }
        });

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personalia', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.contains('dd', 'Permittering').should('exist');
      });
    });
  });
});
