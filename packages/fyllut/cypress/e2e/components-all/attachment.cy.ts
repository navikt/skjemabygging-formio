// Settings from DefaultAttachment.form.ts: label, description, additionalDescription,
// attachmentValues (data tab — which options are enabled + per-option additionalDocumentation
// and showDeadline config), key, vedleggstittel, vedleggskode, vedleggskjema (api), conditional.
//
// Note: attachmentValues (data tab) configure which submission options appear (leggerVedNaa,
// ettersender, levertTidligere, harIkke, andre, nav) and their per-option settings
// (additionalDocumentation textarea, showDeadline alert). These are covered in
// packages/fyllut/cypress/e2e/components-complex/attachment.cy.ts.
// Note: vedleggstittel, vedleggskode, and vedleggskjema (api tab) are submission metadata
// displayed on the attachment summary page — they have no visible effect on the option select.
// Note: There are two attachmentType values: 'default' (configurable options) and 'other'
// (fixed read-only options: leggerVedNaa + nei).

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Attachment', () => {
  const LABEL = 'Vedlegg';
  const LABEL_WITH_DESCRIPTION = 'Vedlegg med beskrivelse';
  const LABEL_OTHER = 'Annen dokumentasjon';
  const LABEL_REQUIRED = 'Vedlegg påkrevd';
  const LABEL_NOT_REQUIRED = 'Vedlegg ikke påkrevd';

  const VISNING_URL = '/fyllut/attachment/visning';
  const ANNET_URL = '/fyllut/attachment/annet';
  const VALIDERING_URL = '/fyllut/attachment/validering';

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit(`${VISNING_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('renders label and option group', () => {
      cy.findByRole('group', { name: LABEL }).should('exist');
    });

    it('renders enabled options for default type', () => {
      cy.findByRole('group', { name: LABEL }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('exist');
        cy.findByLabelText(TEXTS.statiske.attachment.ettersender).should('exist');
        cy.findByLabelText(TEXTS.statiske.attachment.levertTidligere).should('exist');
        cy.findAllByRole('radio').should('have.length', 3);
      });
    });

    it('can select an option', () => {
      cy.findByRole('group', { name: LABEL }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('not.be.checked').check();
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('be.checked');
      });
    });

    it('renders description', () => {
      cy.withinComponent(LABEL_WITH_DESCRIPTION, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });

    it('renders additionalDescription', () => {
      cy.withinComponent(LABEL_WITH_DESCRIPTION, () => {
        cy.contains('Dette er utvidet beskrivelse').should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains('Dette er utvidet beskrivelse').shouldBeVisible();
      });
    });
  });

  describe('Type other', () => {
    beforeEach(() => {
      cy.visit(`${ANNET_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('renders leggerVedNaa and nei options', () => {
      cy.withinComponent(LABEL_OTHER, () => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('exist');
        cy.findByLabelText(TEXTS.statiske.attachment.nei).should('exist');
        cy.findAllByRole('radio').should('have.length', 2);
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit(`${VALIDERING_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('validates required field', () => {
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(LABEL_REQUIRED).should('have.length', 2);
      cy.clickErrorMessageRequired(LABEL_REQUIRED);
      cy.findByRole('group', { name: LABEL_REQUIRED }).should('have.focus');
      cy.findByRole('group', { name: LABEL_REQUIRED }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check();
      });
      cy.findAllByErrorMessageRequired(LABEL_REQUIRED).should('have.length', 0);
    });

    it('does not validate when not required', () => {
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(LABEL_NOT_REQUIRED).should('have.length', 0);
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit(`${VISNING_URL}?sub=paper&lang=en`);
      cy.defaultWaits();
    });

    it('translates label', () => {
      cy.findByRole('group', { name: `${LABEL} (en)` }).should('exist');
    });

    it('translates description', () => {
      cy.withinComponent(`${LABEL_WITH_DESCRIPTION} (en)`, () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
