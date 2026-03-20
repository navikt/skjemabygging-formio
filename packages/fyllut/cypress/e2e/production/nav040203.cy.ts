/*
 * Production form tests for Bekreftelse på ansettelsesforhold
 * Form: nav040203
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Arbeidstaker - Personopplysninger (arbeidstakerPersonopplysninger): 2 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker / utenlandskPersonnummer
 *   - Arbeidstid (arbeidstid): 9 same-panel conditionals
 *       hvordanHarArbeidstakerJobbet → deltid / heltid / rotasjon / varierendeSporadiskArbeid branches
 *       harArbeidstakerHattFastDeltidsarbeidEllerVarierendeUkentligDeltidsarbeid → fastArbeidstid / varierendeArbeidstid
 *       onskerDuAOppgiArbeidstakersArbeidstidIDetteSkjemaetEllerOnskerDuALeggeVedTimelister → arbeidsperioderTimer
 *       harArbeidstakerHattPermisjonILopetAvArbeidsforholdet → permisjonsperioderMedLonn / permisjonsperioderUtenLonn
 *       harArbeidstakerHattUlonnetFerieILopetAvArbeidsforholdet → ferieperioderUtenLonn
 *   - Sluttårsak (sluttarsak): 4 same-panel conditionals
 *       hvaErArsakenTilAtArbeidstakerIkkeJobberHosArbeidsgiverLenger → oppsigelse/avskjed/oppsigelsesgrunn/oppsigelsesperiode fields
 *   - Inntekt (inntekt): 8 same-panel conditionals
 *       skatt / trygdeavgift → oppgiPeriode fields
 *       ytelser selectboxes → compensation groups
 *       harArbeidstakerFeriepengerTilUtbetaling → feriepenger details
 *       harArbeidstakerGittAvkallPaNoenRettigheterIHenholdTilArbeidsavtalen → rights waiver details
 *
 * Vedlegg has isAttachmentPanel=true and is reached through the stepper in the summary flow.
 */

describe('nav040203', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Arbeidstaker - Personopplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040203/arbeidstakerPersonopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fnr and foreign id fields when arbeidstaker fnr answer changes', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Utenlandsk personnummer/ }).should('not.exist');

      cy.withinComponent('Har arbeidstaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Utenlandsk personnummer/ }).should('not.exist');

      cy.withinComponent('Har arbeidstaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Utenlandsk personnummer/ }).should('exist');
    });
  });

  describe('Arbeidstid conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040203/arbeidstid?sub=paper');
      cy.defaultWaits();
    });

    it('shows and hides branch fields for the selected work type', () => {
      cy.findByLabelText('Har arbeidstaker hatt fast deltidsarbeid, eller varierende deltidsarbeid?').should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Oppgi type rotasjon' }).should('not.exist');
      cy.findByLabelText(
        'Ønsker du å oppgi arbeidstakers arbeidstid i dette skjemaet, eller ønsker du å legge ved timelister?',
      ).should('not.exist');

      cy.withinComponent('Hvordan har arbeidstaker jobbet?', () => {
        cy.findByRole('checkbox', { name: /^Deltid/ }).check();
      });
      cy.findByLabelText('Har arbeidstaker hatt fast deltidsarbeid, eller varierende deltidsarbeid?').should('exist');

      cy.withinComponent('Hvordan har arbeidstaker jobbet?', () => {
        cy.findByRole('checkbox', { name: /^Deltid/ }).uncheck();
        cy.findByRole('checkbox', { name: /^Rotasjon/ }).check();
      });
      cy.findByLabelText('Har arbeidstaker hatt fast deltidsarbeid, eller varierende deltidsarbeid?').should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Oppgi type rotasjon' }).should('exist');

      cy.withinComponent('Hvordan har arbeidstaker jobbet?', () => {
        cy.findByRole('checkbox', { name: /^Rotasjon/ }).uncheck();
        cy.findByRole('checkbox', { name: /^Varierende\/sporadisk arbeid/ }).check();
      });
      cy.findByRole('textbox', { name: 'Oppgi type rotasjon' }).should('not.exist');
      cy.findByLabelText(
        'Ønsker du å oppgi arbeidstakers arbeidstid i dette skjemaet, eller ønsker du å legge ved timelister?',
      ).should('exist');

      cy.withinComponent('Hvordan har arbeidstaker jobbet?', () => {
        cy.findByRole('checkbox', { name: /^Varierende\/sporadisk arbeid/ }).uncheck();
        cy.findByRole('checkbox', { name: /^Heltid/ }).check();
      });
      cy.findByLabelText(
        'Ønsker du å oppgi arbeidstakers arbeidstid i dette skjemaet, eller ønsker du å legge ved timelister?',
      ).should('not.exist');
      cy.findByLabelText('Oppgi antall timer per uke arbeidstakers stilling tilsvarer').should('exist');
    });

    it('toggles fast and variable deltid details', () => {
      cy.withinComponent('Hvordan har arbeidstaker jobbet?', () => {
        cy.findByRole('checkbox', { name: /^Deltid/ }).check();
      });

      cy.withinComponent('Har arbeidstaker hatt fast deltidsarbeid, eller varierende deltidsarbeid?', () => {
        cy.findByRole('radio', { name: 'Fast arbeidstid' }).click();
      });
      cy.findByLabelText('Oppgi antall timer per uke arbeidstakers stilling tilsvarer').should('exist');
      cy.findByRole('textbox', { name: 'Uke/år' }).should('not.exist');

      cy.withinComponent('Har arbeidstaker hatt fast deltidsarbeid, eller varierende deltidsarbeid?', () => {
        cy.findByRole('radio', { name: 'Varierende arbeidstid' }).click();
      });
      cy.findByLabelText('Oppgi antall timer per uke arbeidstakers stilling tilsvarer').should('not.exist');
      cy.findByRole('textbox', { name: 'Uke/år' }).should('exist');
      cy.findByLabelText('Antall timer').should('exist');

      cy.findByRole('group', {
        name: /Jeg vil legge ved dette i et eget vedlegg istedenfor å fylle ut denne tabellen/,
      })
        .find('input[type="checkbox"]')
        .click();
      cy.findByRole('textbox', { name: 'Uke/år' }).should('not.exist');
      cy.findByLabelText('Antall timer').should('not.exist');
    });

    it('toggles sporadisk arbeid, permisjon and ulønnet ferie fields', () => {
      cy.withinComponent('Hvordan har arbeidstaker jobbet?', () => {
        cy.findByRole('checkbox', { name: /^Varierende\/sporadisk arbeid/ }).check();
      });

      cy.withinComponent(
        'Ønsker du å oppgi arbeidstakers arbeidstid i dette skjemaet, eller ønsker du å legge ved timelister?',
        () => {
          cy.findByRole('radio', {
            name: 'Jeg vil opplyse om arbeidstid i dette skjemaet',
          }).click();
        },
      );
      cy.findByRole('textbox', { name: /Arbeidet fra og med/ }).should('exist');

      cy.withinComponent(
        'Ønsker du å oppgi arbeidstakers arbeidstid i dette skjemaet, eller ønsker du å legge ved timelister?',
        () => {
          cy.findByRole('radio', { name: 'Jeg vil legge ved timelister' }).click();
        },
      );
      cy.findByRole('textbox', { name: /Arbeidet fra og med/ }).should('not.exist');

      cy.findAllByRole('textbox', { name: /Permisjon fra og med/ }).should('have.length', 0);
      cy.findByRole('group', {
        name: /^Har arbeidstaker hatt permisjon i løpet av arbeidsforholdet\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Ja, med lønn/ }).check();
      });
      cy.findAllByRole('textbox', { name: /Permisjon fra og med/ }).should('have.length', 1);

      cy.findByRole('group', {
        name: /^Har arbeidstaker hatt permisjon i løpet av arbeidsforholdet\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Ja, med lønn/ }).uncheck();
        cy.findByRole('checkbox', { name: /^Ja, uten lønn/ }).check();
      });
      cy.findAllByRole('textbox', { name: /Permisjon fra og med/ }).should('have.length', 1);

      cy.findByRole('group', {
        name: /^Har arbeidstaker hatt permisjon i løpet av arbeidsforholdet\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Ja, uten lønn/ }).uncheck();
      });
      cy.findAllByRole('textbox', { name: /Permisjon fra og med/ }).should('have.length', 0);

      cy.findByRole('textbox', { name: /Ulønnet ferie fra og med/ }).should('not.exist');
      cy.withinComponent('Har arbeidstaker hatt ulønnet ferie i løpet av arbeidsforholdet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Ulønnet ferie fra og med/ }).should('exist');

      cy.withinComponent('Har arbeidstaker hatt ulønnet ferie i løpet av arbeidsforholdet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Ulønnet ferie fra og med/ }).should('not.exist');
    });
  });

  describe('Sluttårsak conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040203/sluttarsak?sub=paper');
      cy.defaultWaits();
    });

    it('shows oppsigelse details only for oppsagt and self-resigned paths', () => {
      cy.findByRole('textbox', { name: /oppsigelse er mottatt\/levert/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi oppsigelsesgrunn' }).should('not.exist');
      cy.findByLabelText('Arbeidet arbeidstaker i oppsigelsesperioden?').should('not.exist');

      cy.withinComponent('Hva er årsaken til at arbeidstaker ikke jobber hos arbeidsgiver lenger?', () => {
        cy.findByRole('radio', { name: 'Arbeidstaker er oppsagt' }).click();
      });
      cy.findByRole('textbox', { name: /oppsigelse er mottatt\/levert/ }).should('exist');
      cy.findByRole('textbox', { name: 'Oppgi oppsigelsesgrunn' }).should('exist');
      cy.findByLabelText('Arbeidet arbeidstaker i oppsigelsesperioden?').should('exist');
      cy.findByRole('textbox', { name: 'Oppgi årsak' }).should('not.exist');

      cy.withinComponent('Hva er årsaken til at arbeidstaker ikke jobber hos arbeidsgiver lenger?', () => {
        cy.findByRole('radio', { name: 'Arbeidstaker hadde en tidsbegrenset arbeidsavtale' }).click();
      });
      cy.findByRole('textbox', { name: /oppsigelse er mottatt\/levert/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi oppsigelsesgrunn' }).should('not.exist');
      cy.findByLabelText('Arbeidet arbeidstaker i oppsigelsesperioden?').should('not.exist');

      cy.withinComponent('Hva er årsaken til at arbeidstaker ikke jobber hos arbeidsgiver lenger?', () => {
        cy.findByRole('radio', { name: 'Arbeidstaker har sagt opp selv' }).click();
      });
      cy.findByRole('textbox', { name: /oppsigelse er mottatt\/levert/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi oppsigelsesgrunn' }).should('exist');
      cy.findByLabelText('Arbeidet arbeidstaker i oppsigelsesperioden?').should('exist');
    });

    it('shows dismissal reason only for avskjediget path', () => {
      cy.withinComponent('Hva er årsaken til at arbeidstaker ikke jobber hos arbeidsgiver lenger?', () => {
        cy.findByRole('radio', { name: 'Arbeidstaker er avskjediget' }).click();
      });
      cy.findByRole('textbox', { name: 'Oppgi årsak' }).should('exist');
      cy.findByLabelText('Arbeidet arbeidstaker i oppsigelsesperioden?').should('exist');
      cy.findByRole('textbox', { name: 'Oppgi oppsigelsesgrunn' }).should('not.exist');

      cy.withinComponent('Hva er årsaken til at arbeidstaker ikke jobber hos arbeidsgiver lenger?', () => {
        cy.findByRole('radio', { name: 'Sesongarbeidet er slutt' }).click();
      });
      cy.findByRole('textbox', { name: 'Oppgi årsak' }).should('not.exist');
      cy.findByLabelText('Arbeidet arbeidstaker i oppsigelsesperioden?').should('not.exist');
    });
  });

  describe('Inntekt conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040203/inntekt?sub=paper');
      cy.defaultWaits();
    });

    it('toggles period fields for tax and trygdeavgift answers', () => {
      cy.findAllByRole('textbox', { name: 'Oppgi periode' }).should('have.length', 0);

      cy.withinComponent('Har det blitt trukket ordinær skatt til Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findAllByRole('textbox', { name: 'Oppgi periode' }).should('have.length', 1);

      cy.withinComponent('Har det blitt trukket trygdeavgift til Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findAllByRole('textbox', { name: 'Oppgi periode' }).should('have.length', 2);

      cy.withinComponent('Har det blitt trukket ordinær skatt til Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findAllByRole('textbox', { name: 'Oppgi periode' }).should('have.length', 1);

      cy.withinComponent('Har det blitt trukket trygdeavgift til Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findAllByRole('textbox', { name: 'Oppgi periode' }).should('have.length', 0);
    });

    it('toggles ytelse, feriepenger and rights-waiver details', () => {
      cy.findAllByRole('textbox', { name: /For perioden fra/ }).should('have.length', 0);
      cy.findByRole('textbox', { name: 'Ytelse' }).should('not.exist');
      cy.findByRole('textbox', { name: /Opptjent i perioden fra/ }).should('not.exist');
      cy.findByRole('textbox', {
        name: 'Oppgi hvilken rettighet arbeidstaker har gitt avkall på',
      }).should('not.exist');

      cy.findByRole('group', {
        name: /^Har arbeidstaker mottatt eller mottar noen av følgende ytelser på grunn av arbeidsforholdets opphør\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Erstatning/ }).check();
      });
      cy.findAllByRole('textbox', { name: /For perioden fra/ }).should('have.length', 1);

      cy.findByRole('group', {
        name: /^Har arbeidstaker mottatt eller mottar noen av følgende ytelser på grunn av arbeidsforholdets opphør\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Etterlønn eller sluttpakke/ }).check();
        cy.findByRole('checkbox', { name: /^Lønn i oppsigelsestiden/ }).check();
      });
      cy.findAllByRole('textbox', { name: /For perioden fra/ }).should('have.length', 3);

      cy.findByRole('group', {
        name: /^Har arbeidstaker mottatt eller mottar noen av følgende ytelser på grunn av arbeidsforholdets opphør\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Andre ytelser/ }).check();
      });
      cy.findByRole('textbox', { name: 'Ytelse' }).should('exist');

      cy.findByRole('group', {
        name: /^Har arbeidstaker mottatt eller mottar noen av følgende ytelser på grunn av arbeidsforholdets opphør\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Erstatning/ }).uncheck();
        cy.findByRole('checkbox', { name: /^Etterlønn eller sluttpakke/ }).uncheck();
        cy.findByRole('checkbox', { name: /^Lønn i oppsigelsestiden/ }).uncheck();
        cy.findByRole('checkbox', { name: /^Andre ytelser/ }).uncheck();
      });
      cy.findAllByRole('textbox', { name: /For perioden fra/ }).should('have.length', 0);
      cy.findByRole('textbox', { name: 'Ytelse' }).should('not.exist');

      cy.withinComponent('Har arbeidstaker feriepenger til utbetaling?', () => {
        cy.findByRole('radio', { name: 'Ja, de er utbetalt' }).click();
      });
      cy.findByRole('textbox', { name: /Opptjent i perioden fra/ }).should('exist');

      cy.withinComponent('Har arbeidstaker feriepenger til utbetaling?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Opptjent i perioden fra/ }).should('not.exist');

      cy.withinComponent('Har arbeidstaker gitt avkall på noen rettigheter i henhold til arbeidsavtalen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Oppgi hvilken rettighet arbeidstaker har gitt avkall på',
      }).should('exist');

      cy.withinComponent('Har arbeidstaker gitt avkall på noen rettigheter i henhold til arbeidsavtalen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Oppgi hvilken rettighet arbeidstaker har gitt avkall på',
      }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040203?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Arbeidsgiver
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
      cy.findByRole('textbox', { name: 'Kontaktperson' }).type('Kari Kontakt');
      cy.findByRole('textbox', { name: /E-post/ }).type('test@example.com');
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0101');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Arbeidstaker - Personopplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har arbeidstaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Vedrørende arbeidsforholdet
      cy.findByRole('textbox', { name: 'Stillingstittel eller yrke' }).type('Utvikler');
      cy.findByRole('textbox', { name: 'Bransje' }).type('IT');
      cy.findByRole('textbox', { name: /Arbeidet fra og med/ }).type('01.01.2024');
      cy.findByRole('textbox', { name: /Arbeidet til og med/ }).type('31.12.2024');
      cy.clickNextStep();

      // Arbeidstid – choose simplest path
      cy.withinComponent('Hvordan har arbeidstaker jobbet?', () => {
        cy.findByRole('checkbox', { name: /^Heltid/ }).check();
      });
      cy.findByLabelText('Oppgi stillingsprosent').type('100');
      cy.findByLabelText('Oppgi antall timer per uke arbeidstakers stilling tilsvarer').type('37.5');
      cy.findByRole('group', {
        name: /^Har arbeidstaker hatt permisjon i løpet av arbeidsforholdet\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Nei/ }).check();
      });
      cy.withinComponent('Har arbeidstaker hatt ulønnet ferie i løpet av arbeidsforholdet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Sluttårsak – choose path with the fewest extra fields
      cy.withinComponent('Hva er årsaken til at arbeidstaker ikke jobber hos arbeidsgiver lenger?', () => {
        cy.findByRole('radio', { name: 'Arbeidstaker hadde en tidsbegrenset arbeidsavtale' }).click();
      });
      cy.findByRole('textbox', { name: /arbeidstakers siste faktiske arbeidsdag/ }).type('31.12.2024');
      cy.clickNextStep();

      // Inntekt – choose no/ingen paths
      cy.findByLabelText('Oppgi arbeidstakers timelønn').type('250');
      cy.findByLabelText('Oppgi arbeidstakers skattepliktige bruttoinntekt forrige avsluttede kalenderår').type(
        '400000',
      );
      cy.findByLabelText('Oppgi arbeidstakers skattepliktige bruttoinntekt hittil i år').type('350000');
      cy.findByRole('textbox', { name: /Lønn utbetalt til og med/ }).type('31.12.2024');
      cy.withinComponent('Har det blitt trukket ordinær skatt til Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har det blitt trukket trygdeavgift til Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', {
        name: /^Har arbeidstaker mottatt eller mottar noen av følgende ytelser på grunn av arbeidsforholdets opphør\?/,
      }).within(() => {
        cy.findByRole('checkbox', { name: /^Ingen/ }).check();
      });
      cy.withinComponent('Har arbeidstaker feriepenger til utbetaling?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har arbeidstaker gitt avkall på noen rettigheter i henhold til arbeidsavtalen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true, navigate via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Arbeidstaker - Personopplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Sluttårsak', () => {
        cy.get('dt')
          .eq(0)
          .should('contain.text', 'Hva er årsaken til at arbeidstaker ikke jobber hos arbeidsgiver lenger?');
        cy.get('dd').eq(0).should('contain.text', 'Arbeidstaker hadde en tidsbegrenset arbeidsavtale');
      });
    });
  });
});
