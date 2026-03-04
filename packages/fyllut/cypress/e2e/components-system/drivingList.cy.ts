// Note: Digital mode (DrivingListFromActivities) requires an external activities API and is not
// tested here.

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const DATE_PICKER_LABEL = TEXTS.statiske.drivingList.datePicker;
const PARKING_LABEL = TEXTS.statiske.drivingList.parking;
const ACCORDION_HEADER = TEXTS.statiske.drivingList.accordionHeader;

describe('DrivingList', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/drivinglist/standard?sub=paper');
      cy.defaultWaits();
    });

    it('should render date picker', () => {
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).should('exist');
    });

    it('should render parking radio group', () => {
      cy.findByRole('group', { name: PARKING_LABEL }).should('exist');
      cy.findByRole('radio', { name: 'Ja' }).should('exist');
      cy.findByRole('radio', { name: 'Nei' }).should('exist');
    });

    it('should show period accordion after selecting date and parking', () => {
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).type('02.06.2025{esc}');
      cy.findByRole('radio', { name: 'Nei' }).check();
      cy.contains(ACCORDION_HEADER).should('be.visible');
      cy.findByRole('button', { name: '02. juni 2025 - 08. juni 2025' }).should('exist');
    });

    it('should show period date range in accordion header', () => {
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).type('02.06.2025{esc}');
      cy.findByRole('radio', { name: 'Nei' }).check();
      cy.findByRole('button', { name: '02. juni 2025 - 08. juni 2025' }).should('exist');
    });

    it('should show date checkboxes when period accordion is opened', () => {
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).type('02.06.2025{esc}');
      cy.findByRole('radio', { name: 'Nei' }).check();
      cy.findByRole('button', { name: '02. juni 2025 - 08. juni 2025' }).click();
      cy.findByRole('checkbox', { name: 'mandag 02. juni 2025' }).should('exist');
      cy.findByRole('checkbox', { name: 'søndag 08. juni 2025' }).should('exist');
    });

    it('should show parking expense field when parking is Ja and date is checked', () => {
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).type('02.06.2025{esc}');
      cy.findByRole('radio', { name: 'Ja' }).check();
      cy.findByRole('button', { name: '02. juni 2025 - 08. juni 2025' }).click();
      cy.findByRole('checkbox', { name: 'mandag 02. juni 2025' }).check();
      cy.findByRole('textbox', { name: /Parkeringsutgifter/ }).should('exist');
    });

    it('should not show period accordion before both date and parking are selected', () => {
      cy.contains(ACCORDION_HEADER).should('not.exist');
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).type('02.06.2025{esc}');
      cy.contains(ACCORDION_HEADER).should('not.exist');
      cy.findByRole('radio', { name: 'Nei' }).check();
      cy.contains(ACCORDION_HEADER).should('be.visible');
    });
  });

  describe('Description', () => {
    beforeEach(() => {
      cy.visit('/fyllut/drivinglist/beskrivelse?sub=paper');
      cy.defaultWaits();
    });

    it('should render description', () => {
      cy.contains('Dette er en beskrivelse').should('be.visible');
    });

    it('should render additionalDescription', () => {
      cy.findByRole('button', { name: 'mer' }).should('exist');
      cy.contains('Dette er utvidet beskrivelse').should('not.be.visible');
      cy.findByRole('button', { name: 'mer' }).click();
      cy.contains('Dette er utvidet beskrivelse').should('be.visible');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/drivinglist/beskrivelse?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate description', () => {
      cy.contains('Dette er en beskrivelse (en)').should('be.visible');
    });

    it('should translate additionalDescription label', () => {
      cy.findByRole('button', { name: 'mer (en)' }).should('exist');
    });
  });
});
