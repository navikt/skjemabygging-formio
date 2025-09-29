/*
 * General tests for react components
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('React components', () => {
  beforeEach(() => {
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.clearBrowserCache',
    });
    cy.defaultIntercepts();
  });

  describe('General', () => {
    describe('Fill in form and view summary, paper', () => {
      beforeEach(() => {
        cy.visit('/fyllut/customcomps/dineopplysninger?sub=paper');
        cy.defaultWaits();
        cy.wait('@getCurrencies');
        cy.wait('@getGlobalTranslations');
      });

      it('reflects changes on summary page when editing data', () => {
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('be.visible');
        cy.findByRole('textbox', { name: 'Fornavn' }).type('Storm');
        cy.findByRole('combobox', { name: 'I hvilket land bor du?' }).click();

        cy.findByRole('combobox', { name: 'I hvilket land bor du?' }).type('Norge{downArrow}{enter}');
        cy.findByRole('combobox', { name: 'Velg instrument (valgfritt)' }).type('Gitar{enter}');
        cy.findByRole('textbox', { name: 'Gyldig fra dato' }).type('01.01.2023{esc}');
        cy.clickNextStep();

        cy.findAllByText('Du må fylle ut: Velg valuta').should('have.length', 2);
        cy.findAllByText('Du må fylle ut: Velg valuta').first().click();
        cy.findByRole('combobox', { name: 'Velg valuta' }).type('{upArrow}{enter}');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
        cy.findByLabelText('Annen dokumentasjon')
          .should('exist')
          .within(() => {
            cy.findByLabelText('Ja, jeg legger det ved denne søknaden.').should('exist').check({ force: true });
            cy.findByLabelText('Ja, jeg legger det ved denne søknaden.').should('be.checked');
          });
        cy.findByLabelText('Bekreftelse på skoleplass')
          .should('exist')
          .within(() => {
            cy.findByLabelText('Jeg har levert denne dokumentasjonen tidligere').should('exist').check({ force: true });
            cy.findByLabelText('Jeg har levert denne dokumentasjonen tidligere').should('be.checked');
          });
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.get('dl')
          .first()
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Fornavn');
            cy.get('dd').eq(0).should('contain.text', 'Storm');
            cy.get('dt').eq(1).should('contain.text', 'I hvilket land bor du?');
            cy.get('dd').eq(1).should('contain.text', 'Norge');
            cy.get('dt').eq(2).should('contain.text', 'Velg valuta');
            cy.get('dd').eq(2).should('contain.text', 'Australske dollar (AUD)');
            cy.get('dt').eq(3).should('contain.text', 'Velg instrument');
            cy.get('dd').eq(3).should('contain.text', 'Gitar');
            cy.get('dt').eq(4).should('contain.text', 'Gyldig fra dato');
            cy.get('dd').eq(4).should('contain.text', '01.01.2023');
          });

        cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();

        cy.findByRole('heading', { name: TEXTS.statiske.prepareLetterPage.subTitle }).should('exist');

        cy.findByRole('link', { name: TEXTS.grensesnitt.goBack }).click();

        cy.clickEditAnswer('Dine opplysninger');

        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');

        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Storm');
        cy.findByRole('textbox', { name: 'Fornavn' }).type('zy');
        cy.findByRole('combobox', { name: 'Velg valuta' }).click();
        cy.findByRole('combobox', { name: 'Velg valuta' }).should('have.focus').type('Norske{enter}');
        cy.findByRole('combobox', { name: 'Velg instrument (valgfritt)' }).type('{backspace}');
        cy.findByRole('textbox', { name: 'Gyldig fra dato' })
          .should('exist')
          .should('contain.value', '01.01.2023')
          .focus();
        cy.findByRole('textbox', { name: 'Gyldig fra dato' }).type('{selectall}02.01.2023');
        cy.clickShowAllSteps();
        cy.findByRole('link', { name: 'Oppsummering' }).click();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.get('dl')
          .first()
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Fornavn');
            cy.get('dd').eq(0).should('contain.text', 'Stormzy');
            cy.get('dt').eq(1).should('contain.text', 'I hvilket land bor du?');
            cy.get('dd').eq(1).should('contain.text', 'Norge');
            cy.get('dt').eq(2).should('contain.text', 'Velg valuta');
            cy.get('dd').eq(2).should('contain.text', 'Norske kroner (NOK)');
            cy.get('dt').eq(3).should('contain.text', 'Gyldig fra dato');
            cy.get('dd').eq(3).should('contain.text', '02.01.2023');
          });
      });
    });

    describe('Fill in form and view summary, digital', () => {
      beforeEach(() => {
        cy.defaultInterceptsMellomlagring();
        cy.visit('/fyllut/customcomps/dineopplysninger?sub=digital');
        cy.defaultWaits();
        cy.wait('@createMellomlagring');
        cy.wait('@getCurrencies');
      });

      it('make sure components keep their values after going to summary page', () => {
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('be.visible');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).should('be.visible');

        cy.findByRole('textbox', { name: 'Fornavn' }).should('be.visible');
        cy.findByRoleWhenAttached('textbox', { name: 'Fornavn' }).type('Storm');
        cy.findByRole('combobox', { name: 'I hvilket land bor du?' })
          .should('be.visible')
          .type('Norge{downArrow}{enter}');
        cy.findByRole('combobox', { name: 'Velg valuta' }).should('be.visible').type('{upArrow}{enter}');
        cy.findByRole('combobox', { name: 'Velg instrument (valgfritt)' }).type('Gitar{enter}');
        cy.findByRole('textbox', { name: 'Gyldig fra dato' }).type('01.01.2023{esc}');
        cy.clickSaveAndContinue();
        cy.wait('@updateMellomlagring');

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.get('dl')
          .first()
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Fornavn');
            cy.get('dd').eq(0).should('contain.text', 'Storm');
            cy.get('dt').eq(1).should('contain.text', 'I hvilket land bor du?');
            cy.get('dd').eq(1).should('contain.text', 'Norge');
            cy.get('dt').eq(2).should('contain.text', 'Velg valuta');
            cy.get('dd').eq(2).should('contain.text', 'Australske dollar (AUD)');
            cy.get('dt').eq(3).should('contain.text', 'Velg instrument');
            cy.get('dd').eq(3).should('contain.text', 'Gitar');
            cy.get('dt').eq(4).should('contain.text', 'Gyldig fra dato');
            cy.get('dd').eq(4).should('contain.text', '01.01.2023');
            cy.get('dt').eq(5).should('contain.text', 'Velg frukt');
            cy.get('dd').eq(5).should('contain.text', 'Fersken');
          });

        cy.clickEditAnswer('Dine opplysninger');

        // Expect requests since we navigate back from summary page
        cy.wait('@getCurrencies');
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
        cy.findByRole('link', { name: 'Lagre og fortsett' }).should('be.visible');

        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Storm');
        // TODO: Not the nicest way to check values from react-select. But not worth the time to debug since it will be replaced by Aksel select.
        cy.get('.formio-component-landvelger').contains('Norge');
        cy.get('.formio-component-valutavelger').contains('Australske dollar (AUD)');
        cy.get('.formio-component-velgInstrument').contains('Gitar');
        cy.findByRole('textbox', { name: 'Gyldig fra dato' }).should('have.value', '01.01.2023');
        cy.findByLabelText('Velg frukt')
          .should('exist')
          .within(() => {
            cy.findByRole('radio', { name: 'Fersken' }).should('be.checked');
          });
      });
    });

    describe('Components within conditional DataGrid', () => {
      beforeEach(() => {
        cy.visit('/fyllut/customcompsdatagrid/dineopplysninger?sub=paper');
        cy.defaultWaits();
        cy.findByRole('checkbox', { name: 'Avkryssingsboks' }).click();
      });

      it('make sure you can add multiple select boxes in a DataGrid and edit them', () => {
        const labelSelect = 'Nedtrekksmeny';
        const labelDate = 'Dato (dd.mm.åååå)';
        const legendRadiopanel = 'Bor du i Norge?';
        const labelAdd = 'Legg til';
        cy.findAllByRole('combobox', { name: labelSelect }).eq(0).type('a{enter}');
        cy.findAllByRole('textbox', { name: labelDate }).eq(0).type('10.10.2000{esc}');
        cy.findAllByText(legendRadiopanel).should('have.length', 1).eq(0).shouldBeVisible();
        cy.findAllByRole('group', { name: legendRadiopanel })
          .eq(0)
          .within(() => {
            cy.findByLabelText('Ja').should('exist').click();
          });
        cy.findByRole('button', { name: labelAdd }).click();
        cy.findAllByRole('combobox', { name: labelSelect }).eq(1).type('b{enter}');
        cy.findAllByRole('textbox', { name: labelDate }).eq(1).type('11.10.2000{esc}');
        cy.findAllByText(legendRadiopanel).should('have.length', 2).eq(1).shouldBeVisible();
        cy.findAllByRole('group', { name: legendRadiopanel })
          .eq(1)
          .within(() => {
            cy.findByLabelText('Nei').should('exist').click();
          });
        cy.findByRole('button', { name: labelAdd }).click();
        cy.findAllByRole('combobox', { name: labelSelect }).eq(2).type('a{enter}');
        cy.findAllByRole('textbox', { name: labelDate }).eq(2).type('12.10.2000{esc}');
        cy.findAllByText(legendRadiopanel).should('have.length', 3).eq(2).shouldBeVisible();
        cy.findAllByRole('group', { name: legendRadiopanel })
          .eq(2)
          .within(() => {
            cy.findByLabelText('Nei').should('exist').click();
          });

        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

        cy.get('dl')
          .eq(1)
          .within(() => {
            cy.get('dt').eq(0).contains(labelSelect);
            cy.get('dd').eq(0).contains('a');
            cy.get('dt').eq(1).contains(labelDate);
            cy.get('dd').eq(1).contains('10.10.2000');
            cy.get('dt').eq(2).contains(legendRadiopanel);
            cy.get('dd').eq(2).contains('Ja');
          });

        cy.get('dl')
          .eq(2)
          .within(() => {
            cy.get('dt').eq(0).contains(labelSelect);
            cy.get('dd').eq(0).contains('b');
            cy.get('dt').eq(1).contains(labelDate);
            cy.get('dd').eq(1).contains('11.10.2000');
            cy.get('dt').eq(2).contains(legendRadiopanel);
            cy.get('dd').eq(2).contains('Nei');
          });

        cy.get('dl')
          .eq(3)
          .within(() => {
            cy.get('dt').eq(0).contains(labelSelect);
            cy.get('dd').eq(0).contains('a');
            cy.get('dt').eq(1).contains(labelDate);
            cy.get('dd').eq(1).contains('12.10.2000');
            cy.get('dt').eq(2).contains(legendRadiopanel);
            cy.get('dd').eq(2).contains('Nei');
          });
      });
    });
  });
});
