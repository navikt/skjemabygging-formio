import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Attachment', () => {
  const LABEL = 'Vedlegg';
  const LABEL_WITH_DESCRIPTION = 'Vedlegg med beskrivelse';
  const LABEL_OTHER = 'Annen dokumentasjon';
  const LABEL_REQUIRED = 'Vedlegg påkrevd';
  const LABEL_NOT_REQUIRED = 'Vedlegg ikke påkrevd';

  const VISNING_URL = '/fyllut/attachment/visning';
  const ANNET_URL = '/fyllut/attachment/annet';
  const VALIDERING_URL = '/fyllut/attachment/validering';
  const UPLOAD_ONLY_URL = '/fyllut/attachmentuploadonly/visning';
  const getUploadOnlyAttachment = () => cy.contains('[data-cy=attachment-upload]', 'Vedlegg upload-only');
  const getUploadOnlyOtherAttachment = () =>
    cy.contains('[data-cy=attachment-upload]', 'Annen dokumentasjon upload-only');

  const navigateToAttachmentsForDigitalNoLogin = () => {
    cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');
    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
      cy.findByLabelText('Norsk pass').check(),
    );
    cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
    cy.findByRole('link', { name: 'Neste steg' }).click();
    cy.url().then((url) => {
      if (url.includes('/legitimasjon')) {
        cy.findByRole('link', { name: 'Neste steg' }).click();
      }
    });
    cy.url().should('not.include', '/legitimasjon');
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Vedlegg' }).click();
    cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
  };

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit(`${VISNING_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('renders label and option group', () => {
      cy.findByRole('group', { name: LABEL }).should('exist');
    });

    it('renders enabled options for default type', () => {
      cy.findByRole('group', { name: LABEL }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('exist');
        cy.findByLabelText(TEXTS.statiske.attachment.ettersender).should('exist');
        cy.findByLabelText(TEXTS.statiske.attachment.levertTidligere).should('exist');
        cy.findAllByRole('radio').should('have.length', 3);
      });
    });

    it('can select an option', () => {
      cy.findByRole('group', { name: LABEL }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('not.be.checked').check();
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('be.checked');
      });
    });

    it('renders description', () => {
      cy.withinComponent(LABEL_WITH_DESCRIPTION, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });

    it('renders additionalDescription', () => {
      cy.withinComponent(LABEL_WITH_DESCRIPTION, () => {
        cy.contains('Dette er utvidet beskrivelse').should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains('Dette er utvidet beskrivelse').shouldBeVisible();
      });
    });
  });

  describe('Type other', () => {
    beforeEach(() => {
      cy.visit(`${ANNET_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('renders leggerVedNaa and nei options', () => {
      cy.withinComponent(LABEL_OTHER, () => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).should('exist');
        cy.findByLabelText(TEXTS.statiske.attachment.nei).should('exist');
        cy.findAllByRole('radio').should('have.length', 2);
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit(`${VALIDERING_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('validates required field', () => {
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(LABEL_REQUIRED).should('have.length', 2);
      cy.clickErrorMessageRequired(LABEL_REQUIRED);
      cy.findByRole('group', { name: LABEL_REQUIRED }).should('have.focus');
      cy.findByRole('group', { name: LABEL_REQUIRED }).within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.leggerVedNaa).check();
      });
      cy.findAllByErrorMessageRequired(LABEL_REQUIRED).should('have.length', 0);
    });

    it('does not validate when not required', () => {
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(LABEL_NOT_REQUIRED).should('have.length', 0);
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit(`${VISNING_URL}?sub=paper&lang=en`);
      cy.defaultWaits();
    });

    it('translates label', () => {
      cy.findByRole('group', { name: `${LABEL} (en)` }).should('exist');
    });

    it('translates description', () => {
      cy.withinComponent(`${LABEL_WITH_DESCRIPTION} (en)`, () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });

  describe('Upload-only digital mode', () => {
    beforeEach(() => {
      cy.defaultInterceptsMellomlagring();
      cy.visit(`${UPLOAD_ONLY_URL}?sub=digital`);
      cy.defaultWaits();
      cy.wait('@createMellomlagring').its('response.body.shouldUploadAttachmentsInFyllut').should('eq', true);
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });

    it('does not render uploadNow selector and shows upload button immediately', () => {
      cy.findByRole('group', { name: 'Vedlegg upload-only' }).should('not.exist');
      getUploadOnlyAttachment().within(() => {
        cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).should('exist');
      });
    });

    it('allows direct upload without selecting option first', () => {
      getUploadOnlyAttachment().within(() => {
        cy.uploadFile('small-file.txt');
      });
      cy.findByText('small-file.txt').should('exist');
    });
  });

  describe('Upload-only digital no login mode', () => {
    beforeEach(() => {
      cy.visit(`${UPLOAD_ONLY_URL}?sub=digitalnologin`);
      cy.defaultWaits();
      navigateToAttachmentsForDigitalNoLogin();
    });

    it('does not render uploadNow selector and shows upload button immediately', () => {
      cy.findByRole('group', { name: 'Vedlegg upload-only' }).should('not.exist');
      getUploadOnlyAttachment().within(() => {
        cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).should('exist');
      });
    });
  });

  describe('Upload-only type other', () => {
    beforeEach(() => {
      cy.defaultInterceptsMellomlagring();
      cy.visit(`${UPLOAD_ONLY_URL}?sub=digital`);
      cy.defaultWaits();
      cy.wait('@createMellomlagring').its('response.body.shouldUploadAttachmentsInFyllut').should('eq', true);
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });

    it('does not render uploadNow selector for other attachment and can upload directly', () => {
      cy.findByRole('group', { name: 'Annen dokumentasjon upload-only' }).should('not.exist');
      getUploadOnlyOtherAttachment().within(() => {
        cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Direkte opplasting');
        cy.uploadFile('test.txt');
      });
      cy.findByText('Direkte opplasting').should('exist');
      cy.findByText('test.txt').should('exist');
    });
  });

  describe('Upload-only validation', () => {
    beforeEach(() => {
      cy.defaultInterceptsMellomlagring();
      cy.visit(`${UPLOAD_ONLY_URL}?sub=digital`);
      cy.defaultWaits();
      cy.wait('@createMellomlagring').its('response.body.shouldUploadAttachmentsInFyllut').should('eq', true);
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });

    it('requires uploaded file even when selector is hidden', () => {
      cy.clickSaveAndContinue();
      cy.findAllByText('Du må laste opp fil: Vedlegg upload-only').should('have.length', 2);
    });
  });
});
