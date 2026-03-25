import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Digital submission with attachments uploaded in Fyllut', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Form with attachments', () => {
    beforeEach(() => {
      cy.visit('/fyllut/formwithattachments?sub=digital');
      cy.defaultWaits();

      cy.clickIntroPageConfirmation();
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { level: 2, name: 'Diverse' }).should('exist');
      cy.findByRole('group', { name: /Radiopanel 1/ }).within(() => cy.findByLabelText('Radiovalg 1').check());
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
    });

    it('shows validation errors when files are not uploaded', () => {
      cy.findByRole('group', { name: /Vedlegg 1/ }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
      });
      cy.findByRole('group', { name: /Vedlegg 2/ }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
      });
      cy.clickSaveAndContinue();

      const validationErrors = [
        'Du må laste opp fil: Vedlegg 1',
        'Du må laste opp fil: Vedlegg 2',
        'Du må laste opp fil: Annen dokumentasjon',
      ];
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findAllByRole('link', { name: /^Du må laste opp fil: .*/ })
            .should('have.length', validationErrors.length)
            .each((link, index) => {
              cy.wrap(link).should('have.text', validationErrors[index]);
            });
        });
    });

    describe('uploading files', () => {
      beforeEach(() => {
        cy.findAttachment(/Vedlegg 1/).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
          cy.uploadFile('small-file.txt');
        });

        cy.findAttachment(/Vedlegg 2/).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
          cy.uploadFile('another-small-file.txt');
        });

        cy.findAttachment(/Annen dokumentasjon/).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
          cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Annet vedlegg 1');
          cy.uploadFile('test.txt');
        });
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      });

      it('shows uploaded attachments on summary page', () => {
        cy.findByRole('heading', { level: 3, name: 'Vedlegg' })
          .should('exist')
          .closest('[data-cy=form-summary-panel]')
          .within(() => {
            cy.findByText('Vedlegg 1').should('exist');
            cy.findByText('Vedlegg 2').should('exist');
            cy.findByText('Annet vedlegg 1').should('exist');
          });
      });

      it('submits attachments with the form', () => {
        cy.mocksUseRouteVariant('post-familie-pdf:success-tc07');
        cy.mocksUseRouteVariant('post-digital-soknad:success-tc07');
        cy.clickSendNav();

        cy.findByRole('heading', { level: 2, name: 'Kvittering' }).should('exist');
        cy.findByText('Vedlegg 1').should('exist');
        cy.findByText('Vedlegg 2').should('exist');
        cy.findByText('Annet vedlegg 1').should('exist');
      });
    });
  });
});
