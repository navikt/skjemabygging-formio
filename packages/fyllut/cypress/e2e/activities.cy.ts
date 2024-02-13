import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const defaultActivityText = 'Jeg får ikke opp noen aktiviteter her som stemmer med det jeg vil søke om';
const activityText = 'Arbeidstrening: 06.12.2023 - 06.04.2024';

describe('Activities', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsActivities();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('activities from backend', () => {
    it('should show radiogroup with activity from backend and default activity', () => {
      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      cy.contains('Velg hvilken aktivitet du vil søke om stønad for');
      cy.findAllByRole('radio').should('have.length', 2);
      cy.findByRole('radio', { name: activityText }).should('exist');
      cy.findByRole('radio', { name: defaultActivityText }).should('exist');
    });

    it('should select maalgruppe attached to activity', () => {
      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the activity from backend
      cy.findByRole('radio', { name: activityText }).check('130892484');

      cy.findByRole('textbox').should('have.value', 'NEDSARBEVN');
    });
  });

  describe('no activities from backend', () => {
    it('should show checkbox with default activity', () => {
      cy.mocksUseRouteVariant('get-activities:success-empty');

      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      cy.contains('Velg hvilken aktivitet du vil søke om stønad for');
      cy.findAllByRole('checkbox').should('have.length', 1);
      cy.findByRole('checkbox', { name: activityText }).should('not.exist');
      cy.findByRole('checkbox', { name: defaultActivityText }).should('exist');
    });

    it('should select maalgruppe from defaultValue', () => {
      cy.mocksUseRouteVariant('get-activities:success-empty');

      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the default activity
      cy.findByRole('checkbox', { name: defaultActivityText }).check('ingenAktivitet');

      cy.findByRole('textbox').should('have.value', 'ARBSOKERE');
    });

    it('should default to ANNET for maalgruppe', () => {
      cy.mocksUseRouteVariant('get-activities:success-empty');
      cy.mocksUseRouteVariant('get-prefill-data:success-empty');

      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the default activity
      cy.findByRole('checkbox', { name: defaultActivityText }).check('ingenAktivitet');

      cy.findByRole('textbox').should('have.value', 'ANNET');
    });
  });

  describe('error from backend', () => {
    it('should show checkbox with default activity and info alert', () => {
      cy.mocksUseRouteVariant('get-activities:failure');

      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      cy.contains('Velg hvilken aktivitet du vil søke om stønad for');
      cy.findAllByRole('checkbox').should('have.length', 1);
      cy.findByRole('checkbox', { name: activityText }).should('not.exist');
      cy.findByRole('checkbox', { name: defaultActivityText }).should('exist');

      cy.get('.navds-alert--info').contains(TEXTS.statiske.activities.error);
    });

    it('should default to ANNET', () => {
      cy.mocksUseRouteVariant('get-activities:failure');
      cy.mocksUseRouteVariant('get-prefill-data:success-empty');

      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the default activity
      cy.findByRole('checkbox', { name: defaultActivityText }).check('ingenAktivitet');

      cy.findByRole('textbox').should('have.value', 'ANNET');
    });
  });
});
