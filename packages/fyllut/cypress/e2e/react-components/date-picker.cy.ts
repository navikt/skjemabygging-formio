/*
 * Tests that the datepicker component (react) renders, validates and handles interactions correctly
 */

import * as moment from 'moment';

describe('NavDatepicker', () => {
  beforeEach(() => {
    cy.visit('/fyllut/navdatepicker/veiledning?sub=paper');
    cy.wait('@getConfig');
    cy.wait('@getForm');
  });

  describe('Date input value', () => {
    beforeEach(() => {
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('06.06.2022');
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('is rendered on summary page', () => {
      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Tilfeldig dato');
          cy.get('dd').eq(0).should('contain.text', '6.6.2022');
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
          cy.get('dd').eq(0).should('contain.text', '18.6.2020');
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
      cy.findAllByText('Du må fylle ut: Tilfeldig dato').should('have.length', 1);
      cy.findAllByText('Tilfeldig dato: Du må fylle ut: Tilfeldig dato').should('have.length', 1);
    });
  });

  describe('Date input field', () => {
    it('has focus after clicking validation message link', () => {
      cy.clickNextStep();

      cy.findAllByText('Du må fylle ut: Tilfeldig dato').should('have.length', 1);
      cy.findByRoleWhenAttached('link', { name: 'Tilfeldig dato: Du må fylle ut: Tilfeldig dato' })
        .should('exist')
        .click();

      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('have.focus').type('02.02.2023');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });

  describe('Valdation against another date input field', () => {
    const MY_TEST_DATE = '15.05.2023';

    beforeEach(() => {
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type(`${MY_TEST_DATE}{esc}`);
    });

    describe('mayBeEqual=false', () => {
      const LABEL = 'Dato med validering mot annet datofelt (valgfritt)';
      const VALIDATION_TEXT = `Datoen må være senere enn ${MY_TEST_DATE}`;

      it('fails when date is before', () => {
        cy.findByRole('textbox', { name: LABEL }).type('14.05.2023');
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
      });

      it('fails when date is equal', () => {
        cy.findByRole('textbox', { name: LABEL }).type('15.05.2023');
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
      });

      it('ok when date is later', () => {
        cy.findByRole('textbox', { name: LABEL }).type('16.05.2023');
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
      });
    });

    describe('mayBeEqual=true', () => {
      const LABEL = 'Dato med validering mot annet datofelt (kan være lik) (valgfritt)';
      const VALIDATION_TEXT = `Datoen kan ikke være tidligere enn ${MY_TEST_DATE}`;

      it('fails when date is before', () => {
        cy.findByRole('textbox', { name: LABEL }).type(`14.05.2023{esc}`);
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
      });

      it('fails when date is equal', () => {
        cy.findByRole('textbox', { name: LABEL }).type('15.05.2023{esc}');
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
      });

      it('ok when date is later', () => {
        cy.findByRole('textbox', { name: LABEL }).type('16.05.2023{esc}');
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
      });
    });
  });

  describe('Validation of date with earliest / latest contraint', () => {
    const LABEL = 'Dato med validering av tidligst og senest (valgfritt)';
    const EARLIEST_DATE = '01.08.2023';
    const LATEST_DATE = '31.08.2023';
    const VALIDATION_TEXT = `Datoen kan ikke være tidligere enn ${EARLIEST_DATE} eller senere enn ${LATEST_DATE}`;

    it("fails when date is before 'earliest date'", () => {
      cy.findByRole('textbox', { name: LABEL }).type('15.07.2023{esc}');
      cy.clickNextStep();

      cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
    });

    it("is ok when date is equal to 'earliest date'", () => {
      cy.findByRole('textbox', { name: LABEL }).type(`${EARLIEST_DATE}{esc}`);
      cy.clickNextStep();

      cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
    });

    it("is ok when date is equal to 'latest date'", () => {
      cy.findByRole('textbox', { name: LABEL }).type(`${LATEST_DATE}{esc}`);
      cy.clickNextStep();

      cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
    });

    it("fails when date is after 'latest date'", () => {
      cy.findByRole('textbox', { name: LABEL }).type('01.09.2023{esc}');
      cy.clickNextStep();

      cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
    });
  });

  describe('Validation of date with earliest (-10) / latest (5) relative constraint', () => {
    const EARLIEST_RELATIVE = -10;
    const LATEST_RELATIVE = 5;

    const LABEL = 'Dato med validering av antall dager tilbake eller framover (valgfritt)';
    const NOW = moment();
    const INPUT_FORMAT = 'DD.MM.YYYY';
    const plusDays = (date, number) => date.clone().add(number, 'days').format(INPUT_FORMAT);
    const VALIDATION_TEXT = `Datoen kan ikke være tidligere enn ${plusDays(
      NOW,
      EARLIEST_RELATIVE,
    )} eller senere enn ${plusDays(NOW, LATEST_RELATIVE)}`;

    it('fails when date is before the earliest limit', () => {
      cy.findByRole('textbox', { name: LABEL }).type(plusDays(NOW, EARLIEST_RELATIVE - 1));
      cy.clickNextStep();
      console.log('VALIDATION_TEXT', VALIDATION_TEXT);

      cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
    });

    it('is ok when date is exactly the earliest limit', () => {
      cy.findByRole('textbox', { name: LABEL }).type(plusDays(NOW, EARLIEST_RELATIVE));
      cy.clickNextStep();
      console.log('VALIDATION_TEXT', VALIDATION_TEXT);

      cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
    });

    it('is ok when date is exactly the latest limit', () => {
      cy.findByRole('textbox', { name: LABEL }).type(plusDays(NOW, LATEST_RELATIVE));
      cy.clickNextStep();
      console.log('VALIDATION_TEXT', VALIDATION_TEXT);

      cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
    });

    it('fails when date is after the earliest limit', () => {
      cy.findByRole('textbox', { name: LABEL }).type(plusDays(NOW, LATEST_RELATIVE + 1));
      cy.clickNextStep();
      console.log('VALIDATION_TEXT', VALIDATION_TEXT);

      cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
    });
  });
});
