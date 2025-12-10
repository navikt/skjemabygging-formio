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
      cy.visit('/fyllut/conditionalxmas?sub=paper');
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
        cy.findByText('Rotmos').should('exist');
      });

      it("navigates back to the added panel when 'rediger' link is clicked", () => {
        cy.clickEditAnswer('Pinnekjøtt');
        cy.url().should('include', '/pinnekjott');
        cy.findByRole('checkbox', { name: 'Rotmos (valgfritt)' }).should('exist');
        cy.findByRole('checkbox', { name: 'Rotmos (valgfritt)' }).should('be.checked');
      });

      it('displays the submission for a different added panel when form is edited', () => {
        cy.clickEditAnswer('Julemeny');
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
        cy.findByRole('link', { name: 'Lutefisk' }).should('exist');
        cy.findByRole('link', { name: 'Pinnekjøtt' }).should('not.exist');
        cy.findByText('Erterstuing').should('exist');
      });

      it("navigates back to the added panel on clicking 'rediger' after changing language", () => {
        cy.findByRole('button', { name: 'Norsk bokmål' }).click();
        cy.findByRole('link', { name: 'English' }).click();
        cy.clickEditAnswer('Lamb ribs');
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
      cy.clickEditAnswer('Valgfrie opplysninger');
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

  describe('Container inside datagrid', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/conditionaldatagrid/informasjon?sub=paper');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Informasjon' }).should('exist');
    });

    describe('component with simple conditional inside container', () => {
      beforeEach(() => {
        cy.findByRole('textbox', { name: 'Oppgi forsikringsselskap når alder er 5 år' }).should('not.exist');
      });

      it('is rendered when condition is true', () => {
        cy.findByRole('textbox', { name: 'Alder' }).should('exist').type('5');
        cy.findByRole('textbox', { name: 'Oppgi forsikringsselskap når alder er 5 år' }).should('exist');
      });

      it('is not rendered when condition is false', () => {
        cy.findByRole('textbox', { name: 'Alder' }).should('exist').type('4');
        cy.findByRole('textbox', { name: 'Oppgi forsikringsselskap når alder er 5 år' }).should('not.exist');
      });
    });

    describe('component with custom conditional inside container', () => {
      beforeEach(() => {
        cy.findByRole('group', { name: 'Bruker dyret medisiner?' }).should('not.exist');
      });

      it('is rendered when condition is true', () => {
        cy.findByRole('textbox', { name: 'Alder' }).should('exist').type('10');
        cy.findByRole('group', { name: 'Bruker dyret medisiner?' }).should('exist');
      });

      it('is not rendered when condition is false', () => {
        cy.findByRole('textbox', { name: 'Alder' }).should('exist').type('9');
        cy.findByRole('group', { name: 'Bruker dyret medisiner?' }).should('not.exist');
      });
    });

    describe('component with simple conditional outside container', () => {
      beforeEach(() => {
        cy.findByRole('group', { name: 'Har det blitt gjennomført øyelysing?' }).should('not.exist');
      });

      it('is rendered when condition is true', () => {
        cy.findByRole('textbox', { name: 'Alder' }).should('exist').type('0');
        cy.findByRole('group', { name: 'Har det blitt gjennomført øyelysing?' }).should('exist');
      });

      it('is not rendered when condition is false', () => {
        cy.findByRole('textbox', { name: 'Alder' }).should('exist').type('1');
        cy.findByRole('group', { name: 'Har det blitt gjennomført øyelysing?' }).should('not.exist');
      });
    });

    describe('component with custom conditional outside container', () => {
      beforeEach(() => {
        cy.get('.formio-component-alertstripe').should('not.exist');
      });

      it('is rendered when condition is true', () => {
        cy.findByRole('textbox', { name: 'Alder' }).should('exist').type('20');
        cy.get('.formio-component-alertstripe')
          .should('exist')
          .should('contain.text', 'Et dyr som er eldre enn 20 år kan ikke forsikres');
      });

      it('is not rendered when condition is false', () => {
        cy.findByRole('textbox', { name: 'Alder' }).should('exist').type('19');
        cy.get('.formio-component-alertstripe').should('not.exist');
      });
    });
  });

  describe('Test on row. in custom conditional', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/conditionalrow?sub=paper');
      cy.defaultWaits();
      cy.clickShowAllSteps();
    });

    it('display fields with row in conditional in panel', () => {
      cy.findByRole('link', { name: 'Panel 1' }).click();
      cy.findByRole('textbox', { name: 'Tekstfelt 1' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tekstfelt skjult når avkrysset' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt skjult når avkrysset' }).type('abc');
      cy.findByRole('checkbox', { name: 'Vis tekstfelt 1' }).click();
      cy.findByRole('textbox', { name: 'Tekstfelt skjult når avkrysset' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tekstfelt 1' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt 1' }).type('abc');

      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.withinSummaryGroup('Panel 1', () => {
        cy.get('dt').should('have.length', 1);
        cy.get('dt').eq(0).should('contain.text', 'Vis tekstfelt 1');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
        // This should be visible.
        //cy.get('dt').eq(1).should('contain.text', 'Tekstfelt 1');
        //cy.get('dd').eq(1).should('contain.text', 'abc');
      });
      cy.contains('Tekstfelt skjult når avkrysset').should('not.exist');
    });

    it('display fields with row in conditional in container', () => {
      cy.findByRole('link', { name: 'Panel 2 med beholder' }).click();
      cy.findByRole('textbox', { name: 'Tekstfelt 2' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tekstfelt 2-1 i beholder' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Vis tekstfelt 2' }).click();
      cy.findByRole('checkbox', { name: 'Vis tekstfelt 2-1 i beholder' }).click();

      // This is expected behavior.
      cy.findByRole('textbox', { name: 'Tekstfelt 2' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tekstfelt 2-1 i beholder' }).type('asdf');

      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.withinSummaryGroup('Panel 2 med beholder', () => {
        cy.get('dt').should('have.length', 3);
        cy.get('dt').eq(0).should('contain.text', 'Vis tekstfelt 2');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
        // This should be visible.
        //cy.get('dt').eq(1).should('contain.text', 'Tekstfelt 2-1 i beholder');
        //cy.get('dd').eq(1).should('contain.text', 'abc');
      });
    });

    it('display fields with row in conditional in data grid', () => {
      cy.findByRole('link', { name: 'Panel 3 med repeterende data' }).click();
      cy.findByRole('textbox', { name: 'Tekstfelt 3' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tekstfelt 3-1 i repeterende' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Vis tekstfelt 3' }).click();
      cy.findByRole('checkbox', { name: 'Vis tekstfelt 3-1 i repeterende' }).click();

      // This is expected behavior.
      cy.findByRole('textbox', { name: 'Tekstfelt 3' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tekstfelt 3-1 i repeterende' }).type('abc');

      cy.findByRole('heading', { name: 'Panel 3 med repeterende data' }).should('exist');
      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.withinSummaryGroup('Panel 3 med repeterende data', () => {
        cy.get('dt').eq(0).should('contain.text', 'Vis tekstfelt 3');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
        cy.get('dt').eq(1).should('contain.text', 'Repeterende');
        cy.get('dd')
          .eq(1)
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Vis tekstfelt 3-1 i repeterende');
            cy.get('dd').eq(0).should('contain.text', 'Ja');
            cy.get('dt').eq(1).should('contain.text', 'Tekstfelt 3-1 i repeterende');
            cy.get('dd').eq(1).should('contain.text', 'abc');
          });
      });
    });

    it('display fields with row in conditional in form group', () => {
      cy.findByRole('link', { name: 'Panel 4 med skjemagruppe' }).click();
      cy.findByRole('textbox', { name: 'Tekstfelt 4' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tekstfelt 4-1 i skjemagruppe' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Vis tekstfelt 4' }).click();
      cy.findByRole('checkbox', { name: 'Vis tekstfelt 4-1 i skjemagruppe' }).click();

      cy.findByRole('textbox', { name: 'Tekstfelt 4 i skjemagruppe' }).type('abc');
      cy.findByRole('textbox', { name: 'Tekstfelt 4-1 i skjemagruppe' }).type('cba');

      cy.findByRole('heading', { name: 'Panel 4 med skjemagruppe' }).should('exist');
      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.withinSummaryGroup('Panel 4 med skjemagruppe', () => {
        cy.get('dt').should('have.length', 3);
        cy.get('dt').eq(0).should('contain.text', 'Vis tekstfelt 4');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
        cy.get('dt').eq(1).should('contain.text', 'Skjemagruppe');
        cy.get('dd')
          .eq(1)
          .within(() => {
            cy.get('dt').should('have.length', 1);
            cy.get('dt').eq(0).should('contain.text', 'Vis tekstfelt 4-1 i skjemagruppe');
            cy.get('dd').eq(0).should('contain.text', 'Ja');
            // This should be visible.
            //cy.get('dt').eq(0).should('contain.text', 'Vis tekstfelt 4 i skjemagruppe');
            //cy.get('dd').eq(0).should('contain.text', 'abc');
            //cy.get('dt').eq(2).should('contain.text', 'Vis tekstfelt 4-1 i skjemagruppe');
            //cy.get('dd').eq(2).should('contain.text', 'cba');
          });
      });
    });
  });
});
