import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Form navigation', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Type: Paper', () => {
    beforeEach(() => {
      cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application').as('downloadPdf');
      cy.visit('/fyllut/stpaper?sub=paper');
      cy.defaultWaits();
    });

    it('Normal flow', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper?sub=paper');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/dineOpplysninger?sub=paper');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/vedlegg?sub=paper');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/oppsummering?sub=paper');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

      cy.findByRole('heading', { level: 2, name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/send-i-posten?sub=paper');
      cy.findByRole('button', { name: 'Last ned skjema' }).click();
      cy.wait('@downloadPdf');
    });

    it('Invalid data on summary page', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper?sub=paper');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/oppsummering?sub=paper');
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('exist');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
      cy.findAllByRole('link', { name: 'Fortsett utfylling' }).eq(1).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/dineOpplysninger?sub=paper');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/vedlegg?sub=paper');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/oppsummering?sub=paper');
      cy.findByRole('link', { name: 'Fortsett utfylling' }).should('not.exist');
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

      cy.findByRole('heading', { level: 2, name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/send-i-posten?sub=paper');
      cy.findByRole('button', { name: 'Last ned skjema' }).click();
      cy.wait('@downloadPdf');
    });

    it('Back buttons', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper?sub=paper');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/dineOpplysninger?sub=paper');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/vedlegg?sub=paper');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/oppsummering?sub=paper');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

      cy.findByRole('heading', { level: 2, name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/send-i-posten?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/oppsummering?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/vedlegg?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/dineOpplysninger?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper?sub=paper');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
    });

    it('Cancel and delete buttons', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper?sub=paper');
      cy.findByRole('button', { name: 'Avbryt og slett' }).click();
      cy.findByRole('button', { name: 'Ja, avbryt og slett' }).click();
      cy.verifyNavRedirect();
      cy.go(-1);
      cy.wait('@getForm');
      cy.wait('@getTranslations');
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/dineOpplysninger?sub=paper');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('button', { name: 'Avbryt og slett' }).click();
      cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/vedlegg?sub=paper');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('button', { name: 'Avbryt og slett' }).click();
      cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/oppsummering?sub=paper');
      cy.findByRole('button', { name: 'Avbryt og slett' }).click();
      cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
      cy.findByRole('heading', { name: 'Du har ikke fylt ut all nødvendig informasjon' }).should('not.exist');

      cy.findByRole('heading', { level: 2, name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.url().should('include', '/fyllut/stpaper/send-i-posten?sub=paper');
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
      cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad').as('submitMellomlagring');
    });

    describe('Digital with attachments', () => {
      beforeEach(() => {
        cy.visit('/fyllut/stdigital?sub=digital');
        cy.defaultWaits();
        cy.wait('@createMellomlagring');
      });

      it('Normal flow', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital?sub=digital&innsendingsId=');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/dineOpplysninger?sub=digital&innsendingsId=');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/oppsummering?sub=digital&innsendingsId=');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@submitMellomlagring');
        cy.verifySendInnRedirect();
      });

      it('Invalid data on summary page', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital?sub=digital');
        cy.clickShowAllSteps();
        cy.findByRole('link', { name: 'Oppsummering' }).click();

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/oppsummering?sub=digital');
        cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('exist');
        cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
        cy.findAllByRole('link', { name: 'Fortsett utfylling' }).eq(1).click();

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/dineOpplysninger?sub=digital');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/oppsummering?sub=digital');
        cy.findByRole('link', { name: 'Fortsett utfylling' }).should('not.exist');
        cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@submitMellomlagring');

        cy.verifySendInnRedirect();
      });

      it('Back buttons', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital?sub=digital');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/dineOpplysninger?sub=digital');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/oppsummering?sub=digital');
        cy.findByRole('link', { name: 'Forrige steg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/dineOpplysninger?sub=digital');
        cy.findByRole('link', { name: 'Forrige steg' }).click();

        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital?sub=digital');
        cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
      });

      it('Cancel and delete buttons', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital?sub=digital');
        cy.findByRole('button', { name: 'Avbryt og slett' }).click();
        cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/dineOpplysninger?sub=digital');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('button', { name: 'Avbryt og slett' }).click();
        cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital/oppsummering?sub=digital');
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
        cy.visit('/fyllut/stdigitalnoattachments?sub=digital');
        cy.defaultWaits();
        cy.wait('@createMellomlagring');
      });

      it('Normal flow', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/stdigitalnoattachments?sub=digital&innsendingsId=');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should('include', '/fyllut/stdigitalnoattachments/dineOpplysninger?sub=digital&innsendingsId=');
        cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should('include', '/fyllut/stdigitalnoattachments/oppsummering?sub=digital&innsendingsId=');

        cy.findByRole('link', { name: 'Send til Nav' }).click();
        cy.wait('@submitMellomlagring');
      });
    });

    describe('Digital with existing id', () => {
      beforeEach(() => {
        cy.mocksUseRouteVariant('get-soknad:success-stdigital');
        cy.visit('/fyllut/stdigital?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878');
        cy.defaultWaits();
        cy.wait('@getMellomlagring');
      });

      it('Save buttons', () => {
        cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
        cy.url().should('include', '/fyllut/stdigital?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878');
        cy.findByRole('button', { name: 'Lagre utkast og fortsett senere' }).click();
        cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
        cy.url().should(
          'include',
          '/fyllut/stdigital/dineOpplysninger?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878',
        );
        cy.findByRole('button', { name: 'Lagre utkast og fortsett senere' }).click();
        cy.findByRole('button', { name: 'Nei, fortsett utfylling' }).click();
        cy.findByRole('link', { name: 'Lagre og fortsett' }).click();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
        cy.url().should(
          'include',
          '/fyllut/stdigital/oppsummering?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878',
        );
        cy.findByRole('button', { name: 'Lagre utkast og fortsett senere' }).click();
        cy.findByRole('button', { name: 'Ja, lagre og fortsett senere' }).click();
        cy.wait('@updateMellomlagring');

        cy.verifyNavRedirect();
      });
    });
  });

  describe('Type: Digital, no login', () => {
    beforeEach(() => {
      cy.mocksUseRouteVariant('post-nologin-soknad:success');
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-soknad').as('nologinSubmit');
      cy.visit('/fyllut/stnologin/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();

      cy.findByRole('heading', { level: 2, name: 'Legitimasjon' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/legitimasjon?sub=digitalnologin');
      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.intercept('POST', '/fyllut/api/nologin-file?attachmentId=personal-id').as('uploadIdFile');
      cy.get('input[type=file]').selectFile('cypress/fixtures/files/id-billy-bruker.jpg', { force: true });
      cy.wait('@uploadIdFile');
      cy.findByRole('link', { name: 'Neste steg' }).click();
    });

    it('Normal flow', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin?sub=digitalnologin');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/dineOpplysninger?sub=digitalnologin');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/vedlegg?sub=digitalnologin');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/oppsummering?sub=digitalnologin');
      cy.findByRole('link', { name: 'Send til Nav' }).click();
      cy.wait('@nologinSubmit');
    });

    it('Invalid data on summary page', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin?sub=digitalnologin');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/oppsummering?sub=digitalnologin');
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
      cy.findByRole('link', { name: 'Send til Nav' }).click();
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('exist');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
      cy.findAllByRole('link', { name: 'Fortsett utfylling' }).eq(1).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/dineOpplysninger?sub=digitalnologin');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/vedlegg?sub=digitalnologin');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/oppsummering?sub=digitalnologin');
      cy.findByRole('link', { name: 'Fortsett utfylling' }).should('not.exist');
      cy.contains('Du må fullføre utfyllingen før du kan fortsette').should('not.exist');
      cy.findByRole('link', { name: 'Send til Nav' }).click();
      cy.wait('@nologinSubmit');
    });

    it('Back buttons', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin?sub=digitalnologin');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/dineOpplysninger?sub=digitalnologin');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/vedlegg?sub=digitalnologin');
      cy.findByLabelText(TEXTS.statiske.attachment.nei).click();
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/oppsummering?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/vedlegg?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/dineOpplysninger?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin?sub=digitalnologin');
      cy.findByRole('link', { name: 'Forrige steg' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplasting av ID' }).click();

      cy.findByRole('heading', { level: 2, name: 'Legitimasjon' }).should('exist');
      cy.url().should('include', '/fyllut/stnologin/legitimasjon?sub=digitalnologin');
    });
  });

  describe('Type: None', () => {
    beforeEach(() => {
      cy.intercept('POST', '/fyllut/api/documents/application').as('downloadPdf');
      cy.visit('/fyllut/stnone');
      cy.defaultWaits();
    });

    it('Normal flow', () => {
      cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
      cy.url().should('include', '/fyllut/stnone');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      cy.url().should('include', '/fyllut/stnone/dineOpplysninger');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
      cy.findByRole('link', { name: 'Neste steg' }).click();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.url().should('include', '/fyllut/stnone/oppsummering');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();

      cy.findByRole('heading', { level: 1, name: 'Submission Type: None' }).should('exist');
      cy.url().should('include', '/fyllut/stnone/ingen-innsending');
      cy.findByRole('button', { name: 'Last ned skjema' }).click();
      cy.wait('@downloadPdf');

      cy.findByRole('link', { name: 'Forrige steg' }).should('exist');
    });
  });

  describe('Browser Navigation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/cypress101/skjema?sub=paper');
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
