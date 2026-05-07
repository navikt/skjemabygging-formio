const ERROR_MESSAGE_MISSING_INNSENDING_OVERSKRIFT =
  'Du må fylle ut «Overskrift til innsending» under skjemainnstillinger før skjemaet kan publiseres.';
const ERROR_MESSAGE_MISSING_INNSENDING_FORKLARING =
  'Du må fylle ut «Forklaring til innsending» under skjemainnstillinger før skjemaet kan publiseres.';
const ERROR_MESSAGE_MISSING_INNSENDING_FIELDS =
  'Du må fylle ut «Overskrift til innsending» og «Forklaring til innsending» under skjemainnstillinger før skjemaet kan publiseres.';

type FormFixture = {
  properties: Record<string, unknown>;
  publishedAt?: string;
  publishedBy?: string;
  status?: string;
};

const visitFormPublicationPage = (propertiesOverride: Record<string, unknown> = {}) => {
  cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
  cy.intercept('GET', '/api/forms/nav112233/translations', { fixture: 'nav112233-translations.json' }).as(
    'getFormTranslations',
  );
  cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getGlobalTranslations');
  cy.intercept('POST', '/api/forms/nav112233/translations', (req) => {
    req.reply(201, req.body);
  }).as('saveTranslation');

  cy.fixture('nav112233.json').then((formJson: FormFixture) => {
    const form = {
      ...formJson,
      properties: {
        ...formJson.properties,
        ...propertiesOverride,
      },
    };

    cy.intercept('GET', '/api/forms/nav112233', form).as('getForm');
    cy.intercept('GET', '/api/form-publications/nav112233', form).as('getPublishedForm');
    cy.intercept('POST', '/api/form-publications/nav112233*', (req) => {
      req.reply(201, {
        changed: true,
        form: {
          ...form,
          publishedAt: '2025-02-15T10:12:55.354+01',
          publishedBy: 'testuser',
          status: 'published',
        },
      });
    }).as('publishFormRequest');

    cy.visit('forms/nav112233');
    cy.wait('@getForm');
    cy.wait('@getFormTranslations');
    cy.wait('@getPublishedForm');
    cy.wait('@getGlobalTranslations');
  });
};

const openPublishAndExpectBlockingMessage = (message: string) => {
  cy.findByRole('button', { name: 'Publiser' }).should('be.visible').click();
  cy.findByRole('heading', { name: 'Brukermelding' }).should('be.visible');
  cy.findByText(message).should('be.visible');
  cy.findByRole('heading', { name: 'Publiseringsinnstillinger' }).should('not.exist');
  cy.get('@publishFormRequest.all').should('have.length', 0);
};

describe('Form publication', () => {
  it('shows the last published date', () => {
    visitFormPublicationPage();

    cy.findByText('Sist publisert:').should('exist').next('p').should('contain', '14.02.25, kl. 14.47');
  });

  it('will publish the form with complete translations', () => {
    visitFormPublicationPage();

    cy.findByRole('button', { name: 'Publiser' }).should('be.visible').click();

    cy.findByRole('heading', { name: 'Publiseringsinnstillinger' }).should('be.visible');
    cy.findByRole('checkbox', { name: 'Norsk bokmål (NB)' }).should('be.disabled');
    cy.findByRole('checkbox', { name: 'Norsk nynorsk (NN)' }).should('not.be.disabled');
    cy.findByRole('checkbox', { name: 'Engelsk (EN)' }).should('be.disabled');
    cy.findByRole('checkbox', { name: 'Norsk bokmål (NB)' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Norsk nynorsk (NN)' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Engelsk (EN)' }).should('not.be.checked');
    cy.findByText('OBS! Engelsk (EN) vil bli avpublisert hvis du publiserer med disse innstillingene.').should(
      'be.visible',
    );

    cy.findAllByRole('button', { name: 'Publiser' }).last().click();
    cy.findByRole('heading', { name: 'Publiseringsadvarsel' }).should('exist');
    cy.findByRole('button', { name: 'Ja, publiser skjemaet' }).should('exist').click();
    cy.wait('@publishFormRequest');
    cy.findByText('Satt i gang publisering, dette kan ta noen minutter.').should('be.visible');
    cy.get('[data-cy=form-status]').should('contain.text', 'Status:Publisert');
    cy.findByText('Sist publisert:').should('exist').next('p').should('contain', '15.02.25, kl. 10.12');
  });

  it('will auto save unsaved global translations when publishing', () => {
    visitFormPublicationPage();

    cy.findByRole('button', { name: 'Publiser' }).should('be.visible').click();
    cy.findAllByRole('button', { name: 'Publiser' }).last().click();
    cy.findByRole('heading', { name: 'Publiseringsadvarsel' }).should('exist');
    cy.findByRole('button', { name: 'Ja, publiser skjemaet' }).should('exist').click();
    cy.wait('@saveTranslation').its('request.body').should('deep.equal', {
      key: 'Fornavn',
      nb: 'Fornavn',
      nn: 'Fornamn',
      en: 'First name',
      globalTranslationId: 674,
    });
    cy.wait('@saveTranslation').its('request.body').should('deep.equal', {
      key: 'Etternavn',
      nb: 'Etternavn',
      nn: 'Etternamn',
      en: 'Last name',
      globalTranslationId: 673,
    });
    cy.wait('@publishFormRequest');

    cy.get('[data-cy=form-status]').should('contain.text', 'Status:Publisert');
    cy.findByText('Sist publisert:').should('exist').next('p').should('contain', '15.02.25, kl. 10.12');
  });

  it('blocks publish when paper-no-cover-page submission is missing innsendingOverskrift', () => {
    visitFormPublicationPage({
      submissionTypes: [],
      innsendingOverskrift: '',
      innsendingForklaring: 'Gi skjemaet til pasienten',
    });

    openPublishAndExpectBlockingMessage(ERROR_MESSAGE_MISSING_INNSENDING_OVERSKRIFT);
  });

  it('blocks publish when paper-no-cover-page submission is missing innsendingForklaring', () => {
    visitFormPublicationPage({
      submissionTypes: [],
      innsendingOverskrift: 'Skriv ut skjemaet',
      innsendingForklaring: '',
    });

    openPublishAndExpectBlockingMessage(ERROR_MESSAGE_MISSING_INNSENDING_FORKLARING);
  });

  it('blocks publish when both paper-no-cover-page fields are missing', () => {
    visitFormPublicationPage({
      submissionTypes: [],
      innsendingOverskrift: '',
      innsendingForklaring: '',
    });

    openPublishAndExpectBlockingMessage(ERROR_MESSAGE_MISSING_INNSENDING_FIELDS);
  });

  it('treats whitespace-only paper-no-cover-page metadata as missing', () => {
    visitFormPublicationPage({
      submissionTypes: [],
      innsendingOverskrift: '   ',
      innsendingForklaring: 'Gi skjemaet til pasienten',
    });

    openPublishAndExpectBlockingMessage(ERROR_MESSAGE_MISSING_INNSENDING_OVERSKRIFT);
  });

  it('allows publish when paper-no-cover-page metadata is complete', () => {
    visitFormPublicationPage({
      submissionTypes: [],
      innsendingOverskrift: 'Skriv ut skjemaet',
      innsendingForklaring: 'Gi skjemaet til pasienten',
    });

    cy.findByRole('button', { name: 'Publiser' }).should('be.visible').click();
    cy.findByRole('heading', { name: 'Publiseringsinnstillinger' }).should('be.visible');
    cy.findAllByRole('button', { name: 'Publiser' }).last().click();
    cy.findByRole('heading', { name: 'Publiseringsadvarsel' }).should('exist');
    cy.findByRole('button', { name: 'Ja, publiser skjemaet' }).should('exist').click();
    cy.wait('@publishFormRequest');
  });

  it('will unpublish the form', () => {
    visitFormPublicationPage();

    cy.fixture('nav112233.json').then((formJson: FormFixture) => {
      cy.intercept('DELETE', '/api/form-publications/nav112233', (req) => {
        req.reply(201, {
          changed: true,
          form: {
            ...formJson,
            publishedAt: '2025-02-15T10:12:55.354+01',
            publishedBy: 'testuser',
            status: 'unpublished',
          },
        });
      }).as('unpublishFormRequest');
    });

    cy.findByRole('button', { name: 'Avpubliser' }).should('exist').click();
    cy.findByRole('heading', { name: 'Avpubliseringsadvarsel' }).should('exist');
    cy.findByRole('button', { name: 'Ja, avpubliser skjemaet' }).should('exist').click();
    cy.wait('@unpublishFormRequest');

    cy.findByText('Avpublisert:').should('exist').next('p').should('contain', '15.02.25, kl. 10.12');
  });
});
