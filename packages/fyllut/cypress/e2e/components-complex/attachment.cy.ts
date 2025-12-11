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
    attachmentWithOneOption: 'Vedlegg med ett valg',
    oldAttachment: 'Gammel radio komponent',
    textarea: 'Ledetekst tilleggsinformasjon',
  };

  it('lists attachment values in pre-defined order', () => {
    cy.findByRole('group', { name: TITLE.attachment })
      .should('exist')
      .within(() => {
        cy.get('input').should('have.length', 3);
        cy.get('input').eq(0).should('have.value', 'leggerVedNaa');
        cy.get('input').eq(1).should('have.value', 'ettersender');
        cy.get('input').eq(2).should('have.value', 'nei');
      });
  });

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

    cy.findByRole('group', { name: TITLE.attachmentWithOneOption }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check({ force: true });
    });

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
        cy.get('dd').eq(0).should('contain.text', 'Dette er en test');
      });

    cy.get('dl')
      .first()
      .within(() => {
        cy.get('dt').eq(1).should('contain.text', TITLE.attachmentWithOneOption);
        cy.get('dd').eq(1).should('contain.text', TEXTS.statiske.attachment.leggerVedNaa);
      });

    cy.get('dl')
      .first()
      .within(() => {
        cy.get('dt').eq(2).should('contain.text', TITLE.oldAttachment);
        cy.get('dd').eq(2).should('contain.text', TEXTS.statiske.attachment.levertTidligere);
      });

    cy.clickPreviousStep();

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

  it('is focusable', () => {
    cy.clickNextStep();

    cy.get('[data-cy=error-summary]')
      .should('exist')
      .within(() => {
        cy.findByRole('heading', { name: TEXTS.validering.error }).should('have.focus');
        cy.get('li').should('have.length', 3);
        cy.findByRole('link', { name: `Du må fylle ut: ${TITLE.oldAttachment}` })
          .should('exist')
          .click();
      });

    cy.findByRole('group', { name: TITLE.oldAttachment })
      .should('have.focus')
      .within(() => {
        cy.findByLabelText('Jeg legger det ved denne søknaden (anbefalt)').click();
      });

    cy.get('[data-cy=error-summary]')
      .should('exist')
      .within(() => {
        cy.get('li').should('have.length', 2);
        cy.findByRole('link', { name: `Du må fylle ut: ${TITLE.attachment}` })
          .should('exist')
          .click();
      });

    cy.findByRole('group', { name: TITLE.attachment })
      .should('have.focus')
      .within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).click();
      });

    // TODO: fix focus for attachment with one option
    cy.findByRole('group', { name: TITLE.attachmentWithOneOption }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check({ force: true });
    });

    cy.get('[data-cy=error-summary]').should('not.exist');
    cy.clickNextStep();

    cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
  });

  it('validates attachment with one option after being checked and unchecked', () => {
    cy.findByRole('group', { name: TITLE.attachment }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.ettersender).check({ force: true });
    });

    cy.findByRole('group', { name: TITLE.oldAttachment }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.levertTidligere).check({ force: true });
    });

    cy.clickNextStep();

    cy.get('[data-cy=error-summary]')
      .should('exist')
      .within(() => {
        cy.findByRole('heading', { name: TEXTS.validering.error }).should('have.focus');
        cy.get('li').should('have.length', 1);
        cy.findByRole('link', { name: `Du må fylle ut: ${TITLE.attachmentWithOneOption}` }).should('exist');
      });

    cy.findByRole('group', { name: TITLE.attachmentWithOneOption }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check({ force: true });
      cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).uncheck();
    });

    cy.get('[data-cy=error-summary]').should('not.exist');

    cy.clickNextStep();

    cy.get('[data-cy=error-summary]')
      .should('exist')
      .within(() => {
        cy.findByRole('heading', { name: TEXTS.validering.error }).should('have.focus');
        cy.get('li').should('have.length', 1);
        cy.findByRole('link', { name: `Du må fylle ut: ${TITLE.attachmentWithOneOption}` }).should('exist');
      });
  });
});
