const baseForm = {
  id: 999,
  title: 'Test skjema for ingen',
  path: 'testingen',
  skjemanummer: 'test-ingen',
  components: [],
  properties: {
    skjemanummer: 'test-ingen',
    tema: 'GEN',
    submissionTypes: [] as string[],
    subsequentSubmissionTypes: ['PAPER'],
    signatures: [],
    isTestForm: true,
    modified: '2025-01-01T00:00:00.000Z',
    modifiedBy: 'Mock',
    mellomlagringDurationDays: '28',
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  createdBy: 'Mock',
  changedAt: '2025-01-01T00:00:00.000Z',
  changedBy: 'Mock',
  revision: 1,
  publishedLanguages: [],
  status: 'draft',
};

const interceptCommonRequests = () => {
  cy.intercept('GET', '/api/config', { fixture: 'config.json' });
  cy.intercept('GET', '/api/form-publications/*', { statusCode: 404 });
  cy.intercept('GET', '/api/recipients', { fixture: 'recipients.json' });
  cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' });
  cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' });
  cy.intercept('GET', '/api/enhetstyper', { fixture: 'enhetstyper.json' });
};

describe('Submission type', () => {
  describe('PAPER_NO_COVER_PAGE', () => {
    beforeEach(() => {
      interceptCommonRequests();
    });

    describe('Checkbox visibility', () => {
      beforeEach(() => {
        const formWithPaperDigital = {
          ...baseForm,
          properties: { ...baseForm.properties, submissionTypes: ['PAPER', 'DIGITAL'] },
        };
        cy.intercept('GET', '/api/forms/testingen', { body: formWithPaperDigital });
        cy.intercept('GET', '/api/forms/testingen/translations', { body: [] });
        cy.visit('forms/testingen/settings');
      });

      it('shows Ingen checkbox in Innsending group', () => {
        cy.findByRole('group', { name: /Innsending/ }).within(() => {
          cy.findByRole('checkbox', { name: /Ingen innsending/ }).should('exist');
        });
      });

      it('hides Ingen checkbox in Ettersending group', () => {
        cy.findByRole('group', { name: /Ettersending/ }).within(() => {
          cy.findByRole('checkbox', { name: /Ingen innsending/ }).should('not.exist');
        });
      });
    });

    describe('Warning for incompatible combinations', () => {
      beforeEach(() => {
        cy.intercept('GET', '/api/forms/testingen', { body: baseForm });
        cy.intercept('GET', '/api/forms/testingen/translations', { body: [] });
        cy.visit('forms/testingen/settings');
      });

      it('shows warning when PAPER_NO_COVER_PAGE is combined with DIGITAL', () => {
        cy.findByRole('group', { name: /Innsending/ }).within(() => {
          cy.findByRole('checkbox', { name: /Ingen innsending/ }).should('be.checked');
          cy.findByRole('checkbox', { name: 'Digital' }).check({ force: true });
        });
        cy.findByText(/uforutsett oppførsel/).should('be.visible');
      });

      it('does not show warning when only PAPER_NO_COVER_PAGE is selected', () => {
        cy.findByRole('group', { name: /Innsending/ }).within(() => {
          cy.findByRole('checkbox', { name: /Ingen innsending/ }).should('be.checked');
        });
        cy.findByText(/uforutsett oppførsel/).should('not.exist');
      });

      it('does not show warning when PAPER_NO_COVER_PAGE is combined with STATIC_PDF', () => {
        cy.findByRole('group', { name: /Innsending/ }).within(() => {
          cy.findByRole('checkbox', { name: /Ingen innsending/ }).should('be.checked');
          cy.findByRole('checkbox', { name: 'Statisk PDF' }).check({ force: true });
        });
        cy.findByText(/uforutsett oppførsel/).should('not.exist');
      });
    });

    describe('Ingen innsending fields', () => {
      beforeEach(() => {
        const formWithIngen = {
          ...baseForm,
          properties: { ...baseForm.properties, submissionTypes: ['PAPER_NO_COVER_PAGE'] },
        };
        cy.intercept('GET', '/api/forms/testingen', { body: formWithIngen });
        cy.intercept('GET', '/api/forms/testingen/translations', { body: [] });
        cy.visit('forms/testingen/settings');
      });

      it('shows heading and explanation fields when PAPER_NO_COVER_PAGE is checked', () => {
        cy.findByRole('textbox', { name: /Overskrift til innsending/ }).should('exist');
        cy.findByRole('textbox', { name: /Forklaring til innsending/ }).should('exist');
      });
    });

    describe('Auto-migration from empty submissionTypes', () => {
      beforeEach(() => {
        cy.intercept('GET', '/api/forms/testingen', { body: baseForm });
        cy.intercept('GET', '/api/forms/testingen/translations', { body: [] });
        cy.visit('forms/testingen/settings');
      });

      it('auto-checks Ingen when form has empty submissionTypes', () => {
        cy.findByRole('group', { name: /Innsending/ }).within(() => {
          cy.findByRole('checkbox', { name: /Ingen innsending/ }).should('be.checked');
        });
      });

      it('includes PAPER_NO_COVER_PAGE in save payload after migration', () => {
        cy.intercept('PUT', '/api/forms/testingen', (req) => {
          expect(req.body.properties.submissionTypes).to.include('PAPER_NO_COVER_PAGE');
          req.reply(req.body);
        }).as('saveForm');

        cy.findByRole('button', { name: /Lagre/ }).click();
        cy.wait('@saveForm');
      });
    });
  });
});
