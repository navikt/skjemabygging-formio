import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Attachments page', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/digitalnologinwithattachmentpanel');
    cy.defaultWaits();
    cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).click();
    cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
    cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
    cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
    cy.findByText(TEXTS.statiske.uploadId.selectFileButton).should('exist').should('be.visible');

    cy.uploadFile();

    cy.clickNextStep();
    cy.clickStart();
    cy.clickShowAllSteps();
    cy.findByText('Vedlegg').click();
  });

  describe('Validation', () => {
    it('should display validation errors when next step button is clicked', () => {
      cy.findByText('Informasjon om din næringsinntekt fra Norge eller utlandet').should('exist');
      cy.findByText('Annen dokumentasjon').should('exist');
      cy.clickNextStep();
      cy.findAllByText('Du må fylle ut: Informasjon om din næringsinntekt fra Norge eller utlandet').should(
        'have.length',
        2,
      );
      cy.findAllByText('Du må fylle ut: Vedlegg med ett valg').should('have.length', 2);
      cy.findAllByText('Du må fylle ut: Annen dokumentasjon').should('be.visible').should('have.length', 2);
    });

    it('validates required attachment with one option', () => {
      cy.findByRole('group', { name: 'Informasjon om din næringsinntekt fra Norge eller utlandet' }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.ettersender }).click();
      });
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.nei }).click();
      });
      cy.findByRole('group', { name: 'Vedlegg med ett valg' }).within(() => {
        cy.findByRole('checkbox', { name: TEXTS.statiske.attachment.leggerVedNaa }).check();
        cy.findByRole('checkbox', { name: TEXTS.statiske.attachment.leggerVedNaa }).uncheck();
      });
      cy.clickNextStep();
      cy.findAllByText('Du må fylle ut: Vedlegg med ett valg').should('have.length', 2);
    });
  });

  it('should render additional description and deadline when existing', () => {
    cy.findByLabelText(TEXTS.statiske.attachment.ettersender).click();
    cy.findByText(
      'Hvis vi ikke har mottatt dette vedlegget innen 14 dager blir saken behandlet med de opplysningene som foreligger.',
    ).should('exist');
    cy.findByLabelText(TEXTS.statiske.attachment.levertTidligere).click();
    cy.findByLabelText('Tittel tilleggsinformasjon').should('exist');
    cy.findByText('Beskrivelse tilleggsinformasjon').should('exist');
  });

  describe('Other attachments', () => {
    it('requires a title to upload file', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).click();
      });
      cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).click();
      cy.findAllByText(`Du må fylle ut: ${TEXTS.statiske.attachment.attachmentTitle}`).should('have.length', 2);
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel');
      cy.uploadFile();
      cy.findAllByText(`Du må fylle ut: ${TEXTS.statiske.attachment.attachmentTitle}`).should('not.exist');
    });

    it('lets you add several attachments', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).click();
      });
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
      cy.uploadFile();
      cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
      cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).should('not.exist');
      cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
      cy.uploadFile();
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('exist');
      cy.findAllByText('test.txt').should('have.length', 2);
    });

    it('lets you delete a started attachment', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).click();
      });
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
      cy.uploadFile();
      cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
      cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
      cy.findByRole('button', { name: TEXTS.statiske.attachment.deleteAttachment }).click();
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('not.exist');
      cy.findByText(TEXTS.statiske.attachment.attachmentTitle).should('not.exist');
    });

    it('lets you delete an uploaded attachment', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).click();
      });
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
      cy.uploadFile();
      cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
      cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
      cy.uploadFile();
      cy.findAllByRole('button', { name: 'Slett filen' }).should('have.length', 2);
      cy.findAllByRole('button', { name: 'Slett filen' }).last().click();
      cy.findAllByText('test.txt').should('have.length', 1);
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('not.exist');
      cy.findByText(TEXTS.statiske.attachment.attachmentTitle).should('not.exist');
    });

    it('is still valid after deleting the first attachment', () => {
      cy.findByRole('group', { name: 'Informasjon om din næringsinntekt fra Norge eller utlandet' }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.ettersender }).click();
      });
      cy.findByRole('group', { name: 'Vedlegg med ett valg' }).within(() => {
        cy.findByRole('checkbox', { name: TEXTS.statiske.attachment.leggerVedNaa }).click();
      });
      cy.uploadFile();
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).click();
      });
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
      cy.uploadFile('test.txt', { index: 1 });
      cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
      cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
      cy.uploadFile('test.txt', { index: 1 });
      cy.findAllByRole('button', { name: 'Slett filen' }).should('have.length', 2);
      cy.findAllByRole('button', { name: 'Slett filen' }).eq(1).click();
      cy.findAllByText('test.txt').should('have.length', 2);
      cy.findByText('Vedleggstittel 1').should('not.exist');
      cy.findByText('Vedleggstittel 2').should('exist');
      cy.clickNextStep();
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.findByText('Du må fylle ut: Annen dokumentasjon').should('not.exist');
      // heading 'Vedlegg' is present without 'Opplysninger mangler'
      // TODO: the heading should be level 3, but currently is level 2
      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
    });
  });

  describe('Deleting files', () => {
    beforeEach(() => {
      // Cypress doesn't like that session request after redirect to nav.no returns a 401
      cy.intercept('https://login.nav.no/oauth2/session', {
        statusCode: 200,
        body: {
          session: {
            created_at: '2025-09-24T05:12:16.362312374Z',
            ends_at: '2025-09-24T11:12:16.362312374Z',
            timeout_at: '2025-09-24T06:12:16.362312744Z',
            ends_in_seconds: 21599,
            active: true,
            timeout_in_seconds: 3599,
          },
          tokens: {
            expire_at: '2025-09-24T06:12:16.361856234Z',
            refreshed_at: '2025-09-24T05:12:16.362312374Z',
            expire_in_seconds: 3599,
            next_auto_refresh_in_seconds: -1,
            refresh_cooldown: true,
            refresh_cooldown_seconds: 59,
          },
        },
      });
    });

    it('should remove all attachments when delete all button is clicked', () => {
      cy.intercept('/fyllut/api/nologin-file?attachmentId=eiajfi8').as('deleteAllFilesByAttachmentId');
      cy.findAllByLabelText(TEXTS.statiske.attachment.leggerVedNaa).first().click();
      cy.uploadFile();
      cy.findByText('test.txt').should('exist');
      cy.uploadFile();
      cy.findByText('test.txt').should('exist');
      cy.findByRole('button', { name: TEXTS.statiske.attachment.deleteAllFiles }).click();
      cy.wait('@deleteAllFilesByAttachmentId');
    });

    it('should remove all attachments on cancel', () => {
      cy.intercept('/fyllut/api/nologin-file').as('deleteAllFiles');
      cy.findAllByLabelText(TEXTS.statiske.attachment.leggerVedNaa).first().click();
      cy.uploadFile();
      cy.findByText('test.txt').should('exist');
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).click();
      cy.findByRole('button', { name: TEXTS.grensesnitt.confirmDiscardPrompt.confirm }).click();
      cy.wait('@deleteAllFiles');
    });
  });
});
