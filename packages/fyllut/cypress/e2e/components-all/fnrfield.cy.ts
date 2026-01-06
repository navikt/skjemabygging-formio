describe('FnrField', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/fnrfield/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable with no spellcheck', () => {
      const label = 'Fødselsnummer eller d-nummer';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
      cy.findByLabelText(label).should('not.have.attr', 'spellcheck');
    });

    it('should have description', () => {
      const label = 'Fødselsnummer med beskrivelse';
      const additionalDescription = 'Utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });
  });

  describe('Validation', () => {
    let label;

    beforeEach(() => {
      label = 'Fødselsnummer påkrevd';
      cy.visit('/fyllut/fnrfield/validering?sub=paper');
      cy.defaultWaits();
    });

    it('validates with required', () => {
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('27908095087');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('validates invalid checksum', () => {
      cy.findByRole('textbox', { name: label }).type('18907299827');
      cy.clickNextStep();
      cy.findAllByText('Dette er ikke et gyldig fødselsnummer eller d-nummer (11 siffer)').should('have.length', 2);
    });

    it('allows test-IDs', () => {
      cy.findByRole('textbox', { name: label }).type('18907299828');
      cy.clickNextStep();
      cy.findAllByText('Dette er ikke et gyldig fødselsnummer eller d-nummer (11 siffer)').should('have.length', 0);
    });

    describe('In prod', () => {
      beforeEach(() => {
        cy.defaultIntercepts();
        cy.intercept('GET', 'fyllut/api/config*', { NAIS_CLUSTER_NAME: 'prod-gcp' }).as('getConfig');
        cy.visit('/fyllut/fnrfield/validering?sub=paper');
        cy.defaultWaits();
      });

      it('does not allow test-ID in production', () => {
        cy.findByRole('textbox', { name: label }).type('18907299828');
        cy.clickNextStep();
        cy.findAllByText('Dette er ikke et gyldig fødselsnummer eller d-nummer (11 siffer)').should('have.length', 2);
      });
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/fnrfield?sub=paper');
      cy.defaultWaits();
    });

    it('lets you fill out the full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('22859597622');
      cy.findByRole('textbox', { name: 'Fødselsnummer med beskrivelse' }).type('11918174526');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Fødselsnummer påkrevd' }).type('01854498645');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fødselsnummer eller d-nummer');
        cy.get('dd').eq(0).should('contain.text', '228595 97622');
        cy.get('dt').eq(1).should('contain.text', 'Fødselsnummer med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', '119181 74526');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fødselsnummer påkrevd');
        cy.get('dd').eq(0).should('contain.text', '018544 98645');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translations', () => {
    beforeEach(() => {
      cy.visit('/fyllut/fnrfield/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate label and description', () => {
      cy.withinComponent('Fødselsnummer med beskrivelse (en)', () => {
        cy.contains('Beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Utvidet beskrivelse (en)').shouldBeVisible();
      });
    });

    it('should translate validation messages', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Validering (en)' }).click();
      const label = 'Fødselsnummer påkrevd (en)';
      cy.findByRole('textbox', { name: label }).type('18907299827');
      cy.clickNextStep();
      cy.findAllByText('This is not a valid Norwegian national identification number or d-number (11 digits)').should(
        'have.length',
        2,
      );
    });
  });
});
