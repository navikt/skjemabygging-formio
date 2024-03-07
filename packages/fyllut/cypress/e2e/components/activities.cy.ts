/*
 * Tests filling out a form with the activities component information and verifying that the information is displayed in the summary
 * Tests the rendering for different number of activities from backend and error from backend
 */

import { SendInnAktivitet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';
import activitiesMultipleJson from '../../../../../mocks/mocks/data/innsending-api/activities/activities-multiple.json';
import activitiesJson from '../../../../../mocks/mocks/data/innsending-api/activities/activities.json';

const defaultActivity = {
  aktivitetId: 'ingenAktivitet',
  maalgruppe: '',
  periode: { fom: '', tom: '' },
  text: TEXTS.statiske.activities.defaultActivity,
};

const activityText = 'Arbeidstrening: 06.12.2023 - 06.04.2024';
const prefillMaalgruppe = 'ARBSOKERE';
const activityJson = activitiesJson[0];

const verifySubmissionValues = (
  maalgruppe: { calculated: string; prefilled: string },
  aktivitet: Partial<SendInnAktivitet>,
) => {
  cy.submitMellomlagring((req) => {
    const {
      submission: {
        data: { container },
      },
    } = req.body;
    expect(container.aktivitet.aktivitetId).to.equal(aktivitet.aktivitetId);
    expect(container.aktivitet.periode.fom).to.equal(aktivitet.periode.fom);
    expect(container.aktivitet.periode.tom).to.equal(aktivitet.periode.tom);
    expect(container.maalgruppe.calculated).to.equal(maalgruppe.calculated);
    expect(container.maalgruppe.prefilled).to.equal(maalgruppe.prefilled);
  });
};

describe('Activities', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsExternal();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('activities from backend', () => {
    it('should show radiogroup with activity from backend and default activity', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      cy.findByRole('group', { name: 'Velg hvilken aktivitet du vil søke om stønad for' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: activityText }).should('exist');
          cy.findByRole('radio', { name: defaultActivity.text }).should('exist');
        });
    });

    it('should select maalgruppe attached to activity as the calculated', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');

      // Check the submission values
      verifySubmissionValues({ calculated: activityJson.maalgruppe, prefilled: prefillMaalgruppe }, activityJson);

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the activity from backend
      cy.findByRole('radio', { name: activityText }).check(activityJson.aktivitetId);

      cy.clickSaveAndContinue();

      // Should show activity and maalgruppe in summary
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl').within(() => {
        cy.get('dd').eq(0).should('contain.text', activityText);
      });

      // Submit
      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
    });

    describe('saved application', () => {
      describe('with prefilled maalgruppe MOTDAGPEN and default activity chosen', () => {
        beforeEach(() => {
          cy.mocksUseRouteVariant('get-activities:success-multiple');
          cy.mocksUseRouteVariant('get-soknad:success-activities-prefilled-maalgruppe');

          cy.visit(
            `/fyllut/testingactivities/aktiviteter?sub=digital&innsendingsId=fb47c474-66c1-46ba-8124-723447a79e83`,
          );
          cy.defaultWaits();
          cy.defaultInterceptsMellomlagring();
          cy.wait('@getMellomlagring');
          cy.wait('@getActivities');

          // Verify that activity from saved application is checked
          cy.findByRole('group', { name: 'Velg hvilken aktivitet du vil søke om stønad for' })
            .should('exist')
            .within(() => {
              cy.findByLabelText(defaultActivity.text).should('be.checked');
            });
        });

        it('should keep prefilled maalgruppe from saved application, not overwrite with new value from prefill endpoint', () => {
          // Go to summary page
          cy.clickSaveAndContinue();

          // Should show activity in summary
          cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
          cy.get('dl').within(() => {
            cy.get('dd').eq(0).should('include.text', defaultActivity.text);
          });

          // Expected submission values
          verifySubmissionValues({ calculated: 'ANNET', prefilled: 'MOTDAGPEN' }, defaultActivity);

          // Submit
          cy.clickSaveAndContinue();
          cy.wait('@submitMellomlagring');
        });

        it('should allow user to change chosen activity and update calculated maalgruppe to reflect that', () => {
          const activityAvklaring = activitiesMultipleJson.find(
            (activity) => activity.aktivitetsnavn === 'Avklaring',
          ) as SendInnAktivitet;

          // Select the activity from backend
          cy.findByRole('group', { name: 'Velg hvilken aktivitet du vil søke om stønad for' })
            .should('exist')
            .within(() => {
              cy.findByRole('radio', { name: /Avklaring/ })
                .should('exist')
                .check(activityAvklaring.aktivitetId);
            });

          // Go to summary page
          cy.clickSaveAndContinue();

          // Should show activity and maalgruppe in summary
          cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
          cy.get('dl').within(() => {
            cy.get('dd').eq(0).should('include.text', 'Avklaring');
          });

          // Expected submission values
          verifySubmissionValues({ calculated: 'NEDSARBEVN', prefilled: 'MOTDAGPEN' }, activityAvklaring);

          // Submit
          cy.clickSaveAndContinue();
          cy.wait('@submitMellomlagring');
        });
      });
    });
  });

  describe('no activities from backend', () => {
    it('should show checkbox with default activity', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');
      cy.mocksUseRouteVariant('get-activities:success-empty');

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      cy.findByRole('group', { name: 'Velg hvilken aktivitet du vil søke om stønad for' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 1);
          cy.findByRole('checkbox', { name: activityText }).should('not.exist');
          cy.findByRole('checkbox', { name: defaultActivity.text }).should('exist');
        });
    });

    it('should default to ANNET as calculated maalgruppe when default activity is selected', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');
      cy.mocksUseRouteVariant('get-activities:success-empty');

      // Check the submission values
      verifySubmissionValues({ calculated: 'ANNET', prefilled: prefillMaalgruppe }, defaultActivity);

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the default activity
      cy.findByRole('checkbox', { name: defaultActivity.text }).check('ingenAktivitet');

      cy.clickSaveAndContinue();

      // Should show activity and maalgruppe in summary
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl').within(() => {
        cy.get('dd').eq(0).should('contain.text', defaultActivity.text);
      });

      // Submit
      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
    });

    it('should default to ANNET for maalgruppe', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');
      cy.mocksUseRouteVariant('get-activities:success-empty');
      cy.mocksUseRouteVariant('get-prefill-data:success-empty');

      // Check the submission values
      verifySubmissionValues({ calculated: 'ANNET', prefilled: null }, defaultActivity);

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the default activity
      cy.findByRole('checkbox', { name: defaultActivity.text }).check(defaultActivity.aktivitetId);

      cy.clickSaveAndContinue();

      // Should show activity and maalgruppe in summary
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl').within(() => {
        cy.get('dd').eq(0).should('contain.text', defaultActivity.text);
      });

      // Submit
      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
    });
  });

  describe('error from backend', () => {
    it('should show checkbox with default activity and info alert', () => {
      cy.mocksUseRouteVariant('get-activities:failure');

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      cy.contains('Velg hvilken aktivitet du vil søke om stønad for');
      cy.findAllByRole('checkbox').should('have.length', 1);
      cy.findByRole('checkbox', { name: activityText }).should('not.exist');
      cy.findByRole('checkbox', { name: defaultActivity.text }).should('exist');

      cy.get('.navds-alert--info').contains(TEXTS.statiske.activities.error);
    });
  });
});
