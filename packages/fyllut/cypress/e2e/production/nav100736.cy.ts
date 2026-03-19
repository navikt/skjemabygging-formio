/*
 * Production form tests for Pristilbud for behandlingsbriller eller irislinser
 * Form: nav100736
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Velg stønadsordning (velgStonadsordning): 2 cross-panel panel-level conditionals
 *       hvilkenStonadsordningSkalDuFylleUtPristilbudFor → opplysningeromirislinsen panel (irislinse)
 *       hvilkenStonadsordningSkalDuFylleUtPristilbudFor → opplysningerOmBehandlingsbrille panel (behandlingsbrille)
 *   - Opplysninger om søker (personopplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       adresse.borDuINorge → adresseVarighet visibility
 *   - Opplysninger om irislinsene (opplysningeromirislinsen): 4 customConditionals
 *       hvilketOyeGjelderDet → styrkePaLinsen, styrkePaLinsen1, visusPaLinsen, visusPaLinsen1
 *   - Opplysninger om behandlingsbrille (opplysningerOmBehandlingsbrille): 1 same-panel conditional
 *       erDetBehovForEnNyInnfatning → navSkjemagruppe2 (innfatning fields)
 */

const visitFormStart = () => {
  cy.visit('/fyllut/nav100736?sub=paper');
  cy.defaultWaits();
  cy.clickNextStep();
};

const selectStonadsordning = (label: 'Irislinse' | 'Briller til forebygging eller behandling av amblyopi') => {
  cy.withinComponent('Hvilken stønadsordning skal du gi pristilbud for?', () => {
    cy.findByRole('radio', { name: label }).click();
  });
};

describe('nav100736', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Velg stønadsordning – panel-level conditionals', () => {
    beforeEach(() => {
      visitFormStart();
    });

    it('shows only the relevant conditional panel in stepper based on stønadsordning', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om irislinsene' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om behandlingsbrille' }).should('not.exist');

      selectStonadsordning('Irislinse');
      cy.findByRole('link', { name: 'Opplysninger om irislinsene' }).should('exist');
      cy.findByRole('link', { name: 'Opplysninger om behandlingsbrille' }).should('not.exist');

      selectStonadsordning('Briller til forebygging eller behandling av amblyopi');
      cy.findByRole('link', { name: 'Opplysninger om irislinsene' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om behandlingsbrille' }).should('exist');
    });
  });

  describe('Opplysninger om søker – identity conditionals', () => {
    beforeEach(() => {
      visitFormStart();
      selectStonadsordning('Irislinse');
      cy.clickNextStep();
    });

    it('shows adresse section when søker has no fnr', () => {
      cy.findByLabelText('Bor søker i Norge?').should('not.exist');

      cy.withinComponent('Har søkeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor søker i Norge?').should('exist');
    });

    it('keeps adresse section hidden when søker has fnr', () => {
      cy.withinComponent('Har søkeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor søker i Norge?').should('not.exist');
    });

    it('shows adresseVarighet date fields when søker does not live in Norway', () => {
      cy.withinComponent('Har søkeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor søker i Norge?').should('exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Bor søker i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');
    });
  });

  describe('Opplysninger om irislinsene – which eye conditionals', () => {
    beforeEach(() => {
      visitFormStart();
      selectStonadsordning('Irislinse');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om irislinsene' }).click();
    });

    it('shows correct eye-specific styrke and visus fields based on eye selection', () => {
      cy.findByRole('textbox', { name: 'Styrke på linsen (Høyre øye)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Styrke på linsen (Venstre øye)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Visus (Høyre øye)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Visus (Venstre øye)' }).should('not.exist');

      cy.withinComponent('Hvilket øye gjelder det?', () => {
        cy.findByRole('radio', { name: 'Høyre' }).click();
      });
      cy.findByRole('textbox', { name: 'Styrke på linsen (Høyre øye)' }).should('exist');
      cy.findByRole('textbox', { name: 'Visus (Høyre øye)' }).should('exist');
      cy.findByRole('textbox', { name: 'Styrke på linsen (Venstre øye)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Visus (Venstre øye)' }).should('not.exist');

      cy.withinComponent('Hvilket øye gjelder det?', () => {
        cy.findByRole('radio', { name: 'Begge' }).click();
      });
      cy.findByRole('textbox', { name: 'Styrke på linsen (Høyre øye)' }).should('exist');
      cy.findByRole('textbox', { name: 'Styrke på linsen (Venstre øye)' }).should('exist');
      cy.findByRole('textbox', { name: 'Visus (Høyre øye)' }).should('exist');
      cy.findByRole('textbox', { name: 'Visus (Venstre øye)' }).should('exist');

      cy.withinComponent('Hvilket øye gjelder det?', () => {
        cy.findByRole('radio', { name: 'Venstre' }).click();
      });
      cy.findByRole('textbox', { name: 'Styrke på linsen (Høyre øye)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Styrke på linsen (Venstre øye)' }).should('exist');
      cy.findByRole('textbox', { name: 'Visus (Høyre øye)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Visus (Venstre øye)' }).should('exist');
    });
  });

  describe('Opplysninger om behandlingsbrille – innfatning conditional', () => {
    beforeEach(() => {
      visitFormStart();
      selectStonadsordning('Briller til forebygging eller behandling av amblyopi');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om behandlingsbrille' }).click();
    });

    it('shows innfatning fields only when innfatning is needed', () => {
      cy.findByRole('textbox', { name: 'Navn på innfatning' }).should('not.exist');

      cy.withinComponent('Er det behov for en ny innfatning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Navn på innfatning' }).should('exist');
      cy.findByRole('textbox', { name: 'Størrelse' }).should('exist');

      cy.withinComponent('Er det behov for en ny innfatning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Navn på innfatning' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100736?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // advance past the form start page to panel 1 (velgStonadsordning)
    });

    it('fills required fields via irislinse path and verifies summary', () => {
      // Panel 1: Velg stønadsordning
      cy.withinComponent('Hvilken stønadsordning skal du gi pristilbud for?', () => {
        cy.findByRole('radio', { name: 'Irislinse' }).click();
      });
      cy.clickNextStep();

      // Panel 2: Opplysninger om søker – fnr path (hides adresse and adresseVarighet)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har søkeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Panel 3: Opplysninger om utfyller
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Optiker');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).type('Optikerstudio AS');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      // epost1 (E-post) is required and shown for irislinse
      cy.findByRole('textbox', { name: 'E-post' }).type('test@example.com');
      cy.clickNextStep();

      // Panel 4: Opplysninger om irislinsene (opplysningerOmBehandlingsbrille is hidden for irislinse)
      cy.withinComponent('Pristilbudet gjelder', () => {
        cy.findByRole('radio', { name: 'Førstegangssøknad' }).click();
      });
      cy.findByRole('textbox', { name: 'Navn på linsen(e)' }).type('TestLinse 500');
      cy.findByRole('textbox', { name: 'Navn på leverandør av linsen(e)' }).type('Leverandør AS');
      cy.findByLabelText('Antall linser').type('2');
      cy.findByLabelText('Totalsum for linsen(e) inkl. mva').type('5000');
      cy.findByLabelText('Totalsum for linsen(e) eks. mva').type('4000');
      cy.findByRole('textbox', { name: 'Varighet på linsen(e)' }).type('12 måneder');
      cy.findByRole('textbox', { name: 'Farge på linsen(e)' }).type('Klar');
      cy.withinComponent('Hvilket øye gjelder det?', () => {
        cy.findByRole('radio', { name: 'Høyre' }).click();
      });
      // styrkePaLinsen1 and visusPaLinsen1 (Venstre) are hidden for Høyre and cleared
      cy.findByRole('textbox', { name: 'Styrke på linsen (Høyre øye)' }).type('+1.00');
      cy.findByRole('textbox', { name: 'Visus (Høyre øye)' }).type('0.8');
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Velg stønadsordning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilken stønadsordning skal du gi pristilbud for?');
        cy.get('dd').eq(0).should('contain.text', 'Irislinse');
      });
      cy.withinSummaryGroup('Opplysninger om søker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
    });
  });
});
