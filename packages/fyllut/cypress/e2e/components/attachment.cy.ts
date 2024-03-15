/*
 * Tests that the alert component (react) renders correctly
 * Also tests that exisiting alerts in older form definitions renders correctly
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Attachment', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/attachments/vedlegg?sub=paper');
    cy.defaultWaits();
  });

  const TITLE = {
    attachment: 'Ny vedleggskomponent',
    oldAttachment: 'Gammel radio komponent',
    textarea: 'Ledetekst tilleggsinformasjon',
  };

  it('check different attachment settings', () => {
    cy.findByRole('textbox', { name: TITLE.textarea }).should('not.exist');

    cy.findByRole('group', { name: TITLE.attachment })
      .should('exist')
      .within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('exist').check({ force: true });
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('be.checked');
      });

    cy.findByRole('textbox', { name: TITLE.textarea }).should('exist');
    cy.findByRole('textbox', { name: TITLE.textarea }).type('Dette er en test');

    cy.findByRole('group', { name: TITLE.oldAttachment })
      .should('exist')
      .within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.levertTidligere).should('exist').check({ force: true });
        cy.findByLabelText(TEXTS.statiske.attachment.levertTidligere).should('be.checked');
      });

    cy.clickNextStep();

    cy.get('dl')
      .first()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', TITLE.attachment);
        cy.get('dd').eq(0).should('contain.text', TEXTS.statiske.attachment.leggerVedNaa);
      });

    cy.get('dl')
      .first()
      .within(() => {
        cy.get('dt').eq(1).should('contain.text', TITLE.textarea);
        cy.get('dd').eq(1).should('contain.text', 'Dette er en test');
      });

    cy.get('dl')
      .first()
      .within(() => {
        cy.get('dt').eq(2).should('contain.text', TITLE.oldAttachment);
        cy.get('dd').eq(2).should('contain.text', TEXTS.statiske.attachment.levertTidligere);
      });

    cy.findByRoleWhenAttached('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).should('exist').click();

    cy.findByRole('textbox', { name: TITLE.textarea }).should('exist');

    cy.findByRole('group', { name: TITLE.attachment }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.ettersender).should('exist').check({ force: true });
      cy.findByLabelText(TEXTS.statiske.attachment.ettersender).should('be.checked');
    });

    cy.findByRole('textbox', { name: TITLE.textarea }).should('not.exist');
    cy.get('.navds-alert')
      .contains(TEXTS.statiske.attachment.deadline.replace(/{{deadline}}/, 14))
      .should('exist');

    cy.findByRole('group', { name: TITLE.attachment }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.nei).should('exist').check({ force: true });
      cy.findByLabelText(TEXTS.statiske.attachment.nei).should('be.checked');
    });

    cy.findByRole('textbox', { name: TITLE.textarea }).should('not.exist');
    cy.get('.navds-alert').should('not.exist');
  });
});
