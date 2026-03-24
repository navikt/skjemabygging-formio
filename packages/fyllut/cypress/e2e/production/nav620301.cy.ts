import nav620301Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav620301.json';

/*
 * Production form tests for Skjema for tilbakemelding til Nav om inntekt som skal holdes utenfor etteroppgjøret for avtalefestet pensjon (AFP)
 * Form: nav620301
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Koronapandemien og fordrevne fra Ukraina (koronapandemien): 2 same-panel conditionals
 *       harDuHattInntekterKnyttetTilKoronapandemien → inntektFraEkstraordinaertKoronarelatertArbeid
 *       harDuHattInntekterKnyttetTilArbeidMedFordrevneFraUkraina → inntektFraEkstraordinaertArbeidMedFordrevneFraUkraina
 *   - Inntekt (inntekt): 8 observable same-panel conditionals
 *       skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp
 *         → før-første-uttak section / etter-opphør section
 *       before-first-withdrawal radios
 *         → lonnForForsteUttak, feriepengerOpptjentForForsteUttak,
 *           etterbetalingAvLonnOpptjentForForsteUttak, bonusOpptjentForForsteUttak,
 *           sykpenger, annen inntekt container, flereAndreTyperInntekter
 *   - Vedlegg (vedlegg): 4 cross-panel attachment conditionals + 1 same-panel alert
 *       inntekt / koronapandemien answers → conditional attachments
 *       visible attachment answered with ettersender → ettersendings-alertstripe
 */

const visitPanel = (panelKey: string, title: string) => {
  cy.visit(`/fyllut/nav620301/${panelKey}?sub=paper`);
  cy.defaultWaits();
  cy.get('#page-title').should('contain.text', title);
};

const selectRadio = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const setCheckbox = (label: string, checked: boolean) => {
  cy.findByRole('group', { name: label })
    .find('input[type="checkbox"]')
    .then(($checkbox) => {
      if ($checkbox.is(':checked') !== checked) {
        cy.findByRole('group', { name: label }).find('input[type="checkbox"]').click();
      }
    });
};

const chooseEttersender = (groupName: RegExp) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
};

describe('nav620301', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav620301*', { body: nav620301Form });
    cy.intercept('GET', '/fyllut/api/translations/nav620301*', { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Koronapandemien og fordrevne fra Ukraina conditionals', () => {
    beforeEach(() => {
      visitPanel('koronapandemien', 'Koronapandemien og fordrevne fra Ukraina');
    });

    it('toggles both income amount fields from the pandemic and Ukraine radiopanels', () => {
      cy.findByLabelText(
        'Inntekt fra ekstraordinært koronarelatert arbeid med pensjonistlønn fram til 30. juni 2023, samt feriepenger opptjent fra slikt arbeid',
      ).should('not.exist');
      cy.findByLabelText('Inntekt fra arbeid med fordrevne fra Ukraina').should('not.exist');

      selectRadio('Har du hatt inntekter knyttet til koronapandemien?', 'Ja');
      cy.findByLabelText(
        'Inntekt fra ekstraordinært koronarelatert arbeid med pensjonistlønn fram til 30. juni 2023, samt feriepenger opptjent fra slikt arbeid',
      ).should('exist');

      selectRadio('Har du hatt inntekter knyttet til arbeid med fordrevne fra Ukraina?', 'Ja');
      cy.findByLabelText('Inntekt fra arbeid med fordrevne fra Ukraina').should('exist');

      selectRadio('Har du hatt inntekter knyttet til koronapandemien?', 'Nei');
      cy.findByLabelText(
        'Inntekt fra ekstraordinært koronarelatert arbeid med pensjonistlønn fram til 30. juni 2023, samt feriepenger opptjent fra slikt arbeid',
      ).should('not.exist');

      selectRadio('Har du hatt inntekter knyttet til arbeid med fordrevne fra Ukraina?', 'Nei');
      cy.findByLabelText('Inntekt fra arbeid med fordrevne fra Ukraina').should('not.exist');
    });
  });

  describe('Inntekt main section conditionals', () => {
    beforeEach(() => {
      visitPanel('inntekt', 'Inntekt');
    });

    it('switches between before-first-withdrawal and after-termination income sections', () => {
      cy.findByLabelText('Etteroppgjørsåret').should('not.exist');
      cy.findByRole('textbox', { name: 'Når begynte du med AFP? (mm.åååå)' }).should('not.exist');
      cy.findByLabelText(/Inntekt etter opphør/).should('not.exist');

      selectRadio(
        'Skal du gi opplysninger om inntekt som er opptjent før første uttak av AFP eller etter opphør av AFP?',
        'Jeg skal oppgi inntekt som jeg har tjent før jeg tok ut AFP første gangen',
      );
      cy.findByLabelText('Etteroppgjørsåret').should('exist');
      cy.findByRole('textbox', { name: 'Når begynte du med AFP? (mm.åååå)' }).should('exist');
      cy.findByLabelText(/Inntekt etter opphør/).should('not.exist');

      selectRadio(
        'Skal du gi opplysninger om inntekt som er opptjent før første uttak av AFP eller etter opphør av AFP?',
        'Jeg skal oppgi inntekt som jeg har tjent etter at jeg opphørte AFP',
      );
      cy.findByLabelText('Etteroppgjørsåret').should('not.exist');
      cy.findByRole('textbox', { name: 'Når begynte du med AFP? (mm.åååå)' }).should('not.exist');
      cy.findByLabelText(/Inntekt etter opphør/).should('exist');

      selectRadio(
        'Skal du gi opplysninger om inntekt som er opptjent før første uttak av AFP eller etter opphør av AFP?',
        'Begge deler',
      );
      cy.findByLabelText('Etteroppgjørsåret').should('exist');
      cy.findByLabelText(/Inntekt etter opphør/).should('exist');
    });

    it('toggles the before-first-withdrawal follow-up fields and extra income container', () => {
      selectRadio(
        'Skal du gi opplysninger om inntekt som er opptjent før første uttak av AFP eller etter opphør av AFP?',
        'Jeg skal oppgi inntekt som jeg har tjent før jeg tok ut AFP første gangen',
      );

      cy.findByLabelText('All lønn før første uttak i uttaksåret').should('not.exist');
      cy.findByLabelText('Feriepenger').should('not.exist');
      cy.findByLabelText(/Etterbetaling av lønn/).should('not.exist');
      cy.findByLabelText('Bonus, honorar eller royalty').should('not.exist');
      cy.findByLabelText('Sykepenger').should('not.exist');
      cy.findByRole('textbox', { name: 'Type inntekt' }).should('not.exist');
      cy.findByRole('checkbox', { name: 'Jeg har flere typer andre inntekter' }).should('not.exist');

      selectRadio('Har du fått utbetalt lønn før første uttak?', 'Ja');
      cy.findByLabelText('All lønn før første uttak i uttaksåret').should('exist');
      selectRadio('Har du fått utbetalt lønn før første uttak?', 'Nei');
      cy.findByLabelText('All lønn før første uttak i uttaksåret').should('not.exist');

      selectRadio('Har du fått feriepenger som er opptjent før første uttak av AFP, men utbetalt etter?', 'Ja');
      cy.findByLabelText('Feriepenger').should('exist');
      selectRadio('Har du fått feriepenger som er opptjent før første uttak av AFP, men utbetalt etter?', 'Nei');
      cy.findByLabelText('Feriepenger').should('not.exist');

      selectRadio(
        'Har du fått etterbetalt lønn som du har tjent opp før du tok ut AFP, men utbetalt etter uttak av AFP?',
        'Ja',
      );
      cy.findByLabelText(/Etterbetaling av lønn/).should('exist');
      selectRadio(
        'Har du fått etterbetalt lønn som du har tjent opp før du tok ut AFP, men utbetalt etter uttak av AFP?',
        'Nei',
      );
      cy.findByLabelText(/Etterbetaling av lønn/).should('not.exist');

      selectRadio(
        'Har du mottatt bonus, honorar eller royalty som er opptjent før første uttak av AFP, men utbetalt etter uttak av AFP?',
        'Ja',
      );
      cy.findByLabelText('Bonus, honorar eller royalty').should('exist');
      selectRadio(
        'Har du mottatt bonus, honorar eller royalty som er opptjent før første uttak av AFP, men utbetalt etter uttak av AFP?',
        'Nei',
      );
      cy.findByLabelText('Bonus, honorar eller royalty').should('not.exist');

      selectRadio('Har du fått utbetalt sykepenger?', 'Ja');
      cy.findByLabelText('Sykepenger').should('exist');
      selectRadio('Har du fått utbetalt sykepenger?', 'Nei');
      cy.findByLabelText('Sykepenger').should('not.exist');

      selectRadio('Har du hatt andre arbeids- eller næringsinntekter som ikke er nevnt ovenfor?', 'Ja');
      cy.findByRole('textbox', { name: 'Type inntekt' }).should('exist');
      cy.findByRole('group', { name: 'Jeg har flere typer andre inntekter' }).should('exist');
      cy.findAllByRole('textbox', { name: 'Type inntekt' }).should('have.length', 1);

      setCheckbox('Jeg har flere typer andre inntekter', true);
      cy.findAllByRole('textbox', { name: 'Type inntekt' }).should('have.length', 2);

      setCheckbox('Jeg har flere typer andre inntekter', false);
      cy.findAllByRole('textbox', { name: 'Type inntekt' }).should('have.length', 1);

      selectRadio('Har du hatt andre arbeids- eller næringsinntekter som ikke er nevnt ovenfor?', 'Nei');
      cy.findByRole('textbox', { name: 'Type inntekt' }).should('not.exist');
      cy.findByRole('group', { name: 'Jeg har flere typer andre inntekter' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals from inntekt', () => {
    beforeEach(() => {
      visitPanel('inntekt', 'Inntekt');
    });

    it('shows before-withdrawal attachments and lets the user choose ettersender on visible attachments', () => {
      selectRadio(
        'Skal du gi opplysninger om inntekt som er opptjent før første uttak av AFP eller etter opphør av AFP?',
        'Jeg skal oppgi inntekt som jeg har tjent før jeg tok ut AFP første gangen',
      );
      selectRadio('Har du fått feriepenger som er opptjent før første uttak av AFP, men utbetalt etter?', 'Ja');
      selectRadio(
        'Har du fått etterbetalt lønn som du har tjent opp før du tok ut AFP, men utbetalt etter uttak av AFP?',
        'Nei',
      );
      selectRadio(
        'Har du mottatt bonus, honorar eller royalty som er opptjent før første uttak av AFP, men utbetalt etter uttak av AFP?',
        'Ja',
      );
      selectRadio('Har du hatt andre arbeids- eller næringsinntekter som ikke er nevnt ovenfor?', 'Nei');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av lønnsslipp fra måneden før første uttak av AFP/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av lønnsslipp for utbetalte feriepenger/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av dokumentasjon på bonus, honorar eller royalty/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av dokumentasjon på etterbetaling av lønn/ }).should('not.exist');
      cy.findByRole('group', { name: /Kopi av lønnsslipp fra månedene etter opphør av AFP/ }).should('not.exist');

      chooseEttersender(/Kopi av dokumentasjon på bonus, honorar eller royalty/);
      cy.findByRole('group', { name: /Kopi av dokumentasjon på bonus, honorar eller royalty/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).should('be.checked');
      });
    });
  });

  describe('Vedlegg conditionals from koronapandemien', () => {
    beforeEach(() => {
      visitPanel('koronapandemien', 'Koronapandemien og fordrevne fra Ukraina');
    });

    it('shows employer confirmations only for the selected pandemic-related income answers', () => {
      selectRadio('Har du hatt inntekter knyttet til koronapandemien?', 'Ja');
      selectRadio('Har du hatt inntekter knyttet til arbeid med fordrevne fra Ukraina?', 'Nei');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Bekreftelse fra arbeidsgiver om at du har hatt ekstraordinært koronarelatert arbeid/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Bekreftelse fra arbeidsgiver om at du har hatt arbeid med fordrevne fra Ukraina/,
      }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav620301?sub=paper');
      cy.defaultWaits();
      cy.get('#page-title').should('exist');
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Koronapandemien og fordrevne fra Ukraina
      selectRadio('Har du hatt inntekter knyttet til koronapandemien?', 'Ja');
      cy.findByLabelText(
        'Inntekt fra ekstraordinært koronarelatert arbeid med pensjonistlønn fram til 30. juni 2023, samt feriepenger opptjent fra slikt arbeid',
      ).type('1000');
      selectRadio('Har du hatt inntekter knyttet til arbeid med fordrevne fra Ukraina?', 'Nei');
      cy.clickNextStep();

      // Inntekt
      selectRadio(
        'Skal du gi opplysninger om inntekt som er opptjent før første uttak av AFP eller etter opphør av AFP?',
        'Nei, jeg har kun hatt inntekt knyttet til koronapandemien eller arbeid med fordrevne fra Ukraina',
      );
      cy.clickNextStep();

      // Vedlegg
      chooseEttersender(/Bekreftelse fra arbeidsgiver om at du har hatt ekstraordinært koronarelatert arbeid/);
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
      cy.withinSummaryGroup('Koronapandemien og fordrevne fra Ukraina', () => {
        cy.contains('dd', /1\s*000/).should('exist');
      });
      cy.withinSummaryGroup('Inntekt', () => {
        cy.contains(
          'dd',
          'Nei, jeg har kun hatt inntekt knyttet til koronapandemien eller arbeid med fordrevne fra Ukraina',
        ).should('exist');
      });
    });
  });
});
