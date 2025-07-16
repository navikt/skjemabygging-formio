/*
 * Tests conditional rendering in the form and that it displays correctly in the summary page.
 * Conditional rendering is showing/hiding form elements based on form definition or user input
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Conditional rendering', () => {
  before(() => {
    cy.configMocksServer();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('When form has panels that are hidden unless a condition is true', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/conditionalxmas');
      cy.defaultWaits();
      cy.clickStart(); // <-- navigate from information page to the form
    });

    it('Renders the first panel of the form', () => {
      cy.findByRole('heading', { name: TEXTS.statiske.introPage.title }).should('not.exist');
      cy.findByRole('heading', { name: 'Julemeny' }).should('exist');
    });

    describe('Filling out the form', () => {
      it("adds the panel 'Pinnekjøtt' when radio option pinnekjøtt is selected", () => {
        cy.clickShowAllSteps();
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
        cy.clickShowAllSteps();
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
        cy.clickShowAllSteps();
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
        cy.findByRole('button', { name: 'Pinnekjøtt' });
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
        cy.findByRole('button', { name: 'Lutefisk' });
        cy.findByRole('link', { name: 'Lutefisk' }).should('exist');
        cy.findByRole('link', { name: 'Pinnekjøtt' }).should('not.exist');
        cy.findByText('Erterstuing').should('exist');
      });

      it("navigates back to the added panel on clicking 'rediger' after changing language", () => {
        cy.findByRole('button', { name: 'Norsk bokmål' }).click();
        cy.findByRole('link', { name: 'English' }).click();
        cy.findByRole('link', { name: 'Edit lamb ribs' }).click();
        cy.url().should('include', '/pinnekjott');
        cy.url().should('include', 'lang=en');
        cy.findByRole('checkbox', { name: 'Root stew (optional)' }).should('exist');
        cy.findByRole('checkbox', { name: 'Root stew (optional)' }).should('be.checked');
      });
    });
  });

  describe('Custom components', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.defaultInterceptsMellomlagring();
      cy.mocksUseRouteVariant('get-soknad:success-2');
    });

    it('renders conditional fields when navigating from summary page', () => {
      cy.visit('/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=01234567-abcd-4ebd-90d4-34448ebaaaa2');
      cy.defaultWaits();
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
      cy.defaultWaits();
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

    it('does not trigger validation on conditionally hidden components', () => {
      cy.visit('/fyllut/testmellomlagring?sub=paper');
      cy.defaultWaits();
      cy.clickStart();
      cy.findAllByRole('group', { name: 'Vis skjulte komponenter (valgfritt)' }).within(() => {
        cy.findAllByRole('radio', { name: 'Ja' }).should('exist');
        cy.findAllByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tall' }).shouldBeVisible();

      cy.clickNextStep();
      cy.findByRole('link', { name: 'Du må fylle ut: Velg en måned' }).shouldBeVisible();
      cy.findByRole('link', { name: 'Du må fylle ut: Tall' }).shouldBeVisible();
      cy.findByRole('link', { name: 'Du må fylle ut: Årstall' }).shouldBeVisible();
      cy.findByRole('link', { name: 'Du må fylle ut: IBAN' }).shouldBeVisible();
      cy.findByRole('link', { name: 'Du må fylle ut: Fødselsnummer eller d-nummer' }).shouldBeVisible();

      cy.findAllByRole('group', { name: 'Vis skjulte komponenter (valgfritt)' }).within(() => {
        cy.findAllByRole('radio', { name: 'Nei' }).should('exist');
        cy.findAllByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Velg en måned' }).should('not.exist');
      cy.findByRole('link', { name: 'Du må fylle ut: Velg en måned' }).should('not.exist');
      cy.findByRole('link', { name: 'Du må fylle ut: Tall' }).should('not.exist');
      cy.findByRole('link', { name: 'Du må fylle ut: Årstall' }).should('not.exist');
      cy.findByRole('link', { name: 'Du må fylle ut: IBAN' }).should('not.exist');
      cy.findByRole('link', { name: 'Du må fylle ut: Fødselsnummer eller d-nummer' }).should('not.exist');
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Gave' });
    });
  });

  describe('conditionally show a component, but the component has hidden=true', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
    });

    it('shows components with textDisplay=form and hides components with textDisplay=pdf', () => {
      cy.visit('/fyllut/hiddentest?sub=paper');
      cy.defaultWaits();
      cy.clickStart();

      cy.findByRole('checkbox', { name: 'Show components (valgfritt)' }).click();

      cy.findByText('This text should only be visible in form').should('exist');
      cy.findByText('This alert should only be visible in form').should('exist');

      cy.findByText('This text should only be visible in PDF').should('not.exist');
      cy.findByText('This alert should only be visible in PDF').should('not.exist');
    });
  });
});
