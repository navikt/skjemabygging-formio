/*
 * Production form tests for Søknad om arbeidsavklaringspenger (AAP)
 * Form: nav111305
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 4 same-panel custom conditionals
 *       harDuFodselsnummer → folkeregister alert, address branch, address validity
 *   - Startdato (startdato): 5 same-panel conditionals
 *       harDuSykepengerNa / harDuPlanerOmATaFerieForDuErFerdigMedSykepenger / vetDuNarDuSkalTaFerie
 *       → ferie alert, date range, workday count
 *   - Bosted og jobb (bostedOgJobb): 6 same-panel conditionals
 *       residency answers → alternate work questions, two datagrids, EU id-number fields
 *   - Yrkesskade (page4): 4 same-panel conditionals
 *       yrkesskade answer → NAV follow-up + three alert branches
 *   - Kontaktperson for helseopplysninger (kontaktpersonForHelseopplysninger): 2 same-panel conditionals
 *       fastlege / annen lege → fastlege group and behandler datagrid
 *   - Barnetillegg (page6): 4 same-panel conditionals
 *       forsorgerDuBarnUnder18Ar / hvilkenRelasjonHarDuTilBarnet → child grid + alert branches
 *   - Student (student): 2 same-panel conditionals
 *       erDuStudent / harDuPlanerOmAKommeTilbakeTilStudiet → return question + study alert
 *   - Utbetalinger (utbetalinger): 7 same-panel conditionals
 *       employer extras + selectboxes → contradiction alert, AFP field, document hints
 *   - Vedlegg (vedlegg): 8 cross-panel conditionals
 *       student / barnetillegg / utbetalinger → conditional attachments
 */

const chooseRadio = (label: string, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const chooseAttachmentAnswer = (groupName: RegExp, answer: string | RegExp) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const paymentGroupName = /Kryss av for utbetalinger du får, eller nylig har søkt om/;

const checkPayment = (option: string | RegExp) => {
  cy.findByRole('group', { name: paymentGroupName }).within(() => {
    cy.findByRole('checkbox', { name: option }).check();
  });
};

const uncheckPayment = (option: string | RegExp) => {
  cy.findByRole('group', { name: paymentGroupName }).within(() => {
    cy.findByRole('checkbox', { name: option }).uncheck();
  });
};

const ensureTextboxValue = (label: string | RegExp, value: string) => {
  cy.findByRole('textbox', { name: label }).then(($input) => {
    if (!$input.val() && !$input.is(':disabled') && !$input.attr('readonly')) {
      cy.findByRole('textbox', { name: label }).type(value);
    }
  });
};

describe('nav111305', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('switches between folkeregister and address fields based on identity answers', () => {
      chooseRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      chooseRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse').should(
        'not.exist',
      );
      cy.findByLabelText('Bor du i Norge?').should('exist');

      chooseRadio('Bor du i Norge?', 'Nei');

      cy.findByRole('textbox', { name: /Vegnavn og husnummer, (evt\\.|eller) postboks/ }).should('exist');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });
  });

  describe('Startdato conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305/startdato?sub=paper');
      cy.defaultWaits();
    });

    it('toggles ferie follow-up questions, alert and date/count fields', () => {
      cy.findByLabelText('Har du planer om å ta ferie før du er ferdig med sykepenger?').should('not.exist');

      chooseRadio('Har du sykepenger nå?', 'Ja');

      cy.findByLabelText('Har du planer om å ta ferie før du er ferdig med sykepenger?').should('exist');
      chooseRadio('Har du planer om å ta ferie før du er ferdig med sykepenger?', 'Nei');

      cy.contains('Det er viktig at du gir oss beskjed hvis du bestemmer deg for å ta ferie').should('exist');
      cy.findByLabelText('Vet du når du skal ta ferie?').should('not.exist');

      chooseRadio('Har du planer om å ta ferie før du er ferdig med sykepenger?', 'Ja');

      cy.contains('Det er viktig at du gir oss beskjed hvis du bestemmer deg for å ta ferie').should('not.exist');
      cy.findByLabelText('Vet du når du skal ta ferie?').should('exist');

      chooseRadio('Vet du når du skal ta ferie?', 'Ja, jeg vet fra-dato og til-dato');

      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('exist');
      cy.findByLabelText('Skriv inn antall arbeidsdager du skal ta ferie').should('not.exist');

      chooseRadio('Vet du når du skal ta ferie?', 'Nei, men jeg vet antall arbeidsdager jeg skal ta ferie');

      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByLabelText('Skriv inn antall arbeidsdager du skal ta ferie').should('exist');

      chooseRadio('Har du sykepenger nå?', 'Nei');

      cy.findByLabelText('Har du planer om å ta ferie før du er ferdig med sykepenger?').should('not.exist');
      cy.findByLabelText('Vet du når du skal ta ferie?').should('not.exist');
    });
  });

  describe('Bosted og jobb conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305/bostedOgJobb?sub=paper');
      cy.defaultWaits();
    });

    it('shows the work-abroad path and EU id field when the user has lived in Norway', () => {
      chooseRadio('Har du bodd sammenhengende i Norge de fem siste årene?', 'Ja');

      cy.findByLabelText('Har du jobbet utenfor Norge de fem siste årene?').should('exist');
      cy.findByLabelText('Har du jobbet sammenhengende i Norge de fem siste årene?').should('not.exist');

      chooseRadio('Har du jobbet utenfor Norge de fem siste årene?', 'Ja');

      cy.findByRole('combobox', { name: 'Hvilket land jobbet du i?' }).should('exist');
      cy.findByRole('textbox', { name: /ID-nummer\/personnummer for det landet du har jobbet i/ }).should('not.exist');

      cy.findByRole('combobox', { name: 'Hvilket land jobbet du i?' }).type('Sver{downArrow}{enter}');
      cy.findByRole('textbox', { name: /ID-nummer\/personnummer for det landet du har jobbet i/ }).should('exist');

      chooseRadio('Har du jobbet utenfor Norge de fem siste årene?', 'Nei');
      cy.findByRole('combobox', { name: 'Hvilket land jobbet du i?' }).should('not.exist');
    });

    it('shows the residence-abroad path and its datagrid when the user has not lived in Norway', () => {
      chooseRadio('Har du bodd sammenhengende i Norge de fem siste årene?', 'Nei');

      cy.findByLabelText('Har du jobbet sammenhengende i Norge de fem siste årene?').should('exist');
      cy.findByLabelText('Har du jobbet utenfor Norge de fem siste årene?').should('not.exist');

      chooseRadio('Har du jobbet sammenhengende i Norge de fem siste årene?', 'Ja');
      cy.findByLabelText('Har du i tillegg til jobb i Norge, også jobbet i et annet land de fem siste årene?').should(
        'exist',
      );

      chooseRadio('Har du i tillegg til jobb i Norge, også jobbet i et annet land de fem siste årene?', 'Ja');

      cy.findByRole('combobox', { name: 'Hvilket land jobbet du i?' }).should('exist');

      chooseRadio('Har du i tillegg til jobb i Norge, også jobbet i et annet land de fem siste årene?', 'Nei');
      cy.findByRole('combobox', { name: 'Hvilket land jobbet du i?' }).should('not.exist');

      chooseRadio('Har du jobbet sammenhengende i Norge de fem siste årene?', 'Nei');

      cy.findByRole('combobox', { name: 'Hvilket land var du i?' }).should('exist');
      cy.findByRole('textbox', { name: /ID-nummer\/personnummer for det landet du har jobbet i/ }).should('not.exist');

      cy.findByRole('combobox', { name: 'Hvilket land var du i?' }).type('Sver{downArrow}{enter}');
      cy.findByRole('textbox', { name: /ID-nummer\/personnummer for det landet du har jobbet i/ }).should('exist');
    });
  });

  describe('Yrkesskade conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows the follow-up question and the matching informational alert for each answer', () => {
      chooseRadio('Har du en yrkesskade eller yrkessykdom som påvirker hvor mye du kan jobbe?', 'Ja');

      cy.findByLabelText('Har NAV godkjent yrkesskaden eller yrkessykdommen din?').should('exist');

      chooseRadio('Har NAV godkjent yrkesskaden eller yrkessykdommen din?', 'Ja');
      cy.contains('NAV vil sjekke at yrkesskaden eller yrkessykdommen din er helt eller delvis årsak').should('exist');

      chooseRadio(
        'Har NAV godkjent yrkesskaden eller yrkessykdommen din?',
        'Jeg venter på svar fra NAV på søknad om godkjenning av yrkesskade eller yrkessykdom',
      );
      cy.contains('Hvis NAV godkjenner yrkesskaden eller yrkessykdommen').should('exist');

      chooseRadio('Har NAV godkjent yrkesskaden eller yrkessykdommen din?', 'Vet ikke');
      cy.contains('NAV vil sjekke om yrkesskaden eller yrkessykdommen din er').should('exist');

      chooseRadio('Har du en yrkesskade eller yrkessykdom som påvirker hvor mye du kan jobbe?', 'Nei');
      cy.findByLabelText('Har NAV godkjent yrkesskaden eller yrkessykdommen din?').should('not.exist');
    });
  });

  describe('Kontaktperson for helseopplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305/kontaktpersonForHelseopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles the fastlege fields and behandler datagrid', () => {
      cy.findByRole('textbox', { name: /Legekontor/ }).should('not.exist');
      chooseRadio('Har du en fastlege?', 'Ja');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByRole('textbox', { name: /Legekontor/ }).should('exist');

      chooseRadio('Har du en fastlege?', 'Nei');
      cy.findByRole('textbox', { name: /Legekontor/ }).should('not.exist');

      chooseRadio(
        'Har du en annen lege eller behandler som du ønsker at NAV skal kunne kontakte for helseopplysninger?',
        'Ja',
      );
      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length.at.least', 1);
      cy.findAllByRole('textbox', { name: 'Etternavn' }).should('have.length.at.least', 1);

      chooseRadio(
        'Har du en annen lege eller behandler som du ønsker at NAV skal kunne kontakte for helseopplysninger?',
        'Nei',
      );
      cy.findByRole('textbox', { name: /Legekontor/ }).should('not.exist');
    });
  });

  describe('Barnetillegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305/page6?sub=paper');
      cy.defaultWaits();
    });

    it('shows child rows and the correct relationship guidance', () => {
      cy.findByRole('textbox', { name: 'Fornavn og mellomnavn' }).should('not.exist');

      chooseRadio('Forsørger du barn under 18 år?', 'Ja');

      cy.contains('Du får ikke barnetillegg hvis').should('exist');
      cy.findByRole('textbox', { name: 'Fornavn og mellomnavn' }).should('exist');

      chooseRadio('Hvilken relasjon har du til barnet?', 'Forelder');
      cy.contains('Bekreftelse på at du er forelder til barnet').should('exist');

      chooseRadio('Hvilken relasjon har du til barnet?', 'Fosterforelder');
      cy.contains('Dokumentasjon på at du er fosterforelder til barnet').should('exist');
    });
  });

  describe('Student conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305/student?sub=paper');
      cy.defaultWaits();
    });

    it('shows the return-to-study question and the study documentation alert only on the relevant branch', () => {
      cy.findByLabelText('Har du planer om å komme tilbake til studiet?').should('not.exist');

      chooseRadio('Er du student?', 'Ja, men har avbrutt studiet helt på grunn av sykdom');
      cy.findByLabelText('Har du planer om å komme tilbake til studiet?').should('exist');

      chooseRadio('Har du planer om å komme tilbake til studiet?', 'Ja');
      cy.contains('Bekreftelse fra studiested på hvilken dato studiet ble avbrutt fra').should('exist');

      chooseRadio('Har du planer om å komme tilbake til studiet?', 'Nei');
      cy.contains('Bekreftelse fra studiested på hvilken dato studiet ble avbrutt fra').should('not.exist');

      chooseRadio('Er du student?', 'Nei');
      cy.findByLabelText('Har du planer om å komme tilbake til studiet?').should('not.exist');
    });
  });

  describe('Utbetalinger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305/utbetalinger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles the contradiction alert, AFP field and document hints', () => {
      cy.findByRole('textbox', { name: 'Hvem utbetaler avtalefestet pensjon (AFP)?' }).should('not.exist');

      chooseRadio('Har du fått eller skal du få ekstra utbetalinger fra arbeidsgiver?', 'Ja');
      cy.contains('Dokumentasjon av ekstra utbetalinger fra arbeidsgiver').should('exist');

      checkPayment('Avtalefestet pensjon (AFP)');
      cy.findByRole('textbox', { name: 'Hvem utbetaler avtalefestet pensjon (AFP)?' }).should('exist');

      checkPayment('Omsorgsstønad (tidligere omsorgslønn)');
      cy.contains('Kopi av avtalen om omsorgsstønad fra kommunen din').should('exist');

      checkPayment('Ingen av disse');
      cy.contains('Du kan ikke krysse av for "Ingen av disse" samtidig som du har valgt en pengestøtte').should(
        'exist',
      );

      uncheckPayment('Ingen av disse');
      cy.contains('Du kan ikke krysse av for "Ingen av disse" samtidig som du har valgt en pengestøtte').should(
        'not.exist',
      );

      uncheckPayment('Avtalefestet pensjon (AFP)');
      cy.findByRole('textbox', { name: 'Hvem utbetaler avtalefestet pensjon (AFP)?' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the study attachment only when the student branch requires it', () => {
      cy.visit('/fyllut/nav111305/student?sub=paper');
      cy.defaultWaits();

      chooseRadio('Er du student?', 'Ja, men har avbrutt studiet helt på grunn av sykdom');
      chooseRadio('Har du planer om å komme tilbake til studiet?', 'Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Bekreftelse fra studiested/ }).should('exist');
    });

    it('switches child attachments when the relationship changes', () => {
      cy.visit('/fyllut/nav111305/page6?sub=paper');
      cy.defaultWaits();

      chooseRadio('Forsørger du barn under 18 år?', 'Ja');
      chooseRadio('Hvilken relasjon har du til barnet?', 'Forelder');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fødselsattest|adopsjonsbevis/ }).should('exist');
      cy.findByRole('group', { name: /fosterforelder/ }).should('not.exist');

      cy.findByRole('link', { name: 'Barnetillegg' }).click();
      chooseRadio('Hvilken relasjon har du til barnet?', 'Fosterforelder');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fødselsattest|adopsjonsbevis/ }).should('not.exist');
      cy.findByRole('group', { name: /fosterforelder/ }).should('exist');
    });

    it('shows utbetaling attachments when the supporting answers require them', () => {
      cy.visit('/fyllut/nav111305/utbetalinger?sub=paper');
      cy.defaultWaits();

      chooseRadio('Har du fått eller skal du få ekstra utbetalinger fra arbeidsgiver?', 'Ja');
      checkPayment('Omsorgsstønad (tidligere omsorgslønn)');
      checkPayment('Sykestipend fra Lånekassen');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /utbetalinger eller goder fra arbeidsgiver/ }).should('exist');
      cy.findByRole('group', { name: /omsorgsstønad/ }).should('exist');
      cy.findByRole('group', { name: /sykestipend fra Lånekassen/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111305?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).click();
      cy.clickNextStep();

      ensureTextboxValue('Fornavn', 'Ola');
      ensureTextboxValue('Etternavn', 'Nordmann');
      chooseRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      ensureTextboxValue(/fødselsnummer/i, '17912099997');
      cy.clickNextStep();

      chooseRadio('Har du sykepenger nå?', 'Nei');
      cy.clickNextStep();

      chooseRadio('Har du bodd sammenhengende i Norge de fem siste årene?', 'Ja');
      chooseRadio('Har du jobbet utenfor Norge de fem siste årene?', 'Nei');
      cy.clickNextStep();

      chooseRadio('Har du en yrkesskade eller yrkessykdom som påvirker hvor mye du kan jobbe?', 'Nei');
      cy.clickNextStep();

      chooseRadio('Har du en fastlege?', 'Nei');
      chooseRadio(
        'Har du en annen lege eller behandler som du ønsker at NAV skal kunne kontakte for helseopplysninger?',
        'Nei',
      );
      cy.clickNextStep();

      chooseRadio('Forsørger du barn under 18 år?', 'Nei');
      cy.clickNextStep();

      chooseRadio('Er du student?', 'Nei');
      cy.clickNextStep();

      chooseRadio('Har du fått eller skal du få ekstra utbetalinger fra arbeidsgiver?', 'Nei');
      checkPayment('Ingen av disse');
      cy.clickNextStep();

      cy.clickNextStep();

      chooseAttachmentAnswer(/Annen dokumentasjon/, /Nei/);
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Startdato', () => {
        cy.contains('dt', 'Har du sykepenger nå?').should('exist');
        cy.contains('dd', 'Nei').should('exist');
      });
      cy.withinSummaryGroup('Bosted og jobb', () => {
        cy.contains('dt', 'Har du bodd sammenhengende i Norge de fem siste årene?').should('exist');
        cy.contains('dd', 'Ja').should('exist');
      });
      cy.withinSummaryGroup('Utbetalinger', () => {
        cy.contains('dt', 'Kryss av for utbetalinger du får, eller nylig har søkt om:').should('exist');
        cy.contains('dd', 'Ingen av disse').should('exist');
      });
    });
  });
});
