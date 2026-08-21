import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

function fillPaperNoCoverPageToSummary(fieldName: string | RegExp = 'Tekstfelt', value = 'test') {
  cy.clickIntroPageConfirmation();
  cy.clickStart();
  cy.findByRole('textbox', { name: fieldName }).type(value);
  cy.clickNextStep();
  cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
  cy.findByLabelText('Vedlegg 1')
    .should('exist')
    .within(() => {
      cy.findByRole('radio', {
        name: RegExp(`${TEXTS.statiske.attachment.uploadLater}|${TEXTS.statiske.attachment.ettersender}`),
      })
        .should('exist')
        .check();
    });
  cy.clickNextStep();
  cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
}

function assertNoCoverPageSubmissionFlow(formPath: string, fieldName?: string | RegExp, value?: string) {
  fillPaperNoCoverPageToSummary(fieldName, value);
  cy.findByRole('link', { name: TEXTS.grensesnitt.navigation.instructions }).click();
  cy.url().should('include', `/${formPath}/ingen-innsending`);
  cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).should('exist');
}

function assertPaperSubmissionFlow(formPath: string, fieldName?: string | RegExp, value?: string) {
  fillPaperNoCoverPageToSummary(fieldName, value);
  cy.findByRole('link', { name: TEXTS.grensesnitt.navigation.instructions }).click();
  cy.url().should('include', `/${formPath}/send-i-posten`);
  cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).should('exist');
}

describe('Form navigation', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.mocksUseRouteVariant('post-soknad:success-hardcoded');
    cy.defaultIntercepts();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  const selectPaperAttachments = () => {
    cy.findByRole('group', { name: 'Nav skjema test' }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).click();
    });
    cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
    });
  };

  const uploadInAttachment = (attachmentLabel: string, fileName: string = 'test.txt') => {
    cy.contains('[data-cy=attachment-upload]', attachmentLabel).within(() => {
      cy.get('input[type=file]').last().selectFile(`cypress/fixtures/files/${fileName}`, { force: true });
    });
  };

  describe('Type: Paper', () => {
    beforeEach(() => {
      cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application').as('downloadPdf');
      cy.visit('/fyllut/formnavigationpaper?sub=paper');
      cy.defaultWaits();
    });

    it('Normal flow', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper?sub=paper');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/dineOpplysninger?sub=paper');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/vedlegg?sub=paper');
      selectPaperAttachments();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/oppsummering?sub=paper');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

      cy.findByRole('heading', { level: 2, name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/send-i-posten?sub=paper');
      cy.findByRole('button', { name: 'Last ned skjema' }).click();
      cy.wait('@downloadPdf');
    });

    it('Invalid data on summary page', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper?sub=paper');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/oppsummering?sub=paper');
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('exist');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
      cy.findAllByRole('link', { name: 'Fortsett utfylling' }).eq(1).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/dineOpplysninger?sub=paper');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/vedlegg?sub=paper');
      selectPaperAttachments();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/oppsummering?sub=paper');
      cy.findByRole('link', { name: 'Fortsett utfylling' }).should('not.exist');
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

      cy.findByRole('heading', { level: 2, name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/send-i-posten?sub=paper');
      cy.findByRole('button', { name: 'Last ned skjema' }).click();
      cy.wait('@downloadPdf');
    });

    it('Back buttons', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper?sub=paper');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/dineOpplysninger?sub=paper');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/vedlegg?sub=paper');
      selectPaperAttachments();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/oppsummering?sub=paper');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

      cy.findByRole('heading', { level: 2, name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/send-i-posten?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/oppsummering?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/vedlegg?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/dineOpplysninger?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
    });

    it('Cancel and delete buttons', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper?sub=paper');
      cy.findByRole('button', { name: 'Avbryt og slett' }).click();
      cy.findByRole('button', { name: 'Ja, avbryt og slett' }).click();
      cy.verifyNavRedirect();
      cy.go(-1);
      cy.wait('@getForm');
      cy.wait('@getTranslations');
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/dineOpplysninger?sub=paper');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('button', { name: 'Avbryt og slett' }).click();
      cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/vedlegg?sub=paper');
      selectPaperAttachments();
      cy.findByRole('button', { name: 'Avbryt og slett' }).click();
      cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/oppsummering?sub=paper');
      cy.findByRole('button', { name: 'Avbryt og slett' }).click();
      cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
      cy.findByRole('heading', { name: 'Du har ikke fylt ut all nødvendig informasjon' }).should('not.exist');

      cy.findByRole('heading', { level: 2, name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationpaper/send-i-posten?sub=paper');
      cy.findByRole('button', { name: 'Avslutt' }).click();
      cy.findByRole('button', { name: 'Ja, avslutt' }).click();

      cy.verifyNavRedirect();

      cy.go(-2);
      cy.wait('@getForm');
      cy.wait('@getTranslations');

      // Verify that the submissions is deleted and user cannot continue the form
      cy.findByRole('heading', { name: 'Du har ikke fylt ut all nødvendig informasjon' }).should('exist');
    });
  });

  describe('Type: Digital', () => {
    beforeEach(() => {
      cy.defaultInterceptsMellomlagring();
      cy.intercept('POST', '/fyllut/api/send-inn/digital-application/*').as('submitApplication');
    });

    describe('Digital with attachments', () => {
      beforeEach(() => {
        cy.visit('/fyllut/formnavigationdigital?sub=digital');
        cy.defaultWaits();
        cy.wait('@createMellomlagring');
      });

      it('Normal flow', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital?sub=digital');
        cy.url().should('include', 'innsendingsId=');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/dineOpplysninger?sub=digital');
        cy.url().should('include', 'innsendingsId=');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/vedlegg?sub=digital');
        cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/oppsummering?sub=digital&innsendingsId=');

        cy.clickSendNav();
        cy.wait('@submitApplication');
        cy.findByRole('heading', { name: 'Kvittering' }).should('exist');
      });

      it('Invalid data on summary page', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital?sub=digital');
        cy.clickShowAllSteps();
        cy.findByRole('link', { name: 'Oppsummering' }).click();

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/oppsummering?sub=digital');
        cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
        cy.clickSendNav();
        cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('exist');
        cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
        cy.findAllByRole('link', { name: 'Fortsett utfylling' }).eq(1).click();

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/dineOpplysninger?sub=digital');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/vedlegg?sub=digital');
        cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/oppsummering?sub=digital');
        cy.findByRole('link', { name: 'Fortsett utfylling' }).should('not.exist');
        cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');

        cy.clickSendNav();
        cy.wait('@submitApplication');
        cy.findByRole('heading', { name: 'Kvittering' }).should('exist');
      });

      it('Back buttons', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital?sub=digital');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/dineOpplysninger?sub=digital');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/vedlegg?sub=digital');
        cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/oppsummering?sub=digital');
        cy.findByRole('link', { name: 'Forrige steg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/vedlegg?sub=digital');
        cy.findByRole('link', { name: 'Forrige steg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/dineOpplysninger?sub=digital');
        cy.findByRole('link', { name: 'Forrige steg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital?sub=digital');
        cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
      });

      it('Cancel and delete buttons', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital?sub=digital');
        cy.findByRole('button', { name: 'Avbryt og slett' }).click();
        cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/dineOpplysninger?sub=digital');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('button', { name: 'Avbryt og slett' }).click();
        cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/vedlegg?sub=digital');
        cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
          cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
        });
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigital/oppsummering?sub=digital');
        cy.intercept('DELETE', '/fyllut/api/send-inn/soknad/*').as('deleteMellomlagring');

        cy.findByRole('button', { name: 'Avbryt og slett' }).click();
        cy.findByRole('button', { name: 'Ja, avbryt og slett utkast' }).click();
        cy.wait('@deleteMellomlagring');

        cy.verifyNavRedirect();

        cy.go(-1);
        cy.wait('@getForm');
        cy.wait('@getTranslations');

        // Verify that the submissions is deleted and user cannot continue the form
        cy.findByRole('heading', { name: 'Du har ikke fylt ut all nødvendig informasjon' }).should('exist');
      });
    });

    describe('Digital without attachments', () => {
      beforeEach(() => {
        cy.visit('/fyllut/formnavigationdigitalnoattachments?sub=digital');
        cy.defaultWaits();
        cy.wait('@createMellomlagring');
      });

      it('Normal flow', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationdigitalnoattachments?sub=digital');
        cy.url().should('include', 'innsendingsId=');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should(
          'include',
          '/fyllut/formnavigationdigitalnoattachments/dineOpplysninger?sub=digital&innsendingsId=',
        );
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should(
          'include',
          '/fyllut/formnavigationdigitalnoattachments/oppsummering?sub=digital&innsendingsId=',
        );

        cy.clickSendNav();
        cy.wait('@submitApplication');
        cy.findByRole('heading', { name: 'Kvittering' }).should('exist');
      });
    });

    describe('Digital with existing id', () => {
      beforeEach(() => {
        cy.mocksUseRouteVariant('get-soknad:success-stdigital');
        cy.visit('/fyllut/formnavigationdigital?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878');
        cy.defaultWaits();
        cy.wait('@getMellomlagring');
      });

      it('Save buttons', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should(
          'include',
          '/fyllut/formnavigationdigital?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878',
        );
        cy.findByRole('button', { name: 'Lagre utkast og fortsett senere' }).click();
        cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should(
          'include',
          '/fyllut/formnavigationdigital/dineOpplysninger?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878',
        );
        cy.findByRole('button', { name: 'Lagre utkast og fortsett senere' }).click();
        cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
          cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
        });
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should(
          'include',
          '/fyllut/formnavigationdigital/oppsummering?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878',
        );
        cy.findByRole('button', { name: 'Lagre utkast og fortsett senere' }).click();
        cy.findByRole('button', { name: 'Ja, lagre og fortsett senere' }).click();
        cy.wait('@updateMellomlagring');

        cy.verifyNavRedirect();
      });
    });

    describe('Digital with attachment upload flow', () => {
      beforeEach(() => {
        cy.mocksUseRouteVariant('post-soknad:success');
        cy.intercept('POST', '/fyllut/api/send-inn/digital-application/*').as('submitApplication');

        cy.visit('/fyllut/formwithattachments?sub=digital');
        cy.defaultWaits();
        cy.wait('@createMellomlagring');
      });

      it('Renders attachments page', () => {
        cy.clickShowAllSteps();
        cy.findByRole('link', { name: 'Vedlegg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).should('exist');
        cy.findByRole('link', { name: 'Forrige steg' }).should('exist');
      });

      it('Normal flow', () => {
        cy.clickIntroPageConfirmation();
        cy.clickSaveAndContinue();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.clickSaveAndContinue();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Diverse' }).should('exist');
        cy.findByRole('group', { name: /Radiopanel 1/ }).within(() => cy.findByLabelText('Radiovalg 1').check());
        cy.clickSaveAndContinue();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.findByRole('group', { name: /Vedlegg 1/ }).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadLater }).check();
        });
        cy.findByRole('group', { name: /Vedlegg 2/ }).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadLater }).check();
        });
        uploadInAttachment('Vedlegg upload-only');
        cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.nei }).check();
        });
        cy.clickSaveAndContinue();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.clickSendNav();
        cy.wait('@submitApplication');

        cy.findByRole('heading', { level: 2, name: 'Kvittering' }).should('exist');
        cy.findByRole('link', { name: 'Gå til Min side' }).should('exist');
      });
    });
  });

  describe('Type: Digital, no login', () => {
    beforeEach(() => {
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-application').as('nologinSubmit');
      cy.visit('/fyllut/formnavigationdigitalnologin/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();

      cy.findByRole('heading', { level: 2, name: 'Legitimasjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/legitimasjon?sub=digitalnologin');
      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-application/attachments/personal-id').as('uploadIdFile');
      cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
      cy.wait('@uploadIdFile');
      cy.findByRole('link', { name: 'Neste steg' }).click();
    });

    it('Normal flow', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin?sub=digitalnologin');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/dineOpplysninger?sub=digitalnologin');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/vedlegg?sub=digitalnologin');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/oppsummering?sub=digitalnologin');
      cy.findByRole('link', { name: 'Send til Nav' }).click();
      cy.wait('@nologinSubmit');
    });

    it('Invalid data on summary page', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin?sub=digitalnologin');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/oppsummering?sub=digitalnologin');
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
      cy.findByRole('link', { name: 'Send til Nav' }).click();
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('exist');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
      cy.findAllByRole('link', { name: 'Fortsett utfylling' }).eq(1).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/dineOpplysninger?sub=digitalnologin');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/vedlegg?sub=digitalnologin');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/oppsummering?sub=digitalnologin');
      cy.findByRole('link', { name: 'Fortsett utfylling' }).should('not.exist');
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
      cy.findByRole('link', { name: 'Send til Nav' }).click();
      cy.wait('@nologinSubmit');
    });

    it('Back buttons', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin?sub=digitalnologin');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/dineOpplysninger?sub=digitalnologin');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/vedlegg?sub=digitalnologin');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/oppsummering?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/vedlegg?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/dineOpplysninger?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplasting av ID' }).click();

      cy.findByRole('heading', { level: 2, name: 'Legitimasjon' }).should('exist');
      cy.url().should('include', '/fyllut/formnavigationdigitalnologin/legitimasjon?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
    });
  });

  describe('Type: Paper, no cover page', () => {
    describe('Legacy None flow (empty submissionTypes array)', () => {
      beforeEach(() => {
        cy.intercept('POST', '/fyllut/api/documents/application').as('downloadPdf');
        cy.visit('/fyllut/formnavigationnone');
        cy.defaultWaits();
      });

      it('Normal legacy flow', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationnone');
        cy.findByRole('link', { name: 'Neste steg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationnone/dineOpplysninger');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Neste steg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationnone/vedlegg');
        cy.findByRole('group', { name: /Nav skjema test/ }).within(() =>
          cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
        );
        cy.findByLabelText('Annen dokumentasjon').within(() => {
          cy.findByLabelText('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved').check();
        });
        cy.findByRole('link', { name: 'Neste steg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationnone/oppsummering');
        cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

        cy.findByRole('heading', { level: 1, name: 'Submission Type: None' }).should('exist');
        cy.url().should('include', '/fyllut/formnavigationnone/ingen-innsending');
        cy.findByRole('button', { name: 'Last ned skjema' }).click();
        cy.wait('@downloadPdf');

        cy.findByRole('link', { name: 'Forrige steg' }).should('exist');
      });
    });

    describe('Normal flow with submission method PAPER_NO_COVER_PAGE', () => {
      describe('Type: Paper No Cover Page', () => {
        const paperNoCoverPageFormPath = 'papernocoverpage';

        beforeEach(() => {
          cy.visit(`/fyllut/${paperNoCoverPageFormPath}`);
          cy.defaultWaits();
        });

        it('handles query param sub=papernocoverpage', () => {
          cy.visit(`/fyllut/${paperNoCoverPageFormPath}?sub=papernocoverpage`);
          cy.defaultWaits();
          cy.url().should('include', 'sub=papernocoverpage');

          assertNoCoverPageSubmissionFlow(paperNoCoverPageFormPath);
        });

        it('does not require query param sub=papernocoverpage when it is the only available', () => {
          cy.url().should('not.include', '?');
          assertNoCoverPageSubmissionFlow(paperNoCoverPageFormPath);
        });
      });

      describe('Type: Paper and Paper No Cover Page', () => {
        const paperAndPaperNoCoverPageFormPath = 'papernocoverpagepaper';

        it('redirects default to sub=paper when sub is missing (INCLUDE_DIST_TESTS)', () => {
          // cy.skipIfNoIncludeDistTests(); // because the redirect happens in backend

          cy.visit(`/fyllut/${paperAndPaperNoCoverPageFormPath}?sub=paper`);
          cy.defaultWaits();
          cy.url().should('include', 'sub=paper');

          assertPaperSubmissionFlow(paperAndPaperNoCoverPageFormPath);
        });

        it('sub=papernocoverpage is required when form has multiple submission types', () => {
          cy.visit(`/fyllut/${paperAndPaperNoCoverPageFormPath}?sub=papernocoverpage`);
          cy.defaultWaits();
          cy.url().should('include', 'sub=papernocoverpage');

          assertNoCoverPageSubmissionFlow(paperAndPaperNoCoverPageFormPath);
        });
      });

      describe('Type: Digital and Paper No Cover Page', () => {
        const digitalAndPaperNoCoverPageFormPath = 'papernocoverpagedigital';

        it('uses sub=papernocoverpage for the no-cover-page flow', () => {
          cy.visit(`/fyllut/${digitalAndPaperNoCoverPageFormPath}?sub=papernocoverpage`);
          cy.defaultWaits();
          cy.url().should('include', 'sub=papernocoverpage');

          assertNoCoverPageSubmissionFlow(digitalAndPaperNoCoverPageFormPath);
        });
      });
    });
  });

  describe('Browser Navigation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/formnavigationcypress101/skjema?sub=paper');
      cy.defaultWaits();
    });

    it('Navigation with browser back and forward buttons', () => {
      cy.findByRole('heading', { name: 'Skjema for Cypress-testing' }).should('exist');
      cy.findByRole('heading', { level: 2, name: 'Veiledning' }).should('exist');

      cy.clickNextStep();
      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');

      cy.findByText('Har du norsk fødselsnummer eller D-nummer?').should('exist');
      cy.findByRole('textbox', { name: 'Velg måned' }).should('exist');

      cy.go('back');
      cy.findByRole('heading', { level: 2, name: 'Veiledning' }).should('exist');

      cy.go('forward');
      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
    });
  });
});
