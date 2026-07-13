describe('Address in new renderer', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.intercept('GET', '/fyllut/api/config*', (req) => {
      req.headers['accept-encoding'] = 'identity';
      delete req.headers['if-none-match'];
      delete req.headers['if-modified-since'];
      req.continue((res) => {
        if (typeof res.body === 'object' && res.body !== null) {
          res.body.newRenderForms = ['adresse'];
        }
      });
    }).as('getConfig');
    cy.intercept('POST', '/fyllut/api/log*', { body: 'ok' });
    cy.intercept('GET', '/fyllut/api/forms/*').as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/*').as('getTranslations');
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  it('renders and updates a norwegian address', () => {
    cy.visit('/fyllut/adresse/norskadresse?sub=paper');

    cy.wait('@getConfig');
    cy.wait('@getForm');
    cy.wait('@getTranslations');

    cy.findByRole('textbox', { name: /C\/O/ }).should('exist');
    cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testgata 1');
    cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
    cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');

    cy.findByRole('textbox', { name: 'Vegadresse' }).should('have.value', 'Testgata 1');
    cy.findByRole('textbox', { name: 'Postnummer' }).should('have.value', '0001');
    cy.findByRole('textbox', { name: 'Poststed' }).should('have.value', 'Oslo');
  });

  it('renders a foreign address with country selection', () => {
    cy.visit('/fyllut/adresse/utenlandskadresse?sub=paper');

    cy.wait('@getConfig');
    cy.wait('@getForm');
    cy.wait('@getTranslations');

    cy.findByRole('textbox', { name: 'Vegnavn og husnummer, eller postboks' }).should('exist');
    cy.findByRole('combobox', { name: 'Land' }).click();
    cy.findByRole('option', { name: 'Sverige' }).click();
  });

  it('supports the address type choice wizard in the new renderer', () => {
    cy.visit('/fyllut/adresse/utenprefillwizarduser?sub=paper');

    cy.wait('@getConfig');
    cy.wait('@getForm');
    cy.wait('@getTranslations');

    cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
      cy.findByLabelText('Ja').check({ force: true });
    });
    cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(() => {
      cy.findByLabelText('Vegadresse').check({ force: true });
    });
    cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');

    cy.visit('/fyllut/adresse/adressevalg?sub=paper');

    cy.wait('@getConfig');
    cy.wait('@getForm');
    cy.wait('@getTranslations');

    cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
      cy.findByLabelText('Nei').check({ force: true });
    });
    cy.findByRole('combobox', { name: 'Land' }).should('exist');
  });
});
