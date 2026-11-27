import { FormPropertiesType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

/*
 * The Skyra script is loaded by Nav's decorator, which is disabled in these tests.
 * The tests therefore verify that Fyllut renders the <skyra-survey> element with the configured slug.
 */
const SKYRA_SLUG = 'fyllut-cypress-survey';
const NO_LOGIN_FORM_PATH = 'sender';

const configureRuntime = (legacy: boolean, cluster = 'dev-gcp', isLoggedIn = true) => {
  cy.intercept('GET', '/fyllut/api/config*', (req) => {
    req.headers['accept-encoding'] = 'identity';
    delete req.headers['if-none-match'];
    delete req.headers['if-modified-since'];
    req.continue((res) => {
      if (typeof res.body === 'object' && res.body !== null) {
        res.body.newRenderForms = legacy ? [] : ['*'];
        res.body.NAIS_CLUSTER_NAME = cluster;
        res.body.isLoggedIn = isLoggedIn;
      }
    });
  }).as('getConfig');
};

const submitToReceipt = (formPath: string) => {
  cy.visit(`/fyllut/${formPath}?sub=digital`);
  cy.defaultWaits();
  cy.wait('@createMellomlagring');

  cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
  cy.clickSaveAndContinue();
  cy.wait('@updateMellomlagring');

  cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
  cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
  cy.clickSaveAndContinue();
  cy.wait('@updateMellomlagring');

  cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
  cy.clickSendNav();
  cy.wait('@submitApplication').its('response.statusCode').should('eq', 200);
  cy.findByRole('heading', { level: 2, name: 'Kvittering' }).should('exist');
};

const submitWithoutLoginToReceipt = () => {
  cy.intercept('POST', '/fyllut/api/captcha').as('createNoLoginToken');
  cy.intercept('POST', '/fyllut/api/send-inn/nologin-application/attachments/personal-id').as('uploadIdFile');
  cy.intercept('POST', '/fyllut/api/send-inn/nologin-application').as('submitNoLoginApplication');
  cy.visit(`/fyllut/${NO_LOGIN_FORM_PATH}/legitimasjon?sub=digitalnologin`);
  cy.defaultWaits();

  cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).check();
  cy.uploadFile('small-file.txt', { verifyUpload: true });
  cy.wait('@createNoLoginToken').its('response.statusCode').should('eq', 200);
  cy.wait('@uploadIdFile').its('response.statusCode').should('eq', 201);
  cy.clickNextStep();

  cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
  cy.clickIntroPageConfirmation();
  cy.clickNextStep();
  cy.findByRole('radio', { name: 'Organisasjon', exact: true }).check();
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Organisasjon' }).should('exist');
  cy.findByRole('textbox', {
    name: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
  }).type('889640782');
  cy.findByRole('textbox', { name: 'Virksomhetens navn' }).type('Test organization');
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
  cy.get('[data-uxsignals-embed]').should('not.exist');
  cy.clickSendNav();
  cy.wait('@submitNoLoginApplication').its('response.statusCode').should('eq', 200);
  cy.findByRole('heading', { level: 2, name: 'Kvittering' }).should('exist');
  cy.get('@createMellomlagring.all').should('have.length', 0);
};

describe('Surveys on receipt page', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.mocksUseRouteVariant('post-soknad:success-hardcoded');
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.intercept('POST', '/fyllut/api/send-inn/digital-application/*').as('submitApplication');
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('New renderer', () => {
    it('renders the survey when the form has a Skyra slug', () => {
      submitToReceipt('skyrasurvey');
      cy.get('skyra-survey').should('have.length', 1).and('have.attr', 'slug', SKYRA_SLUG);
    });

    it('does not render the survey when the form has no Skyra slug', () => {
      submitToReceipt('skyrasurveynoslug');
      cy.get('skyra-survey').should('not.exist');
    });
  });

  describe('Legacy renderer', () => {
    beforeEach(() => {
      configureRuntime(true);
    });

    it('renders the survey when the form has a Skyra slug', () => {
      submitToReceipt('skyrasurvey');
      cy.get('skyra-survey').should('have.length', 1).and('have.attr', 'slug', SKYRA_SLUG);
    });

    it('does not render the survey when the form has no Skyra slug', () => {
      submitToReceipt('skyrasurveynoslug');
      cy.get('skyra-survey').should('not.exist');
    });
  });

  describe('UX Signals on receipt page', () => {
    const studyId = 'panel-cypress-receipt';
    const widgetSelector = '[data-uxsignals-embed]';
    const configureStudy = (
      properties: Pick<FormPropertiesType, 'uxSignalsId' | 'uxSignalsSubmissionTypes'>,
      formPath = 'skyrasurvey',
    ) => {
      cy.intercept({ method: 'GET', pathname: `/fyllut/api/forms/${formPath}` }, (req) => {
        delete req.headers['if-none-match'];
        delete req.headers['if-modified-since'];
        req.continue((res) => {
          expect(res.statusCode).to.eq(200);
          res.headers['cache-control'] = 'no-store';
          Object.assign(res.body.properties, properties);
        });
      }).as('getForm');
    };

    beforeEach(() => {
      cy.intercept('GET', 'https://widget.uxsignals.com/embed.js', {
        statusCode: 200,
        headers: { 'content-type': 'application/javascript' },
        body: '',
      }).as('loadUxSignals');
    });

    [
      { name: 'New renderer', legacy: false },
      { name: 'Legacy renderer', legacy: true },
    ].forEach(({ name, legacy }) => {
      describe(`${name}`, () => {
        beforeEach(() => {
          configureRuntime(legacy);
        });

        ['dev-gcp', 'prod-gcp'].forEach((cluster) => {
          it(`loads the configured study in ${cluster === 'prod-gcp' ? 'live' : 'demo'} mode`, () => {
            configureRuntime(legacy, cluster);
            configureStudy({ uxSignalsId: studyId, uxSignalsSubmissionTypes: ['DIGITAL'] });

            submitToReceipt('skyrasurvey');

            cy.wait('@loadUxSignals').its('response.statusCode').should('eq', 200);
            cy.get(widgetSelector)
              .should('have.length', 1)
              .and('have.attr', 'data-uxsignals-embed', studyId)
              .and('have.attr', 'data-uxsignals-mode', cluster === 'prod-gcp' ? '' : 'demo');
            cy.get('skyra-survey').should('have.attr', 'slug', SKYRA_SLUG);
            cy.findByRole('button', { name: 'Utskriftsvennlig versjon' }).should('be.visible');
          });
        });

        const disabledStudies: { name: string; properties: Parameters<typeof configureStudy>[0] }[] = [
          { name: 'no study ID', properties: { uxSignalsSubmissionTypes: ['DIGITAL'] } },
          { name: 'paper only', properties: { uxSignalsId: studyId, uxSignalsSubmissionTypes: ['PAPER'] } },
          { name: 'no submission types', properties: { uxSignalsId: studyId } },
        ];

        disabledStudies.forEach(({ name, properties }) => {
          it(`does not load UX Signals for ${name}`, () => {
            configureStudy(properties);
            submitToReceipt('skyrasurvey');

            cy.get(widgetSelector).should('not.exist');
            cy.get('@loadUxSignals.all').should('have.length', 0);
          });
        });

        describe('Without login', () => {
          beforeEach(() => {
            configureRuntime(legacy, 'dev-gcp', false);
          });

          ['dev-gcp', 'prod-gcp'].forEach((cluster) => {
            it(`loads the study after nologin submission in ${cluster === 'prod-gcp' ? 'live' : 'demo'} mode`, () => {
              configureRuntime(legacy, cluster, false);
              configureStudy(
                { uxSignalsId: studyId, uxSignalsSubmissionTypes: ['DIGITAL_NO_LOGIN'] },
                NO_LOGIN_FORM_PATH,
              );

              submitWithoutLoginToReceipt();

              cy.wait('@loadUxSignals').its('response.statusCode').should('eq', 200);
              cy.get(widgetSelector)
                .should('have.length', 1)
                .and('have.attr', 'data-uxsignals-embed', studyId)
                .and('have.attr', 'data-uxsignals-mode', cluster === 'prod-gcp' ? '' : 'demo');
              cy.findByRole('button', { name: TEXTS.statiske.receipt.printFriendlyVersion }).should('be.visible');
            });
          });

          it('does not load a study enabled only for logged-in submissions', () => {
            configureStudy({ uxSignalsId: studyId, uxSignalsSubmissionTypes: ['DIGITAL'] }, NO_LOGIN_FORM_PATH);

            submitWithoutLoginToReceipt();

            cy.get(widgetSelector).should('not.exist');
            cy.get('@loadUxSignals.all').should('have.length', 0);
          });
        });
      });
    });
  });
});
