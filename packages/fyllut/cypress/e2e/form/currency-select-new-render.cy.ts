describe('Currency select in new renderer', () => {
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
          res.body.newRenderForms = ['currencyselect'];
        }
      });
    }).as('getConfig');
    cy.intercept('POST', '/fyllut/api/log*', { body: 'ok' });
    cy.intercept('GET', '/fyllut/api/forms/*').as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/*').as('getTranslations');
    cy.intercept('GET', '/fyllut/api/common-codes/currencies*').as('getCurrencies');
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  it('loads currency options from the endpoint and selects a value', () => {
    cy.visit('/fyllut/currencyselect/visning?sub=paper');

    cy.wait('@getConfig');
    cy.wait('@getForm');
    cy.wait('@getTranslations');
    cy.wait('@getCurrencies');

    cy.findByRole('combobox', { name: 'Velg valuta' }).type('Euro{downArrow}{enter}');
    cy.findByRole('combobox', { name: 'Velg valuta med beskrivelse' }).type('Euro{downArrow}{enter}');

    cy.contains('Euro (EUR)').should('exist');
  });

  it('validates the required currency field after options are loaded', () => {
    cy.visit('/fyllut/currencyselect/validering?sub=paper');

    cy.wait('@getConfig');
    cy.wait('@getForm');
    cy.wait('@getTranslations');
    cy.wait('@getCurrencies');

    cy.findByRole('button', { name: 'Neste steg' }).click();
    cy.findAllByErrorMessageRequired('Valuta påkrevd').should('have.length', 2);

    cy.findByRole('combobox', { name: 'Valuta påkrevd' }).type('Euro{downArrow}{enter}');
    cy.findAllByErrorMessageRequired('Valuta påkrevd').should('have.length', 0);
  });
});
