import form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav040103.json';

/*
 * Production form tests for Søknad om dagpenger (ikke permittert)
 * Form: nav040103
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Personalia (personalia): 8 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fødselsnummer / fødselsdato / folkeregister-alert / borDuINorge
 *       borDuINorge + vegadresseEllerPostboksadresse → norwegian vs foreign address fields
 *   - Din situasjon (dinSituasjon): 2 same-panel conditionals
 *       velgDetAlternativetSomPasserBestForDeg → textarea vs arbeidsforhold datagrid
 *   - Arbeidsforhold i EØS (arbeidsforholdIEos): 1 same-panel conditional
 *       harDuJobbetIEtAnnetEosLandSveitsEllerStorbritanniaILopetAvDeSiste36Manedene → arbeidsforholdIEosOmradet
 *   - Utdanning (utdanning): 1 customConditional
 *       tarDuUtdanningEllerOpplaering → planleggerDuAStarteEllerFullforeUtdanningEllerOpplaeringSamtidigSomDuMottarDagpenger
 *   - Barnetillegg (barnetillegg): 1 same-panel conditional
 *       forsorgerDuBarnUnder18Ar → opplysningerOmBarn datagrid
 *
 * Summary path keeps all optional branches minimal and reaches Vedlegg via stepper because
 * Vedlegg has isAttachmentPanel=true.
 */

const formatDate = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const relativeDate = (daysFromToday: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);

  return formatDate(date);
};

const chooseVedleggAnswer = (groupName: RegExp, answer: RegExp | string) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const waitForComponent = (label: string | RegExp) => {
  cy.findByLabelText(label, undefined, { timeout: 20000 }).should('exist');
};

describe('nav040103', () => {
  const applicationDate = relativeDate(-14);

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav040103*', { body: form });
    cy.intercept('GET', '/fyllut/api/translations/nav040103*', { body: { 'nb-NO': {} } });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: { 'nb-NO': {} } });
  });

  describe('Personalia conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040103/personalia?sub=paper');
      cy.defaultWaits();
    });

    it('switches between fnr, birth date, and address branches based on identity answers', () => {
      waitForComponent('Har du norsk fødselsnummer eller d-nummer?');
      cy.findByRole('textbox', { name: /fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer eller d-nummer/i }).should('exist');
      cy.contains('folkeregistrerte adresse').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('exist');
      cy.contains('folkeregistrerte adresse').should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Din situasjon conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040103/dinSituasjon?sub=paper');
      cy.defaultWaits();
    });

    it('shows textarea only for the no-work branch and restores the arbeidsforhold grid otherwise', () => {
      waitForComponent('Velg det alternativet som passer best for deg');
      cy.findByRole('textbox', { name: 'Hvis du ikke har vært i jobb, hva er da din situasjon?' }).should('not.exist');

      cy.withinComponent('Velg det alternativet som passer best for deg', () => {
        cy.findByRole('radio', { name: 'Jeg har ikke vært i jobb' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvis du ikke har vært i jobb, hva er da din situasjon?' }).should('exist');
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('not.exist');

      cy.withinComponent('Velg det alternativet som passer best for deg', () => {
        cy.findByRole('radio', { name: 'Jeg har hatt fast arbeidstid i minst seks måneder' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvis du ikke har vært i jobb, hva er da din situasjon?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('exist');
    });
  });

  describe('Arbeidsforhold i EØS conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040103/arbeidsforholdIEos?sub=paper');
      cy.defaultWaits();
    });

    it('shows the EØS datagrid only when the user has worked abroad', () => {
      waitForComponent(
        'Har du jobbet i et annet EØS-land, Sveits eller Storbritannia i løpet av de siste 36 månedene?',
      );
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('not.exist');

      cy.withinComponent(
        'Har du jobbet i et annet EØS-land, Sveits eller Storbritannia i løpet av de siste 36 månedene?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('exist');
      cy.findByRole('textbox', { name: /Startdato for arbeidsforholdet/ }).should('exist');

      cy.withinComponent(
        'Har du jobbet i et annet EØS-land, Sveits eller Storbritannia i løpet av de siste 36 månedene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('not.exist');
    });
  });

  describe('Utdanning conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040103/utdanning?sub=paper');
      cy.defaultWaits();
    });

    it('shows future-study question only when the user is not currently studying', () => {
      waitForComponent('Tar du utdanning eller opplæring?');
      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('not.exist');

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', {
          name: 'Nei, jeg er ikke under utdanning eller opplæring, og har ikke vært det de siste seks månedene',
        }).click();
      });

      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('exist');

      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', { name: 'Ja, jeg er under utdanning eller opplæring nå' }).click();
      });

      cy.findByLabelText(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
      ).should('not.exist');
    });
  });

  describe('Barnetillegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040103/barnetillegg?sub=paper');
      cy.defaultWaits();
    });

    it('shows child details only when the user supports children under 18', () => {
      waitForComponent('Forsørger du barn under 18 år?');
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');

      cy.withinComponent('Forsørger du barn under 18 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).should('exist');

      cy.withinComponent('Forsørger du barn under 18 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040103?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      // Veiledning
      cy.findByRole(
        'checkbox',
        {
          name: 'Jeg bekrefter at jeg har lest og forstått denne veiledningen.',
        },
        { timeout: 20000 },
      ).should('exist');
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg har lest og forstått denne veiledningen.',
      }).click();
      cy.clickNextStep();

      // Personalia
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer eller d-nummer/i }).type('17912099997');
      cy.withinComponent('Er Norge ditt bostedsland?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Din situasjon
      cy.findByRole('textbox', { name: /Hvilken dato søker du dagpenger fra/ }).type(applicationDate);
      cy.withinComponent('Velg det alternativet som passer best for deg', () => {
        cy.findByRole('radio', { name: 'Jeg har ikke vært i jobb' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvis du ikke har vært i jobb, hva er da din situasjon?' }).type(
        'Jeg er nyutdannet og søker arbeid.',
      );
      cy.clickNextStep();

      // Arbeidsforhold i EØS
      cy.withinComponent(
        'Har du jobbet i et annet EØS-land, Sveits eller Storbritannia i løpet av de siste 36 månedene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      // Egen næring
      cy.withinComponent('Driver du egen næringsvirksomhet?', () => {
        cy.findByRole('radio', { name: 'Nei, jeg driver ikke egen næringsvirksomhet' }).click();
      });
      cy.withinComponent('Driver du eget gårdsbruk?', () => {
        cy.findByRole('radio', { name: 'Nei, jeg driver ikke gårdsbruk' }).click();
      });
      cy.clickNextStep();

      // Verneplikt
      cy.withinComponent('Har du avtjent verneplikt i tre av de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Andre ytelser
      cy.findByRole('group', { name: /Mottar du eller har du søkt om noen av disse ytelsene/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /Nei, jeg verken mottar eller har søkt om noen av disse ytelsene/,
        }).check();
      });
      cy.withinComponent('Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Utdanning
      cy.withinComponent('Tar du utdanning eller opplæring?', () => {
        cy.findByRole('radio', {
          name: 'Nei, jeg er ikke under utdanning eller opplæring, og har ikke vært det de siste seks månedene',
        }).click();
      });
      cy.withinComponent(
        'Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      // Barnetillegg
      cy.withinComponent('Forsørger du barn under 18 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Reell arbeidssøker
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

      // Tilleggsopplysninger
      cy.clickNextStep();

      // Vedlegg – isAttachmentPanel=true, so use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      chooseVedleggAnswer(/Bekreftelse på sluttårsak \/ nedsatt arbeidstid/, 'Jeg ettersender dokumentasjonen senere');
      chooseVedleggAnswer(/Kopi av arbeidsavtale \/ sluttårsak/, 'Jeg ettersender dokumentasjonen senere');
      chooseVedleggAnswer(/Annen dokumentasjon/, /ingen ekstra dokumentasjon/i);
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personalia', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilken dato søker du dagpenger fra?');
        cy.get('dd').eq(0).should('contain.text', applicationDate);
      });
    });
  });
});
