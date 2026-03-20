/*
 * Production form tests for Søknad om svangerskapspenger til selvstendig næringsdrivende og frilanser
 * Form: nav140410
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 6 same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse, folkeregister alerts
 *       harDuBoddINorgeDeSiste12Manedene → previous-foreign-stay container
 *       hvorSkalDuBoDeNeste12Manedene → future-foreign-stay container
 *   - Yrkesaktivitet (yrkesaktivitet): 11 same-panel conditionals
 *       freelancer/self-employed/EU work answers → grouped follow-up fields
 *       registration, current-business, tenure and endrings branches
 *   - Om barnet (omBarnet): 1 same-panel conditional
 *       erBarnetFodt → narBleBarnetFodtDdMmAaaa
 *   - Risiko og tiltak (risikoOgTiltak): 3 same-panel conditionals
 *       hvordanKanDuJobbeIPeriodenDuHarBehovForSvangerskapspenger → three datagrid branches
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const advancePastInformationalPanels = () => {
  cy.get('#page-title').then(($heading) => {
    const title = $heading.text().trim();

    if (['Introduksjon', 'Veiledning'].includes(title)) {
      cy.clickNextStep();
      advancePastInformationalPanels();
    }
  });
};

describe('nav140410', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140410/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles address fields and folkeregister alerts based on the identity answer', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('folkeregistrerte adresse').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.contains('folkeregistrerte adresse').should('exist');
    });

    it('shows foreign-stay follow-ups only for the abroad branches', () => {
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.withinComponent('Har du bodd i Norge de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Jeg har bodd i utlandet, helt eller delvis' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Jeg skal bo i utlandet, helt eller delvis' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Jeg skal kun bo i Norge' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');
    });
  });

  describe('Yrkesaktivitet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140410/yrkesaktivitet?sub=paper');
      cy.defaultWaits();
    });

    it('shows freelancer and self-employed follow-ups only for the matching answers', () => {
      cy.findByLabelText('Når startet du som frilanser? (dd.mm.åååå)').should('not.exist');
      cy.findByRole('textbox', { name: /Hva heter virksomheten din/ }).should('not.exist');

      cy.withinComponent('Har du jobbet og hatt inntekt som frilanser de siste 4 ukene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Når startet du som frilanser? (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Når sluttet du som frilanser? (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Jobber du fortsatt som frilanser?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Når sluttet du som frilanser? (dd.mm.åååå)').should('exist');

      cy.withinComponent('Har du jobbet og hatt inntekt som selvstendig næringsdrivende de siste 4 ukene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Hva heter virksomheten din/ }).should('exist');
      cy.findByLabelText('Virksomhetens organisasjonsnummer').should('not.exist');
      cy.findByRole('combobox', { name: 'Velg land' }).should('not.exist');

      cy.withinComponent('Er næringen registrert i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Virksomhetens organisasjonsnummer').should('exist');

      cy.withinComponent('Er næringen registrert i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Virksomhetens organisasjonsnummer').should('not.exist');
      cy.findByRole('combobox', { name: 'Velg land' }).should('exist');

      cy.findByLabelText('Oppgi sluttdato for næringen (dd.mm.åååå)').should('not.exist');
      cy.withinComponent('Er dette en virksomhet du driver nå?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Oppgi sluttdato for næringen (dd.mm.åååå)').should('exist');
    });

    it('switches between the under-4-years and 4-years-or-more tenure branches', () => {
      cy.withinComponent('Har du jobbet og hatt inntekt som selvstendig næringsdrivende de siste 4 ukene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hva har du hatt i næringsresultat før skatt de siste 12 månedene?').should('not.exist');
      cy.findByLabelText(
        'Har du hatt en varig endring i arbeidsforholdet ditt, virksomheten eller arbeidssituasjonen din de siste 4 årene?',
      ).should('not.exist');

      cy.withinComponent('Hvor lenge har du hatt denne virksomheten?', () => {
        cy.findByRole('radio', { name: 'Under 4 år' }).click();
      });
      cy.findByLabelText('Hva har du hatt i næringsresultat før skatt de siste 12 månedene?').should('exist');
      cy.findByLabelText('Har du blitt yrkesaktiv i løpet av de 3 siste ferdigliknende årene?').should('exist');

      cy.withinComponent('Har du blitt yrkesaktiv i løpet av de 3 siste ferdigliknende årene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Når ble du yrkesaktiv? (dd.mm.åååå)').should('exist');

      cy.withinComponent('Hvor lenge har du hatt denne virksomheten?', () => {
        cy.findByRole('radio', { name: '4 år eller mer' }).click();
      });
      cy.findByLabelText('Hva har du hatt i næringsresultat før skatt de siste 12 månedene?').should('not.exist');
      cy.findByLabelText(
        'Har du hatt en varig endring i arbeidsforholdet ditt, virksomheten eller arbeidssituasjonen din de siste 4 årene?',
      ).should('exist');

      cy.withinComponent(
        'Har du hatt en varig endring i arbeidsforholdet ditt, virksomheten eller arbeidssituasjonen din de siste 4 årene?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByLabelText('Oppgi dato for endringen (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Oppgi næringsinntekten din etter endringen.').should('exist');
      cy.findByRole('textbox', {
        name: 'Her kan du skrive kort om hva som har endret seg i arbeidsforholdet ditt, virksomheten eller arbeidssituasjonen din',
      }).should('exist');
    });

    it('shows the EU/EØS follow-ups only when the applicant has foreign work', () => {
      cy.findByLabelText('Fra hvilken dato har du hatt jobb i EU/EØS-land? (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har du hatt jobb i EU/EØS-land de siste 4 ukene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fra hvilken dato har du hatt jobb i EU/EØS-land? (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Til hvilken dato har du hatt jobb i EU/EØS-land? (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Er det en jobb du har per i dag?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Til hvilken dato har du hatt jobb i EU/EØS-land? (dd.mm.åååå)').should('exist');
      cy.get('select[name="data[hvilketLandJobbetDuI]"]').should('exist');
      cy.findByRole('textbox', { name: /Oppgi navnet på arbeidsgiveren/ }).should('exist');
    });
  });

  describe('Om barnet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140410/omBarnet?sub=paper');
      cy.defaultWaits();
    });

    it('shows the birth date only when the child is born', () => {
      cy.findByLabelText('Når ble barnet født? (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Er barnet født?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Når ble barnet født? (dd.mm.åååå)').should('exist');

      cy.withinComponent('Er barnet født?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Når ble barnet født? (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Risiko og tiltak conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140410/risikoOgTiltak?sub=paper');
      cy.defaultWaits();
    });

    it('switches between the three work-capacity branches', () => {
      cy.findByLabelText('Fra hvilken dato kan du jobbe? (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Fra hvilken dato kan du jobbe redusert? (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Fra hvilken dato kan du ikke fortsette å jobbe? (dd.mm.åååå)').should('not.exist');

      cy.findByRole('group', { name: 'Hvordan kan du jobbe i perioden du har behov for svangerskapspenger?' }).within(
        () => {
          cy.findByRole('checkbox', { name: 'Jeg kan fortsette med samme stillingsprosent' }).check();
        },
      );
      cy.findByLabelText('Fra hvilken dato kan du jobbe? (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Til hvilken dato kan du jobbe? (dd.mm.åååå)').should('exist');

      cy.findByRole('group', { name: 'Hvordan kan du jobbe i perioden du har behov for svangerskapspenger?' }).within(
        () => {
          cy.findByRole('checkbox', { name: 'Jeg kan fortsette med samme stillingsprosent' }).uncheck();
          cy.findByRole('checkbox', { name: 'Jeg kan fortsette med redusert arbeidstid' }).check();
        },
      );
      cy.findByLabelText('Fra hvilken dato kan du jobbe? (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Fra hvilken dato kan du jobbe redusert? (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Oppgi stillingsprosenten du skal jobbe').should('exist');

      cy.findByRole('group', { name: 'Hvordan kan du jobbe i perioden du har behov for svangerskapspenger?' }).within(
        () => {
          cy.findByRole('checkbox', { name: 'Jeg kan fortsette med redusert arbeidstid' }).uncheck();
          cy.findByRole('checkbox', { name: 'Jeg kan ikke fortsette å jobbe' }).check();
        },
      );
      cy.findByLabelText('Fra hvilken dato kan du jobbe redusert? (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Fra hvilken dato kan du ikke fortsette å jobbe? (dd.mm.åååå)').should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140410?sub=paper');
      cy.defaultWaits();
      advancePastInformationalPanels();
    });

    it('fills required fields and verifies summary', () => {
      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Har du bodd i Norge de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Jeg har kun bodd i Norge' }).click();
      });
      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Jeg skal kun bo i Norge' }).click();
      });
      cy.clickNextStep();

      // Yrkesaktivitet
      cy.withinComponent('Har du jobbet og hatt inntekt som frilanser de siste 4 ukene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Når startet du som frilanser? (dd.mm.åååå)').type(dateOffset(-60));
      cy.withinComponent('Jobber du fortsatt som frilanser?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du jobbet og hatt inntekt som selvstendig næringsdrivende de siste 4 ukene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du hatt jobb i EU/EØS-land de siste 4 ukene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: 'Hvor skal du søke om svangerskapspenger fra?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Frilanser' }).check();
      });
      cy.clickNextStep();

      // Om barnet
      cy.findByLabelText('Når har du termindato? (dd.mm.åååå)').type(dateOffset(120));
      cy.withinComponent('Er barnet født?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Risiko og tiltak
      cy.findByRole('textbox', {
        name: 'Hva kan skade det ufødte barnet, og hvilke tiltak for å tilrettelegge har du vurdert i arbeidssituasjonen din?',
      }).type('Jeg trenger å unngå tunge løft og eksponering for kjemikalier.');
      cy.findByLabelText('Fra hvilken dato har du behov for svangerskapspenger? (dd.mm.åååå)').type(dateOffset(14));
      cy.findByRole('group', { name: 'Hvordan kan du jobbe i perioden du har behov for svangerskapspenger?' }).within(
        () => {
          cy.findByRole('checkbox', { name: 'Jeg kan ikke fortsette å jobbe' }).check();
        },
      );
      cy.findByLabelText('Fra hvilken dato kan du ikke fortsette å jobbe? (dd.mm.åååå)').type(dateOffset(14));

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg
      cy.findByRole('group', { name: /Medisinsk dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Yrkesaktivitet', () => {
        cy.contains('dd', 'Frilanser').should('exist');
      });
      cy.withinSummaryGroup('Om barnet', () => {
        cy.contains('dd', 'Nei').should('exist');
      });
    });
  });
});
