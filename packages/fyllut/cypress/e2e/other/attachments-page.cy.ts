import { SubmissionAttachment, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

describe('Attachments page (paper submission)', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/attachmentspagepaper?sub=paper');
    cy.defaultWaits();

    cy.clickIntroPageConfirmation();
    cy.clickNextStep();
    cy.findByRole('heading', { name: 'Veiledning' }).should('exist');

    cy.clickNextStep();
    cy.findByRole('heading', { name: /Dine opplysninger/ }).should('exist');
    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
      cy.findByLabelText('Ja').check(),
    );
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
    cy.clickNextStep();

    cy.findByRole('group', { name: 'Høyeste fullførte utdanning' }).within(() => cy.findByLabelText('Annet').check());
    cy.clickNextStep();
    cy.findByRole('heading', { name: /Vedlegg/ }).should('exist');
  });

  it('shows legacy paper labels for attachment options', () => {
    cy.findByRole('group', { name: /Vedlegg med masse greier/ }).within(() => {
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).should('exist');
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.ettersender }).should('exist');
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.levertTidligere }).should('exist');
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.harIkke }).should('exist');
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.andre }).should('exist');
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.nav }).should('exist');

      cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).should('not.exist');
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadLater }).should('not.exist');
    });
  });
});

describe('Attachments page', () => {
  const getUploadOnlyAttachment = () => cy.contains('[data-cy=attachment-upload]', 'Vedlegg med ett valg');
  const getOtherAttachment = () => cy.contains('[data-cy=attachment-upload]', 'Annen dokumentasjon');
  const getMainAttachment = () =>
    cy.contains('[data-cy=attachment-upload]', 'Informasjon om din næringsinntekt fra Norge eller utlandet');
  const uploadFileInCurrentScope = (fileName: string = 'test.txt') => {
    cy.get('input[type=file]').last().selectFile(`cypress/fixtures/files/${fileName}`, { force: true });
  };
  const prepareRepeatedAttachmentSubmission = () => {
    cy.mocksUseRouteVariant('post-nologin-soknad:success-tc22');
    cy.findByRole('link', { name: 'Dine opplysninger' }).click();
    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
      cy.findByLabelText('Ja').check(),
    );
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
    cy.clickNextStep();
    getMainAttachment().within(() => {
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadLater }).click();
    });
    getUploadOnlyAttachment().within(() => {
      uploadFileInCurrentScope('test.txt');
      cy.findByRole('button', { name: 'Slett filen' }).should('be.visible');
    });
    cy.findByRole('group', {
      name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
    }).within(() => {
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).click();
    });
    getOtherAttachment().within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
      uploadFileInCurrentScope('test.txt');
      cy.findByRole('button', { name: 'Slett filen' }).should('be.visible');
      cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 2');
    });
  };
  const submitWithoutDeletedAttachment = () => {
    cy.clickNextStep();
    cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
    cy.findByText('Vedleggstittel 1').should('be.visible');
    cy.findByText('Vedleggstittel 2').should('not.exist');
    cy.intercept('POST', '/fyllut/api/send-inn/nologin-application').as('submitApplication');
    cy.clickSendNav();
    cy.wait('@submitApplication').should(({ request, response }) => {
      expect(response?.statusCode).to.equal(200);
      const attachments = request.body.submission.data.annenDokumentasjon as SubmissionAttachment[];
      expect(attachments).to.have.length(1);
      expect(attachments[0]).to.include({
        attachmentId: 'ez0ub3y',
        title: 'Vedleggstittel 1',
        value: 'leggerVedNaa',
      });
      expect(attachments[0].files).to.have.length(1);
      expect(attachments[0].files?.[0]).to.include({ attachmentId: 'ez0ub3y', fileName: 'test.txt' });
      expect(JSON.stringify(request.body.submission)).to.not.include('ez0ub3y-1');
      expect(JSON.stringify(request.body.submission)).to.not.include('Vedleggstittel 2');
    });
    cy.findByRole('heading', { level: 2, name: 'Kvittering' }).should('exist');
  };

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.visit('/fyllut/attachmentspagedigitalnologinattachmentpanel');
    cy.defaultWaits();
    cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).click();
    cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
    cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
    cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
    cy.findByText(TEXTS.statiske.uploadId.selectFileButton).should('exist').should('be.visible');

    cy.intercept('POST', '/fyllut/api/send-inn/nologin-application/attachments/personal-id').as('uploadIdFile');
    cy.uploadFile('id-billy-bruker.jpg');
    cy.wait('@uploadIdFile').its('response.statusCode').should('eq', 201);
    cy.findByRole('button', { name: 'Slett filen' }).should('be.visible');

    cy.clickNextStep();
    cy.clickStart();
    cy.clickShowAllSteps();
    cy.findByText('Vedlegg').click();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
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
      cy.findAllByText('Du må laste opp fil: Vedlegg med ett valg').should('have.length', 2);
      cy.findAllByText('Du må fylle ut: Annen dokumentasjon').should('be.visible').should('have.length', 2);
    });

    it('validates required attachment with one option', () => {
      cy.findByRole('group', { name: 'Informasjon om din næringsinntekt fra Norge eller utlandet' }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadLater }).click();
      });
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.nei }).click();
      });
      getUploadOnlyAttachment().within(() => {
        cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).should('exist');
      });
      cy.clickNextStep();
      cy.findAllByText('Du må laste opp fil: Vedlegg med ett valg').should('have.length', 2);
    });
  });

  it('shows digital option labels for digital no login attachments', () => {
    cy.findByRole('group', { name: 'Informasjon om din næringsinntekt fra Norge eller utlandet' }).within(() => {
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).should('exist');
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadLater }).should('exist');

      cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).should('not.exist');
      cy.findByRole('radio', { name: TEXTS.statiske.attachment.ettersender }).should('not.exist');
    });
  });

  it('hides uploadNow selector when only upload-only option is enabled and allows direct upload', () => {
    getUploadOnlyAttachment().within(() => {
      cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).should('exist');
      cy.get('input[type=radio], input[type=checkbox]').should('have.length', 0);
      uploadFileInCurrentScope('test.txt');
    });
    cy.findByText('test.txt').should('exist');
  });

  it('should render additional description and deadline when existing', () => {
    cy.findByLabelText(TEXTS.statiske.attachment.uploadLater).click();
    cy.findByText(
      'Hvis vi ikke har mottatt dette vedlegget innen 14 dager blir saken behandlet med de opplysningene som foreligger.',
    ).should('exist');
    cy.findByLabelText(TEXTS.statiske.attachment.alreadySent).click();
    cy.findByLabelText('Tittel tilleggsinformasjon').should('exist');
    cy.findByText('Beskrivelse tilleggsinformasjon').should('exist');
  });

  describe('Other attachments', () => {
    it('requires a title to upload file', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).click();
      });
      getOtherAttachment().within(() => {
        cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).click();
      });
      cy.findAllByText(`Du må fylle ut: ${TEXTS.statiske.attachment.attachmentTitle}`).should('have.length', 2);
      getOtherAttachment().within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel');
        uploadFileInCurrentScope('test.txt');
      });
      cy.findAllByText(`Du må fylle ut: ${TEXTS.statiske.attachment.attachmentTitle}`).should('not.exist');
    });

    it('lets you add several attachments', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).click();
      });
      getOtherAttachment().within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
        uploadFileInCurrentScope('test.txt');
        cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
        cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).should('not.exist');
        cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
        uploadFileInCurrentScope('test.txt');
      });
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('exist');
      cy.findAllByText('test.txt').should('have.length', 2);
    });

    it('cleans up a late upload without restoring or submitting the cancelled attachment', () => {
      prepareRepeatedAttachmentSubmission();
      let releaseUpload: () => void;
      const uploadedFile = { fileId: '' };
      const heldResponse = new Cypress.Promise<void>((resolve) => {
        releaseUpload = resolve;
      });
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-application/attachments/ez0ub3y-1', (req) => {
        req.continue((res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.attachmentId).to.equal('ez0ub3y-1');
          uploadedFile.fileId = res.body.fileId;
          return heldResponse;
        });
      }).as('uploadRepeatedAttachment');
      cy.intercept('DELETE', '/fyllut/api/send-inn/nologin-application/attachments/**').as('deleteAttachmentFile');
      getOtherAttachment().within(() => {
        uploadFileInCurrentScope('small-file.txt');
      });
      cy.wrap(uploadedFile).its('fileId').should('be.a', 'string').and('not.be.empty');
      getOtherAttachment().within(() => {
        cy.findByText('small-file.txt').should('be.visible');
        cy.findByRole('button', { name: TEXTS.statiske.attachment.deleteAttachment }).should('be.enabled').click();
        cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).should('not.exist');
        cy.findByText('small-file.txt').should('not.exist');
      });
      cy.get('@deleteAttachmentFile.all').should('have.length', 0);

      // Release before cy.wait: the upload cannot finish while its response is held.
      cy.then(() => {
        releaseUpload();
      });
      cy.wait('@uploadRepeatedAttachment').its('response.statusCode').should('eq', 201);
      cy.wait('@deleteAttachmentFile').should(({ request, response }) => {
        expect(new URL(request.url).pathname).to.equal(
          `/fyllut/api/send-inn/nologin-application/attachments/ez0ub3y-1/${uploadedFile.fileId}`,
        );
        expect(response?.statusCode).to.equal(204);
      });
      cy.get('@deleteAttachmentFile.all').should('have.length', 1);
      getOtherAttachment().within(() => {
        cy.findByText('Vedleggstittel 1').should('be.visible');
        cy.findByText('Vedleggstittel 2').should('not.exist');
        cy.findAllByText('test.txt').should('have.length', 1);
        cy.findByText('small-file.txt').should('not.exist');
        cy.findAllByRole('button', { name: 'Slett filen' }).should('have.length', 1);
      });
      submitWithoutDeletedAttachment();
    });

    it('lets you add more attachments after visiting summary page', () => {
      cy.findByRole('group', { name: 'Informasjon om din næringsinntekt fra Norge eller utlandet' }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadLater }).click();
      });
      getUploadOnlyAttachment().within(() => {
        uploadFileInCurrentScope('test.txt');
      });
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).click();
      });
      getOtherAttachment().within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
        uploadFileInCurrentScope('test.txt');
        cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
        cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
        uploadFileInCurrentScope('test.txt');
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      getOtherAttachment().within(() => {
        cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
        cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 3');
        uploadFileInCurrentScope('test.txt');
      });
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('exist');
      cy.findByText('Vedleggstittel 3').should('exist');
      cy.findAllByText('test.txt').should('have.length', 4);
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('exist');
      cy.findByText('Vedleggstittel 3').should('exist');
      cy.findAllByText('test.txt').should('have.length', 4);
    });

    it('does not submit a deleted attachment without uploaded files', () => {
      prepareRepeatedAttachmentSubmission();
      cy.intercept('DELETE', '/fyllut/api/send-inn/nologin-application/attachments/**').as(
        'deleteUnuploadedAttachment',
      );
      getOtherAttachment().within(() => {
        cy.findByRole('button', { name: TEXTS.statiske.attachment.deleteAttachment }).click();
      });
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('not.exist');
      cy.findByText(TEXTS.statiske.attachment.attachmentTitle).should('not.exist');
      cy.get('@deleteUnuploadedAttachment.all').should('have.length', 0);

      submitWithoutDeletedAttachment();
    });

    it('lets you delete an uploaded attachment', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).click();
      });
      getOtherAttachment().within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
        uploadFileInCurrentScope('test.txt');
        cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
        cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
        uploadFileInCurrentScope('test.txt');
        cy.findAllByRole('button', { name: 'Slett filen' }).should('have.length', 2);
        cy.findAllByRole('button', { name: 'Slett filen' }).last().click();
      });
      cy.findAllByText('test.txt').should('have.length', 1);
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('not.exist');
      cy.findByText(TEXTS.statiske.attachment.attachmentTitle).should('not.exist');
    });

    it('is still valid after deleting the first attachment', () => {
      cy.findByRole('group', { name: 'Informasjon om din næringsinntekt fra Norge eller utlandet' }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadLater }).click();
      });
      getUploadOnlyAttachment().within(() => {
        uploadFileInCurrentScope('test.txt');
      });
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).click();
      });
      getOtherAttachment().within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
        uploadFileInCurrentScope('test.txt');
        cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
        cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
        uploadFileInCurrentScope('test.txt');
        cy.findAllByRole('button', { name: 'Slett filen' }).should('have.length', 2);
        cy.findAllByRole('button', { name: 'Slett filen' }).eq(1).click();
      });
      cy.findAllByText('test.txt').should('have.length', 2);
      cy.findAllByText(/^Vedleggstittel [12]$/).should('have.length', 1);
      cy.clickNextStep();
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.findByText('Du må fylle ut: Annen dokumentasjon').should('not.exist');
      // heading 'Vedlegg' is present without 'Opplysninger mangler'
      cy.findByRole('heading', { level: 3, name: 'Vedlegg' }).should('exist');
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
      const uploadedFileIds: string[] = [];
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-application/attachments/eiajfi8').as('uploadMainAttachment');
      cy.intercept('DELETE', '/fyllut/api/send-inn/nologin-application/attachments/eiajfi8/*').as(
        'deleteMainAttachmentFile',
      );
      cy.intercept('DELETE', '/fyllut/api/send-inn/nologin-application/attachments/eiajfi8').as(
        'deleteAllMainAttachmentFiles',
      );
      getMainAttachment().within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).click();
        [1, 2].forEach((fileCount) => {
          uploadFileInCurrentScope('test.txt');
          cy.wait<unknown, UploadedFile>('@uploadMainAttachment')
            .should(({ response }) => {
              expect(response?.statusCode).to.equal(201);
              expect(typeof response?.body.fileId).to.equal('string');
              expect(response?.body.fileId).to.not.equal('');
            })
            .then(({ response }) => {
              uploadedFileIds.push(response!.body.fileId);
            });
          cy.findAllByRole('button', { name: 'Slett filen' }).should('have.length', fileCount);
        });
        cy.findAllByText('test.txt').should('have.length', 2);
        cy.findByRole('button', { name: TEXTS.statiske.attachment.deleteAllFiles }).click();
      });
      cy.wait(['@deleteMainAttachmentFile', '@deleteMainAttachmentFile']).should((deletions) => {
        expect(deletions.map(({ response }) => response?.statusCode)).to.eql([204, 204]);
        expect(deletions.map(({ request }) => new URL(request.url).pathname)).to.eql(
          uploadedFileIds.map((fileId) => `/fyllut/api/send-inn/nologin-application/attachments/eiajfi8/${fileId}`),
        );
        expect(new Set(uploadedFileIds).size).to.equal(2);
      });
      cy.get('@deleteMainAttachmentFile.all').should('have.length', 2);
      cy.get('@deleteAllMainAttachmentFiles.all').should('have.length', 0);
      getMainAttachment().within(() => {
        cy.findByText('test.txt').should('not.exist');
        cy.findByRole('button', { name: 'Slett filen' }).should('not.exist');
        cy.findByRole('button', { name: TEXTS.statiske.attachment.deleteAllFiles }).should('not.exist');
        cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).should('be.visible');
      });
    });

    it('should remove all attachments on cancel', () => {
      cy.intercept('DELETE', '/fyllut/api/send-inn/nologin-application').as('deleteAllFiles');
      getMainAttachment().within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).click();
        uploadFileInCurrentScope('test.txt');
      });
      cy.findByText('test.txt').should('exist');
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).click();
      cy.findByRole('button', { name: TEXTS.grensesnitt.confirmDiscardPrompt.confirm }).click();
      cy.wait('@deleteAllFiles').its('response.statusCode').should('eq', 204);
    });
  });
});
