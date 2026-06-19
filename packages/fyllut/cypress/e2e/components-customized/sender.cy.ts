import { expect } from 'chai';

type SenderField = {
  label: string;
  value: string;
};

describe('Sender', () => {
  const FORM_URL = '/fyllut/sender';
  const PANEL_SELECTOR_NAME = /^Velg avsenderpanel/;
  const PANEL_SELECTOR_NAME_EN = /^Velg avsenderpanel \(en\)/;
  const CONDITIONAL_SENDER_SELECTOR_NAME = /^Velg avsendertype/;
  const CONDITIONAL_SENDER_SELECTOR_NAME_EN = /^Velg avsendertype \(en\)/;
  const INTRO_CONFIRMATION_NAME =
    /Jeg bekrefter at jeg vil svare så riktig som jeg kan|I confirm that I will answer as accurately as I can/;

  const PERSON_FIELDS: SenderField[] = [
    { label: 'Representantens fødselsnummer eller d-nummer', value: '13097248022' },
    { label: 'Representantens fornavn', value: 'Ola' },
    { label: 'Representantens etternavn', value: 'Nordmann' },
  ];
  const ORGANIZATION_FIELDS: SenderField[] = [
    {
      label: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
      value: '889640782',
    },
    { label: 'Virksomhetens navn', value: 'NAV Test AS' },
  ];
  const NESTED_ORGANIZATION_FIELDS: SenderField[] = [
    {
      label: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
      value: '889640782',
    },
    { label: 'Virksomhetens navn', value: 'Nested NAV Test AS' },
  ];
  const CONDITIONAL_PERSON_FIELDS: SenderField[] = [
    { label: 'Representantens fødselsnummer eller d-nummer', value: '13097248022' },
    { label: 'Representantens fornavn', value: 'Kari' },
    { label: 'Representantens etternavn', value: 'Sender' },
  ];
  const PREFILLED_PERSON_FIELDS: SenderField[] = [
    { label: 'Representantens fødselsnummer eller d-nummer', value: '08842748500' },
    { label: 'Representantens fornavn', value: 'Ola' },
    { label: 'Representantens etternavn', value: 'Nordmann' },
  ];

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Panel selection', () => {
    beforeEach(() => {
      cy.visit(`${FORM_URL}?sub=paper`);
      cy.defaultWaits();
      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();
      cy.findByRole('heading', { name: PANEL_SELECTOR_NAME }).should('exist');
    });

    it('shows the selector before any sender panel', () => {
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).shouldBeVisible();
      cy.findByRole('heading', { name: 'Person' }).should('not.exist');
      cy.findByRole('heading', { name: 'Organisasjon' }).should('not.exist');
      cy.findByRole('heading', { name: 'Organisasjon nested container' }).should('not.exist');
      cy.findByRole('heading', { name: 'Valgstyrt avsender' }).should('not.exist');
    });

    it('navigates to the selected sender panel', () => {
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Organisasjon' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Organisasjon' }).should('exist');
    });
  });

  describe('Person panel', () => {
    beforeEach(() => {
      cy.visit(`${FORM_URL}?sub=paper`);
      cy.defaultWaits();
      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Person' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Person' }).should('exist');
    });

    it('renders visible and interactable person fields', () => {
      PERSON_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('exist');
        cy.findByLabelText(label).shouldBeVisible();
        cy.findByLabelText(label).should('be.enabled');
        cy.findByLabelText(label).should('not.have.attr', 'readonly');
      });
    });

    it('shows required and field-specific validation errors', () => {
      cy.clickNextStep();

      PERSON_FIELDS.forEach(({ label }) => {
        cy.findAllByText(`Du må fylle ut: ${label}`).should('have.length', 2);
      });

      cy.findByRole('textbox', { name: PERSON_FIELDS[0].label }).clear();
      cy.findByRole('textbox', { name: PERSON_FIELDS[0].label }).type('12345678911');
      cy.findByRole('textbox', { name: PERSON_FIELDS[1].label }).clear();
      cy.findByRole('textbox', { name: PERSON_FIELDS[1].label }).type('Ola=');
      cy.findByRole('textbox', { name: PERSON_FIELDS[2].label }).clear();
      cy.findByRole('textbox', { name: PERSON_FIELDS[2].label }).type('Nordmann!');
      cy.clickNextStep();

      cy.findAllByText('Dette er ikke et gyldig fødselsnummer eller d-nummer (11 siffer)').should('have.length', 2);
      cy.findAllByText(`${PERSON_FIELDS[1].label} inneholder ugyldige tegn`).should('have.length', 2);
      cy.findAllByText(`${PERSON_FIELDS[2].label} inneholder ugyldige tegn`).should('have.length', 2);
    });

    it('submits all the way to kvittering with avsender set', () => {
      cy.visit(`${FORM_URL}/legitimasjon?sub=digitalnologin`);
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');
      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() => {
        cy.findByLabelText('Norsk pass').check();
      });
      cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Person' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Person' }).should('exist');

      PERSON_FIELDS.forEach(({ label, value }) => {
        cy.findByRole('textbox', { name: label }).type(value);
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Person', () => {
        PERSON_FIELDS.forEach(({ label, value }) => {
          cy.contains(label).should('exist');
          cy.contains(value).should('exist');
        });
      });

      cy.mocksUseRouteVariant('post-nologin-soknad:success-tc21c');
      cy.mocksUseRouteVariant('post-familie-pdf:success');
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-application', (req) => {
        expect(req.body.submission.data).to.have.nested.property('mottakerPerson');
      }).as('submitApplication');

      cy.clickSendNav();
      cy.wait('@submitApplication').then(({ response }) => {
        expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
      });
      cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
    });
  });

  describe('Organization panel', () => {
    beforeEach(() => {
      cy.visit(`${FORM_URL}?sub=paper`);
      cy.defaultWaits();
      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Organisasjon' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Organisasjon' }).should('exist');
    });

    it('renders visible and interactable organization fields', () => {
      ORGANIZATION_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('exist');
        cy.findByLabelText(label).shouldBeVisible();
        cy.findByLabelText(label).should('be.enabled');
        cy.findByLabelText(label).should('not.have.attr', 'readonly');
      });
    });

    it('shows required and field-specific validation errors', () => {
      cy.clickNextStep();

      ORGANIZATION_FIELDS.forEach(({ label }) => {
        cy.findAllByText(`Du må fylle ut: ${label}`).should('have.length', 2);
      });

      cy.findByRole('textbox', { name: ORGANIZATION_FIELDS[0].label }).clear();
      cy.findByRole('textbox', { name: ORGANIZATION_FIELDS[0].label }).type('123');
      cy.findByRole('textbox', { name: ORGANIZATION_FIELDS[1].label }).clear();
      cy.findByRole('textbox', { name: ORGANIZATION_FIELDS[1].label }).type('NAV!');
      cy.clickNextStep();

      cy.findAllByText('Dette er ikke et gyldig organisasjonsnummer. Sjekk at du har tastet riktig.').should(
        'have.length',
        2,
      );
      cy.findAllByText(`${ORGANIZATION_FIELDS[1].label} inneholder ugyldige tegn`).should('have.length', 2);
    });

    it('submits all the way to kvittering with avsender set', () => {
      cy.visit(`${FORM_URL}/legitimasjon?sub=digitalnologin`);
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');
      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() => {
        cy.findByLabelText('Norsk pass').check();
      });
      cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Organisasjon' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Organisasjon' }).should('exist');

      ORGANIZATION_FIELDS.forEach(({ label, value }) => {
        cy.findByRole('textbox', { name: label }).type(value);
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Organisasjon', () => {
        ORGANIZATION_FIELDS.forEach(({ label, value }) => {
          cy.contains(label).should('exist');
          cy.contains(value).should('exist');
        });
      });

      cy.mocksUseRouteVariant('post-nologin-soknad:success-tc21a');
      cy.mocksUseRouteVariant('post-familie-pdf:success');
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-application', (req) => {
        expect(req.body.submission.data).to.have.nested.property('mottakerOrganisasjon');
      }).as('submitApplication');

      cy.clickSendNav();
      cy.wait('@submitApplication').then(({ response }) => {
        expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
      });
      cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
    });
  });

  describe('Nested organization panel', () => {
    it('submits all the way to kvittering with avsender set', () => {
      cy.visit(`${FORM_URL}/legitimasjon?sub=digitalnologin`);
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');
      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() => {
        cy.findByLabelText('Norsk pass').check();
      });
      cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Organisasjon nested container' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Organisasjon nested container' }).should('exist');

      NESTED_ORGANIZATION_FIELDS.forEach(({ label, value }) => {
        cy.findByRole('textbox', { name: label }).type(value);
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Organisasjon nested container', () => {
        NESTED_ORGANIZATION_FIELDS.forEach(({ label, value }) => {
          cy.contains(label).should('exist');
          cy.contains(value).should('exist');
        });
      });

      cy.mocksUseRouteVariant('post-nologin-soknad:success-tc21b');
      cy.mocksUseRouteVariant('post-familie-pdf:success');
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-application', (req) => {
        expect(req.body.submission.data).to.have.nested.property(
          'containerOrganization.containerOrganizationNested.mottakerOrganisasjonNested',
        );
      }).as('submitApplication');

      cy.clickSendNav();
      cy.wait('@submitApplication').then(({ response }) => {
        expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
      });
      cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
    });
  });

  describe('Conditional sender panel', () => {
    beforeEach(() => {
      cy.visit(`${FORM_URL}?sub=paper`);
      cy.defaultWaits();
      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Valgstyrt avsender' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Valgstyrt avsender' }).should('exist');
    });

    it('shows organization fields by default and hides them when person is selected', () => {
      cy.findByRole('group', { name: CONDITIONAL_SENDER_SELECTOR_NAME }).shouldBeVisible();

      PERSON_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('not.exist');
      });
      ORGANIZATION_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('exist');
        cy.findByLabelText(label).shouldBeVisible();
        cy.findByLabelText(label).should('be.enabled');
        cy.findByLabelText(label).should('not.have.attr', 'readonly');
      });

      cy.findByRole('group', { name: CONDITIONAL_SENDER_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Person' }).click();
      });
      PERSON_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('exist');
        cy.findByLabelText(label).shouldBeVisible();
        cy.findByLabelText(label).should('be.enabled');
        cy.findByLabelText(label).should('not.have.attr', 'readonly');
      });
      ORGANIZATION_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('not.exist');
      });

      cy.findByRole('group', { name: CONDITIONAL_SENDER_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Organisasjon' }).click();
      });
      ORGANIZATION_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('exist');
        cy.findByLabelText(label).shouldBeVisible();
        cy.findByLabelText(label).should('be.enabled');
        cy.findByLabelText(label).should('not.have.attr', 'readonly');
      });
      PERSON_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('not.exist');
      });
    });

    it('submits all the way to kvittering with avsender set', () => {
      cy.visit(`${FORM_URL}/legitimasjon?sub=digitalnologin`);
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');
      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() => {
        cy.findByLabelText('Norsk pass').check();
      });
      cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Valgstyrt avsender' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Valgstyrt avsender' }).should('exist');

      cy.findByRole('group', { name: CONDITIONAL_SENDER_SELECTOR_NAME }).within(() => {
        cy.findByRole('radio', { name: 'Person' }).click();
      });
      CONDITIONAL_PERSON_FIELDS.forEach(({ label, value }) => {
        cy.findByRole('textbox', { name: label }).type(value);
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Valgstyrt avsender', () => {
        CONDITIONAL_PERSON_FIELDS.forEach(({ label, value }) => {
          cy.contains(label).should('exist');
          cy.contains(value).should('exist');
        });
      });

      cy.mocksUseRouteVariant('post-nologin-soknad:success-tc21d');
      cy.mocksUseRouteVariant('post-familie-pdf:success');
      cy.intercept('POST', '/fyllut/api/send-inn/nologin-application', (req) => {
        expect(req.body.submission.data).to.have.nested.property('valgstyrtMottakerPerson');
      }).as('submitApplication');

      cy.clickSendNav();
      cy.wait('@submitApplication').then(({ response }) => {
        expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
      });
      cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
    });

    describe('Digital submission method', () => {
      beforeEach(() => {
        cy.defaultInterceptsMellomlagring();
        cy.defaultInterceptsExternal();
        cy.visit(`${FORM_URL}/?sub=digital`);
        cy.defaultWaits();
        cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
        cy.clickStart();
        cy.wait('@getPrefillData');
        cy.wait('@createMellomlagring');

        cy.findByRole('group', { name: PANEL_SELECTOR_NAME }).within(() => {
          cy.findByRole('radio', { name: 'Valgstyrt avsender' }).click();
        });
        cy.clickSaveAndContinue();
        cy.findByRole('heading', { name: 'Valgstyrt avsender' }).should('exist');
      });

      it('submits with prefilled person as avsender', () => {
        cy.findByRole('group', { name: CONDITIONAL_SENDER_SELECTOR_NAME }).within(() => {
          cy.findByRole('radio', { name: 'Person' }).click();
        });
        PREFILLED_PERSON_FIELDS.forEach(({ label, value }) => {
          cy.findByRole('textbox', { name: label }).should('have.value', value);
        });
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.withinSummaryGroup('Valgstyrt avsender', () => {
          PREFILLED_PERSON_FIELDS.forEach(({ label, value }) => {
            cy.contains(label).should('exist');
            cy.contains(value).should('exist');
          });
        });

        cy.mocksUseRouteVariant('post-digital-soknad:success-tc21e');
        cy.mocksUseRouteVariant('post-familie-pdf:success');
        cy.submitApplication();

        cy.clickSendNav();
        cy.wait('@submitApplication').then(({ response }) => {
          expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
        });
        cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
      });

      it('submits with organization as avsender', () => {
        cy.findByRole('group', { name: CONDITIONAL_SENDER_SELECTOR_NAME }).within(() => {
          cy.findByRole('radio', { name: 'Organisasjon' }).click();
        });
        ORGANIZATION_FIELDS.forEach(({ label, value }) => {
          cy.findByRole('textbox', { name: label }).type(value);
        });
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.withinSummaryGroup('Valgstyrt avsender', () => {
          ORGANIZATION_FIELDS.forEach(({ label, value }) => {
            cy.contains(label).should('exist');
            cy.contains(value).should('exist');
          });
        });

        cy.mocksUseRouteVariant('post-digital-soknad:success-tc21f');
        cy.mocksUseRouteVariant('post-familie-pdf:success');
        cy.submitApplication();

        cy.clickSendNav();
        cy.wait('@submitApplication').then(({ response }) => {
          expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
        });
        cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
      });
    });
  });

  describe('Translation', () => {
    it('translates the panel selector and selected sender panels', () => {
      cy.visit(`${FORM_URL}?sub=paper&lang=en`);
      cy.defaultWaits();
      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Velg avsenderpanel (en)' }).should('exist');
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME_EN }).shouldBeVisible();
      cy.findByRole('group', { name: PANEL_SELECTOR_NAME_EN }).within(() => {
        cy.findByRole('radio', { name: 'Person (en)' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Person (en)' }).should('exist');
      PERSON_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: `${label} (en)` }).should('exist');
      });
    });

    it('translates the conditional sender selector', () => {
      cy.visit(`${FORM_URL}?sub=paper&lang=en`);
      cy.defaultWaits();
      cy.findByRole('checkbox', { name: INTRO_CONFIRMATION_NAME }).check();
      cy.clickNextStep();

      cy.findByRole('group', { name: PANEL_SELECTOR_NAME_EN }).within(() => {
        cy.findByRole('radio', { name: 'Valgstyrt avsender (en)' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Valgstyrt avsender (en)' }).should('exist');
      cy.findByRole('group', { name: CONDITIONAL_SENDER_SELECTOR_NAME_EN }).shouldBeVisible();
      cy.findByRole('group', { name: CONDITIONAL_SENDER_SELECTOR_NAME_EN }).within(() => {
        cy.findByRole('radio', { name: 'Person (en)' }).should('exist');
        cy.findByRole('radio', { name: 'Organisasjon (en)' }).should('exist');
      });
    });
  });
});
