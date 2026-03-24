/*
 * Production form tests for Svar i sak om barnebidrag etter fylte 18 år
 * Form: nav540010
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Hvem som fyller ut svaret (hvemSomFyllerUtSvaret): 2 same-panel / panel-level conditionals
 *       hvemErDuSomSoker → harBidragsbarnetFylt18Ar / erDuVergeForBidragsbarnet
 *       hvemErDuSomSoker + harBidragsbarnetFylt18Ar → role-specific downstream panels
 *   - Søknaden gjelder (soknadenGjelder): 2 custom same-panel conditionals
 *       hvaHarDenBidragspliktigeSoktOm → sokerBidragsbarnetTilbakeITid / sokerTilbakeITid
 *       sokerBidragsbarnetTilbakeITid → contribution follow-ups
 *   - Videregående opplæring (videregaendeOpplaering): 2 custom same-panel conditionals
 *       erBidragsbarnetIVideregaendeOpplaeringFraTidspunktetDetErSoktFra → navnetPaSkolen / skolegang alert
 *   - Avtalt samvær (avtaltSamvaer): 4 custom/same-panel conditionals
 *       harBidragsbarnetOgDenBidragspliktigeAvtaltAHaSamvaerEtterFylte18Ar → samværsgruppe
 *       samvaeretErAvtaltFastsattVed → harNavMottattSamvaersavtalenTidligereIDenneSaken / avtalenGjelderFraDato
 *       harBidragsbarnetSamvaerIFerier → ferie alert
 *       gjennomforesSamvaeretSlikDetErAvtalt2 → textarea
 *   - Vedlegg (vedlegg): 2 cross-panel attachment conditionals
 *       erBidragsbarnetIVideregaendeOpplaeringFraTidspunktetDetErSoktFra → bekreftelsePaSkolegang
 *       harNavMottattSamvaersavtalenTidligereIDenneSaken=Nei → avtaleOmSamvaer
 */

const formPath = 'nav540010';
const submissionMethod = '?sub=paper';

const roleBidragsbarnet = 'Bidragsbarnet etter fylte 18 år';
const roleForelder = 'En forelder på vegne av bidragsbarnet';
const roleBidragspliktig = 'En bidragspliktig forelder på vegne av seg selv';
const roleAndre = 'Andre på vegne av bidragsbarnet';

const visitPath = (path = '') => {
  cy.visit(`/fyllut/${formPath}${path}${submissionMethod}`);
  cy.defaultWaits();
};

const answerRadio = (label: string | RegExp, value: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

const prepareParentAdultPath = () => {
  visitPath('/hvemSomFyllerUtSvaret');
  answerRadio('Hvem er du som skal svare?', roleForelder);
  answerRadio('Har bidragsbarnet fylt 18 år?', 'Ja');
};

const openParentAdultPanel = (title: string) => {
  prepareParentAdultPath();
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: title }).click();
};

describe('nav540010', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Hvem som fyller ut svaret conditionals', () => {
    beforeEach(() => {
      visitPath('/hvemSomFyllerUtSvaret');
    });

    it('toggles role-specific follow-up questions and downstream panels', () => {
      cy.clickShowAllSteps();

      cy.findByLabelText('Har bidragsbarnet fylt 18 år?').should('not.exist');
      cy.findByLabelText('Er du verge for bidragsbarnet?').should('not.exist');

      answerRadio('Hvem er du som skal svare?', roleForelder);
      cy.findByLabelText('Har bidragsbarnet fylt 18 år?').should('exist');
      cy.findByLabelText('Er du verge for bidragsbarnet?').should('not.exist');
      answerRadio('Har bidragsbarnet fylt 18 år?', 'Ja');
      cy.findByRole('link', { name: 'Om deg som fyller ut dette skjemaet' }).should('exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('not.exist');

      answerRadio('Hvem er du som skal svare?', roleBidragspliktig);
      cy.findByLabelText('Har bidragsbarnet fylt 18 år?').should('not.exist');
      cy.findByRole('link', { name: 'Boforhold og andre egne barn' }).should('exist');
      cy.findByRole('link', { name: 'Din jobb' }).should('exist');
      cy.findByRole('link', { name: 'Jobb' }).should('not.exist');

      answerRadio('Hvem er du som skal svare?', roleAndre);
      cy.findByLabelText('Er du verge for bidragsbarnet?').should('exist');
      cy.findByRole('link', { name: 'Om deg som fyller ut dette skjemaet' }).should('exist');

      answerRadio('Hvem er du som skal svare?', roleBidragsbarnet);
      cy.findByLabelText('Er du verge for bidragsbarnet?').should('not.exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('link', { name: 'Om bidragsbarnet' }).should('not.exist');
      cy.findByRole('link', { name: 'Din jobb' }).should('not.exist');
    });
  });

  describe('Søknaden gjelder conditionals', () => {
    beforeEach(() => {
      openParentAdultPanel('Søknaden gjelder');
    });

    it('shows backdating follow-ups only on the fastsettelse path', () => {
      cy.findByLabelText('Har den bidragspliktige søkt tilbake i tid?').should('not.exist');
      cy.findByRole('textbox', {
        name: /Beskriv hva den bidragspliktige har betalt, og for hvilke perioder det gjelder/,
      }).should('not.exist');

      answerRadio('Hva har den bidragspliktige søkt om?', 'Fastsettelse av barnebidrag etter 18 år');
      cy.findByLabelText('Har den bidragspliktige søkt tilbake i tid?').should('exist');

      answerRadio('Har den bidragspliktige søkt tilbake i tid?', 'Ja');
      cy.findByLabelText(
        'Har den bidragspliktige forsørget bidragsbarnet noe økonomisk i perioden det er søkt tilbake i tid?',
      ).should('exist');

      answerRadio(
        'Har den bidragspliktige forsørget bidragsbarnet noe økonomisk i perioden det er søkt tilbake i tid?',
        'Ja',
      );
      cy.findByRole('textbox', {
        name: /Beskriv hva den bidragspliktige har betalt, og for hvilke perioder det gjelder/,
      }).should('exist');

      answerRadio('Har den bidragspliktige søkt tilbake i tid?', 'Nei');
      cy.findByRole('textbox', {
        name: /Beskriv hva den bidragspliktige har betalt, og for hvilke perioder det gjelder/,
      }).should('not.exist');

      answerRadio('Hva har den bidragspliktige søkt om?', 'Endring av barnebidrag etter 18 år');
      cy.findByLabelText('Har den bidragspliktige søkt tilbake i tid?').should('not.exist');
    });
  });

  describe('Videregående opplæring conditionals', () => {
    beforeEach(() => {
      openParentAdultPanel('Videregående opplæring');
      cy.findByRole('link', { name: 'Søknaden gjelder' }).click();
      answerRadio('Hva har den bidragspliktige søkt om?', 'Fastsettelse av barnebidrag etter 18 år');
      cy.findByRole('link', { name: 'Videregående opplæring' }).click();
    });

    it('shows school details only when bidragsbarnet går på videregående skole', () => {
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).should('not.exist');

      answerRadio('Er bidragsbarnet i videregående opplæring fra tidspunktet det er søkt fra?', 'Ja');
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).should('exist');
      cy.findByText(/bekreftelse på at bidragsbarnet går på videregående skole/i).should('exist');

      answerRadio('Er bidragsbarnet i videregående opplæring fra tidspunktet det er søkt fra?', 'Nei');
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).should('not.exist');
    });
  });

  describe('Avtalt samvær conditionals', () => {
    beforeEach(() => {
      openParentAdultPanel('Søknaden gjelder');
      answerRadio('Hva har den bidragspliktige søkt om?', 'Fastsettelse av barnebidrag etter 18 år');
      cy.findByRole('link', { name: 'Avtalt samvær' }).click();
    });

    it('toggles samvær follow-up fields for the parent-on-behalf path', () => {
      cy.findByLabelText('Samværet er avtalt ved').should('not.exist');

      answerRadio('Har bidragsbarnet og den bidragspliktige avtalt å ha samvær etter fylte 18 år?', 'Ja');
      cy.findByLabelText('Samværet er avtalt ved').should('exist');
      cy.findByLabelText('Har Nav mottatt samværsavtalen tidligere i denne saken?').should('not.exist');
      cy.findByRole('textbox', { name: /Avtalen gjelder fra dato/ }).should('not.exist');

      answerRadio('Samværet er avtalt ved', 'skriftlig avtale');
      cy.findByLabelText('Har Nav mottatt samværsavtalen tidligere i denne saken?').should('exist');

      answerRadio('Samværet er avtalt ved', 'muntlig avtale');
      cy.findByLabelText('Har Nav mottatt samværsavtalen tidligere i denne saken?').should('not.exist');
      cy.findByRole('textbox', { name: /Avtalen gjelder fra dato/ }).should('exist');

      answerRadio('Har bidragsbarnet samvær i ferier?', 'Ja');
      cy.findByText(/Dette samværet skal du legge inn i neste steg/i).should('exist');

      answerRadio('Gjennomføres samværet slik det er avtalt?', 'Nei');
      cy.findByRole('textbox', {
        name: /Beskriv hvordan samværet har vært, og fra når samværsavtalen ikke ble fulgt/,
      }).should('exist');

      answerRadio('Har bidragsbarnet og den bidragspliktige avtalt å ha samvær etter fylte 18 år?', 'Nei');
      cy.findByLabelText('Samværet er avtalt ved').should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      prepareParentAdultPath();
      cy.clickShowAllSteps();
    });

    it('shows school and samvær attachments when those branches are chosen', () => {
      cy.findByRole('link', { name: 'Søknaden gjelder' }).click();
      answerRadio('Hva har den bidragspliktige søkt om?', 'Fastsettelse av barnebidrag etter 18 år');
      answerRadio('Har den bidragspliktige søkt tilbake i tid?', 'Nei');

      cy.findByRole('link', { name: 'Videregående opplæring' }).click();
      answerRadio('Er bidragsbarnet i videregående opplæring fra tidspunktet det er søkt fra?', 'Ja');
      cy.findByRole('textbox', { name: 'Navnet på skolen' }).type('Oslo katedralskole');

      cy.findByRole('link', { name: 'Avtalt samvær' }).click();
      answerRadio('Har bidragsbarnet og den bidragspliktige avtalt å ha samvær etter fylte 18 år?', 'Ja');
      answerRadio('Samværet er avtalt ved', 'skriftlig avtale');
      answerRadio('Har Nav mottatt samværsavtalen tidligere i denne saken?', 'Nei');
      cy.findByLabelText('Oppgi antall overnattinger over en 14 dagers periode').type('2');
      answerRadio('Har bidragsbarnet samvær i ferier?', 'Nei');
      answerRadio('Gjennomføres samværet slik det er avtalt?', 'Ja');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av skolegang|Bekreftelse på skolegang/ }).should('exist');
      cy.findByRole('group', { name: /Avtale om samvær/ }).should('exist');
      cy.findByRole('group', { name: /Vedtak eller avtale om bidrag|Avtale om bidrag/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitPath('/hvemSomFyllerUtSvaret');
    });

    it('fills the minimum parent-on-behalf flow and verifies the summary', () => {
      // Hvem som fyller ut svaret
      answerRadio('Hvem er du som skal svare?', roleForelder);
      answerRadio('Har bidragsbarnet fylt 18 år?', 'Ja');
      cy.clickNextStep();

      // Veiledning
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      // Søknaden gjelder
      answerRadio('Hva har den bidragspliktige søkt om?', 'Fastsettelse av barnebidrag etter 18 år');
      answerRadio('Har den bidragspliktige søkt tilbake i tid?', 'Nei');
      cy.clickNextStep();

      // Videregående opplæring
      answerRadio('Er bidragsbarnet i videregående opplæring fra tidspunktet det er søkt fra?', 'Nei');
      cy.clickNextStep();

      // Om den som har søkt
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Søker');
      cy.clickNextStep();

      // Om bidragsbarnet
      cy.findByRole('textbox', { name: 'Bidragsbarnets fornavn' }).type('Sara');
      cy.findByRole('textbox', { name: 'Bidragsbarnets etternavn' }).type('Nordmann');
      answerRadio('Har bidragsbarnet norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      answerRadio('Blir bidragsbarnet helt eller delvis forsørget av barnevernet eller en institusjon?', 'Nei');
      cy.clickNextStep();

      // Avtalt samvær
      answerRadio('Har bidragsbarnet og den bidragspliktige avtalt å ha samvær etter fylte 18 år?', 'Nei');
      cy.clickNextStep();

      // Nåværende bidrag
      answerRadio('Har bidragsbarnet en avtale om barnebidrag som gjelder fra etter fylte 18 år?', 'Nei');
      cy.clickNextStep();

      // Jobb
      answerRadio('Er bidragsbarnet i jobb?', 'Nei');
      cy.clickNextStep();

      // Inntekt
      answerRadio(
        'Har bidragsbarnet skattepliktig inntekt i Norge?',
        'Nei, bidragsbarnet har ikke skattepliktig inntekt',
      );
      cy.clickNextStep();

      // Om deg som fyller ut dette skjemaet
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Anne');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Forelder');
      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
      answerRadio('Bor du i Norge?', 'Ja');
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Forelderveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Generell fullmakt|Fullmakt fra bidragsbarnet/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.contains('dt', 'Hva har den bidragspliktige søkt om?')
          .next('dd')
          .should('contain.text', 'Fastsettelse av barnebidrag etter 18 år');
      });
      cy.withinSummaryGroup('Om bidragsbarnet', () => {
        cy.contains('dt', 'Bidragsbarnets fornavn').next('dd').should('contain.text', 'Sara');
      });
      cy.withinSummaryGroup('Om deg som fyller ut dette skjemaet', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Anne');
      });
    });
  });
});
