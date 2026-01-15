const assertRadioWithDescription = (label: string, description: string) => {
  cy.findByRole('radio', { name: label }).should('exist');
  cy.contains(description).should('exist');
};

describe('Radiopanel', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/radiopanel/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Radio';
      cy.findByLabelText(label).shouldBeVisible();
      cy.withinComponent(label, () => {
        cy.findByRole('radio', { name: 'NRK P1' }).should('exist');
        cy.findByRole('radio', { name: 'NRK P2' }).should('exist');
      });
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description and additional description', () => {
      const label = 'Radio med beskrivelse';
      const additionalDescription = 'Utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });
  });

  describe('Data', () => {
    beforeEach(() => {
      cy.visit('/fyllut/radiopanel/data?sub=paper');
      cy.defaultWaits();
    });

    it('should display descriptions for each radio option', () => {
      const label = 'Radioknapper med beskrivelse';
      cy.withinComponent(label, () => {
        assertRadioWithDescription('Ja', 'Positivt svar');
        assertRadioWithDescription('Nei', 'Negativt svar');
        assertRadioWithDescription('Kanskje', 'Nølende svar');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/radiopanel/validering?sub=paper');
      cy.defaultWaits();
    });

    it('validates required radio panel', () => {
      const label = 'Radioknapper påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.withinComponent(label, () => {
        cy.findByRole('radio', { name: 'Valg 1' }).click();
      });
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('does not validate non-required radio panel', () => {
      const label = 'Radioknapper ikke påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/radiopanel?sub=paper');
      cy.defaultWaits();
    });

    it('lets you fill out the full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.withinComponent('Radio', () => {
        cy.findByRole('radio', { name: 'NRK P1' }).click();
      });
      cy.withinComponent('Radio med beskrivelse', () => {
        cy.findByRole('radio', { name: 'NRK P13' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Data' }).should('exist');
      cy.withinComponent('Radioknapper med beskrivelse', () => {
        cy.findByRole('radio', { name: 'Kanskje' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.withinComponent('Radioknapper påkrevd', () => {
        cy.findByRole('radio', { name: 'Valg 1' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Radio');
        cy.get('dd').eq(0).should('contain.text', 'NRK P1');
        cy.get('dt').eq(1).should('contain.text', 'Radio med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'NRK P13');
      });
      cy.withinSummaryGroup('Data', () => {
        cy.get('dt').eq(0).should('contain.text', 'Radioknapper med beskrivelse');
        cy.get('dd').eq(0).should('contain.text', 'Kanskje');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Radioknapper påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'Valg 1');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translations', () => {
    beforeEach(() => {
      cy.visit('/fyllut/radiopanel/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label, options and description', () => {
      cy.withinComponent('Radio (en)', () => {
        cy.findByRole('radio', { name: 'NRK P1 (en)' }).should('exist');
        cy.findByRole('radio', { name: 'NRK P2 (en)' }).should('exist');
      });
      cy.withinComponent('Radio med beskrivelse (en)', () => {
        cy.contains('Beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Utvidet beskrivelse (en)').shouldBeVisible();
      });
    });

    it('should have english option descriptions', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Data (en)' }).click();
      cy.withinComponent('Radioknapper med beskrivelse (en)', () => {
        assertRadioWithDescription('Ja (en)', 'Positivt svar (en)');
        assertRadioWithDescription('Nei (en)', 'Negativt svar (en)');
        assertRadioWithDescription('Kanskje (en)', 'Nølende svar (en)');
      });
    });
  });
});
