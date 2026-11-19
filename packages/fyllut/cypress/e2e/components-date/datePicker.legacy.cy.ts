/*
 * Tests that the datepicker component (react) renders, validates and handles interactions correctly
 */
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Settings } from 'luxon';

const validateionBefore = (date: string) => `Datoen kan ikke være tidligere enn ${date}`;
const validationAfter = (date: string) => `Datoen kan ikke være senere enn ${date}`;

const EARLIEST_RELATIVE = -10;
const LATEST_RELATIVE = 5;

let beforeDate;
let afterDate;
const todayOverwrite = new Date(2020, 6, 14);

const allFieldsEneabled = () => {
  cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('not.be.disabled');
  cy.findByRole('textbox', { name: 'Dato med validering mot annet datofelt (valgfritt)' }).should('not.be.disabled');
  cy.findByRole('textbox', { name: 'Dato med validering mot annet datofelt (kan være lik) (valgfritt)' }).should(
    'not.be.disabled',
  );
  cy.findByRole('textbox', { name: 'Dato med validering av tidligst og senest (valgfritt)' }).should('not.be.disabled');
  cy.findByRole('textbox', { name: 'Dato med validering av antall dager tilbake eller framover (valgfritt)' }).should(
    'not.be.disabled',
  );
};

describe('NavDatepicker', () => {
  beforeEach(() => {
    // Overwrite native global definition of current date
    cy.clock(todayOverwrite, ['Date']);
    // We also have to overwrite luxon's definition of current date
    Settings.now = () => todayOverwrite.valueOf();

    beforeDate = dateUtils.toLocaleDate(dateUtils.addDays(EARLIEST_RELATIVE));
    afterDate = dateUtils.toLocaleDate(dateUtils.addDays(LATEST_RELATIVE));

    cy.defaultIntercepts();
    cy.visit('/fyllut/navdatepicker/veiledning?sub=paper');
    cy.defaultWaits();
  });

  describe('Date input value', () => {
    beforeEach(() => {
      allFieldsEneabled();
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('06.06.2022{esc}');
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('is rendered on summary page', () => {
      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Tilfeldig dato');
          cy.get('dd').eq(0).should('contain.text', '06.06.2022');
        });
    });

    it('is editable after returning from summary page', () => {
      cy.clickEditAnswer('Veiledning');
      cy.findByRole('heading', { name: 'Veiledning' }).should('be.visible');
      cy.findByRoleWhenAttached('textbox', { name: 'Tilfeldig dato' }).should('be.visible').and('be.enabled');
      cy.findByRoleWhenAttached('textbox', { name: 'Tilfeldig dato' }).type('{selectall}18.06.2020');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Tilfeldig dato');
          cy.get('dd').eq(0).should('contain.text', '18.06.2020');
        });
    });

    it('is cleared when user removes textbox content', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Veiledning' }).click();
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');

      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('be.visible').and('be.enabled');
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('have.value', '06.06.2022');
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('{selectall}{backspace}');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('not.exist');
      cy.findAllByText('Du må fylle ut: Tilfeldig dato').should('have.length', 2);
    });
  });

  describe('Date input field', () => {
    it('has focus after clicking validation message link', () => {
      cy.clickNextStep();

      cy.findAllByText('Du må fylle ut: Tilfeldig dato').should('have.length', 2);
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Tilfeldig dato' }).should('exist');
          cy.findByRole('link', { name: 'Du må fylle ut: Tilfeldig dato' }).click();
        });

      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('have.focus');
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('02.02.2023');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });

  describe('Valdation against another date input field', () => {
    const MY_TEST_DATE = '15.05.2023';

    beforeEach(() => {
      allFieldsEneabled();
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type(`${MY_TEST_DATE}{esc}`);
    });

    describe('mayBeEqual=false', () => {
      const LABEL = 'Dato med validering mot annet datofelt (valgfritt)';

      it('fails when date is before', () => {
        cy.findByRole('textbox', { name: LABEL }).type('14.05.2023');
        cy.clickNextStep();

        cy.findAllByText(validateionBefore('16.05.2023')).should('have.length', 2);
      });

      it('fails when date is equal', () => {
        cy.findByRole('textbox', { name: LABEL }).type('15.05.2023');
        cy.clickNextStep();

        cy.findAllByText(validateionBefore('16.05.2023')).should('have.length', 2);
      });

      it('ok when date is later', () => {
        cy.findByRole('textbox', { name: LABEL }).type('16.05.2023');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('be.visible');
        cy.findAllByText(validateionBefore('16.05.2023')).should('have.length', 0);
      });
    });

    describe('mayBeEqual=true', () => {
      const LABEL = 'Dato med validering mot annet datofelt (kan være lik) (valgfritt)';

      it('fails when date is before', () => {
        cy.findByRole('textbox', { name: LABEL }).type(`14.05.2023{esc}`);
        cy.clickNextStep();

        cy.findAllByText(validateionBefore(MY_TEST_DATE)).should('have.length', 2);
      });

      it('fails when date is equal', () => {
        cy.findByRole('textbox', { name: LABEL }).type('15.05.2023{esc}');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('be.visible');
        cy.findAllByText(validateionBefore(MY_TEST_DATE)).should('have.length', 0);
      });

      it('ok when date is later', () => {
        cy.findByRole('textbox', { name: LABEL }).type('16.05.2023{esc}');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('be.visible');
        cy.findAllByText(validateionBefore(MY_TEST_DATE)).should('have.length', 0);
      });
    });
  });

  describe('Validation of date with earliest / latest contraint', () => {
    beforeEach(() => {
      allFieldsEneabled();
    });

    const LABEL = 'Dato med validering av tidligst og senest (valgfritt)';
    const EARLIEST_DATE = '01.08.2023';
    const LATEST_DATE = '31.08.2023';

    it("fails when date is before 'earliest date'", () => {
      cy.findByRole('textbox', { name: LABEL }).type('15.07.2023{esc}');
      cy.clickNextStep();

      cy.findAllByText(validateionBefore(EARLIEST_DATE)).should('have.length', 2);
    });

    it("is ok when date is equal to 'earliest date'", () => {
      cy.findByRole('textbox', { name: LABEL }).type(`${EARLIEST_DATE}{esc}`);
      cy.clickNextStep();

      cy.findAllByText(validateionBefore(EARLIEST_DATE)).should('have.length', 0);
    });

    it("is ok when date is equal to 'latest date'", () => {
      cy.findByRole('textbox', { name: LABEL }).type(`${LATEST_DATE}{esc}`);
      cy.clickNextStep();

      cy.findAllByText(validationAfter(LATEST_DATE)).should('have.length', 0);
    });

    it("fails when date is after 'latest date'", () => {
      cy.findByRole('textbox', { name: LABEL }).type('01.09.2023{esc}');
      cy.clickNextStep();

      cy.findAllByText(validationAfter(LATEST_DATE)).should('have.length', 2);
    });
  });

  describe('Validation of date with earliest (-10) / latest (5) relative constraint', () => {
    const LABEL = 'Dato med validering av antall dager tilbake eller framover (valgfritt)';

    it('fails when date is before the earliest limit', () => {
      cy.findByRole('textbox', { name: LABEL }).type(dateUtils.toLocaleDate(dateUtils.addDays(EARLIEST_RELATIVE - 1)));
      cy.clickNextStep();

      cy.findAllByText(validateionBefore(beforeDate)).should('have.length', 2);
    });

    it('is ok when date is exactly the earliest limit', () => {
      cy.findByRole('textbox', { name: LABEL }).type(dateUtils.toLocaleDate(dateUtils.addDays(EARLIEST_RELATIVE)));
      cy.clickNextStep();

      cy.findAllByText(validateionBefore(beforeDate)).should('have.length', 0);
    });

    it('is ok when date is exactly the latest limit', () => {
      cy.findByRole('textbox', { name: LABEL }).type(dateUtils.toLocaleDate(dateUtils.addDays(LATEST_RELATIVE)));
      cy.clickNextStep();

      cy.findAllByText(validationAfter(afterDate)).should('have.length', 0);
    });

    it('fails when date is after the earliest limit', () => {
      cy.findByRole('textbox', { name: LABEL }).type(dateUtils.toLocaleDate(dateUtils.addDays(LATEST_RELATIVE + 1)));
      cy.clickNextStep();

      cy.findAllByText(validationAfter(afterDate)).should('have.length', 2);
    });
  });

  describe('Dates with range earlier or later than to day', () => {
    const LABEL_TODAY = 'Dato med validering av antall dager tilbake eller framover (valgfritt)';
    const LABEL_PAST = 'Dato med intervall tidligere enn dagens dato (valgfritt)';
    const LABEL_FUTURE = 'Dato med intervall senere enn dagens dato (valgfritt)';

    it('shows current month if range includes current date', () => {
      cy.findByRole('textbox', { name: LABEL_TODAY })
        .parent()
        .within(() => {
          cy.findByRole('button', { name: 'Åpne datovelger' }).click();
        });

      cy.findByRole('grid', { name: 'juli 2020' }).shouldBeVisible();
    });

    it('shows the end of the range as default month when the range is in the past', () => {
      cy.findByRole('textbox', { name: LABEL_PAST })
        .parent()
        .within(() => {
          cy.findByRole('button', { name: 'Åpne datovelger' }).click();
        });

      cy.findByRole('grid', { name: 'april 2012' }).shouldBeVisible();
    });

    it('shows the beginning of the range as default month when the range is in the future', () => {
      cy.findByRole('textbox', { name: LABEL_FUTURE })
        .parent()
        .within(() => {
          cy.findByRole('button', { name: 'Åpne datovelger' }).click();
        });

      cy.findByRole('grid', { name: 'september 2028' }).shouldBeVisible();
    });
  });

  describe('Data grid', () => {
    beforeEach(() => {
      allFieldsEneabled();
    });

    it('test to and from date inside data grid with valid date', () => {
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('06.06.2022');

      cy.findByRole('textbox', { name: /Grid fra/ }).type('02.02.2023');
      cy.findByRole('textbox', { name: /Grid til/ }).type('03.02.2023');

      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('test to and from date inside data grid with invalid to date', () => {
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('06.06.2022');

      cy.findByRole('textbox', { name: /Grid fra/ }).type('02.02.2023');
      cy.findByRole('textbox', { name: /Grid til/ }).type('01.02.2023');

      cy.clickNextStep();
      cy.findAllByText(validateionBefore('03.02.2023')).should('have.length', 2);
    });

    it('test to and from date inside data grid with invalid to dated', () => {
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('06.06.2022');

      cy.findByRole('button', { name: 'Legg til' }).click();

      cy.findAllByRole('textbox', { name: /Grid fra/ })
        .eq(0)
        .type('02.02.2023');
      cy.findAllByRole('textbox', { name: /Grid til/ })
        .eq(0)
        .type('01.02.2023');

      cy.findAllByRole('textbox', { name: /Grid fra/ })
        .eq(1)
        .type('04.02.2023');
      cy.findAllByRole('textbox', { name: /Grid til/ })
        .eq(1)
        .type('03.02.2023');

      cy.clickNextStep();
      cy.findAllByText(validateionBefore('03.02.2023')).should('have.length', 2);
      cy.findAllByText(validateionBefore('05.02.2023')).should('have.length', 2);
    });
  });
});
