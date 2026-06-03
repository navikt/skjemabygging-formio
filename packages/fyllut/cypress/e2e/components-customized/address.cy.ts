describe('Address', () => {
  const findComponentByKey = (components: any[] = [], key: string): any | undefined => {
    for (const component of components) {
      if (component?.key === key) {
        return component;
      }
      const foundInChildren = findComponentByKey(component?.components, key);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  };

  const visitAddressWithConfig = ({
    addressTypeWizard,
    addressType,
  }: {
    addressTypeWizard?: 'user' | 'predefined';
    addressType?: 'NORWEGIAN_ADDRESS' | 'POST_OFFICE_BOX' | 'FOREIGN_ADDRESS';
  }) => {
    cy.intercept('GET', '/fyllut/api/forms/adresse*', (req) => {
      req.continue((res) => {
        const addressComponent = findComponentByKey(res.body?.components, 'norsk');
        if (!addressComponent) {
          throw new Error('Address component "norsk" was not found in form response');
        }

        addressComponent.prefillKey = undefined;
        addressComponent.addressTypeWizard = addressTypeWizard;
        addressComponent.addressType = addressType;
      });
    }).as('getAddressFormWithConfig');

    cy.visit('/fyllut/adresse/norskadresse?sub=paper');
    cy.wait('@getConfig');
    cy.wait('@getAddressFormWithConfig');
    cy.wait('@getTranslations');
  };

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Norwegian address (NORWEGIAN_ADDRESS)', () => {
    beforeEach(() => {
      cy.visit('/fyllut/adresse/norskadresse?sub=paper');
      cy.defaultWaits();
    });

    it('should render C/O field', () => {
      cy.findByRole('textbox', { name: /C\/O/ }).should('exist');
    });

    it('should render Vegadresse field', () => {
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
    });

    it('should render Postnummer field', () => {
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
    });

    it('should render Poststed field', () => {
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');
    });

    it('should allow filling in address fields', () => {
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('have.value', 'Testgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('have.value', '0001');
      cy.findByRole('textbox', { name: 'Poststed' }).should('have.value', 'Oslo');
    });
  });

  describe('Post office box (POST_OFFICE_BOX)', () => {
    beforeEach(() => {
      cy.visit('/fyllut/adresse/postboksadresse?sub=paper');
      cy.defaultWaits();
    });

    it('should render C/O field', () => {
      cy.findByRole('textbox', { name: /C\/O/ }).should('exist');
    });

    it('should render Postboks field', () => {
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
    });

    it('should render Postnummer field', () => {
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
    });

    it('should render Poststed field', () => {
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');
    });
  });

  describe('Foreign address (FOREIGN_ADDRESS)', () => {
    beforeEach(() => {
      cy.visit('/fyllut/adresse/utenlandskadresse?sub=paper');
      cy.defaultWaits();
    });

    it('should render C/O field', () => {
      cy.findByRole('textbox', { name: /C\/O/ }).should('exist');
    });

    it('should render street address long field', () => {
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, eller postboks' }).should('exist');
    });

    it('should render Land combobox', () => {
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
    });
  });

  describe('Address type choice (prefillKey in paper mode)', () => {
    beforeEach(() => {
      cy.visit('/fyllut/adresse/adressevalg?sub=paper');
      cy.defaultWaits();
    });

    it('should render custom livesInNorway radio label', () => {
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('exist');
    });

    it('should show contact address type question when Ja is selected', () => {
      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByLabelText('Ja').check();
      });
      cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).should('exist');
    });

    it('should show Norwegian address fields when Vegadresse is selected', () => {
      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByLabelText('Ja').check();
      });
      cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(() => {
        cy.findByLabelText('Vegadresse').check();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
    });

    it('should show foreign address fields when Nei is selected', () => {
      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByLabelText('Nei').check();
      });
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
    });
  });

  describe('Address type wizard without prefill', () => {
    it('should show wizard when addressTypeWizard is user', () => {
      visitAddressWithConfig({ addressTypeWizard: 'user' });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });

    it('should require addressType to show address fields when addressTypeWizard is predefined', () => {
      visitAddressWithConfig({ addressTypeWizard: 'predefined' });
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      visitAddressWithConfig({ addressTypeWizard: 'predefined', addressType: 'NORWEGIAN_ADDRESS' });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
    });

    it('should require addressType to show address fields when addressTypeWizard is undefined', () => {
      visitAddressWithConfig({});
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      visitAddressWithConfig({ addressType: 'NORWEGIAN_ADDRESS' });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
    });
  });
});
