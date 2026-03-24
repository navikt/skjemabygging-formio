import nav520501Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav520501.json';

/*
 * Production form tests for Melding om at Skatteetaten skal kreve inn barnebidraget
 * Form: nav520501
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Part i saken (partISaken): 2 cross-panel conditionals
 *       hvilkenPartErDuISaken → Om den andre parten guidance text
 *       hvilkenPartErDuISaken → Barn og nåværende avtale / Innkreving og nåværende avtale panel visibility
 *   - Dine opplysninger (dineOpplysninger): 3 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility and folkeregister alert
 *       adresse.borDuINorgeX → adresseVarighet
 *   - Barn og nåværende avtale (barnOgNavarendeAvtale): observable datagrid conditionals
 *       navaerendeBidragErFastsattVed → attachment alertstripes
 *       onskerDuInnkrevingTilbakeITid → month picker and receiver/payer follow-up questions
 *       received/paid-something radios → description fields and payer documentation alert
 *   - Innkreving og nåværende avtale (innkrevingOgNavarendeAvtale): 3 same-panel conditionals
 *       navaerendeBidragErFastsattVed → alertstripes and backdated-payment follow-up question
 *       received-something radio → description field
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 1 cross-panel attachment conditional
 *       payer paid-something path → dokumentasjonPaBarnebidragDuHarBetaltTilbakeITid
 */

const selectRadio = (label: string | RegExp, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const fillDineOpplysningerWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillOtherPartyNames = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Hansen');
  cy.clickNextStep();
};

const fillBarnBaseRow = () => {
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Barn');
  cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Barnesen');
  cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).type('01.01.2020');
  cy.findByRole('checkbox', {
    name: 'Jeg ønsker at Skatteetaten skal kreve inn barnebidraget for dette barnet.',
  }).click();
};

const fillBackdatingMonth = () => {
  cy.findByRole('textbox', { name: /Jeg ønsker innkreving fra Skatteetaten fra og med/ }).type('01.2027');
};

const goToPartyPanel = () => {
  cy.visit('/fyllut/nav520501/partISaken?sub=paper');
  cy.defaultWaits();
};

const choosePartyAndOpenPanel = (partyOption: string, panelTitle: string) => {
  goToPartyPanel();
  selectRadio('Hvilken part er du i saken?', partyOption);
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

const goToVeiledningPanel = () => {
  cy.get('#page-title')
    .invoke('text')
    .then((title) => {
      if (title.trim() !== 'Veiledning') {
        cy.clickNextStep();
        goToVeiledningPanel();
      }
    });
};

describe('nav520501', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav520501*', { body: nav520501Form });
    cy.intercept('GET', '/fyllut/api/translations/nav520501*', { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Part i saken cross-panel conditionals', () => {
    beforeEach(() => {
      goToPartyPanel();
    });

    it('shows the correct guidance text on Om den andre parten for mottaker and betaler', () => {
      selectRadio('Hvilken part er du i saken?', 'Forelder som mottar barnebidrag');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om den andre parten' }).click();
      cy.contains('Her skal du oppgi navnet til den som skal betale barnebidraget.').should('exist');

      cy.findByRole('link', { name: 'Part i saken' }).click();
      selectRadio('Hvilken part er du i saken?', 'Forelder som betaler barnebidrag');
      cy.findByRole('link', { name: 'Om den andre parten' }).click();
      cy.contains('Her skal du oppgi navnet til den som skal motta barnebidraget.').should('exist');
    });

    it('shows the bidragsbarn panel and hides the barn panel for bidragsbarn over 18 år', () => {
      selectRadio('Hvilken part er du i saken?', 'Bidragsbarn over 18 år som mottar barnebidrag');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Innkreving og nåværende avtale' }).should('exist');
      cy.findByRole('link', { name: 'Barn og nåværende avtale' }).should('not.exist');
    });
  });

  describe('Dine opplysninger identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav520501/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows the address section when the applicant has no Norwegian identity number and shows folkeregister alert for Ja', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar og annen kommunikasjon til din folkeregistrerte adresse').should('exist');
    });

    it('shows the foreign-address fields when the applicant lives abroad', () => {
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByRole('combobox', { name: 'Land' }).should('not.exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer/ }).should('exist');
    });
  });

  describe('Barn og nåværende avtale conditionals for forelder som mottar', () => {
    beforeEach(() => {
      choosePartyAndOpenPanel('Forelder som mottar barnebidrag', 'Barn og nåværende avtale');
    });

    it('shows agreement-specific alerts for privat avtale and dom', () => {
      fillBarnBaseRow();
      cy.contains('kopi av den private avtalen').should('not.exist');

      selectRadio('Nåværende bidrag er fastsatt ved', 'privat avtale');
      cy.contains('kopi av den private avtalen').should('exist');

      selectRadio('Nåværende bidrag er fastsatt ved', 'dom');
      cy.contains('kopi av den private avtalen').should('not.exist');
      cy.contains('kopi av dommen').should('exist');
    });

    it('shows the receiver backdating question and description when some bidrag was received', () => {
      fillBarnBaseRow();
      selectRadio('Nåværende bidrag er fastsatt ved', 'Nav');
      selectRadio('Ønsker du innkreving tilbake i tid?', 'Ja');
      fillBackdatingMonth();

      cy.findByLabelText('Har du fått barnebidraget i henhold til fastsettelsen tilbake i tid?').should('exist');
      cy.findByRole('textbox', {
        name: /Beskriv hva den bidragspliktige har betalt fra det tidspunktet du ønsker innkreving/,
      }).should('not.exist');

      selectRadio('Har du fått barnebidraget i henhold til fastsettelsen tilbake i tid?', 'Jeg har fått noe');
      cy.findByRole('textbox', {
        name: /Beskriv hva den bidragspliktige har betalt fra det tidspunktet du ønsker innkreving/,
      }).should('exist');
    });
  });

  describe('Barn og nåværende avtale conditionals for forelder som betaler', () => {
    beforeEach(() => {
      choosePartyAndOpenPanel('Forelder som betaler barnebidrag', 'Barn og nåværende avtale');
    });

    it('shows payer follow-up fields and the documentation attachment when some bidrag was paid', () => {
      fillBarnBaseRow();
      selectRadio('Nåværende bidrag er fastsatt ved', 'Nav');
      selectRadio('Ønsker du innkreving tilbake i tid?', 'Ja');
      fillBackdatingMonth();

      cy.findByLabelText('Har du betalt barnebidraget i henhold til fastsettelsen tilbake i tid?').should('exist');
      selectRadio('Har du betalt barnebidraget i henhold til fastsettelsen tilbake i tid?', 'Jeg har betalt noe');

      cy.contains('Du må legge ved dokumentasjon på barnebidrag du har betalt').should('exist');
      cy.findByRole('textbox', {
        name: /Beskriv hva du har betalt fra det tidspunktet du ønsker innkreving/,
      }).should('exist');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon på barnebidrag du har betalt tilbake i tid|Dokumentasjon av utgifter/,
      }).should('exist');
    });
  });

  describe('Innkreving og nåværende avtale conditionals', () => {
    beforeEach(() => {
      choosePartyAndOpenPanel('Bidragsbarn over 18 år som mottar barnebidrag', 'Innkreving og nåværende avtale');
    });

    it('shows settlement alert and the received-something description for bidragsbarn path', () => {
      cy.contains('kopi av rettsforliket').should('not.exist');

      selectRadio('Nåværende bidrag er fastsatt ved', 'rettsforlik');
      cy.contains('kopi av rettsforliket').should('exist');

      selectRadio('Ønsker du innkreving tilbake i tid?', 'Ja');
      fillBackdatingMonth();
      cy.findByLabelText('Har du fått barnebidraget i henhold til fastsettelsen tilbake i tid?').should('exist');

      selectRadio('Har du fått barnebidraget i henhold til fastsettelsen tilbake i tid?', 'Jeg har fått noe');
      cy.findByRole('textbox', {
        name: /Beskriv hva den bidragspliktige har betalt fra det tidspunktet du ønsker innkreving/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav520501?sub=paper');
      cy.defaultWaits();
      goToVeiledningPanel();
    });

    it('fills required fields and verifies the summary for the bidragsbarn path', () => {
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      selectRadio('Hvilken part er du i saken?', 'Bidragsbarn over 18 år som mottar barnebidrag');
      cy.clickNextStep();

      fillDineOpplysningerWithFnr();
      fillOtherPartyNames();

      selectRadio('Nåværende bidrag er fastsatt ved', 'Nav');
      selectRadio('Ønsker du innkreving tilbake i tid?', 'Nei');
      fillBackdatingMonth();
      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
        cy.findByRole('radio', { name: /Nei|ingen ekstra dokumentasjon/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Part i saken', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilken part er du i saken?');
        cy.get('dd').eq(0).should('contain.text', 'Bidragsbarn over 18 år som mottar barnebidrag');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Om den andre parten', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
    });
  });
});
