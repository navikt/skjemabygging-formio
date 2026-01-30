import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Digital submission without user login', () => {
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

  describe('Submission of application', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nologinform');
      cy.defaultWaits();
      cy.findByRole('link', { name: 'Kan ikke logge inn' }).click();
      cy.findByRole('link', { name: 'Send digitalt uten å logge inn' }).click();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.uploadFile('id-billy-bruker.jpg');
      cy.clickNextStep();

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
    });

    it('should submit application successfully', () => {
      cy.mocksUseRouteVariant('post-nologin-soknad:success-tc02');

      cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
        cy.findByLabelText('Jeg ettersender dokumentasjonen senere').check(),
      );

      cy.findByRole('group', { name: 'Bekreftelse på utdanning' }).within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );

      cy.uploadFile('another-small-file.txt', { id: 'e3xh1d' });

      cy.findByLabelText('Annen dokumentasjon').within(() => {
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check();
      });
      cy.findByLabelText('Gi vedlegget et beskrivende navn').type('Vitnemål');
      cy.uploadFile('small-file.txt', { id: 'en5h1c' });

      cy.findByRole('button', { name: 'Legg til nytt vedlegg' }).click();
      cy.findByRole('textbox', { name: 'Gi vedlegget et beskrivende navn' }).type('Egenerklæring');
      cy.uploadFile('small-file.txt', { id: 'en5h1c-1' });

      cy.clickNextStep();

      cy.clickSendNav();
      cy.findByRole('heading', { name: TEXTS.statiske.receipt.title }).should('exist');
      cy.findByRole('button', { name: 'Vis alle steg' }).should('not.exist');
      cy.findByRole('button', { name: 'Skjul alle steg' }).should('not.exist');
    });

    it('prevents further editing when navigating back after submission', () => {
      cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
        cy.findByLabelText('Jeg ettersender dokumentasjonen senere').check(),
      );

      cy.findByLabelText('Annen dokumentasjon').within(() =>
        cy.findByLabelText('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved').check(),
      );

      cy.findByLabelText('Bekreftelse på utdanning').within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );
      cy.uploadFile('another-small-file.txt');
      cy.clickNextStep();

      cy.clickSendNav();

      cy.findByText(TEXTS.statiske.receipt.title).should('exist');
      cy.findByRole('link', { name: TEXTS.statiske.receipt.downloadLinkLabel }).should('exist');
      cy.contains('b', 'Vi har mottatt følgende dokumenter')
        .parents('section')
        .within(() => {
          cy.get('ul[role="list"]').find('li').should('have.length.at.least', 1);
          cy.contains('li', 'Uinnlogget søknad').should('exist');
          cy.contains('li', 'Norsk pass').should('exist');
        });
      cy.contains('b', TEXTS.statiske.receipt.mustSendLaterHeading)
        .parents('section')
        .within(() => {
          cy.get('ul[role="list"]').find('li').should('have.length.at.least', 1);
        });
      cy.get('.aksel-alert--success').should('not.exist');
      cy.get('.aksel-alert--warning').should('exist').and('be.visible');

      cy.go('back');
      cy.findByText(TEXTS.statiske.error.alreadySubmitted).should('exist');
      cy.go('forward');
      cy.findByText(TEXTS.statiske.error.alreadySubmitted).should('exist');
    });
  });

  it('should clear id when navigating back from id upload page', () => {
    cy.visit('/fyllut/nologinform');
    cy.defaultWaits();
    cy.findByRole('link', { name: 'Kan ikke logge inn' }).click();
    cy.findByRole('link', { name: 'Send digitalt uten å logge inn' }).click();
    cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
      cy.findByLabelText('Norsk pass').check(),
    );
    cy.uploadFile('id-billy-bruker.jpg');
    cy.findByRole('button', { name: 'Slett filen' }).should('exist');
    cy.go('back');

    // have to choose the submission type again since the state is reset when going back
    cy.findByRole('link', { name: 'Kan ikke logge inn' }).click();
    cy.findByRole('link', { name: 'Send digitalt uten å logge inn' }).click();
    cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');
    cy.findByRole('button', { name: 'Slett filen' }).should('not.exist');

    cy.clickNextStep();
    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() => {
      cy.findByText(`Du må fylle ut: ${TEXTS.statiske.uploadId.label}`).should('exist');
    });
  });

  it('should redirect to id upload page on initial render of page', () => {
    cy.skipIfNoIncludeDistTests();

    cy.visit('/fyllut/nologinform/utdanning?sub=digitalnologin'); // <-- Directly visiting a later step in the form
    cy.defaultWaits();
    cy.url().should('include', '/fyllut/nologinform/legitimasjon?sub=digitalnologin');
    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).should('exist');
  });

  describe('Nologin service unavailable', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nologinform/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();
      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
    });

    it('shows service unavailable error when upload fails due to service unavailability', () => {
      cy.mocksUseRouteVariant('upload-file:service-unavailable');
      cy.uploadFile('id-billy-bruker.jpg');
      cy.findByText(TEXTS.statiske.nologin.temporarilyUnavailable).shouldBeVisible();
      cy.clickNextStep();
      cy.findByText(TEXTS.statiske.uploadId.missingUploadError).shouldBeVisible();
    });

    it('shows service unavailable error when submission fails due to service unavailability', () => {
      cy.mocksUseRouteVariant('post-nologin-soknad:service-unavailable');
      cy.uploadFile('id-billy-bruker.jpg');
      cy.clickNextStep();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
      cy.findByRole('heading', { name: /Dine opplysninger/ }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
        cy.findByLabelText('Ja').check(),
      );
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
      cy.clickNextStep();

      cy.findByRole('group', { name: 'Høyeste fullførte utdanning' }).within(() =>
        cy.findByLabelText('Videregående').check(),
      );
      cy.clickNextStep();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
        cy.findByLabelText(TEXTS.statiske.attachment.ettersender).check(),
      );
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.nei).check();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: /Oppsummering/ }).should('exist');
      cy.clickSendNav();
      cy.findByText(TEXTS.statiske.nologin.temporarilyUnavailable).shouldBeVisible();
    });
  });

  describe('Attachments', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nologinform/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();
      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );

      cy.uploadFile('id-billy-bruker.jpg');
      cy.clickNextStep();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
    });

    describe('Summary page', () => {
      it('shows titles, value and deadline for attachments with no uploads', () => {
        cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
          cy.findByLabelText(TEXTS.statiske.attachment.ettersender).check(),
        );
        cy.findByRole('group', {
          name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
        }).within(() => {
          cy.findByLabelText(TEXTS.statiske.attachment.nei).check();
        });
        cy.clickNextStep();
        cy.get('.aksel-form-summary')
          .eq(4)
          .within(() => {
            cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
            cy.findByText('Vedlegg med masse greier').should('exist');
            cy.findByText(TEXTS.statiske.attachment.ettersender).should('exist');
            cy.findByText('Bekreftelse på utdanning').should('not.exist');
            cy.findByText(
              'Hvis vi ikke har mottatt dette vedlegget innen 14 dager blir saken behandlet med de opplysningene som foreligger.',
            ).should('exist');
            cy.findByText('Annen dokumentasjon').should('exist');
            cy.findByText(TEXTS.statiske.attachment.nei).should('exist');
          });
      });

      it('shows file names and titles for attachments with uploads', () => {
        cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
          cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check(),
        );
        cy.uploadFile('id-billy-bruker.jpg');
        cy.findByRole('group', {
          name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
        }).within(() => {
          cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check();
        });

        cy.findByRole('textbox', { name: 'Gi vedlegget et beskrivende navn' }).type('Vitnemål');
        cy.findByRole('button', { name: 'Velg fil' }).click();
        cy.uploadFile('id-billy-bruker.jpg', { id: 'en5h1c' });
        cy.findByRole('button', { name: 'Legg til nytt vedlegg' }).click();
        cy.findByRole('textbox', { name: 'Gi vedlegget et beskrivende navn' }).type('Egenerklæring');
        cy.uploadFile('small-file.txt', { id: 'en5h1c-1' });
        cy.clickNextStep();

        cy.get('.aksel-form-summary')
          .eq(4)
          .within(() => {
            cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
            cy.findByText('Vedlegg med masse greier').should('exist');
            cy.findByText(TEXTS.statiske.attachment.leggerVedNaa).should('not.exist');
            cy.findByText(
              'Hvis vi ikke har mottatt dette vedlegget innen 14 dager blir saken behandlet med de opplysningene som foreligger.',
            ).should('not.exist');
            cy.findByText('Annen dokumentasjon').should('exist');
            cy.findByText('Vitnemål').should('exist');
            cy.findByText('Egenerklæring').should('exist');
            cy.findAllByText('test.txt').should('have.length', 3);
          });
      });
    });

    describe('Validation', () => {
      it('validates that all required fields are filled', () => {
        cy.clickNextStep();
        cy.get('[data-cy=error-summary]').should('exist');
        cy.get('[data-cy=error-summary]').within(() => {
          cy.findAllByRole('link').should('have.length', 2);
          cy.findByRole('link', { name: 'Du må fylle ut: Vedlegg med masse greier' }).should('exist');
          cy.findByRole('link', { name: 'Du må fylle ut: Annen dokumentasjon' }).should('exist');
        });

        cy.findByRole('link', { name: 'Oppsummering' }).click();
        cy.findByRole('heading', { name: 'VedleggOpplysninger mangler' }).should('exist');
        cy.findByRole('link', { name: 'Vedlegg' }).click();

        cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
          cy.findByLabelText(TEXTS.statiske.attachment.ettersender).check(),
        );
        cy.findByRole('group', {
          name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
        }).within(() => {
          cy.findByLabelText(TEXTS.statiske.attachment.nei).check();
        });

        cy.clickNextStep();
        cy.findByRole('heading', { name: 'VedleggOpplysninger mangler' }).should('not.exist');
        cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      });

      it('validates that files are uploaded for attachment', () => {
        cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
          cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check(),
        );
        cy.findByRole('group', {
          name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
        }).within(() => {
          cy.findByLabelText(TEXTS.statiske.attachment.nei).check();
        });

        cy.clickNextStep();
        cy.get('[data-cy=error-summary]').should('exist');
        cy.get('[data-cy=error-summary]').within(() => {
          cy.findAllByRole('link').should('have.length', 1);
          cy.findByRole('link', { name: 'Du må laste opp fil: Vedlegg med masse greier' }).should('exist');
        });
        cy.findByRole('link', { name: 'Oppsummering' }).click();
        cy.findByRole('heading', { name: 'VedleggOpplysninger mangler' }).should('exist');
        cy.findByRole('link', { name: 'Vedlegg' }).click();

        cy.uploadFile('small-file.txt', { id: 'eyobqqf' });
        cy.clickNextStep();
        cy.findByRole('heading', { name: 'VedleggOpplysninger mangler' }).should('not.exist');
        cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      });

      it('validates that files are uploaded for other attachment', () => {
        cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
          cy.findByLabelText(TEXTS.statiske.attachment.ettersender).check(),
        );
        cy.findByRole('group', {
          name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
        }).within(() => {
          cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check();
        });
        cy.clickNextStep();
        cy.get('[data-cy=error-summary]').should('exist');
        cy.get('[data-cy=error-summary]').within(() => {
          cy.findAllByRole('link').should('have.length', 1);
          cy.findByRole('link', { name: 'Du må laste opp fil: Annen dokumentasjon' }).should('exist');
        });
        cy.findByRole('link', { name: 'Oppsummering' }).click();
        cy.findByRole('heading', { name: 'VedleggOpplysninger mangler' }).should('exist');
        cy.findByRole('link', { name: 'Vedlegg' }).click();

        cy.clickNextStep();
        cy.findByRole('button', { name: 'Velg fil' }).click();
        cy.get('[data-cy=error-summary]').should('exist');
        cy.get('[data-cy=error-summary]').within(() => {
          cy.findAllByRole('link').should('have.length', 2);
          cy.findByRole('link', { name: 'Du må fylle ut: Gi vedlegget et beskrivende navn' }).should('exist');
        });
        cy.findByRole('textbox', { name: 'Gi vedlegget et beskrivende navn' }).type('Vitnemål');
        cy.get('[data-cy=error-summary]').should('not.exist');
        cy.findByRole('button', { name: 'Velg fil' }).click();
        cy.uploadFile('small-file.txt', { id: 'en5h1c' });
        cy.findByRole('button', { name: 'Legg til nytt vedlegg' }).click();
        cy.findByRole('textbox', { name: 'Gi vedlegget et beskrivende navn' }).type('Egenerklæring');
        cy.uploadFile('small-file.txt', { id: 'en5h1c-1' });
        cy.clickNextStep();
        cy.findByRole('heading', { name: 'VedleggOpplysninger mangler' }).should('not.exist');
        cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      });
    });
  });

  describe('Attachment in PDF', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nologinform/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();
    });

    it('includes signature and lists attachments in pdf, and submits application', () => {
      cy.mocksUseRouteVariant('post-familie-pdf:success-tc01');
      cy.mocksUseRouteVariant('post-nologin-soknad:success-tc01');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.uploadFile('id-billy-bruker.jpg');
      cy.clickNextStep();

      // standard fill start
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
      // standard fill end

      cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
        cy.findByLabelText('Jeg har levert denne dokumentasjonen tidligere').check(),
      );
      cy.findByRole('textbox', { name: 'Tilleggsinfo 3' }).type('Ble levert i fjor');

      cy.findByRole('group', { name: 'Bekreftelse på utdanning' }).within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );
      cy.uploadFile('another-small-file.txt', { id: 'e3xh1d' });

      cy.findByLabelText('Annen dokumentasjon').within(() =>
        cy.findByLabelText('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved').check(),
      );
      cy.clickNextStep();
      cy.clickSendNav();
      cy.findByText(TEXTS.statiske.receipt.title).should('exist');
      cy.findByRole('link', { name: TEXTS.statiske.receipt.downloadLinkLabel }).should('exist');
      cy.contains('b', 'Vi har mottatt følgende dokumenter')
        .parents('section')
        .within(() => {
          cy.get('ul[role="list"]').find('li').should('have.length.at.least', 1);
          cy.contains('li', 'Uinnlogget søknad').should('exist');
          cy.contains('li', 'Norsk pass').should('exist');
          cy.contains('li', 'Bekreftelse på utdanning').should('exist');
        });
      cy.get('.aksel-alert--success').should('exist').and('be.visible');
      cy.get('.aksel-alert--warning').should('not.exist');
    });

    it('does not include file for attachment that was hidden by condition after upload', () => {
      cy.mocksUseRouteVariant('post-familie-pdf:success');
      cy.mocksUseRouteVariant('post-nologin-soknad:success-tc05');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.uploadFile('id-billy-bruker.jpg');
      cy.clickNextStep();

      // standard fill start
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

      cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
        cy.findByLabelText('Jeg har levert denne dokumentasjonen tidligere').check(),
      );
      cy.findByRole('textbox', { name: 'Tilleggsinfo 3' }).type('Ble levert i fjor');

      cy.findByRole('group', { name: 'Bekreftelse på utdanning' }).within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );
      cy.uploadFile('another-small-file.txt', { id: 'e3xh1d' });

      cy.findByLabelText('Annen dokumentasjon').within(() =>
        cy.findByLabelText('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved').check(),
      );

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utdanning' }).click();

      cy.findByRole('group', { name: 'Høyeste fullførte utdanning' }).within(() =>
        cy.findByLabelText('Grunnskole').check(),
      );
      cy.clickNextStep();

      cy.findByText('Bekreftelse på utdanning').should('not.exist');

      cy.clickNextStep();
      cy.clickSendNav();
      cy.findByText(TEXTS.statiske.receipt.title).should('exist');
      cy.findByRole('link', { name: TEXTS.statiske.receipt.downloadLinkLabel }).should('exist');
      cy.contains('b', 'Vi har mottatt følgende dokumenter')
        .parents('section')
        .within(() => {
          cy.get('ul[role="list"]').find('li').should('have.length.at.least', 1);
          cy.contains('li', 'Uinnlogget søknad').should('exist');
          cy.contains('li', 'Norsk pass').should('exist');
          cy.contains('li', 'Bekreftelse på utdanning').should('not.exist');
        });
      cy.get('.aksel-alert--success').should('exist').and('be.visible');
      cy.get('.aksel-alert--warning').should('not.exist');
    });
  });

  describe('Session expired flow', () => {
    it('should redirect user to session expired page', () => {
      cy.visit('/fyllut/nologinform/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.clock(Date.now());
      cy.uploadFile('id-billy-bruker.jpg');
      cy.clickNextStep();

      cy.tick(3660000); // Move time forward by 1 hour and 1 minute (in ms)
      cy.findByRole('heading', { name: TEXTS.statiske.error.sessionExpired.title }).should('exist');
      cy.findByRole('link', { name: TEXTS.statiske.error.sessionExpired.buttonText }).click(); // start over

      cy.url().should('match', /.*\/fyllut\/nologinform$/);
      cy.findByRole('link', { name: 'Send digitalt' }).should('exist');
      cy.findByRole('link', { name: 'Kan ikke logge inn' }).should('exist');
    });
  });
});
