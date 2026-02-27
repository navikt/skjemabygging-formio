import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const ACTIVITIES_LABEL = TEXTS.statiske.activities.label;
const DEFAULT_ACTIVITY = TEXTS.statiske.activities.defaultActivity;
const ACTIVITY_TEXT = 'Arbeidstrening: 01. desember 2023 - 06. april 2024';

describe('Activities', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsExternal();
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/activities/visning?sub=digital');
      cy.defaultWaits();
      cy.wait('@getActivities');
    });

    it('should render activities as a radio group with the component label', () => {
      cy.findByRole('group', { name: ACTIVITIES_LABEL }).should('exist');
    });

    it('should render fetched activity as a radio option', () => {
      cy.findByRole('group', { name: ACTIVITIES_LABEL }).within(() => {
        cy.findByRole('radio', { name: ACTIVITY_TEXT }).should('exist');
      });
    });

    it('should render default "ingen aktivitet" radio option', () => {
      cy.findByRole('group', { name: ACTIVITIES_LABEL }).within(() => {
        cy.findByRole('radio', { name: DEFAULT_ACTIVITY }).should('exist');
      });
    });

    it('should allow selecting an activity', () => {
      cy.findByRole('group', { name: ACTIVITIES_LABEL }).within(() => {
        cy.findByRole('radio', { name: ACTIVITY_TEXT }).check();
        cy.findByRole('radio', { name: ACTIVITY_TEXT }).should('be.checked');
      });
    });

    it('should allow selecting the default activity', () => {
      cy.findByRole('group', { name: ACTIVITIES_LABEL }).within(() => {
        cy.findByRole('radio', { name: DEFAULT_ACTIVITY }).check();
        cy.findByRole('radio', { name: DEFAULT_ACTIVITY }).should('be.checked');
      });
    });

    it('should render description', () => {
      cy.withinComponent('Aktivitet med beskrivelse', () => {
        cy.contains('Dette er en beskrivelse').should('be.visible');
      });
    });

    it('should render additionalDescription', () => {
      cy.withinComponent('Aktivitet med beskrivelse', () => {
        cy.findByRole('button', { name: 'mer' }).should('exist');
        cy.contains('Dette er utvidet beskrivelse').should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains('Dette er utvidet beskrivelse').should('be.visible');
      });
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/activities/visning?sub=digital&lang=en');
      cy.defaultWaits();
      cy.wait('@getActivities');
    });

    it('should translate label', () => {
      cy.findByRole('group', { name: `${ACTIVITIES_LABEL} (en)` }).should('exist');
    });

    it('should translate description', () => {
      cy.withinComponent(`Aktivitet med beskrivelse (en)`, () => {
        cy.contains('Dette er en beskrivelse (en)').should('be.visible');
      });
    });
  });
});
