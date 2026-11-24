import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const errorMessage = (label: string) => TEXTS.validering.containsUnsupportedCharacters.replace('{{field}}', label);
const requiredMessage = (label: string) => TEXTS.validering.required.replace('{{field}}', label);

const assertCharacterErrorAndRecovery = (label: string, invalid: string, valid = 'Plain text') => {
  const name = new RegExp(`^${label}( \\(valgfritt\\))?$`);
  const message = errorMessage(label);
  cy.findByRole('textbox', { name }).type(invalid);
  cy.clickNextStep();
  cy.findAllByText(message).should('have.length', 2);
  cy.findByRole('link', { name: message }).click();
  cy.findByRole('textbox', { name }).should('have.focus');
  cy.findByRole('textbox', { name }).should('have.value', invalid);
  cy.findByRole('textbox', { name }).clear();
  cy.findByRole('textbox', { name }).type(valid);
  cy.findAllByText(message).should('not.exist');
};

(['new', 'legacy'] as const).forEach((renderer) => {
  describe(`Supported characters (${renderer} renderer)`, () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      if (renderer === 'legacy') {
        cy.intercept('GET', '/fyllut/api/config*', (request) => {
          request.headers['accept-encoding'] = 'identity';
          delete request.headers['if-none-match'];
          request.continue((response) => {
            response.body.newRenderForms = [];
          });
        }).as('getConfig');
      }
    });

    [
      { path: 'textfield/validering', label: 'Tekstfelt ikke påkrevd', invalid: 'Hello 😀', valid: 'Hello! #1 *' },
      { path: 'textarea/validering', label: 'Tekstområde ikke påkrevd', invalid: 'First\nSecond\uF0B7' },
      { path: 'surname/validering', label: 'Etternavn ikke påkrevd', invalid: 'Name 🇳🇴', valid: 'Name' },
      { path: 'adresse/norskadresse', label: 'Vegadresse', invalid: 'Road 1️⃣', valid: 'Road 1' },
    ].forEach(({ path, label, invalid, valid }) => {
      it(`rejects unsupported characters in ${path} without changing the answer`, () => {
        cy.visit(`/fyllut/${path}?sub=paper`);
        cy.defaultWaits();
        assertCharacterErrorAndRecovery(label, invalid, valid);
      });
    });

    it('rejects emoji in an email address', () => {
      cy.visit('/fyllut/email/validering?sub=paper');
      cy.defaultWaits();
      const name = /^E-post ikke påkrevd/;
      cy.findByRole('textbox', { name }).type('😀@example.no');
      cy.clickNextStep();
      cy.findByRole('textbox', { name }).should('have.attr', 'aria-invalid', 'true');
      cy.findByRole('textbox', { name }).clear();
      cy.findByRole('textbox', { name }).type('person@example.no');
      cy.findByRole('textbox', { name }).should('not.have.attr', 'aria-invalid');
    });

    it('removes character errors when the field becomes hidden', () => {
      cy.defaultInterceptsMellomlagring();
      cy.visit('/fyllut/nestedconditions?sub=digital');
      cy.defaultWaits();
      cy.wait('@createMellomlagring');
      cy.clickStart();
      cy.findByRole('checkbox', { name: /^Root toggle/ }).check();
      cy.findByRole('checkbox', { name: /^Include expense details/ }).check();
      cy.findByRole('textbox', { name: 'Expense details' }).type('Receipt 😀');
      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: errorMessage('Expense details') }).should('exist');
      cy.findByRole('checkbox', { name: /^Include expense details/ }).uncheck();
      cy.findByRole('textbox', { name: 'Expense details' }).should('not.exist');
      cy.findAllByText(errorMessage('Expense details')).should('not.exist');
    });

    it('validates sender text fields beside the cover-page rule', () => {
      cy.visit('/fyllut/sender?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
      cy.findByRole('radiogroup', { name: /^Velg avsenderpanel/ }).within(() => {
        cy.findByRole('radio', { name: 'Person' }).check();
      });
      cy.clickNextStep();
      assertCharacterErrorAndRecovery('Representantens fornavn', 'Ola 😀', 'Ola');
    });

    it('validates additional documentation only while its option is selected', () => {
      cy.visit('/fyllut/supportedcharacters/vedlegg?sub=paper');
      cy.defaultWaits();
      cy.findByRole('radiogroup', { name: /^Upload documentation/ }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check();
      });
      assertCharacterErrorAndRecovery('Upload details', 'Details\u2028more', 'Plain text');
      cy.findByRole('textbox', { name: /^Upload details/ }).clear();
      cy.findByRole('textbox', { name: /^Upload details/ }).type('Details 😀');
      cy.clickNextStep();
      cy.findByRole('radiogroup', { name: /^Upload documentation/ }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.ettersender).check();
      });
      cy.findAllByText(errorMessage('Upload details')).should('not.exist');
    });

    it('validates and focuses additional documentation outside an attachment panel', () => {
      cy.visit('/fyllut/supportedcharacters/documentation?sub=paper');
      cy.defaultWaits();
      cy.findByRole('radiogroup', { name: /^Supporting documentation/ }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check();
      });
      assertCharacterErrorAndRecovery('Additional documentation', 'Receipt 😀');
    });

    it('keeps an invalid uploaded title editable while the user clears and retypes it', () => {
      cy.defaultInterceptsMellomlagring();
      cy.visit('/fyllut/attachmentuploadonly/visning?sub=digital');
      cy.defaultWaits();
      cy.wait('@createMellomlagring').its('response.statusCode').should('eq', 200);
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      const label = TEXTS.statiske.attachment.attachmentTitle;
      cy.findByRole('textbox', { name: label }).type('Title 😀');
      cy.intercept('POST', '**/fyllut/api/send-inn/digital-application/*/attachments/*').as('upload');
      cy.contains('[data-cy=attachment-upload]', 'Annen dokumentasjon upload-only').within(() => {
        cy.uploadFile('small-file.txt');
      });
      cy.wait('@upload').its('response.statusCode').should('eq', 201);
      cy.clickSaveAndContinue();
      cy.findAllByText(errorMessage(label)).should('exist');
      cy.contains('[data-cy=attachment-upload]', 'Annen dokumentasjon upload-only').within(() => {
        cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).should('not.exist');
      });
      cy.findByRole('textbox', { name: label }).clear();
      cy.findByRole('textbox', { name: label }).should('have.focus');
      cy.clickSaveAndContinue();
      cy.findAllByText(requiredMessage(label)).should('exist');
      cy.clickPreviousStep();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      cy.findByRole('textbox', { name: label }).should('have.value', '');
      cy.findByRole('textbox', { name: label }).type('Corrected title');
      cy.findAllByText(requiredMessage(label)).should('not.exist');
      cy.findAllByText(errorMessage(label)).should('not.exist');
    });

    it('shows only the invalid additional documentation after uploading a file', () => {
      cy.defaultInterceptsMellomlagring();
      cy.visit('/fyllut/supportedcharacters/vedlegg?sub=digital');
      cy.defaultWaits();
      cy.wait('@createMellomlagring').its('response.statusCode').should('eq', 200);
      cy.findByRole('radiogroup', { name: /^Upload documentation/ }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.uploadNow).check();
      });
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      const name = /^Upload details/;
      cy.findByRole('textbox', { name }).type('Details 😀');
      cy.intercept('POST', '**/fyllut/api/send-inn/digital-application/*/attachments/*').as('upload');
      cy.contains('[data-cy=attachment-upload]', 'Upload documentation').within(() => {
        cy.uploadFile('small-file.txt');
      });
      cy.wait('@upload').its('response.statusCode').should('eq', 201);
      cy.clickSaveAndContinue();
      cy.findAllByText(errorMessage('Upload details')).should('exist');
      cy.findByRole('radiogroup', { name: /^Upload documentation/ }).should('not.exist');
      cy.findByRole('link', { name: errorMessage('Upload details') }).click();
      cy.findByRole('textbox', { name }).should('have.focus');
      cy.findByRole('textbox', { name }).clear();
      cy.findByRole('textbox', { name }).should('have.focus').type('Corrected explanation');
      cy.findAllByText(errorMessage('Upload details')).should('not.exist');
    });

    it('shows the error message in the selected language', () => {
      cy.visit('/fyllut/textfield/validering?sub=paper&lang=en');
      cy.defaultWaits();
      cy.findByRole('textbox', { name: /^Tekstfelt ikke påkrevd/ }).type('Hello 😀');
      cy.clickNextStep();
      cy.findAllByText(/contains unsupported characters/).should('have.length', 2);
    });
  });
});
