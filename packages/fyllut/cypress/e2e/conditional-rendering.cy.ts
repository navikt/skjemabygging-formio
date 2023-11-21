import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Conditional rendering', () => {
  before(() => {
    cy.configMocksServer();
  });

  describe('When form has panels that are hidden unless a condition is true', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.intercept('GET', '/fyllut/api/forms/conditionalxmas').as('getForm');
      cy.visit('/fyllut/conditionalxmas');
      cy.wait('@getForm');
      cy.clickStart(); // <-- navigate from information page to the form
    });

    it('Renders the first panel of the form', () => {
      cy.findByRole('heading', { name: TEXTS.statiske.introPage.title }).should('not.exist');
      cy.findByRole('heading', { name: 'Julemeny' }).should('exist');
    });

    describe('Filling out the form', () => {
      it("adds the panel 'Pinnekjøtt' when radio option pinnekjøtt is selected", () => {
        cy.findByRole('link', { name: 'Pinnekjøtt' }).should('not.exist');
        cy.findByRole('group', { name: 'Julemiddag' }).within(() => {
          cy.findByLabelText('Pinnekjøtt').check({ force: true });
        });
        cy.findByRole('link', { name: 'Pinnekjøtt' }).should('exist');
        cy.findByRole('link', { name: 'Lutefisk' }).should('not.exist');
        cy.clickNextStep();
        cy.url().should('include', '/pinnekjott');
      });

      it("adds the panel 'Lutefisk' when radio option lutefisk is selected", () => {
        cy.findByRole('link', { name: 'Lutefisk' }).should('not.exist');
        cy.findByRole('group', { name: 'Julemiddag' }).within(() => {
          cy.findByLabelText('Lutefisk').check({ force: true });
        });
        cy.findByRole('link', { name: 'Lutefisk' }).should('exist');
        cy.findByRole('link', { name: 'Pinnekjøtt' }).should('not.exist');
        cy.clickNextStep();
        cy.url().should('include', '/lutefisk');
      });
    });

    describe('Summary page', () => {
      beforeEach(() => {
        cy.findByRole('group', { name: 'Julemiddag' }).within(() => {
          cy.findByLabelText('Pinnekjøtt').check({ force: true });
        });
        cy.findByRole('link', { name: 'Pinnekjøtt' }).should('exist');
        cy.clickNextStep();
        cy.findByRole('checkbox', { name: 'Rotmos (valgfritt)' }).check({ force: true });
        cy.clickNextStep();
        cy.findByRole('checkbox', { name: 'Sjokoladetrekk (valgfritt)' }).check({ force: true });
        cy.clickNextStep();
      });

      it('lists the submission for the added panel', () => {
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.findByRole('heading', { name: 'Pinnekjøtt', level: 3 }).should('exist');
        cy.findByText('Rotmos').should('exist');
      });

      it("navigates back to the added panel when 'rediger' link is clicked", () => {
        cy.findByRole('link', { name: 'Rediger pinnekjøtt' }).click();
        cy.url().should('include', '/pinnekjott');
        cy.findByRole('checkbox', { name: 'Rotmos (valgfritt)' }).should('exist');
        cy.findByRole('checkbox', { name: 'Rotmos (valgfritt)' }).should('be.checked');
      });

      it('displays the submission for a different added panel when form is edited', () => {
        cy.findByRole('link', { name: 'Rediger julemeny' }).click();
        cy.url().should('include', '/veiledning');
        cy.findByRole('link', { name: 'Pinnekjøtt' }).should('exist');
        cy.findByRole('group', { name: 'Julemiddag' }).within(() => {
          cy.findByLabelText('Lutefisk').check({ force: true });
        });
        cy.findByRole('link', { name: 'Lutefisk' }).should('exist');
        cy.clickNextStep();
        cy.url().should('include', '/lutefisk');
        cy.findByRole('checkbox', { name: 'Erterstuing (valgfritt)' }).click({ force: true });
        cy.clickNextStep();
        cy.url().should('include', '/marsipangris');
        cy.clickNextStep();
        cy.url().should('include', '/oppsummering');
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.findByRole('heading', { name: 'Lutefisk', level: 3 }).should('exist');
        cy.findByRole('link', { name: 'Lutefisk' }).should('exist');
        cy.findByRole('link', { name: 'Pinnekjøtt' }).should('not.exist');
        cy.findByText('Erterstuing').should('exist');
      });

      it("navigates back to the added panel on clicking 'rediger' after changing language", () => {
        cy.findByRole('button', { name: 'Norsk bokmål' }).click();
        cy.findByRole('link', { name: 'English' }).click();
        cy.findByRole('link', { name: 'Edit lamb ribs' }).click();
        cy.url().should('include', '/pinnekjott?lang=en');
        cy.findByRole('checkbox', { name: 'Root stew (optional)' }).should('exist');
        cy.findByRole('checkbox', { name: 'Root stew (optional)' }).should('be.checked');
      });
    });
  });

  describe('Custom components', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.intercept('GET', '/fyllut/api/forms/testmellomlagring').as('getTestMellomlagringForm');
      cy.defaultInterceptsMellomlagring();
      cy.mocksUseRouteVariant('get-soknad:success-2');
      cy.intercept('GET', '/fyllut/api/send-inn/soknad/01234567-abcd-4ebd-90d4-34448ebaaaa2').as('getMellomlagring');
    });

    it('renders conditional fields when navigating from summary page', () => {
      cy.visit('/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=01234567-abcd-4ebd-90d4-34448ebaaaa2');
      cy.wait('@getTestMellomlagringForm');
      cy.wait('@getMellomlagring');
      cy.findByRole('link', { name: 'Rediger valgfrie opplysninger' }).should('be.visible');
      cy.findByRole('link', { name: 'Rediger valgfrie opplysninger' }).click();
      cy.findByRole('textbox', { name: 'Hva drakk du til frokost (valgfritt)' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Hva drakk du til frokost (valgfritt)' }).should('have.value', 'Jus');
      cy.findByRole('textbox', { name: 'Hva syntes du om frokosten?' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Hva syntes du om frokosten?' }).should('have.value', 'Helt ok');
    });

    it('removes values of conditional fields when they are hidden', () => {
      cy.visit('/fyllut/testmellomlagring?sub=paper');
      cy.wait('@getTestMellomlagringForm');
      cy.clickStart();
      cy.findByRole('textbox', { name: 'Hva drakk du til frokost (valgfritt)' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Hva syntes du om frokosten?' }).should('not.exist');

      cy.findByRole('textbox', { name: 'Hva drakk du til frokost (valgfritt)' }).type('Jus');
      cy.findByRole('textbox', { name: 'Hva syntes du om frokosten?' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Hva syntes du om frokosten?' }).type('Helt ok');

      cy.findByRole('textbox', { name: 'Hva drakk du til frokost (valgfritt)' }).type('{selectAll}{del}');
      cy.findByRole('textbox', { name: 'Hva syntes du om frokosten?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva drakk du til frokost (valgfritt)' }).type('Melk');
      cy.findByRole('textbox', { name: 'Hva syntes du om frokosten?' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Hva syntes du om frokosten?' }).should('have.value', '');
    });
  });
});
