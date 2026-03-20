/*
 * Production form tests for Melding om frivillig skattetrekk for barnepensjon
 * Form: nav952003
 * Submission types: DIGITAL only
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 1 same-panel conditional
 *       jegHarIkkeTelefonnummer → telefonnummer visibility
 *   - Meldingen gjelder (meldingenGjelder): 2 panel-level conditionals
 *       skalDuHaNyttSkattetrekkEllerStoppeSkattetrekk → Nytt skattetrekk / Stoppe skattetrekk
 *   - Nytt skattetrekk (nyttSkattetrekk): 3 same-panel conditionals
 *       kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa → barnetsOpplysninger / amount-choice visibility
 *       onskerDuEkstraSkattetrekkIKronerEllerProsent → kroner/prosent fields
 *       barnetsOpplysninger.onskerDuEkstraSkattetrekkIKronerEllerProsent → row kroner/prosent fields
 *   - Stoppe skattetrekk (stoppeSkattetrekk): 1 same-panel conditional
 *       kryssAvForDenPengestottenDuOnskerAStoppeSkattetrekkPa → barnetsOpplysninger1
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuAndreOpplysningerSomErRelevantForSkattetrekket1 → tilleggsopplysninger1
 *
 * Note on Dine opplysninger customConditionals:
 *   The identity component (prefillKey=sokerIdentifikasjonsnummer) and navAddress
 *   (prefillKey=sokerAdresser) are read-only in digital mode because the form uses
 *   prefilled person data for logged-in users. The address/alert conditionals tied to
 *   identitet/adresse are therefore not testable via UI interaction here.
 */

describe('nav952003', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.defaultInterceptsMellomlagring();
  });

  describe('Dine opplysninger – phone conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952003/dineOpplysninger?sub=digital');
      cy.defaultWaits();
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
      cy.visit('/fyllut/nav952003/meldingenGjelder?sub=digital');
      cy.defaultWaits();
    });

    it('navigates to Nytt skattetrekk when nytt skattetrekk is selected', () => {
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Nytt skattetrekk' }).click();
      });
      cy.clickSaveAndContinue();

      cy.findByLabelText('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på').should('exist');
      cy.findByLabelText('Kryss av for den pengestøtten du ønsker å stoppe skattetrekk på').should('not.exist');
    });

    it('navigates to Stoppe skattetrekk when stoppe skattetrekk is selected', () => {
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Stoppe skattetrekk' }).click();
      });
      cy.clickSaveAndContinue();

      cy.findByLabelText('Kryss av for den pengestøtten du ønsker å stoppe skattetrekk på').should('exist');
      cy.findByLabelText('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på').should('not.exist');
    });
  });

  describe('Nytt skattetrekk – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952003/meldingenGjelder?sub=digital');
      cy.defaultWaits();
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Nytt skattetrekk' }).click();
      });
      cy.clickSaveAndContinue();
    });

    it('shows child details only for barnepensjon under 18 år', () => {
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');

      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Barnepensjon under 18 år' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/ }).should('exist');
      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('not.exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned').should('not.exist');

      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Barnepensjon over 18 år' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');
      cy.findByLabelText('Ønsker du ekstra skattetrekk i kroner eller prosent?').should('exist');
    });

    it('toggles top-level amount fields between kroner and prosent for over-18 path', () => {
      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Barnepensjon over 18 år' }).click();
      });

      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('not.exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned').should('not.exist');

      cy.withinComponent('Ønsker du ekstra skattetrekk i kroner eller prosent?', () => {
        cy.findByRole('radio', { name: 'Kroner' }).click();
      });
      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned').should('not.exist');

      cy.withinComponent('Ønsker du ekstra skattetrekk i kroner eller prosent?', () => {
        cy.findByRole('radio', { name: 'Prosent' }).click();
      });
      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('not.exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned').should('exist');
    });

    it('toggles datagrid amount fields between kroner and prosent for under-18 path', () => {
      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Barnepensjon under 18 år' }).click();
      });

      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('not.exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned').should('not.exist');

      cy.withinComponent('Ønsker du ekstra skattetrekk i kroner eller prosent?', () => {
        cy.findByRole('radio', { name: 'Kroner' }).click();
      });
      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned').should('not.exist');

      cy.withinComponent('Ønsker du ekstra skattetrekk i kroner eller prosent?', () => {
        cy.findByRole('radio', { name: 'Prosent' }).click();
      });
      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').should('not.exist');
      cy.findByLabelText('Ekstra skattetrekk i prosent per måned').should('exist');
    });
  });

  describe('Stoppe skattetrekk – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952003/meldingenGjelder?sub=digital');
      cy.defaultWaits();
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Stoppe skattetrekk' }).click();
      });
      cy.clickSaveAndContinue();
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
        cy.findByRole('radio', { name: 'Barnepensjon over 18 år' }).click();
      });

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952003/tilleggsopplysninger?sub=digital');
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
      cy.visit('/fyllut/nav952003?sub=digital');
      cy.defaultWaits();
      cy.clickSaveAndContinue(); // landing page → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickSaveAndContinue();

      // Dine opplysninger – identity is prefilled in digital mode; only phone must be completed here
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickSaveAndContinue();

      // Meldingen gjelder
      cy.withinComponent('Skal du ha nytt skattetrekk eller stoppe skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Nytt skattetrekk' }).click();
      });
      cy.clickSaveAndContinue();

      // Nytt skattetrekk – simplest valid branch without child datagrid
      cy.withinComponent('Kryss av for den pengestøtten du ønsker ekstra skattetrekk på', () => {
        cy.findByRole('radio', { name: 'Barnepensjon over 18 år' }).click();
      });
      cy.withinComponent('Ønsker du ekstra skattetrekk i kroner eller prosent?', () => {
        cy.findByRole('radio', { name: 'Kroner' }).click();
      });
      cy.findByLabelText('Ekstra skattetrekk i kroner per måned').type('500');
      cy.clickSaveAndContinue();

      // Tilleggsopplysninger
      cy.withinComponent('Har du andre opplysninger som er relevant for skattetrekket?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickSaveAndContinue();

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
        cy.get('dd').eq(0).should('contain.text', 'Barnepensjon over 18 år');
        cy.get('dt').eq(1).should('contain.text', 'Ønsker du ekstra skattetrekk i kroner eller prosent?');
        cy.get('dd').eq(1).should('contain.text', 'Kroner');
        cy.get('dt').eq(2).should('contain.text', 'Ekstra skattetrekk i kroner per måned');
        cy.get('dd').eq(2).should('contain.text', '500');
      });
    });
  });
});
