// Address (navAddress) renders different fields depending on addressType setting.
// Settings from Address.form.ts: prefillKey, customLabels.livesInNorway, addressType, required.
//
// - addressType: 'NORWEGIAN_ADDRESS' shows C/O, Vegadresse, Postnummer, Poststed.
// - addressType: 'POST_OFFICE_BOX' shows C/O, Postboks, Postnummer, Poststed.
// - addressType: 'FOREIGN_ADDRESS' shows C/O, Vegnavn og husnummer.., Bygning, Postnummer,
//   By/stedsnavn, Region, and a Land combobox.
// - When prefillKey is set (and no addressType), paper mode shows an address type choice:
//   "Bor du i Norge?" radio. The customLabels.livesInNorway setting customizes this label.
//   Selecting "Ja" shows "Er kontaktadressen en vegadresse eller postboksadresse?".
//
// Note: Address has hideLabel: true by default — the component label is not displayed.
// Note: Field labels inside the address come from static TEXTS (not translated via
//   component-level translations), so there are no component translation tests here.
// Note: addressPriority (bosted/opphold/kontakt) is only relevant for prefill from PDL
//   in digital mode — it has no visible effect in paper mode testing.

describe('Address', () => {
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
      cy.findByRole('group', { name: 'Bor du i Sverige?' }).should('exist');
    });

    it('should show contact address type question when Ja is selected', () => {
      cy.findByRole('group', { name: 'Bor du i Sverige?' }).within(() => {
        cy.findByLabelText('Ja').check();
      });
      cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).should('exist');
    });

    it('should show Norwegian address fields when Vegadresse is selected', () => {
      cy.findByRole('group', { name: 'Bor du i Sverige?' }).within(() => {
        cy.findByLabelText('Ja').check();
      });
      cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(() => {
        cy.findByLabelText('Vegadresse').check();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
    });

    it('should show foreign address fields when Nei is selected', () => {
      cy.findByRole('group', { name: 'Bor du i Sverige?' }).within(() => {
        cy.findByLabelText('Nei').check();
      });
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
    });
  });
});
