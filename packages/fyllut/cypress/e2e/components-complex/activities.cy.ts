/*
 * Tests filling out a form with the activities component information and verifying that the information is displayed in the summary
 * Tests the rendering for different number of activities from backend and error from backend
 */

import {
  SendInnAktivitet,
  SendInnMaalgruppe,
  SubmissionActivity,
  SubmissionMaalgruppe,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';
import activitiesMultipleJson from '../../../../../mocks/mocks/data/innsending-api/activities/activities-multiple.json';
import activitiesJson from '../../../../../mocks/mocks/data/innsending-api/activities/activities.json';

const defaultActivity: SubmissionActivity = {
  aktivitetId: 'ingenAktivitet',
  text: TEXTS.statiske.activities.defaultActivity,
};

const activityText = 'Arbeidstrening: 01. desember 2023 - 06. april 2024';
const prefillMaalgruppe: SendInnMaalgruppe = {
  gyldighetsperiode: {
    fom: '2024-01-01',
    tom: '2024-05-13',
  },
  maalgruppetype: 'ARBSOKERE',
  maalgruppenavn: 'Arbeidssøker',
};
const activityJson = activitiesJson[0];

const verifySubmissionValues = (maalgruppe: SubmissionMaalgruppe, aktivitet: Partial<SubmissionActivity>) => {
  cy.submitMellomlagring((req) => {
    const {
      submission: {
        data: { container: aktivitetMaalgruppeSubmission },
      },
    } = req.body;

    expect(aktivitetMaalgruppeSubmission.aktivitet.aktivitetId).to.equal(aktivitet.aktivitetId);
    expect(aktivitetMaalgruppeSubmission.aktivitet.periode?.fom).to.equal(aktivitet.periode?.fom);
    expect(aktivitetMaalgruppeSubmission.aktivitet.periode?.tom).to.equal(aktivitet.periode?.tom);

    // Activity målgruppe (if selected)
    if (aktivitetMaalgruppeSubmission.aktivitet.maalgruppe) {
      expect(aktivitetMaalgruppeSubmission.aktivitet.maalgruppe.maalgruppetype).to.equal(
        aktivitet.maalgruppe.maalgruppetype,
      );
      expect(aktivitetMaalgruppeSubmission.aktivitet.maalgruppe.gyldighetsperiode?.fom).to.equal(
        aktivitet.maalgruppe.gyldighetsperiode?.fom,
      );
      expect(aktivitetMaalgruppeSubmission.aktivitet.maalgruppe.gyldighetsperiode?.tom).to.equal(
        aktivitet.maalgruppe.gyldighetsperiode?.tom,
      );
    }

    // Prefilled målgruppe (if prefilled)
    if (aktivitetMaalgruppeSubmission.maalgruppe.prefilled) {
      expect(aktivitetMaalgruppeSubmission.maalgruppe.prefilled.maalgruppetype).to.equal(
        maalgruppe.prefilled.maalgruppetype,
      );
      expect(aktivitetMaalgruppeSubmission.maalgruppe.prefilled.gyldighetsperiode.fom).to.equal(
        maalgruppe.prefilled.gyldighetsperiode.fom,
      );
      expect(aktivitetMaalgruppeSubmission.maalgruppe.prefilled.gyldighetsperiode.tom).to.equal(
        maalgruppe.prefilled.gyldighetsperiode.tom,
      );
    }

    // Calculated målgruppe
    expect(aktivitetMaalgruppeSubmission.maalgruppe.calculated.maalgruppetype).to.equal(
      maalgruppe.calculated.maalgruppetype,
    );
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

  describe('paper', () => {
    it('should not show activity component when submission method is paper', () => {
      cy.visit(`/fyllut/testingactivities?sub=paper`);
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('group', { name: 'Hvilken aktivitet søker du om støtte i forbindelse med?' }).should('not.exist');
    });
  });

  describe('activities from backend', () => {
    it('should show radiogroup with activity from backend and default activity', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      cy.findByRole('group', { name: 'Hvilken aktivitet søker du om støtte i forbindelse med?' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: activityText }).should('exist');
          cy.findByRole('radio', { name: defaultActivity.text }).should('exist');
        });
    });

    it('should select activity and store correct submission values', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');

      // Check the submission values
      verifySubmissionValues(
        {
          calculated: { maalgruppetype: 'ANNET' },
          prefilled: prefillMaalgruppe,
        },
        activityJson,
      );

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the activity from backend
      cy.findByRole('radio', { name: activityText }).check(activityJson.aktivitetId);

      cy.clickSaveAndContinue();

      // Should show activity in summary
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.findByText(activityText).should('exist');

      // Submit
      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
      cy.verifySendInnRedirect();
    });

    describe('saved application', () => {
      describe('with prefilled maalgruppe MOTDAGPEN and default activity chosen', () => {
        beforeEach(() => {
          cy.mocksUseRouteVariant('get-activities:success-multiple');
          cy.mocksUseRouteVariant('get-soknad:success-activities-prefilled-maalgruppe');

          cy.defaultInterceptsMellomlagring();
          cy.visit(
            `/fyllut/testingactivities/aktiviteter?sub=digital&innsendingsId=fb47c474-66c1-46ba-8124-723447a79e83`,
          );
          cy.defaultWaits();
          cy.wait('@getMellomlagring');
          cy.wait('@getActivities');

          // Verify that activity from saved application is checked
          cy.findByRole('group', { name: 'Hvilken aktivitet søker du om støtte i forbindelse med?' })
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
          cy.findByText(defaultActivity.text).should('exist');

          // Expected submission values
          verifySubmissionValues(
            {
              calculated: { maalgruppetype: 'ANNET' },
              prefilled: {
                maalgruppetype: 'MOTDAGPEN',
                gyldighetsperiode: {
                  fom: '2024-01-01',
                  tom: '2024-05-13',
                },
              },
            },
            defaultActivity,
          );

          // Submit
          cy.clickSaveAndContinue();
          cy.wait('@submitMellomlagring');
          cy.verifySendInnRedirect();
        });

        it('should allow user to change chosen activity and update selected maalgruppe to reflect that', () => {
          const activityAvklaring = activitiesMultipleJson.find(
            (activity) => activity.aktivitetsnavn === 'Avklaring',
          ) as SendInnAktivitet;

          // Select the activity from backend
          cy.findByRole('group', { name: 'Hvilken aktivitet søker du om støtte i forbindelse med?' })
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
          cy.findByText('Avklaring: 01. februar 2024 - 30. april 2024').should('exist');

          // Expected submission values
          verifySubmissionValues(
            {
              calculated: { maalgruppetype: 'ANNET' },
              prefilled: {
                maalgruppetype: 'MOTDAGPEN',
                gyldighetsperiode: {
                  fom: '2024-01-01',
                  tom: '2024-05-13',
                },
              },
            },
            activityAvklaring,
          );

          // Submit
          cy.clickSaveAndContinue();
          cy.wait('@submitMellomlagring');
          cy.verifySendInnRedirect();
        });
      });
    });
  });

  describe('conditionals on maalgruppe', () => {
    it('should hide component when maalgruppe is prefilled', () => {
      cy.mocksUseRouteVariant('get-prefill-data:success');
      cy.visit('/fyllut/testingactivities/aktiviteter?sub=digital');
      cy.defaultWaits();
      cy.wait('@getActivities');

      cy.findByText('Målgruppe ble ikke preutfylt').should('not.exist');
    });

    it('should show component when maalgruppe is not prefilled', () => {
      cy.mocksUseRouteVariant('get-prefill-data:success-empty');
      cy.visit('/fyllut/testingactivities/aktiviteter?sub=digital');
      cy.defaultWaits();
      cy.wait('@getActivities');

      cy.findByText('Målgruppe ble ikke preutfylt').should('exist');
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

      cy.findByRole('group', { name: 'Hvilken aktivitet søker du om støtte i forbindelse med?' })
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
      verifySubmissionValues(
        {
          calculated: { maalgruppetype: 'ANNET' },
          prefilled: prefillMaalgruppe,
        },
        defaultActivity,
      );

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      // Select the default activity
      cy.findByRole('checkbox', { name: defaultActivity.text }).check('ingenAktivitet');

      cy.clickSaveAndContinue();

      // Should show activity and maalgruppe in summary
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.findByText(defaultActivity.text).should('exist');

      // Submit
      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
      cy.verifySendInnRedirect();
    });

    it('should default to ANNET for maalgruppe', () => {
      cy.mocksUseRouteVariant('get-soknad:success-activities-empty');
      cy.mocksUseRouteVariant('get-activities:success-empty');
      cy.mocksUseRouteVariant('get-prefill-data:success-empty');

      // Check the submission values
      verifySubmissionValues(
        {
          calculated: { maalgruppetype: 'ANNET' },
          prefilled: null,
        },
        defaultActivity,
      );

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
      cy.verifySendInnRedirect();
    });
  });

  describe('error from backend', () => {
    it('should show checkbox with default activity and info alert', () => {
      cy.mocksUseRouteVariant('get-activities:failure');

      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      cy.contains('Hvilken aktivitet søker du om støtte i forbindelse med?');
      cy.findAllByRole('checkbox').should('have.length', 1);
      cy.findByRole('checkbox', { name: activityText }).should('not.exist');
      cy.findByRole('checkbox', { name: defaultActivity.text }).should('exist');

      cy.get('.navds-alert--info').contains(TEXTS.statiske.activities.errorContinue);
    });
  });

  describe('validation errors', () => {
    it('should show validation errors', () => {
      cy.visit(`/fyllut/testingactivities?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      cy.clickSaveAndContinue();

      cy.findByRole('link', { name: `Du må fylle ut: ${TEXTS.statiske.activities.label}` }).should('exist');
    });
  });
});
