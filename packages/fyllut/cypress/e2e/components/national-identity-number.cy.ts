import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('NationalIdentityNumber', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/cypress101/personopplysninger');
    cy.defaultWaits();
  });

  it('triggers error when NIN has invalid checksum', () => {
    cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
    cy.findByRole('textbox', { name: 'Fødselsnummer / D-nummer' }).should('exist').type('18907299827');
    cy.clickNextStep();
    cy.findByRole('region', { name: TEXTS.validering.error })
      .should('exist')
      .within(() => {
        cy.findByRole('link', { name: 'Dette er ikke et gyldig fødselsnummer eller D-nummer' }).should('exist');
      });
  });

  it('allows test-IDs', () => {
    cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
    cy.findByRole('textbox', { name: 'Fødselsnummer / D-nummer' }).should('exist').type('18907299828');
    cy.clickNextStep();
    cy.findByRole('region', { name: TEXTS.validering.error })
      .should('exist')
      .within(() => {
        cy.findByRole('link', { name: 'Dette er ikke et gyldig fødselsnummer eller D-nummer' }).should('not.exist');
      });
  });

  describe('In prod', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.intercept('GET', 'fyllut/api/config*', { NAIS_CLUSTER_NAME: 'prod-gcp' }).as('getConfig');
      cy.visit('/fyllut/cypress101/personopplysninger');
      cy.defaultWaits();
    });

    it('does not allow test-ID in production', () => {
      cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
      cy.findByRole('textbox', { name: 'Fødselsnummer / D-nummer' }).should('exist').type('18907299828');
      cy.clickNextStep();
      cy.findByRole('region', { name: TEXTS.validering.error })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Dette er ikke et gyldig fødselsnummer eller D-nummer' }).should('exist');
        });
    });
  });
});
