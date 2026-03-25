/*
 * Production form tests for Søknad om barnebidrag etter fylte 18 år
 * Form: nav540006
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Hvem som fyller ut søknaden (hvemSomFyllerUtSoknaden): 2 same-panel / panel-level conditionals
 *       hvemErDuSomSoker → harBidragsbarnetFylt18Ar, erDuVergeForDenSomSoker
 *       hvemErDuSomSoker → role-specific downstream panels
 *   - Videregående opplæring (videregaendeOpplaering): 1 same-panel conditional
 *       erDuIVideregaendeOpplaringFraTidspunktetDuSokerFra → navnetPaSkolen1
 *   - Søknaden gjelder (soknadenGjelder): 2 same-panel conditionals
 *       hvaSokerDuOm → jegSokerOmFastsettelseFraOgMedMmAaaa
 *       hvaSokerDuOm → hvaErGrunnenTilAtDuSokerOmEndring, jegSokerOmEndringFraOgMedMmAaaa
 *   - Om den du søker bidrag fra (omDenDuSokerBidragFra): 2 same-panel conditionals
 *       kjennerDuDetNorskeFodselsnummeretEllerDNummeretTilDenDuSokerBidragFra
 *       → fodselsnummerEllerDNummerTilDenDuSokerBidragFra / vetDuFodselsdatoenTilDenDuSokerBidragFra
 *   - Vedlegg (vedlegg): 2 cross-panel attachment conditionals
 *       erDuIVideregaendeOpplaringFraTidspunktetDuSokerFra → bekreftelsePaSkolegang
 *       harDuAvtaltAHaSamvaerMedDenSomErBidragspliktigEtterFylte18Ar → avtaleOmSamvaer
 */

const roleBidragsbarnet = 'Bidragsbarnet etter fylte 18 år';
const roleForelder = 'En forelder på vegne av bidragsbarnet';
const roleAndre = 'Andre på vegne av bidragsbarnet';

const visitApplicantPanel = () => {
  cy.visit('/fyllut/nav540006/hvemSomFyllerUtSoknaden?sub=paper');
  cy.defaultWaits();
};

const chooseApplicantRole = (role: string) => {
  cy.withinComponent('Hvem er du som søker?', () => {
    cy.findByRole('radio', { name: role }).click();
  });
};

const openBidragsbarnetPanel = (panelTitle: string) => {
  visitApplicantPanel();
  chooseApplicantRole(roleBidragsbarnet);
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

const answerRadio = (label: string | RegExp, value: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

describe('nav540006', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Hvem som fyller ut søknaden conditionals', () => {
    beforeEach(() => {
      visitApplicantPanel();
    });

    it('toggles role-specific questions for parent and guardian paths', () => {
      cy.findByLabelText('Har bidragsbarnet fylt 18 år?').should('not.exist');
      cy.findByLabelText('Er du verge for den som søker?').should('not.exist');

      chooseApplicantRole(roleForelder);
      cy.findByLabelText('Har bidragsbarnet fylt 18 år?').should('exist');
      cy.findByLabelText('Er du verge for den som søker?').should('not.exist');

      chooseApplicantRole(roleAndre);
      cy.findByLabelText('Har bidragsbarnet fylt 18 år?').should('not.exist');
      cy.findByLabelText('Er du verge for den som søker?').should('exist');
    });

    it('shows role-specific downstream panels in the stepper', () => {
      cy.clickShowAllSteps();

      chooseApplicantRole(roleBidragsbarnet);
      cy.findByRole('link', { name: 'Om den du søker bidrag fra' }).should('exist');
      cy.findByRole('link', { name: 'Om den bidragspliktige' }).should('not.exist');
      cy.findByRole('link', { name: 'Om deg som fyller ut søknaden' }).should('not.exist');

      chooseApplicantRole(roleForelder);
      cy.findByRole('link', { name: 'Om den du søker bidrag fra' }).should('not.exist');
      cy.findByRole('link', { name: 'Om den bidragspliktige' }).should('exist');
    });
  });

  describe('Videregående opplæring conditionals', () => {
    beforeEach(() => {
      openBidragsbarnetPanel('Videregående opplæring');
    });

    it('shows school name only when the applicant is in upper secondary school', () => {
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).should('not.exist');

      answerRadio('Er du i videregående opplæring fra tidspunktet du søker fra?', 'Ja');
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).should('exist');

      answerRadio('Er du i videregående opplæring fra tidspunktet du søker fra?', 'Nei');
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).should('not.exist');
    });
  });

  describe('Søknaden gjelder conditionals', () => {
    beforeEach(() => {
      openBidragsbarnetPanel('Søknaden gjelder');
    });

    it('switches between fastsettelse and endring fields', () => {
      cy.findByRole('textbox', { name: /Jeg søker om fastsettelse fra og med/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Jeg søker om endring fra og med/ }).should('not.exist');

      answerRadio('Hva søker du om?', 'Fastsettelse av barnebidrag etter 18 år');
      cy.findByRole('textbox', { name: /Jeg søker om fastsettelse fra og med/ }).should('exist');
      cy.findByRole('textbox', { name: /Jeg søker om endring fra og med/ }).should('not.exist');
      cy.findByLabelText('Søker du tilbake i tid?').should('exist');

      answerRadio('Hva søker du om?', 'Endring av barnebidrag etter 18 år');
      cy.findByRole('textbox', { name: /Jeg søker om fastsettelse fra og med/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Jeg søker om endring fra og med/ }).should('exist');
      cy.findByRole('textbox', { name: 'Hva er grunnen til at du søker om endring?' }).should('exist');
    });
  });

  describe('Om den du søker bidrag fra conditionals', () => {
    beforeEach(() => {
      openBidragsbarnetPanel('Om den du søker bidrag fra');
    });

    it('switches between fødselsnummer and birth-date/address discovery flows', () => {
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer til den du søker bidrag fra/i }).should(
        'not.exist',
      );
      cy.findByLabelText('Vet du fødselsdatoen til den du søker bidrag fra?').should('not.exist');

      answerRadio('Kjenner du det norske fødselsnummeret eller d-nummeret til den søker bidrag fra?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer til den du søker bidrag fra/i }).should('exist');
      cy.findByLabelText('Vet du fødselsdatoen til den du søker bidrag fra?').should('not.exist');
      cy.findByLabelText('Bor den du søker bidrag fra på sin folkeregistrerte adresse?').should('exist');

      answerRadio('Kjenner du det norske fødselsnummeret eller d-nummeret til den søker bidrag fra?', 'Nei');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer til den du søker bidrag fra/i }).should(
        'not.exist',
      );
      cy.findByLabelText('Vet du fødselsdatoen til den du søker bidrag fra?').should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      visitApplicantPanel();
      chooseApplicantRole(roleBidragsbarnet);
      cy.clickShowAllSteps();
    });

    it('shows school attachment but hides samvær attachment when only school documentation is required', () => {
      cy.findByRole('link', { name: 'Videregående opplæring' }).click();
      answerRadio('Er du i videregående opplæring fra tidspunktet du søker fra?', 'Ja');
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).type('Oslo videregående skole');

      cy.findByRole('link', { name: 'Søknaden gjelder' }).click();
      answerRadio('Hva søker du om?', 'Fastsettelse av barnebidrag etter 18 år');
      cy.findByRole('textbox', { name: /Jeg søker om fastsettelse fra og med/ }).type('01.2027');
      answerRadio('Søker du tilbake i tid?', 'Nei');
      answerRadio('Ønsker du at Skatteetaten skal kreve inn barnebidraget?', 'Nei, vi gjør opp privat oss i mellom');

      cy.findByRole('link', { name: 'Avtalt samvær' }).click();
      answerRadio('Har du avtalt å ha samvær med den som er bidragspliktig etter fylte 18 år?', 'Nei');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Bekreftelse på skolegang/ }).should('exist');
      cy.findByRole('group', { name: /Avtale om samvær|Avtale om samvaer/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitApplicantPanel();
    });

    it('fills required fields and verifies summary', () => {
      // Hvem som fyller ut søknaden
      chooseApplicantRole(roleBidragsbarnet);
      cy.clickNextStep();

      // Veiledning
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      // Videregående opplæring
      answerRadio('Er du i videregående opplæring fra tidspunktet du søker fra?', 'Ja');
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).type('Oslo videregående skole');
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      answerRadio('Blir du helt eller delvis forsørget av barnevernet, eller en institusjon?', 'Nei');
      cy.clickNextStep();

      // Søknaden gjelder
      answerRadio('Hva søker du om?', 'Fastsettelse av barnebidrag etter 18 år');
      cy.findByRole('textbox', { name: /Jeg søker om fastsettelse fra og med/ }).type('01.2027');
      answerRadio('Søker du tilbake i tid?', 'Nei');
      answerRadio('Ønsker du at Skatteetaten skal kreve inn barnebidraget?', 'Nei, vi gjør opp privat oss i mellom');
      cy.clickNextStep();

      // Avtalt samvær
      answerRadio('Har du avtalt å ha samvær med den som er bidragspliktig etter fylte 18 år?', 'Nei');
      cy.clickNextStep();

      // Om den du søker bidrag fra
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Bidragspliktig');
      answerRadio('Kjenner du det norske fødselsnummeret eller d-nummeret til den søker bidrag fra?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer til den du søker bidrag fra/i }).type(
        '17912099997',
      );
      answerRadio('Bor den du søker bidrag fra på sin folkeregistrerte adresse?', 'Ja');
      cy.clickNextStep();

      // Nåværende bidrag
      answerRadio('Har du en avtale om barnebidrag som gjelder fra etter fylte 18 år?', 'Nei');
      cy.clickNextStep();

      // Jobb
      answerRadio('Er du i jobb?', 'Nei');
      cy.clickNextStep();

      // Inntekt
      answerRadio(/Har du skattepliktig inntekt i Norge/, 'Ja');
      answerRadio('Har du skattepliktig inntekt som selvstendig næringsdrivende eller frilanser?', 'Nei');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg
      cy.findByRole('group', { name: /Bekreftelse på skolegang/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Videregående opplæring', () => {
        cy.contains('dt', 'Navnet på skolen').next('dd').should('contain.text', 'Oslo videregående skole');
      });
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.contains('dt', 'Hva søker du om?')
          .next('dd')
          .should('contain.text', 'Fastsettelse av barnebidrag etter 18 år');
      });
      cy.withinSummaryGroup('Om den du søker bidrag fra', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Kari');
      });
    });
  });
});
