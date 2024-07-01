/*
 * Tests that the datepicker component (react) renders, validates and handles interactions correctly
 */
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const validateionBefore = (date: string) => `Datoen kan ikke være tidligere enn ${date}`;
const validationAfter = (date: string) => `Datoen kan ikke være senere ${date}`;

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
      cy.findByRole('link', { name: 'Rediger veiledning' }).click();
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
      cy.findByRole('navigation', { name: 'Søknadssteg' })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Veiledning' }).click();
        });
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
      cy.findByRole('region', { name: TEXTS.validering.error })
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
    beforeEach(() => {
      allFieldsEneabled();
    });

    const EARLIEST_RELATIVE = -10;
    const LATEST_RELATIVE = 5;

    const LABEL = 'Dato med validering av antall dager tilbake eller framover (valgfritt)';

    const beforeDate = dateUtils.toLocaleDate(dateUtils.addDays(EARLIEST_RELATIVE));
    const afterDate = dateUtils.toLocaleDate(dateUtils.addDays(LATEST_RELATIVE));

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

  describe('Data grid', () => {
    it('test to and from date inside data grid', () => {
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('06.06.2022');

      cy.findByRole('textbox', { name: /Grid fra/ }).type('02.02.2023');
      cy.findByRole('textbox', { name: /Grid til/ }).type('01.02.2023');

      cy.clickNextStep();
      cy.findAllByText(validateionBefore('02.02.2023')).should('have.length', 2);
    });
  });
});
