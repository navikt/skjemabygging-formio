/*
 * Production form tests for Melding om frivillig skattetrekk
 * Form: nav952002
 * Submission types: PAPER, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 4 same-panel/custom conditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       identitet.harDuFodselsnummer → folkeregistrert-adresse alert
 *       adresse.borDuINorge → adresseVarighet visibility
 *       jegHarIkkeTelefonnummer → telefonnummer visibility
 *   - Meldingen gjelder (page6): 2 panel-level conditionals
 *       skalDuHaNyttSkattetrekkEllerStoppeSkattetrekk → Nytt skattetrekk / Stoppe skattetrekk
 *   - Nytt skattetrekk (nyttSkattetrekk): 5 same-panel conditionals
 *       kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa → alertstripe1 / html1 / amount-choice visibility
 *       kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa → barnetsOpplysninger
 *       onskerDuEkstraSkattetrekkIKronerEllerProsent → kroner/prosent fields
 *   - Stoppe skattetrekk (pengestotterOgSkattetrekk1): 1 same-panel conditional
 *       kryssAvForDenPengestottenDuOnskerAaStoppeSkattetrekkPa → barnetsOpplysninger1
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuAndreOpplysningerSomErRelevantForSkattetrekket → tilleggsopplysninger1
 */

describe('nav952002', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger – identity and phone conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952002/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address fields when user has no Norwegian identity number', () => {
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');
    });

    it('shows folkeregister alert when user confirms Norwegian identity number', () => {
      cy.contains('Nav sender svar på søknad').should('not.exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Nav sender svar på søknad').should('exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.contains('Nav sender svar på søknad').should('not.exist');
    });

    it('shows address validity fields when living abroad', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });

    it('hides phone number when the no-phone checkbox is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('exist');
    });
  });

  describe('Meldingen gjelder – panel-level conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952002/page6?sub=paper');
      cy.defaultWaits();
    });

    it('shows Nytt skattetrekk panel and hides Stoppe skattetrekk for nytt skattetrekk path', () => {
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Nytt skattetrekk' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Nytt skattetrekk' }).should('exist');
      cy.findByRole('link', { name: 'Stoppe skattetrekk' }).should('not.exist');
    });

    it('shows Stoppe skattetrekk panel and hides Nytt skattetrekk for stop path', () => {
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Stoppe skattetrekk' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Stoppe skattetrekk' }).should('exist');
      cy.findByRole('link', { name: 'Nytt skattetrekk' }).should('not.exist');
    });
  });

  describe('Nytt skattetrekk – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952002/page6?sub=paper');
      cy.defaultWaits();
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Nytt skattetrekk' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Nytt skattetrekk' }).click();
    });

    it('shows general voluntary-deduction info for standard benefits and pension self-service info for pension', () => {
      cy.contains('frivillig avtale som gjelder ut inneværende år').should('not.exist');
      cy.contains('Ekstra skattetrekk i pensjon eller uføretrygd kan du legge inn selv').should('not.exist');

      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Arbeidsavklaringspenger' }).click();
      });

      cy.contains('frivillig avtale som gjelder ut inneværende år').should('exist');
      cy.findByLabelText('Ønsker du ekstra skattetrekk i kroner eller prosent?').should('exist');

      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Alderspensjon' }).click();
      });

      cy.contains('frivillig avtale som gjelder ut inneværende år').should('exist');
      cy.contains('Ekstra skattetrekk i pensjon eller uføretrygd kan du legge inn selv').should('exist');
    });

    it('shows child benefit details for barnepensjon under 18 år', () => {
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');

      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Barnepensjon under 18 år' }).click();
      });

      cy.contains('frivillig avtale som gjelder ut inneværende år').should('exist');
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/ }).should('exist');

      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Arbeidsavklaringspenger' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');
    });

    it('toggles top-level amount fields between kroner and prosent', () => {
      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Arbeidsavklaringspenger' }).click();
      });

      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('not.exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned:').should('not.exist');

      cy.withinComponent('Ønsker du ekstra skattetrekk i kroner eller prosent?', () => {
        cy.findByRole('radio', { name: 'Kroner' }).click();
      });

      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned:').should('not.exist');

      cy.withinComponent('Ønsker du ekstra skattetrekk i kroner eller prosent?', () => {
        cy.findByRole('radio', { name: 'Prosent' }).click();
      });

      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('not.exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned:').should('exist');
    });
  });

  describe('Stoppe skattetrekk – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952002/page6?sub=paper');
      cy.defaultWaits();
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Stoppe skattetrekk' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Stoppe skattetrekk' }).click();
    });

    it('shows child details only when stopping barnepensjon under 18 år', () => {
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');

      cy.withinComponent('Kryss av for den pengestøtten du ønsker å stoppe skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Barnepensjon under 18 år' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/ }).should('exist');

      cy.withinComponent('Kryss av for den pengestøtten du ønsker å stoppe skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Alderspensjon' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952002/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows textarea only when user has additional information', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Har du andre opplysninger som er relevant for skattetrekket?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Har du andre opplysninger som er relevant for skattetrekket?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952002?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickNextStep();

      // Dine opplysninger – Norwegian identity path keeps address fields hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Meldingen gjelder
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Nytt skattetrekk' }).click();
      });
      cy.clickNextStep();

      // Nytt skattetrekk – simple happy path without child datagrid
      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Arbeidsavklaringspenger' }).click();
      });
      cy.withinComponent('Ønsker du ekstra skattetrekk i kroner eller prosent?', () => {
        cy.findByRole('radio', { name: 'Kroner' }).click();
      });
      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').type('500');
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.withinComponent('Har du andre opplysninger som er relevant for skattetrekket?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Meldingen gjelder', () => {
        cy.get('dt').eq(0).should('contain.text', 'Skal du ha nytt skattetrekk eller stoppe skattetrekk?');
        cy.get('dd').eq(0).should('contain.text', 'Nytt skattetrekk');
      });
      cy.withinSummaryGroup('Nytt skattetrekk', () => {
        cy.get('dt').eq(0).should('contain.text', 'Kryss av for den pengestøtten du ønsker ekstra skattetrekk på');
        cy.get('dd').eq(0).should('contain.text', 'Arbeidsavklaringspenger');
        cy.get('dt').eq(1).should('contain.text', 'Ønsker du ekstra skattetrekk i kroner eller prosent?');
        cy.get('dd').eq(1).should('contain.text', 'Kroner');
        cy.get('dt').eq(2).should('contain.text', 'Ekstra skattetrekk i kroner per måned');
        cy.get('dd').eq(2).should('contain.text', '500');
      });
      cy.withinSummaryGroup('Tilleggsopplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Har du andre opplysninger som er relevant for skattetrekket?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
    });
  });
});
