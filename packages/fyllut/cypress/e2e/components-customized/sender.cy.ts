describe('Sender', () => {
  const FORM_URL = '/fyllut/sender';
  const PERSON_URL = `${FORM_URL}/person`;
  const ORGANIZATION_URL = `${FORM_URL}/organisasjon`;

  const PERSON_FIELDS = [
    { label: 'Representantens fødselsnummer eller d-nummer', value: '12345678901' },
    { label: 'Representantens fornavn', value: 'Ola' },
    { label: 'Representantens etternavn', value: 'Nordmann' },
  ];

  const ORGANIZATION_FIELDS = [
    {
      label: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
      value: '889640782',
    },
    { label: 'Virksomhetens navn', value: 'NAV Test AS' },
  ];

  const assertTextboxIsVisibleAndInteractable = (label: string) => {
    cy.findByRole('textbox', { name: label }).should('exist');
    cy.findByLabelText(label).shouldBeVisible();
    cy.findByLabelText(label).should('be.enabled');
    cy.findByLabelText(label).should('not.have.attr', 'readonly');
  };

  const fillFields = (fields: Array<{ label: string; value: string }>) => {
    fields.forEach(({ label, value }) => {
      cy.findByRole('textbox', { name: label }).type(value);
    });
  };

  // Sender is rendered with component type "sender", while summary and PDF registries currently only map "recipient".
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Person (senderRole: person)', () => {
    beforeEach(() => {
      cy.visit(`${PERSON_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('should render visible and interactable person fields', () => {
      PERSON_FIELDS.forEach(({ label }) => {
        assertTextboxIsVisibleAndInteractable(label);
      });
    });

    it('should stay on the page until person fields are filled', () => {
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Person' }).should('exist');

      fillFields(PERSON_FIELDS);
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Organisasjon' }).should('exist');
    });
  });

  describe('Organization (senderRole: organization)', () => {
    beforeEach(() => {
      cy.visit(`${ORGANIZATION_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('should render visible and interactable organization fields', () => {
      ORGANIZATION_FIELDS.forEach(({ label }) => {
        assertTextboxIsVisibleAndInteractable(label);
      });
    });

    it('should stay on the page until organization fields are filled', () => {
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Organisasjon' }).should('exist');

      fillFields(ORGANIZATION_FIELDS);
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit(`${FORM_URL}?sub=paper`);
      cy.defaultWaits();
    });

    it('should test filling out the full sender form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Person' }).should('exist');
      fillFields(PERSON_FIELDS);
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Organisasjon' }).should('exist');
      fillFields(ORGANIZATION_FIELDS);
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Person', () => {
        PERSON_FIELDS.forEach(({ label, value }) => {
          cy.contains(label).should('exist');
          cy.contains(value).should('exist');
        });
      });
      cy.withinSummaryGroup('Organisasjon', () => {
        ORGANIZATION_FIELDS.forEach(({ label, value }) => {
          cy.contains(label).should('exist');
          cy.contains(value).should('exist');
        });
      });
    });
  });

  // Sender field labels are generated inside the component and are currently not translated with "(en)".
  describe('Translation', () => {
    it('should translate the person step heading', () => {
      cy.visit(`${PERSON_URL}?sub=paper&lang=en`);
      cy.defaultWaits();

      cy.findByRole('heading', { name: 'Person (en)' }).should('exist');
      PERSON_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('exist');
      });
    });

    it('should translate the organization step heading', () => {
      cy.visit(`${ORGANIZATION_URL}?sub=paper&lang=en`);
      cy.defaultWaits();

      cy.findByRole('heading', { name: 'Organisasjon (en)' }).should('exist');
      ORGANIZATION_FIELDS.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('exist');
      });
    });
  });
});
