describe('DataFetcher', () => {
  const LABEL = 'Aktivitetsvelger';
  const LABEL_WITH_DESCRIPTION = 'Aktivitetsvelger med beskrivelse';
  const LABEL_WITH_OTHER = 'Aktivitetsvelger med annet';
  const PANEL_URL = '/fyllut/datafetcher/visning';

  before(() => {
    cy.configMocksServer();
  });

  afterEach(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.mocksUseRouteVariant('get-register-data-activities:success');
      cy.defaultIntercepts();
      cy.visit(`${PANEL_URL}?sub=digital`);
      cy.defaultWaits();
    });

    it('renders checkbox group with label', () => {
      cy.findByRole('group', { name: LABEL }).should('exist');
    });

    it('renders fetched activities as checkboxes', () => {
      cy.findByRole('group', { name: LABEL }).within(() => {
        cy.findByRole('checkbox', { name: 'Aktivitet 1' }).should('exist');
        cy.findByRole('checkbox', { name: 'Aktivitet 2' }).should('exist');
        cy.findByRole('checkbox', { name: 'Aktivitet 3' }).should('exist');
        cy.findAllByRole('checkbox').should('have.length', 3);
      });
    });

    it('can check an activity', () => {
      cy.findByRole('group', { name: LABEL }).within(() => {
        cy.findByRole('checkbox', { name: 'Aktivitet 1' }).should('not.be.checked').check();
        cy.findByRole('checkbox', { name: 'Aktivitet 1' }).should('be.checked');
      });
    });

    it('renders "Annet" option when showOther is true', () => {
      cy.findByRole('group', { name: LABEL_WITH_OTHER }).within(() => {
        cy.findAllByRole('checkbox').should('have.length', 4);
        cy.findByRole('checkbox', { name: 'Annet' }).should('exist');
      });
    });

    it('renders description', () => {
      cy.withinComponent(LABEL_WITH_DESCRIPTION, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });

    it('renders additionalDescription', () => {
      cy.withinComponent(LABEL_WITH_DESCRIPTION, () => {
        cy.contains('mer').should('exist');
      });
    });
  });

  describe('Validation', () => {
    it('shows error when required field is empty', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success');
      cy.defaultIntercepts();
      cy.visit(`${PANEL_URL}?sub=digital`);
      cy.defaultWaits();
      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: `Du må fylle ut: ${LABEL}` }).should('exist');
    });
  });

  describe('Paper mode', () => {
    it('does not render the component', () => {
      cy.defaultIntercepts();
      cy.visit(`${PANEL_URL}?sub=paper`);
      cy.defaultWaits();
      cy.findByRole('group', { name: LABEL }).should('not.exist');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.mocksUseRouteVariant('get-register-data-activities:success');
      cy.defaultIntercepts();
      cy.visit(`${PANEL_URL}?sub=digital&lang=en`);
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
});
