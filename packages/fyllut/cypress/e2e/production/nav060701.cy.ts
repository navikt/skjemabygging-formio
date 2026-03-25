import nav060701Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav060701.json';

/*
 * Production form tests for Svar på brev om vurdering av grunnstønad
 * Form: nav060701
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 * introPage.enabled === true — cy.clickIntroPageConfirmation() is required on the root URL.
 *
 * Panels tested:
 *   - Fullmakt (fullmakt): 3 same-panel conditionals
 *       svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson → sender fields
 *       jegHarIkkeTelefonnummer2 → hides representative phone input
 *       adult-other branch → relation field
 *   - Personopplysninger (personopplysninger): 5 same-panel / branch conditionals
 *       child branches → child alert + borBarnetINorge + oppgiBarnetsBosettingsland
 *       self/adult branches → voksen-container + correct sivilstand field
 *       harIkkeTelefonnummer → hides applicant phone input
 *   - Tilknytning til Norge (tilknytningTilNorgeSoker): 5 same-panel conditionals
 *       erDuFastBosattINorge → bosettingsland + tilknytning
 *       hvilkenTilknytningHarDuTilNorge=Annet → fritekst
 *       mottarDuYtelseFraEtAnnetLandEnnNorge=Ja → ytelse fields
 *   - Ekstrautgifter (ekstrautgifter): panel-level conditionals
 *       transportDriftAvEgenBil / annet → Transport + Annet panels
 *   - Transport (transport): same-panel conditionals + cross-panel Vedlegg attachment
 *       transport path toggles detail fields, TT-kort follow-ups, bil follow-up,
 *       datagrid reisemåte fields and transport-related attachments
 */

const selectRadio = (label: string | RegExp, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectCheckboxOption = (groupLabel: string | RegExp, optionLabel: string | RegExp) => {
  cy.findByRole('group', { name: groupLabel }).within(() => {
    cy.findByRole('checkbox', { name: optionLabel }).check();
  });
};

const waitForPageTitle = (title?: string) => {
  cy.get('#page-title').should('be.visible');

  if (title) {
    cy.get('#page-title').should('contain.text', title);
  }
};

const visitPanel = (panelKey: string, title: string) => {
  cy.visit(`/fyllut/nav060701/${panelKey}?sub=paper`);
  cy.defaultWaits();
  waitForPageTitle(title);
};

const selectFullmaktOption = (option: string) => {
  selectRadio('Svarer du for deg selv eller på vegne av en annen person?', option);
};

const goToEkstrautgifterAsSelf = () => {
  visitPanel('fullmakt', 'Fullmakt');
  selectFullmaktOption('Jeg svarer på vegne av meg selv.');
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Ekstrautgifter' }).click();
  waitForPageTitle('Ekstrautgifter');
};

describe('nav060701', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav060701*', { body: nav060701Form }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav060701*', { body: { 'nb-NO': {} } }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: { 'nb-NO': {} } });
  });

  describe('Fullmakt conditionals', () => {
    beforeEach(() => {
      visitPanel('fullmakt', 'Fullmakt');
    });

    it('toggles representative fields, relation field and phone input', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du svarer for?' }).should('not.exist');

      selectFullmaktOption('Jeg svarer på vegne av en annen person over 18 år.');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.get('input[type="tel"]').should('have.length', 1);
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du svarer for?' }).should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.get('input[type="tel"]').should('not.exist');

      selectFullmaktOption('Jeg svarer på vegne av eget barn under 18 år.');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du svarer for?' }).should('not.exist');

      selectFullmaktOption('Jeg svarer på vegne av meg selv.');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('not.exist');
      cy.get('input[type="tel"]').should('not.exist');
    });
  });

  describe('Personopplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('fullmakt', 'Fullmakt');
    });

    it('shows child-specific fields and country only for child branches', () => {
      selectFullmaktOption('Jeg svarer på vegne av eget barn under 18 år.');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Personopplysninger' }).click();
      waitForPageTitle('Personopplysninger');

      cy.contains('Her må du fylle inn fødselsnummeret og personopplysningene til barnet.').should('exist');
      cy.findByLabelText('Bor barnet i Norge?').should('exist');
      cy.findByLabelText('Hva er din sivilstand?').should('not.exist');
      cy.findByLabelText('Hva er personens sivilstand?').should('not.exist');
      cy.findByText('Oppgi barnets bosettingsland').should('not.exist');

      selectRadio('Bor barnet i Norge?', 'Nei');
      cy.findByText('Oppgi barnets bosettingsland').should('exist');

      cy.findByRole('link', { name: 'Fullmakt' }).click();
      waitForPageTitle('Fullmakt');
      selectFullmaktOption('Jeg svarer på vegne av meg selv.');
      cy.findByRole('link', { name: 'Personopplysninger' }).click();
      waitForPageTitle('Personopplysninger');

      cy.findByLabelText('Bor barnet i Norge?').should('not.exist');
      cy.findByLabelText('Hva er din sivilstand?').should('exist');
      cy.findByLabelText('Hva er personens sivilstand?').should('not.exist');
      cy.get('input[type="tel"]').should('have.length.at.least', 1);

      cy.findByRole('link', { name: 'Fullmakt' }).click();
      waitForPageTitle('Fullmakt');
      selectFullmaktOption('Jeg svarer på vegne av en annen person over 18 år.');
      cy.findByRole('link', { name: 'Personopplysninger' }).click();
      waitForPageTitle('Personopplysninger');

      cy.contains('Her må du fylle inn fødselsnummeret og personopplysningene til personen du svarer for.').should(
        'exist',
      );
      cy.findByLabelText('Hva er din sivilstand?').should('not.exist');
      cy.findByLabelText('Hva er personens sivilstand?').should('exist');
    });
  });

  describe('Tilknytning til Norge – self branch', () => {
    beforeEach(() => {
      visitPanel('fullmakt', 'Fullmakt');
      selectFullmaktOption('Jeg svarer på vegne av meg selv.');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tilknytning til Norge' }).click();
      waitForPageTitle('Tilknytning til Norge');
    });

    it('toggles residence, other-connection and foreign-benefit fields', () => {
      cy.findByRole('combobox', { name: 'Velg bosettingsland' }).should('not.exist');
      cy.findByLabelText('Hvilken tilknytning har du til Norge?').should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags annen tilknytning har du til Norge?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilket land mottar du ytelse fra?' }).should('not.exist');

      selectRadio('Er du fast bosatt i Norge?', 'Nei');
      cy.findByRole('combobox', { name: 'Velg bosettingsland' }).should('exist');
      cy.findByLabelText('Hvilken tilknytning har du til Norge?').should('exist');

      selectRadio('Hvilken tilknytning har du til Norge?', 'Annet');
      cy.findByRole('textbox', { name: 'Hva slags annen tilknytning har du til Norge?' }).should('exist');

      selectRadio('Mottar du ytelse fra et annet land enn Norge?', 'Ja');
      cy.findByRole('textbox', { name: 'Hvilket land mottar du ytelse fra?' }).should('exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar du?' }).should('exist');

      selectRadio('Er du fast bosatt i Norge?', 'Ja');
      cy.findByRole('combobox', { name: 'Velg bosettingsland' }).should('not.exist');
      cy.findByLabelText('Hvilken tilknytning har du til Norge?').should('not.exist');
    });
  });

  describe('Ekstrautgifter panel-level conditionals', () => {
    beforeEach(() => {
      goToEkstrautgifterAsSelf();
    });

    it('shows conditional panel links for selected extra-expense categories', () => {
      cy.findByRole('link', { name: 'Transport' }).should('not.exist');
      cy.findByRole('link', { name: 'Annet' }).should('not.exist');

      selectCheckboxOption('Kryss av for det du skal svare på', 'Transport / drift av egen bil');
      cy.findByRole('link', { name: 'Transport' }).should('exist');

      selectCheckboxOption('Kryss av for det du skal svare på', 'Annet');
      cy.findByRole('link', { name: 'Annet' }).should('exist');
    });
  });

  describe('Transport conditionals and Vedlegg attachments', () => {
    beforeEach(() => {
      goToEkstrautgifterAsSelf();
      selectCheckboxOption('Kryss av for det du skal svare på', 'Transport / drift av egen bil');
      cy.clickNextStep();
      waitForPageTitle('Transport');
    });

    it('toggles transport branches and shows matching attachments on Vedlegg', () => {
      cy.findByRole('textbox', { name: 'Beskriv nærmere' }).should('not.exist');
      cy.findByLabelText('Oppgi antall turer per halvår').should('not.exist');
      cy.findByLabelText('Oppgi kroner per halvår').should('not.exist');
      cy.findByRole('textbox', { name: 'Her kan du oppgi andre aktuelle opplysninger' }).should('not.exist');

      selectCheckboxOption('Hvordan dekker du transportbehovet ditt i dag?', 'Drosje');

      selectRadio('Er du innvilget TT-kort?', 'Ja');
      cy.findByLabelText('Oppgi antall turer per halvår').should('not.exist');
      cy.findByLabelText('Oppgi kroner per halvår').should('not.exist');

      selectRadio('Oppgi antall turer per halvår, eller kroner per halvår', 'Antall turer');
      cy.findByLabelText('Oppgi antall turer per halvår').should('exist');

      selectRadio('Oppgi antall turer per halvår, eller kroner per halvår', 'Antall kroner');
      cy.findByLabelText('Oppgi antall turer per halvår').should('not.exist');
      cy.findByLabelText('Oppgi kroner per halvår').should('exist');

      selectRadio('Kan du bruke offentlige transportmidler?', 'Nei');
      cy.findAllByRole('textbox', { name: /Beskriv nærmere/ }).should('have.length.at.least', 1);

      cy.findByRole('checkbox', { name: /Nei, jeg har ikke tilgang på bil/ }).click();
      cy.findByRole('group', { name: 'Har du tilgang til egen bil?' }).should('not.exist');
      cy.findByLabelText('Bruker noen andre bilen?').should('not.exist');

      cy.findByRole('checkbox', { name: /Nei, jeg har ikke tilgang på bil/ }).click();
      cy.findByRole('group', { name: 'Har du tilgang til egen bil?' }).should('exist');
      selectRadio('Bruker noen andre bilen?', 'Ja');
      cy.findAllByRole('textbox', { name: /Beskriv nærmere/ }).should('have.length.at.least', 2);

      cy.findByRole('textbox', { name: 'Reisemål' }).type('Butikk');
      selectRadio('Velg reisemåte', 'Drosje');
      cy.findByLabelText('Pris').should('exist');
      selectRadio('Velg reisemåte', 'Annet');
      cy.findAllByRole('textbox', { name: /Beskriv nærmere/ }).should('have.length.at.least', 3);

      selectRadio('Har du andre aktuelle opplysninger?', 'Ja');
      cy.findByRole('textbox', { name: 'Her kan du oppgi andre aktuelle opplysninger' }).should('exist');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      waitForPageTitle('Vedlegg');
      cy.findByRole('group', { name: /Dokumentasjon av ekstrautgifter til transport/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon av ekstrautgifter til drosje/ }).should('exist');

      cy.findByRole('link', { name: 'Transport' }).click();
      waitForPageTitle('Transport');
      selectRadio('Har NAV bedt om dokumentasjon på transport i brevet?', 'Ja');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      waitForPageTitle('Vedlegg');
      cy.findByRole('group', { name: /Dokumentasjon av ekstrautgifter til transport/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av ekstrautgifter til drosje/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav060701?sub=paper');
      cy.defaultWaits();
      waitForPageTitle();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
      waitForPageTitle('Fullmakt');
    });

    it('fills required fields and verifies summary', () => {
      // Fullmakt
      selectFullmaktOption('Jeg svarer på vegne av meg selv.');
      cy.clickNextStep();

      // Personopplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      selectRadio('Hva er din sivilstand?', 'Ugift');
      cy.clickNextStep();

      // Tilknytning til Norge
      selectRadio('Er du fast bosatt i Norge?', 'Ja');
      selectRadio('Mottar du ytelse fra et annet land enn Norge?', 'Nei');
      cy.clickNextStep();

      // Helsesituasjon
      cy.clickNextStep();

      // Ekstrautgifter
      selectCheckboxOption('Kryss av for det du skal svare på', 'Annet');
      cy.clickNextStep();

      // Annet
      cy.findByRole('textbox', { name: 'Svar på spørsmålene i brevet fra NAV' }).type(
        'Jeg vil gi mer informasjon om andre ekstrautgifter.',
      );
      selectRadio('Har NAV bedt om dokumentasjon i brevet?', 'Nei');
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', {
          name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
        }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personopplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Annet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Svar på spørsmålene i brevet fra NAV');
        cy.get('dd').eq(0).should('contain.text', 'Jeg vil gi mer informasjon om andre ekstrautgifter');
      });
    });
  });
});
