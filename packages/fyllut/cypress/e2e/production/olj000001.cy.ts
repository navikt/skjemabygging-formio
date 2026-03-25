/*
 * Production form tests for Søknad til oljepionernemnda
 * Form: olj000001
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Hvem som fyller ut søknaden (hvemSomFyllerUtSoknaden): 5 same-panel / panel-level conditionals
 *       hvemErDuSomFyllerUtSoknaden → relation/proxy follow-up questions
 *       hvaVarDinRelasjonTilOljepioneren=barn → erDuOver18Ar → harOljepionerenFlereBarn
 *       harOljepionerenFlereBarn=ja → senderDuEnSamletSoknadForAlleBarnaTilOljepioneren
 *       survivor/proxy branches → panel Den etterlatte som søker in the stepper
 *   - Den etterlatte som søker (denEtterlatteSomSoker): 4 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummerEtterlatt → fnr / fodselsdato + borDuINorgeEtterlatt
 *       borDuINorgeEtterlatt → address type / foreign address fields
 *       erKontaktadressenEnVegadresseEllerPostboksadresseEtterlatt → vegadresse / postboksadresse
 *   - Vedlegg (vedlegg): 2 cross-panel attachment conditionals
 *       survivor path → skifteattestEllerAnnenDokumentasjonSomBekrefterRelasjonenTilOljepioneren
 *       survivor child batch path → fullmaktForASokePaVegneAvAlleBarna
 */

const visitApplicantPanel = () => {
  cy.visit('/fyllut/olj000001/hvemSomFyllerUtSoknaden?sub=paper');
  cy.defaultWaits();
  cy.get('h2#page-title').should('contain.text', 'Hvem som fyller ut søknaden');
};

const answerRadio = (label: string | RegExp, value: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

const openSurvivorFlowStepper = () => {
  visitApplicantPanel();
  answerRadio('Hvem er du som fyller ut søknaden?', 'Jeg er etterlatt og søker på vegne av meg selv');
  answerRadio('Hva er var din relasjon til oljepioneren?', 'Ektefelle');
  cy.clickShowAllSteps();
};

const chooseAttachmentLater = (groupName: RegExp) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
};

describe('olj000001', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Hvem som fyller ut søknaden conditionals', () => {
    it('toggles survivor child follow-up questions', () => {
      visitApplicantPanel();

      cy.findByLabelText('Hva er var din relasjon til oljepioneren?').should('not.exist');
      cy.findByLabelText('Er du over 18 år?').should('not.exist');
      cy.findByLabelText('Har oljepioneren flere barn?').should('not.exist');
      cy.findByLabelText('Sender du én samlet søknad for alle barna til oljepioneren?').should('not.exist');

      answerRadio('Hvem er du som fyller ut søknaden?', 'Jeg er etterlatt og søker på vegne av meg selv');
      cy.findByLabelText('Hva er var din relasjon til oljepioneren?').should('exist');

      answerRadio('Hva er var din relasjon til oljepioneren?', 'Barn');
      cy.findByLabelText('Er du over 18 år?').should('exist');
      cy.findByLabelText('Har oljepioneren flere barn?').should('not.exist');

      answerRadio('Er du over 18 år?', 'Ja');
      cy.findByLabelText('Har oljepioneren flere barn?').should('exist');

      answerRadio('Har oljepioneren flere barn?', 'Ja');
      cy.findByLabelText('Sender du én samlet søknad for alle barna til oljepioneren?').should('exist');

      answerRadio('Hva er var din relasjon til oljepioneren?', 'Ektefelle');
      cy.findByLabelText('Er du over 18 år?').should('not.exist');
      cy.findByLabelText('Har oljepioneren flere barn?').should('not.exist');
      cy.findByLabelText('Sender du én samlet søknad for alle barna til oljepioneren?').should('not.exist');
    });

    it('shows the survivor panel only for survivor-type paths', () => {
      visitApplicantPanel();
      cy.clickShowAllSteps();

      cy.findByRole('link', { name: 'Den etterlatte som søker' }).should('not.exist');

      answerRadio('Hvem er du som fyller ut søknaden?', 'Jeg er oljepioner og søker på vegne av meg selv');
      cy.findByRole('link', { name: 'Den etterlatte som søker' }).should('not.exist');

      answerRadio('Hvem er du som fyller ut søknaden?', 'Jeg er etterlatt og søker på vegne av meg selv');
      answerRadio('Hva er var din relasjon til oljepioneren?', 'Ektefelle');
      cy.findByRole('link', { name: 'Den etterlatte som søker' }).should('exist');

      answerRadio('Hvem er du som fyller ut søknaden?', 'Jeg er verge');
      answerRadio('Er du verge til en oljepioner eller etterlatt?', 'Etterlatt');
      cy.findByLabelText('Hva er var den etterlattes relasjon til oljepioneren?').should('exist');
      cy.findByRole('link', { name: 'Den etterlatte som søker' }).should('exist');
    });
  });

  describe('Den etterlatte som søker conditionals', () => {
    it('switches between fnr and address branches for the survivor', () => {
      openSurvivorFlowStepper();
      cy.findByRole('link', { name: 'Den etterlatte som søker' }).click();
      cy.get('h2#page-title').should('contain.text', 'Den etterlatte som søker');

      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      answerRadio('Bor du i Norge?', 'Ja');
      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('exist');
      answerRadio('Er kontaktadressen en vegadresse eller postboksadresse?', 'vegadresse');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      answerRadio('Er kontaktadressen en vegadresse eller postboksadresse?', 'postboksadresse');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');

      answerRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer|postboks/i }).should('exist');
      cy.findByRole('combobox').should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the survivor attachment for survivor applicants', () => {
      openSurvivorFlowStepper();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.get('h2#page-title').should('contain.text', 'Vedlegg');

      cy.findByRole('group', { name: /Skifteattest|relasjonen til oljepioneren/ }).should('exist');
      cy.findByRole('group', { name: /Fullmakt/ }).should('not.exist');
    });

    it('shows the fullmakt attachment when a survivor child submits for all children', () => {
      visitApplicantPanel();
      answerRadio('Hvem er du som fyller ut søknaden?', 'Jeg er etterlatt og søker på vegne av meg selv');
      answerRadio('Hva er var din relasjon til oljepioneren?', 'Barn');
      answerRadio('Er du over 18 år?', 'Ja');
      answerRadio('Har oljepioneren flere barn?', 'Ja');
      answerRadio('Sender du én samlet søknad for alle barna til oljepioneren?', 'Ja, jeg søker for alle barna');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.get('h2#page-title').should('contain.text', 'Vedlegg');

      cy.findByRole('group', { name: /Fullmakt/ }).should('exist');
      cy.findByRole('group', { name: /Skifteattest|relasjonen til oljepioneren/ }).should('exist');
    });
  });

  describe('Summary', () => {
    it('fills the simplest paper flow and verifies the summary', () => {
      cy.visit('/fyllut/olj000001?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      // Hvem som fyller ut søknaden
      answerRadio('Hvem er du som fyller ut søknaden?', 'Jeg er oljepioner og søker på vegne av meg selv');
      cy.clickNextStep();

      cy.get('h2#page-title').should('contain.text', 'Dine opplysninger');

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Pioner');
      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Arbeidsforhold' }).click();
      cy.get('h2#page-title').should('contain.text', 'Arbeidsforhold');

      // Arbeidsforhold
      cy.get('body').then(($body) => {
        if ($body.text().match(/Hvilke arbeid hadde du\?/)) {
          cy.findByRole('checkbox', { name: 'Dekksarbeider' }).check();
        }

        if ($body.text().match(/Navn på arbeidsgiver/)) {
          cy.findAllByRole('textbox', { name: 'Navn på arbeidsgiver' }).first().type('Testrederiet');
        }

        if ($body.text().match(/Start arbeidsforhold/)) {
          cy.findAllByRole('textbox', { name: /Start arbeidsforhold/ })
            .first()
            .type('01.1980');
        }

        if ($body.text().match(/Slutt arbeidsforhold/)) {
          cy.findAllByRole('textbox', { name: /Slutt arbeidsforhold/ })
            .first()
            .type('12.1985');
        }
      });
      answerRadio('Har du andre opplysninger om arbeidsforholdet?', 'Nei');
      cy.clickNextStep();

      // Sykdom
      cy.get('body').then(($body) => {
        if ($body.text().match(/Hvilken sykdom påførte arbeidet deg\?/)) {
          cy.findByRole('checkbox', { name: 'Lungekreft' }).check();
        }

        if ($body.text().match(/Skriv kort om helsesituasjonen din i dag/)) {
          cy.findByRole('textbox', { name: 'Skriv kort om helsesituasjonen din i dag' }).type('Har vedvarende plager.');
        }
      });
      answerRadio('Får du eller har du fått behandling for sykdommen din?', 'Nei');
      answerRadio('Vet du navnet på fastlegen din eller legekontoret ditt?', 'Nei');
      cy.clickNextStep();

      // Yrkesskade og yrkessykdom
      answerRadio('Har du tidligere søkt om å få godkjent yrkesskade eller yrkessykdom hos Nav?', 'Nei');
      answerRadio('Har du hatt yrkesskadesak eller yrkessykdomssak hos et forsikringsselskap?', 'Nei');
      answerRadio(
        'Har du mottatt erstatning fra arbeidsgiver for den samme sykdommen som du nå søker erstatning for?',
        'Nei',
      );
      cy.clickNextStep();

      // Utbetaling
      answerRadio('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?', 'Norsk kontonummer');
      cy.findByLabelText('Norsk bankkontonummer for utbetaling').type('01234567892');
      cy.clickNextStep();

      // Vedlegg
      chooseAttachmentLater(/Medisinske opplysninger/);
      chooseAttachmentLater(/Dokumentasjon på arbeidsforhold på plattform/);
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      cy.get('body').then(($body) => {
        if ($body.text().match(/Erklæring fra søker/i)) {
          cy.findByRole('checkbox', { name: /Jeg bekrefter at opplysningene er riktige/i }).click();
          cy.clickNextStep();
        }
      });

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Arbeidsforhold', () => {
        cy.contains('dd', 'Dekksarbeider').should('exist');
      });
      cy.withinSummaryGroup('Sykdom', () => {
        cy.contains('dd', 'Lungekreft').should('exist');
      });
    });
  });
});
