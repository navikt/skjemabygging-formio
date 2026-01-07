describe('Static PDF', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/api/forms/cypresssettings/static-pdfs', {
      body: [
        {
          languageCode: 'nb',
          fileName: 'skjemanummer-nb-01012026.pdf',
          createdAt: '2026-01-01T09:10:41.989+01',
          createdBy: 'Ola Nordmann',
        },
        {
          languageCode: 'nn',
          fileName: 'skjemanummer-nn-01022026.pdf',
          createdAt: '2026-01-02T09:10:41.989+01',
          createdBy: 'Ola Nordmann',
        },
      ],
    }).as('getStaticPdfs');
    cy.visit('forms/cypresssettings/pdf');
    cy.wait('@getStaticPdfs');
    cy.defaultWaits();
  });

  it('Expect all languages to exist in list', () => {
    cy.contains('Bokmål').should('exist');
    cy.contains('Nynorsk').should('exist');
    cy.contains('Engelsk').should('exist');
    cy.contains('Samisk').should('exist');
    cy.contains('Fransk').should('exist');
  });

  it('Add language', () => {
    cy.findByTestId('upload-static-pdf-nb-button').should('exist');
    cy.findByTestId('upload-static-pdf-nn-button').should('exist');
    cy.findByTestId('upload-static-pdf-en-button').should('exist');
    cy.findByTestId('upload-static-pdf-se-button').should('exist');
    cy.findByTestId('upload-static-pdf-fr-button').should('exist');

    cy.intercept('POST', '/api/forms/cypresssettings/static-pdfs/en', {
      status: 201,
      body: {
        status: 'OK',
        data: {
          languageCode: 'en',
          fileName: 'skjemanummer-en-01012026.pdf',
          createdAt: '2026-01-01T09:10:41.989+01',
          createdBy: 'Ola Nordmann',
        },
      },
    }).as('uploadStaticPdfs');

    cy.findByTestId('download-static-pdf-en-button').should('not.exist');
    cy.findByTestId('delete-static-pdf-en-button').should('not.exist');
    cy.findByTestId('upload-static-pdf-en-button').click();
    cy.get('input[type=file]').eq(2).selectFile(Cypress.Buffer.from('Test'), { force: true });
    cy.get('[data-color=danger]').filter(':visible').click();
    cy.wait('@uploadStaticPdfs');
    cy.findByTestId('download-static-pdf-en-button').should('exist');
    cy.findByTestId('delete-static-pdf-en-button').should('exist');
  });

  it('Delete language', () => {
    cy.findByTestId('delete-static-pdf-nb-button').should('exist');
    cy.findByTestId('delete-static-pdf-nn-button').should('exist');
    cy.findByTestId('delete-static-pdf-en-button').should('not.exist');
    cy.findByTestId('delete-static-pdf-se-button').should('not.exist');
    cy.findByTestId('delete-static-pdf-fr-button').should('not.exist');

    cy.intercept('DELETE', '/api/forms/cypresssettings/static-pdfs/nb', { status: 200 }).as('deleteStaticPdfs');
    cy.findByTestId('delete-static-pdf-nb-button').click();
    cy.contains('Ja, avpubliser').click();
    cy.wait('@deleteStaticPdfs');
    cy.findByTestId('delete-static-pdf-nb-button').should('not.exist');
  });

  it('Download language', () => {
    cy.findByTestId('download-static-pdf-nb-button').should('exist');
    cy.findByTestId('download-static-pdf-nn-button').should('exist');
    cy.findByTestId('download-static-pdf-en-button').should('not.exist');
    cy.findByTestId('download-static-pdf-se-button').should('not.exist');
    cy.findByTestId('download-static-pdf-fr-button').should('not.exist');

    cy.intercept('GET', '/api/forms/cypresssettings/static-pdfs/nb', { status: 200 }).as('downloadStaticPdfs');
    cy.findByTestId('download-static-pdf-nb-button').click();
    cy.wait('@downloadStaticPdfs');
  });
});
