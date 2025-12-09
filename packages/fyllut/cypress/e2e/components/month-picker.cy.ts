/*
 * Tests that the month picker component (react) renders and functions correctly
 */

import { expect } from 'chai';

describe('Month picker', () => {
  before(() => {
    cy.configMocksServer();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Paper', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/monthpickertest/veiledning?sub=paper');
      cy.clock(new Date('2024-08-01'), ['Date']);
      cy.defaultWaits();
    });

    it('should select month and show it in summary', () => {
      cy.findByRole('textbox', { name: 'Required monthPicker' }).should('exist');
      cy.findByRole('textbox', { name: 'Required monthPicker' }).type('01.2022{esc}');

      cy.clickNextStep();

      cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).check();

      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.get('dl')
        .eq(0)
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Required monthPicker');
          cy.get('dd').eq(0).should('contain.text', 'Januar 2022');
        });
    });

    it('should show error for required month picker', () => {
      cy.clickNextStep();

      // Error summary
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Required monthPicker' }).should('exist');
        });

      // Component error
      cy.findAllByText('Du må fylle ut: Required monthPicker').should('have.length', 2);
    });

    it('should show error for exact min/max dates', () => {
      cy.findByRole('textbox', { name: 'Required monthPicker' }).should('exist');
      cy.findByRole('textbox', { name: 'Required monthPicker' }).type('01.2022{esc}');

      // Min
      cy.findByRole('textbox', { name: 'Min/max monthPicker (valgfritt)' }).should('exist');
      cy.findByRole('textbox', { name: 'Min/max monthPicker (valgfritt)' }).type('01.2019{esc}');
      cy.clickNextStep();
      cy.findAllByText('Min/max monthPicker kan ikke være før 2020').should('have.length', 2);

      // Max
      cy.findByRole('textbox', { name: 'Min/max monthPicker (valgfritt)' }).clear();
      cy.findByRole('textbox', { name: 'Min/max monthPicker (valgfritt)' }).type('01.2028{esc}');
      cy.clickNextStep();
      cy.findAllByText('Min/max monthPicker kan ikke være senere enn 2024').should('have.length', 2);
    });

    it('should show error for relative min/max dates', () => {
      cy.findByRole('textbox', { name: 'Required monthPicker' }).should('exist');
      cy.findByRole('textbox', { name: 'Required monthPicker' }).type('01.2022{esc}');

      // Min
      cy.findByRole('textbox', { name: 'Relative monthPicker (valgfritt)' }).should('exist');
      cy.findByRole('textbox', { name: 'Relative monthPicker (valgfritt)' }).type('01.2015{esc}');
      cy.clickNextStep();
      cy.findAllByText('Relative monthPicker kan ikke være før 2019').should('have.length', 2);

      // Max
      cy.findByRole('textbox', { name: 'Relative monthPicker (valgfritt)' }).clear();
      cy.findByRole('textbox', { name: 'Relative monthPicker (valgfritt)' }).type('01.2028{esc}');
      cy.clickNextStep();
      cy.findAllByText('Relative monthPicker kan ikke være senere enn 2027').should('have.length', 2);
    });

    it('has focus after clicking validation message link', () => {
      cy.clickNextStep();

      cy.findAllByText('Du må fylle ut: Required monthPicker').should('have.length', 2);
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Required monthPicker' }).should('exist').click();
        });

      cy.findByRole('textbox', { name: 'Required monthPicker' }).should('have.focus');
      cy.findByRole('textbox', { name: 'Required monthPicker' }).type('02.2024');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });

    it('lets you pick year from a select, if the monthpicker has an allowed range', () => {
      cy.findByRole('textbox', { name: 'Relative monthPicker (with today as base) (valgfritt)' })
        .parent()
        .within(() => cy.findByRole('button', { name: 'Åpne månedsvelger' }).click());
      cy.findByRole('combobox', { name: 'År' }).shouldBeVisible();
      cy.findByRole('combobox', { name: 'År' }).should('have.value', '2024');
    });

    it('opens dialog on a year inside the allowed range', () => {
      cy.findByRole('textbox', { name: 'MonthPicker with range in the past (valgfritt)' })
        .parent()
        .within(() => cy.findByRole('button', { name: 'Åpne månedsvelger' }).click());
      cy.findByRole('combobox', { name: 'År' }).should('have.value', '2003');
    });
  });

  describe('Digital', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.defaultInterceptsMellomlagring();
    });

    it('should have correct submission values', () => {
      cy.visit('/fyllut/monthpickertest/veiledning?sub=digital');
      cy.defaultWaits();
      cy.wait('@createMellomlagring');

      cy.findByRole('textbox', { name: 'Required monthPicker' }).should('exist');
      cy.findByRole('textbox', { name: 'Required monthPicker' }).type('01.2022{esc}');

      cy.findByRole('textbox', { name: 'Relative monthPicker (valgfritt)' }).should('exist');
      cy.findByRole('textbox', { name: 'Relative monthPicker (valgfritt)' }).type('01.2020{esc}');

      cy.clickSaveAndContinue();

      cy.submitMellomlagring(async (req) => {
        const {
          submission: { data },
        } = req.body;

        expect(data.requiredMonthPicker).to.equal('2022-01');
        expect(data.relativeMonthPicker).to.equal('2020-01');
      });

      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
    });

    it('should load mellomlagring', () => {
      cy.mocksUseRouteVariant('get-soknad:success-month-picker');
      cy.visit('/fyllut/monthpickertest/veiledning?sub=digital&innsendingsId=62a75280-2a85-4e56-9de2-84faa63a2193');
      cy.defaultWaits();
      cy.wait('@getMellomlagring');

      cy.findByRole('textbox', { name: 'Required monthPicker' }).should('exist');
      cy.findByRole('textbox', { name: 'Required monthPicker' }).should('have.value', 'februar 2022');

      cy.findByRole('textbox', { name: 'Min/max monthPicker (valgfritt)' }).should('exist');
      cy.findByRole('textbox', { name: 'Min/max monthPicker (valgfritt)' }).should('have.value', 'not-a-date');

      cy.findByRole('textbox', { name: 'Relative monthPicker (valgfritt)' }).should('exist');
      cy.findByRole('textbox', { name: 'Relative monthPicker (valgfritt)' }).should('have.value', 'januar 2022');
    });
  });
});
