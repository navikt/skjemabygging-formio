import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';
import activitiesJson from '../../../../mocks/mocks/data/innsending-api/activities/activities.json';

const defaultActivity = {
  aktivitetId: 'ingenAktivitet',
  maalgruppe: '',
  periode: { fom: '', tom: '' },
  text: TEXTS.statiske.activities.defaultActivity,
};

const activityText = 'Arbeidstrening: 06.12.2023 - 06.04.2024';
const innsendingsId = 'fb47c474-66c1-46ba-8124-723447a79e8e';
const prefillMaalgruppe = 'ARBSOKERE';
const activityJson = activitiesJson[0];

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
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');

      cy.visit(`/fyllut/testingactivities/aktiviteter?sub=digital&innsendingsId=${innsendingsId}`);
      cy.wait('@getTestFormActivities');
      cy.wait('@getActivities');

      cy.findByRole('group', { name: 'Velg hvilken aktivitet du vil søke om stønad for' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: activityText }).should('exist');
          cy.findByRole('radio', { name: defaultActivity.text }).should('exist');
        });
    });

    it('should select maalgruppe attached to activity', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');

      // Check the submission values
      cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
        const {
          submission: {
            data: { container },
          },
        } = req.body;
        expect(container.aktivitet.aktivitetId).to.equal(activityJson.aktivitetId);
        expect(container.aktivitet.periode.fom).to.equal(activityJson.periode.fom);
        expect(container.aktivitet.periode.tom).to.equal(activityJson.periode.tom);
        expect(container.maalgruppe).to.equal(activityJson.maalgruppe);
        req.reply(201);
      }).as('submit');

      cy.visit(`/fyllut/testingactivities/aktiviteter?sub=digital&innsendingsId=${innsendingsId}`);
      cy.wait('@getTestFormActivities');
      cy.wait('@getActivities');

      // Select the activity from backend
      cy.findByRole('radio', { name: activityText }).check(activityJson.aktivitetId);

      cy.clickSaveAndContinue();

      // Should show activity and maalgruppe in summary
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl').within(() => {
        cy.get('dd').eq(0).should('contain.text', activityText);
        cy.get('dd').eq(1).should('contain.text', activityJson.maalgruppe);
      });

      // Submit
      cy.clickSaveAndContinue();
      cy.wait('@submit');
    });
  });

  describe('no activities from backend', () => {
    it('should show checkbox with default activity', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');
      cy.mocksUseRouteVariant('get-activities:success-empty');

      cy.visit(`/fyllut/testingactivities/aktiviteter?sub=digital&innsendingsId=${innsendingsId}`);
      cy.wait('@getTestFormActivities');
      cy.wait('@getActivities');

      cy.findByRole('group', { name: 'Velg hvilken aktivitet du vil søke om stønad for' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 1);
          cy.findByRole('checkbox', { name: activityText }).should('not.exist');
          cy.findByRole('checkbox', { name: defaultActivity.text }).should('exist');
        });
    });

    it('should select maalgruppe from defaultValue', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');
      cy.mocksUseRouteVariant('get-activities:success-empty');

      // Check the submission values
      cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
        const {
          submission: {
            data: { container },
          },
        } = req.body;
        expect(container.aktivitet.aktivitetId).to.equal(defaultActivity.aktivitetId);
        expect(container.aktivitet.periode.fom).to.equal('');
        expect(container.aktivitet.periode.tom).to.equal('');
        expect(container.maalgruppe).to.equal(prefillMaalgruppe);
        req.reply(201);
      }).as('submit');

      cy.visit(`/fyllut/testingactivities/aktiviteter?sub=digital&innsendingsId=${innsendingsId}`);
      cy.wait('@getTestFormActivities');
      cy.wait('@getActivities');

      // Select the default activity
      cy.findByRole('checkbox', { name: defaultActivity.text }).check('ingenAktivitet');

      cy.clickSaveAndContinue();

      // Should show activity and maalgruppe in summary
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl').within(() => {
        cy.get('dd').eq(0).should('contain.text', defaultActivity.text);
        cy.get('dd').eq(1).should('contain.text', prefillMaalgruppe);
      });

      // Submit
      cy.clickSaveAndContinue();
      cy.wait('@submit');
    });

    it('should default to ANNET for maalgruppe', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');
      cy.mocksUseRouteVariant('get-activities:success-empty');
      cy.mocksUseRouteVariant('get-prefill-data:success-empty');

      // Check the submission values
      cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
        const {
          submission: {
            data: { container },
          },
        } = req.body;
        expect(container.aktivitet.aktivitetId).to.equal(defaultActivity.aktivitetId);
        expect(container.aktivitet.periode.fom).to.equal('');
        expect(container.aktivitet.periode.tom).to.equal('');
        expect(container.maalgruppe).to.equal('ANNET');
        req.reply(201);
      }).as('submit');

      cy.visit(`/fyllut/testingactivities/aktiviteter?sub=digital&innsendingsId=${innsendingsId}`);
      cy.wait('@getTestFormActivities');
      cy.wait('@getActivities');

      // Select the default activity
      cy.findByRole('checkbox', { name: defaultActivity.text }).check(defaultActivity.aktivitetId);

      cy.clickSaveAndContinue();

      // Should show activity and maalgruppe in summary
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl').within(() => {
        cy.get('dd').eq(0).should('contain.text', defaultActivity.text);
        cy.get('dd').eq(1).should('contain.text', 'ANNET');
      });

      // Submit
      cy.clickSaveAndContinue();
      cy.wait('@submit');
    });
  });

  describe('error from backend', () => {
    it('should show checkbox with default activity and info alert', () => {
      cy.mocksUseRouteVariant('get-activities:failure');

      cy.visit(`/fyllut/testingactivities/aktiviteter?sub=digital&innsendingsId=${innsendingsId}`);
      cy.wait('@getTestFormActivities');
      cy.wait('@getActivities');

      cy.contains('Velg hvilken aktivitet du vil søke om stønad for');
      cy.findAllByRole('checkbox').should('have.length', 1);
      cy.findByRole('checkbox', { name: activityText }).should('not.exist');
      cy.findByRole('checkbox', { name: defaultActivity.text }).should('exist');

      cy.get('.navds-alert--info').contains(TEXTS.statiske.activities.error);
    });
  });
});
