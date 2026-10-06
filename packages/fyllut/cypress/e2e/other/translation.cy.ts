/*
 * Tests translations of the form work from both url params and language switcher
 */

import { expect } from 'chai';

const languageSelect = () => cy.findByRole('combobox', { name: /^(Choose language|Velg språk|Vel språk)$/ });

describe('Translations', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Change translations based on url params', () => {
    it('get default bokmål', () => {
      cy.visit('/fyllut/translationcypress101/veiledning');
      languageSelect().should('have.value', 'nb');
    });

    it('get bokmål with lang param', () => {
      cy.visit('/fyllut/translationcypress101/veiledning?lang=nb-NO');
      languageSelect().should('have.value', 'nb');
    });

    it('get nynorsk with lang param', () => {
      cy.visit('/fyllut/translationcypress101/veiledning?lang=nn-NO');
      languageSelect().should('have.value', 'nn');
    });

    it('get english with lang param', () => {
      cy.visit('/fyllut/translationcypress101/skjema?lang=en');
      languageSelect().should('have.value', 'en');
    });
  });

  describe('Change translation language', () => {
    beforeEach(() => {
      cy.visit('/fyllut/translationcypress101/skjema?sub=paper');
    });

    it('change to english and back to norwegian', () => {
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');
      languageSelect().select('en');
      cy.findByRole('heading', { name: 'Guidance' }).should('exist');
      languageSelect().select('nb');
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');
    });

    it('retains selected language on navigation', () => {
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');
      languageSelect().select('en');
      cy.findByRole('heading', { name: 'Guidance' }).should('exist');
      cy.clickNextStep();

      languageSelect().should('have.value', 'en');
      cy.findByRole('heading', { name: 'Your information' }).should('exist');
      cy.findByRole('combobox', { name: 'Title' }).should('be.visible').click();
      cy.findByText('Mr').should('exist').click();
      cy.findByRole('textbox', { name: 'First name' }).should('exist').type('Cyp');
      cy.findByRole('textbox', { name: 'Last name' }).should('exist').type('Ress');
      cy.get('.aksel-radio-group')
        .first()
        .should('exist')
        .within(($radio) => cy.findByLabelText('Yes').should('exist').check({ force: true }));
      cy.findByRole('textbox', { name: 'Norwegian national identification / D number' })
        .should('exist')
        .type('16020256145');
      cy.findByRole('textbox', { name: 'Velg måned' }).should('exist').type('02.2022');

      cy.clickNextStep();

      languageSelect().should('have.value', 'en');
      cy.findByRole('heading', { name: 'Attachments' }).should('exist');
      cy.get('.aksel-radio-group')
        .first()
        .should('exist')
        .within(($radio) =>
          cy.findByLabelText('No, I have no additional documentation to attach').should('exist').check({ force: true }),
        );
      cy.clickNextStep();

      languageSelect().should('have.value', 'en');
      cy.findByRole('heading', { name: 'Summary' }).should('exist');
    });

    it('stays on current panel when changing language', () => {
      cy.clickShowAllSteps();

      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
      languageSelect().select('en');
      cy.findByRole('heading', { name: 'Your information' }).should('exist');

      cy.findByRole('link', { name: 'Attachments' }).click();
      languageSelect().select('nb');
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');

      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
    });
  });

  describe('Special cases', () => {
    beforeEach(() => {
      cy.visit('/fyllut/translationcypress101/skjema?sub=paper');
    });

    it('Check that translateHTMLTemplate override work', () => {
      languageSelect().select('en');
      cy.clickNextStep();

      // This example will fail without the override in translateHTMLTemplate
      cy.get('[data-component-key="eksempelOversettelse1"]').contains('Example correct translation').should('exist');
    });
  });

  describe('Unpublished language in url param (INCLUDE_DIST_TESTS)', () => {
    beforeEach(() => {
      cy.skipIfNoIncludeDistTests();
    });

    it('removes lang when the language is not published', () => {
      cy.visit('/fyllut/translationunpublishedlanguage/skjema?sub=paper&lang=en');
      cy.location('pathname').should('eq', '/fyllut/translationunpublishedlanguage/skjema');
      cy.location('search').should('eq', '?sub=paper');
      languageSelect().should('have.value', 'nb');
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');
    });

    it('keeps lang when the language is published', () => {
      cy.visit('/fyllut/translationunpublishedlanguage/skjema?sub=paper&lang=nn-NO');
      languageSelect().should('have.value', 'nn');
      cy.location('search').should('eq', '?sub=paper&lang=nn-NO');
    });

    it('removes repeated lang parameters', () => {
      cy.visit('/fyllut/translationunpublishedlanguage/skjema?sub=paper&lang=en&lang=en');
      cy.location('search').should('eq', '?sub=paper');
      languageSelect().should('have.value', 'nb');
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');
    });
  });

  describe('Resuming the saved language', () => {
    const submissionId = '8e3c3621-76d7-4ebd-90d4-34448ebcccc3';

    [
      { formPath: 'translationsavedlanguage', savedLanguage: 'en', expectedLanguage: 'nb', status: 'published' },
      { formPath: 'translationsavedlanguage', savedLanguage: 'nn', expectedLanguage: 'nn', status: 'published' },
      { formPath: 'translationsavedlanguagepending', savedLanguage: 'en', expectedLanguage: 'en', status: 'pending' },
    ].forEach(({ formPath, savedLanguage, expectedLanguage, status }) => {
      it(`resumes ${savedLanguage} as ${expectedLanguage} for a ${status} form without losing answers`, () => {
        const savedApplication = {
          innsendingsId: submissionId,
          hoveddokumentVariant: {
            document: {
              language: savedLanguage,
              data: { data: { explanation: 'Saved answer' } },
            },
          },
          shouldUploadAttachmentsInFyllut: true,
          endretDato: '2026-10-01T10:00:00Z',
          skalSlettesDato: '2026-11-01T10:00:00Z',
        };
        cy.intercept('GET', `/fyllut/api/send-inn/soknad/${submissionId}`, savedApplication).as('getSavedApplication');
        cy.intercept('PUT', '/fyllut/api/send-inn/soknad', savedApplication).as('saveApplication');

        cy.visit(`/fyllut/${formPath}/skjema?sub=digital&innsendingsId=${submissionId}`);
        cy.wait('@getSavedApplication');
        languageSelect().should('have.value', expectedLanguage);
        cy.findByRole('textbox', { name: /Din forklaring|Your explanation/ }).should('have.value', 'Saved answer');
        cy.location('search').should((search) => {
          const params = new URLSearchParams(search);
          expect(params.get('sub')).to.equal('digital');
          expect(params.get('innsendingsId')).to.equal(submissionId);
          expect(params.get('lang')).to.equal(expectedLanguage === 'nb' ? null : expectedLanguage);
        });

        cy.clickSaveAndContinue();
        cy.wait('@saveApplication').then(({ request }) => {
          expect(request.body.language).to.equal(expectedLanguage);
          expect(request.body.submission.data.explanation).to.equal('Saved answer');
        });
      });
    });
  });

  describe('Invalid url', () => {
    beforeEach(() => {
      cy.visit('/fyllut/&#cypress101/skjema?sub=paper', { failOnStatusCode: false });
    });

    it('should show error page when URL is invalid', () => {
      cy.findByRole('heading', { name: 'Beklager, fant ikke siden' }).should('exist');
    });
  });
});
