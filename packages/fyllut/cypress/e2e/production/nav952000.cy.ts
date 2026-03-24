import nav952000Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav952000.json';

/*
 * Production form tests for Melding om nytt bankkontonummer
 * Form: nav952000
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Fullmakt (fullmakt): 5 same-panel conditionals
 *       melderDuOmNyttBankkontonummerPaVegneAvNoenAndreEnnDegSelv
 *       → erDuUnder18Ar, hvorforMelderDuOmNyttBankkontonummerPaaVegneAvEnAnnenPerson
 *       erDuUnder18Ar → alertstripe2, skalDuMeldeBankkontonummerForEnYtelseDuSelvHarOpptjent
 *       hvorforMelderDuOmNyttBankkontonummerPaaVegneAvEnAnnenPerson
 *       → erDereFlereArvinger, alertstripe1
 *   - Kontoendringen gjelder (kontoendringenGjelder): 1 same-panel conditional
 *       jegHarIkkeTelefonnummer → telefonnummerSoker
 *   - Bankkontonummer (bankkontonummer): account-type and country-specific customConditionals
 *       harDuNorskEllerUtenlandskBankkonto → norskBankkontonummer / utenlandskKontonummer
 *       bankensLand → IBAN, BIC / Swift-kode, Bankkode AU, Bankkode CC, Bankkode FW, IFSC kode,
 *       norskBankkontonummer1 and country alerts
 *   - Vedlegg (vedlegg): cross-panel attachment conditionals from Fullmakt
 *       under-18 path → own/guardian ID attachments
 *       fullmakt/verge/dødsfall paths → signer ID, fullmakt, vergeattest, skifteattest, arving-fullmakt
 */

const formPath = 'nav952000';

const labels = {
  melderPaVegneAvAndre: 'Melder du om nytt bankkontonummer på vegne av andre enn deg selv?',
  erDuUnder18Ar: 'Er du under 18 år?',
  selvOpptjentYtelse: 'Skal du melde bankkontonummer for en ytelse du selv har opptjent?',
  hvorforMelderDu: 'Hvorfor melder du om nytt bankkontonummer på vegne av en annen person?',
  erDereFlereArvinger: 'Er dere flere arvinger?',
  ingenSpesiellGrunnVarsel: 'Nav kan ikke endre bankkontonummer når du melder på vegne av en annen person',
  under18Varsel: 'Hvis du er under 18 år, må en av dine foresatte signere søknaden.',
  ingenTelefon: 'Jeg har ikke telefonnummer',
  telefonnummer: 'Telefonnummer',
  hvilkenYtelse: 'Hvilken ytelse gjelder utbetalingen?',
  harDuNorskEllerUtenlandskBankkonto: 'Har du norsk eller utenlandsk bankkonto?',
};

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/${formPath}/${panelKey}?sub=paper`);
  cy.defaultWaits();
};

const selectRadio = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectMelderPaVegneAvAndre = (option: 'Ja' | 'Nei') => {
  selectRadio(labels.melderPaVegneAvAndre, option);
};

const selectUnder18 = (option: 'Ja' | 'Nei') => {
  selectRadio(labels.erDuUnder18Ar, option);
};

const selectSelvOpptjentYtelse = (option: 'Ja' | 'Nei') => {
  selectRadio(labels.selvOpptjentYtelse, option);
};

const selectHvorforMelderDu = (
  option:
    | 'Jeg har fullmakt'
    | 'Jeg er verge eller hjelpeverge'
    | 'Jeg er forelder til barn under 18 år'
    | 'Personen er død'
    | 'Ingen spesiell grunn',
) => {
  selectRadio(labels.hvorforMelderDu, option);
};

const selectErDereFlereArvinger = (option: 'Ja' | 'Nei') => {
  selectRadio(labels.erDereFlereArvinger, option);
};

const selectForeignBankAccount = () => {
  selectRadio(labels.harDuNorskEllerUtenlandskBankkonto, 'Utenlandsk kontonummer');
};

const selectNorwegianBankAccount = () => {
  selectRadio(labels.harDuNorskEllerUtenlandskBankkonto, 'Norsk kontonummer');
};

const selectBankCountry = (countryLabel: string, searchValue = countryLabel) => {
  cy.findByRole('combobox', { name: 'Bankens land' }).should('exist');
  cy.findByRole('combobox', { name: 'Bankens land' }).click();
  cy.findByRole('combobox', { name: 'Bankens land' }).focus();
  cy.findByRole('combobox', { name: 'Bankens land' }).type('{selectall}{backspace}');
  cy.findByRole('combobox', { name: 'Bankens land' }).type(searchValue);
  cy.findByRole('option', { name: countryLabel }).click();
};

const goToVedlegg = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

const chooseEttersender = (groupName: string | RegExp) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
};

const chooseNoExtraDocumentation = () => {
  cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /Nei/ }).click();
  });
};

describe('nav952000', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', `/fyllut/api/forms/${formPath}*`, { body: nav952000Form });
    cy.intercept('GET', `/fyllut/api/translations/${formPath}*`, { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Fullmakt conditionals', () => {
    beforeEach(() => {
      visitPanel('fullmakt');
    });

    it('switches between own-benefit and acting-for-others follow-up questions', () => {
      cy.findByLabelText(labels.erDuUnder18Ar).should('not.exist');
      cy.findByLabelText(labels.hvorforMelderDu).should('not.exist');

      selectMelderPaVegneAvAndre('Nei');
      cy.findByLabelText(labels.erDuUnder18Ar).should('exist');
      cy.findByLabelText(labels.hvorforMelderDu).should('not.exist');

      selectMelderPaVegneAvAndre('Ja');
      cy.findByLabelText(labels.erDuUnder18Ar).should('not.exist');
      cy.findByLabelText(labels.hvorforMelderDu).should('exist');
    });

    it('toggles the under-18 guidance and self-earned-benefit question', () => {
      selectMelderPaVegneAvAndre('Nei');

      cy.findByLabelText(labels.selvOpptjentYtelse).should('not.exist');
      cy.contains(labels.under18Varsel).should('not.exist');

      selectUnder18('Ja');
      cy.findByLabelText(labels.selvOpptjentYtelse).should('exist');
      cy.contains(labels.under18Varsel).should('exist');

      selectUnder18('Nei');
      cy.findByLabelText(labels.selvOpptjentYtelse).should('not.exist');
      cy.contains(labels.under18Varsel).should('not.exist');
    });

    it('shows heir question only for deceased path and warning only for no-authority path', () => {
      selectMelderPaVegneAvAndre('Ja');

      cy.findByLabelText(labels.erDereFlereArvinger).should('not.exist');
      cy.contains(labels.ingenSpesiellGrunnVarsel).should('not.exist');

      selectHvorforMelderDu('Personen er død');
      cy.findByLabelText(labels.erDereFlereArvinger).should('exist');
      cy.contains(labels.ingenSpesiellGrunnVarsel).should('not.exist');

      selectHvorforMelderDu('Ingen spesiell grunn');
      cy.findByLabelText(labels.erDereFlereArvinger).should('not.exist');
      cy.contains(labels.ingenSpesiellGrunnVarsel).should('exist');
    });
  });

  describe('Kontoendringen gjelder conditionals', () => {
    beforeEach(() => {
      visitPanel('kontoendringenGjelder');
    });

    it('hides the phone input when the no-phone checkbox is checked', () => {
      cy.findByLabelText(labels.telefonnummer).should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText(labels.telefonnummer).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText(labels.telefonnummer).should('exist');
    });
  });

  describe('Bankkontonummer conditionals', () => {
    beforeEach(() => {
      visitPanel('bankkontonummer');
    });

    it('switches between Norwegian and foreign account fields and handles Norway in foreign flow', () => {
      cy.findByLabelText(/Norsk bankkontonummer/).should('exist');
      cy.findByRole('combobox', { name: 'Bankens land' }).should('not.exist');

      selectForeignBankAccount();
      cy.findByLabelText(/Norsk bankkontonummer/).should('not.exist');
      cy.findByRole('combobox', { name: 'Bankens land' }).should('exist');

      selectBankCountry('Norge');
      cy.findByLabelText(/Norsk bankkontonummer/).should('exist');
      cy.findByRole('textbox', { name: 'IBAN' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Kontonummer' }).should('not.exist');
    });

    it('shows IBAN and BIC for an IBAN country', () => {
      selectForeignBankAccount();
      selectBankCountry('Sverige');

      cy.findByRole('textbox', { name: 'IBAN' }).should('exist');
      cy.findByRole('textbox', { name: 'BIC / Swift-kode' }).should('exist');
      cy.findByRole('textbox', { name: 'Kontonummer' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Bankkode AU' }).should('not.exist');
    });

    it('shows the Australia and Canada-specific alerts and bank codes', () => {
      selectForeignBankAccount();

      selectBankCountry('Australia');
      cy.contains('For Australia kan du oppgi både BIC / Swift-kode og bankkode').should('exist');
      cy.findByRole('textbox', { name: 'Bankkode AU' }).should('exist');

      selectBankCountry('Canada');
      cy.contains('For Canada kan du oppgi både BIC / Swift-kode og bankkode').should('exist');
      cy.findByRole('textbox', { name: 'Bankkode CC' }).should('exist');
    });

    it('shows the USA and India-specific bank codes and updates BIC visibility', () => {
      selectForeignBankAccount();

      selectBankCountry('USA');
      cy.findByRole('textbox', { name: 'Bankkode FW' }).should('exist');
      cy.findByRole('textbox', { name: 'BIC / Swift-kode' }).should('not.exist');

      selectBankCountry('India');
      cy.findByRole('textbox', { name: 'IFSC kode' }).should('exist');
      cy.findByRole('textbox', { name: 'BIC / Swift-kode' }).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      visitPanel('fullmakt');
    });

    it('shows guardian ID attachment when the claimant is under 18 and the benefit is not self-earned', () => {
      selectMelderPaVegneAvAndre('Nei');
      selectUnder18('Ja');
      selectSelvOpptjentYtelse('Nei');

      goToVedlegg();

      cy.findByRole('group', { name: /Kopi av legitimasjon til den foresatte som signerer skjemaet/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av din legitimasjon/ }).should('not.exist');
      cy.findByRole('group', { name: /Kopi av legitimasjon til den som signerer søknaden/ }).should('not.exist');
    });

    it('shows signer ID and power-of-attorney attachments for the fullmakt path', () => {
      selectMelderPaVegneAvAndre('Ja');
      selectHvorforMelderDu('Jeg har fullmakt');

      goToVedlegg();

      cy.findByRole('group', { name: /Kopi av legitimasjon til den som signerer søknaden/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på at du har fullmakt/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av verge- eller hjelpevergeattest/ }).should('not.exist');
      cy.findByRole('group', { name: /Kopi av skifteattest/ }).should('not.exist');
    });

    it('shows signer ID and verge certificate for the guardian path', () => {
      selectMelderPaVegneAvAndre('Ja');
      selectHvorforMelderDu('Jeg er verge eller hjelpeverge');

      goToVedlegg();

      cy.findByRole('group', { name: /Kopi av legitimasjon til den som signerer søknaden/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av verge- eller hjelpevergeattest/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på at du har fullmakt/ }).should('not.exist');
    });

    it('shows inheritance attachments for the deceased path with multiple heirs', () => {
      selectMelderPaVegneAvAndre('Ja');
      selectHvorforMelderDu('Personen er død');
      selectErDereFlereArvinger('Ja');

      goToVedlegg();

      cy.findByRole('group', { name: /Kopi av legitimasjon til den som signerer søknaden/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av skifteattest/ }).should('exist');
      cy.findByRole('group', { name: /Fullmakt fra de andre arvingene/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitPanel('fullmakt');
    });

    it('fills required fields and verifies summary', () => {
      // Fullmakt
      cy.findByLabelText(labels.melderPaVegneAvAndre).should('exist');
      selectMelderPaVegneAvAndre('Nei');
      selectUnder18('Nei');
      cy.clickNextStep();

      // Kontoendringen gjelder
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText(labels.telefonnummer).type('12345678');
      selectRadio(labels.hvilkenYtelse, 'Pensjon eller uføretrygd');
      cy.clickNextStep();

      // Bankkontonummer
      selectNorwegianBankAccount();
      cy.findByLabelText(/Norsk bankkontonummer/).type('01234567892');
      cy.clickNextStep();

      // Vedlegg
      chooseEttersender(/Kopi av din legitimasjon/);
      chooseNoExtraDocumentation();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Fullmakt', () => {
        cy.contains('dt', labels.melderPaVegneAvAndre).next('dd').should('contain.text', 'Nei');
      });

      cy.withinSummaryGroup('Kontoendringen gjelder', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
        cy.contains('dt', 'Etternavn').next('dd').should('contain.text', 'Nordmann');
      });

      cy.withinSummaryGroup('Bankkontonummer', () => {
        cy.contains('dt', 'Norsk bankkontonummer')
          .next('dd')
          .invoke('text')
          .should('match', /0123\s*45\s*67892/);
      });
    });
  });
});
