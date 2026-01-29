describe('MonthPicker', () => {
  beforeEach(() => {
    // Overwrite native global definition of current date
    const today = new Date('2025-08-01');
    cy.clock(today, ['Date']);
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/monthpicker/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Månedsvelger (mm.åååå)';
      cy.findByLabelText(label).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description', () => {
      const label = 'MonthPicker med beskrivelse';
      const descriptionText = 'Beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains(descriptionText).should('exist');
        cy.contains('Utvidet beskrivelse').should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains('Utvidet beskrivelse').shouldBeVisible();
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/monthpicker/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate required field', () => {
      const label = 'MonthPicker påkrevd';
      cy.clickNextStep();
      cy.findByText('For å gå videre må du rette opp følgende:');
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('02.2024');
      // Fixme: It should not be necessary to click next step.
      //  Formio is not triggering a showErrors event on input change during cypress tests
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate input format', () => {
      const label = 'MonthPicker påkrevd';
      cy.findByLabelText(label).type('24-02');
      cy.clickNextStep();
      cy.findAllByText(`${label} er ikke en gyldig dato.`).should('have.length', 2);
      cy.findByLabelText(label).type('{selectAll}2024-02');
      // Fixme: It should not be necessary to click next step.
      //  Formio is not triggering a showErrors event on input change during cypress tests
      cy.clickNextStep();
      cy.findAllByText(`${label} er ikke en gyldig dato.`).should('have.length', 0);
    });

    it('should validate minYear', () => {
      const label = 'MonthPicker 2020 og senere';
      cy.findByLabelText(label).type('01.2019');
      cy.clickNextStep();
      cy.findAllByText(`${label} kan ikke være før 2020`).should('have.length', 2);
      cy.findByLabelText(label).type('{selectAll}01.2020');
      // Fixme: It should not be necessary to click next step.
      //  Formio is not triggering a showErrors event on input change during cypress tests
      cy.clickNextStep();
      cy.findAllByText(`${label} kan ikke være før 2020`).should('have.length', 0);
    });

    it('should validate maxYear', () => {
      const label = 'MonthPicker 2030 og tidligere';
      cy.findByLabelText(label).type('01.2031');
      cy.clickNextStep();
      cy.findAllByText(`${label} kan ikke være senere enn 2030`).should('have.length', 2);
      cy.findByLabelText(label).type('{selectAll}01.2030');
      // Fixme: It should not be necessary to click next step.
      //  Formio is not triggering a showErrors event on input change during cypress tests
      cy.clickNextStep();
      cy.findAllByText(`${label} kan ikke være senere enn 2030`).should('have.length', 0);
    });

    it('should validate earliestAllowedDate', () => {
      const label = 'MonthPicker senere enn 5 år tilbake i tid';
      cy.findByLabelText(label).type('12.2019');
      cy.clickNextStep();
      cy.findAllByText(`${label} kan ikke være før 2020`).should('have.length', 2);
      cy.findByLabelText(label).type('{selectAll}01.2020');
      // Fixme: It should not be necessary to click next step.
      //  Formio is not triggering a showErrors event on input change during cypress tests
      cy.clickNextStep();
      cy.findAllByText(`${label} kan ikke være før 2020`).should('have.length', 0);
    });

    it('should validate latestAllowedDate', () => {
      const label = 'MonthPicker tidligere enn om 4 år';
      cy.findByLabelText(label).type('01.2030');
      cy.clickNextStep();
      cy.findAllByText(`${label} kan ikke være senere enn 2029`).should('have.length', 2);
      cy.findByLabelText(label).type('{selectAll}12.2029');
      // Fixme: It should not be necessary to click next step.
      //  Formio is not triggering a showErrors event on input change during cypress tests
      cy.clickNextStep();
      cy.findAllByText(`${label} kan ikke være senere enn 2029`).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/monthpicker?sub=paper');
      cy.defaultWaits();
    });
    it('should submit form with valid month picker values', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Månedsvelger (mm.åååå)' }).type('03.2023');
      cy.findByRole('textbox', { name: 'MonthPicker med beskrivelse' }).type('05.2024');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'MonthPicker påkrevd' }).type('07.2022');
      cy.findByRole('textbox', { name: 'MonthPicker 2020 og senere' }).type('08.2021');
      cy.findByRole('textbox', { name: 'MonthPicker 2030 og tidligere' }).type('09.2029');
      cy.findByRole('textbox', { name: 'MonthPicker senere enn 5 år tilbake i tid' }).type('10.2021');
      cy.findByRole('textbox', { name: 'MonthPicker tidligere enn om 4 år' }).type('11.2027');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Månedsvelger (mm.åååå)');
        cy.get('dd').eq(0).should('contain.text', 'Mars 2023');
        cy.get('dt').eq(1).should('contain.text', 'MonthPicker med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'Mai 2024');
      });

      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'MonthPicker påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'Juli 2022');
        cy.get('dt').eq(1).should('contain.text', 'MonthPicker 2020 og senere');
        cy.get('dd').eq(1).should('contain.text', 'August 2021');
        cy.get('dt').eq(2).should('contain.text', 'MonthPicker 2030 og tidligere');
        cy.get('dd').eq(2).should('contain.text', 'September 2029');
        cy.get('dt').eq(3).should('contain.text', 'MonthPicker senere enn 5 år tilbake i tid');
        cy.get('dd').eq(3).should('contain.text', 'Oktober 2021');
        cy.get('dt').eq(4).should('contain.text', 'MonthPicker tidligere enn om 4 år');
        cy.get('dd').eq(4).should('contain.text', 'November 2027');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translations', () => {
    beforeEach(() => {
      cy.visit('/fyllut/monthpicker/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate label and description', () => {
      cy.withinComponent('MonthPicker med beskrivelse (en)', () => {
        cy.contains('Beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Utvidet beskrivelse (en)').shouldBeVisible();
      });
    });

    it('should translate month names', () => {
      cy.findByRole('textbox', { name: 'Månedsvelger (mm.åååå) (en)' }).type('02.2023');
      cy.findByLabelText('Månedsvelger (mm.åååå) (en)').should('have.value', 'February 2023');
      cy.findByRole('textbox', { name: 'MonthPicker med beskrivelse (en)' }).type('03.2023');
      cy.findByLabelText('MonthPicker med beskrivelse (en)').should('have.value', 'March 2023');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Summary' }).click();
      cy.withinSummaryGroup('Visning (en)', () => {
        cy.get('dt').eq(0).should('contain.text', 'Månedsvelger (mm.åååå) (en)');
        cy.get('dd').eq(0).should('contain.text', 'February 2023');
        cy.get('dt').eq(1).should('contain.text', 'MonthPicker med beskrivelse (en)');
        cy.get('dd').eq(1).should('contain.text', 'March 2023');
      });
    });

    it('should translate validation messages', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Validering (en)' }).click();

      cy.findByRole('textbox', { name: 'MonthPicker påkrevd (en)' }).type('04.2022');
      cy.clickNextStep();
      cy.findAllByText('MonthPicker påkrevd (en) is required').should('have.length', 0);
      cy.findByRole('textbox', { name: 'MonthPicker påkrevd (en)' }).type('{selectAll}invalid-date');
      cy.clickNextStep();
      cy.findAllByText('MonthPicker påkrevd (en) is not a valid date').should('have.length', 2);

      cy.findByRole('textbox', { name: 'MonthPicker 2020 og senere (en)' }).type('01.2019');
      cy.findByRole('textbox', { name: 'MonthPicker 2030 og tidligere (en)' }).type('01.2031');
      cy.findByRole('textbox', { name: 'MonthPicker senere enn 5 år tilbake i tid (en)' }).type('01.2019');
      cy.findByRole('textbox', { name: 'MonthPicker tidligere enn om 4 år (en)' }).type('01.2031');
      cy.clickNextStep();
      cy.findAllByText('MonthPicker 2020 og senere (en) cannot be earlier than 2020').should('have.length', 2);
      cy.findAllByText('MonthPicker 2030 og tidligere (en) cannot be later than 2030').should('have.length', 2);
      cy.findAllByText('MonthPicker senere enn 5 år tilbake i tid (en) cannot be earlier than 2020').should(
        'have.length',
        2,
      );
      cy.findAllByText('MonthPicker tidligere enn om 4 år (en) cannot be later than 2029').should('have.length', 2);
    });
  });
});
