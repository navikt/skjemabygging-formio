import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import * as moment from 'moment';

describe('Custom react components', () => {
  beforeEach(() => {
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.clearBrowserCache',
    });
    cy.defaultIntercepts();
  });

  describe('General', () => {
    describe('Fill in form and view summary, paper', () => {
      beforeEach(() => {
        cy.intercept('GET', '/fyllut/api/forms/customcomps').as('getForm');
        cy.intercept('GET', '/fyllut/api/translations/customcomps').as('getTranslations');
        cy.visit('/fyllut/customcomps/dineopplysninger?sub=paper');
        cy.wait('@getConfig');
        cy.wait('@getForm');
        cy.wait('@getGlobalTranslation');
        cy.wait('@getTranslations');
        cy.wait('@getCountries');
        cy.wait('@getCurrencies');
      });

      it('reflects changes on summary page when editing data', () => {
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('be.visible');
        cy.findByRole('textbox', { name: 'Fornavn' }).type('Storm');
        cy.findByRole('combobox', { name: 'I hvilket land bor du?' }).click();

        cy.findByRole('combobox', { name: 'I hvilket land bor du?' }).type(
          'Nor{downArrow}{downArrow}{downArrow}{downArrow}{enter}',
        );
        cy.findByRole('combobox', { name: 'Velg instrument (valgfritt)' }).type('Gitar{enter}');
        cy.findByRole('textbox', { name: 'Gyldig fra dato' }).type('01.01.2023{esc}');
        cy.clickNextStep();

        cy.findAllByText('Du må fylle ut: Velg valuta').should('have.length', 2);
        cy.findAllByText('Du må fylle ut: Velg valuta').first().click();
        cy.findByRole('combobox', { name: 'Velg valuta' }).should('have.focus').type('{upArrow}{enter}');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
        cy.findByLabelText('Annen dokumentasjon')
          .should('exist')
          .within(() =>
            cy.findByLabelText('Ja, jeg legger det ved denne søknaden.').should('exist').check({ force: true }),
          );
        cy.findByLabelText('Bekreftelse på skoleplass')
          .should('exist')
          .within(() =>
            cy.findByLabelText('Jeg har levert denne dokumentasjonen tidligere').should('exist').check({ force: true }),
          );
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
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
            cy.get('dd').eq(4).should('contain.text', '1.1.2023');
          });

        cy.findByRole('link', { name: TEXTS.grensesnitt.moveForward }).click();

        cy.findByRole('heading', { name: 'Innsending/Send til NAV' }).should('exist');

        cy.findByRole('link', { name: TEXTS.grensesnitt.goBack }).click();

        // Need to force this since it fails on GitHub
        cy.findByRole('link', { name: 'Rediger dine opplysninger' }).click({ force: true });
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
        cy.findByRole('navigation', { name: 'Søknadssteg' })
          .should('exist')
          .within(() => {
            cy.findByRole('link', { name: 'Oppsummering' }).click();
          });

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
            cy.get('dd').eq(3).should('contain.text', '2.1.2023');
          });
      });
    });

    describe('Fill in form and view summary, digital', () => {
      beforeEach(() => {
        cy.intercept('GET', '/fyllut/api/forms/customcomps').as('getForm');
        cy.intercept('GET', '/fyllut/api/translations/customcomps').as('getTranslations');
        cy.visit('/fyllut/customcomps/dineopplysninger?sub=digital');
        cy.wait('@getConfig');
        cy.wait('@getForm');
        cy.wait('@getGlobalTranslation');
        cy.wait('@getTranslations');
        cy.wait('@getCountries');
        cy.wait('@getCurrencies');
      });

      it('make sure components keep their values after going to summary page', () => {
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('be.visible');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('be.visible');
        cy.findByRoleWhenAttached('textbox', { name: 'Fornavn' }).type('Storm');
        cy.findByRole('combobox', { name: 'I hvilket land bor du?' })
          .should('be.visible')
          .type('Nor{downArrow}{downArrow}{downArrow}{downArrow}{enter}');
        cy.findByRole('combobox', { name: 'Velg valuta' }).should('be.visible').type('{upArrow}{enter}');
        cy.findByRole('combobox', { name: 'Velg instrument (valgfritt)' }).type('Gitar{enter}');
        cy.findByRole('textbox', { name: 'Gyldig fra dato' }).type('01.01.2023{esc}');
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
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
            cy.get('dd').eq(4).should('contain.text', '1.1.2023');
          });

        cy.findByRole('link', { name: 'Rediger dine opplysninger' }).click();
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');

        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Storm');
        // TODO: Not the nicest way to check values from react-select. But not worth the time to debug since it will be replaced by Aksel select.
        cy.get('.formio-component-landvelger').contains('Norge');
        cy.get('.formio-component-valutavelger').contains('Australske dollar (AUD)');
        cy.get('.formio-component-velgInstrument').contains('Gitar');
        cy.findByRole('textbox', { name: 'Gyldig fra dato' }).should('have.value', '01.01.2023');
      });
    });

    describe('Components within conditional DataGrid', () => {
      beforeEach(() => {
        cy.intercept('GET', '/fyllut/api/forms/customcompsdatagrid').as('getDataGridForm');
        cy.visit('/fyllut/customcompsdatagrid/dineopplysninger?sub=paper');
        cy.wait('@getConfig');
        cy.wait('@getDataGridForm');
        cy.findByRole('checkbox', { name: 'Avkryssingsboks' }).click();
      });

      it('make sure you can add multiple select boxes in a DataGrid and edit them', () => {
        const labelSelect = 'Nedtrekksmeny';
        const labelDate = 'Dato (dd.mm.åååå)';
        const labelAdd = 'Legg til';
        cy.findAllByRole('combobox', { name: labelSelect }).eq(0).type('a{enter}');
        cy.findAllByRole('textbox', { name: labelDate }).eq(0).type('10.10.2000{esc}');
        cy.findByRole('button', { name: labelAdd }).click();
        cy.findAllByRole('combobox', { name: labelSelect }).eq(1).type('b{enter}');
        cy.findAllByRole('textbox', { name: labelDate }).eq(1).type('11.10.2000{esc}');
        cy.findByRole('button', { name: labelAdd }).click();
        cy.findAllByRole('combobox', { name: labelSelect }).eq(2).type('a{enter}');
        cy.findAllByRole('textbox', { name: labelDate }).eq(2).type('12.10.2000{esc}');

        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

        cy.get('dl')
          .eq(1)
          .within(() => {
            cy.get('dt').eq(0).contains(labelSelect);
            cy.get('dd').eq(0).contains('a');
            cy.get('dt').eq(1).contains(labelDate);
            cy.get('dd').eq(1).contains('10.10.2000');
          });

        cy.get('dl')
          .eq(2)
          .within(() => {
            cy.get('dt').eq(0).contains(labelSelect);
            cy.get('dd').eq(0).contains('b');
            cy.get('dt').eq(1).contains(labelDate);
            cy.get('dd').eq(1).contains('11.10.2000');
          });

        cy.get('dl')
          .eq(3)
          .within(() => {
            cy.get('dt').eq(0).contains(labelSelect);
            cy.get('dd').eq(0).contains('a');
            cy.get('dt').eq(1).contains(labelDate);
            cy.get('dd').eq(1).contains('12.10.2000');
          });
      });
    });
  });

  describe('NavDatepicker', () => {
    beforeEach(() => {
      cy.intercept('GET', '/fyllut/api/forms/navdatepicker').as('getNavDatepickerForm');
      cy.intercept('GET', '/fyllut/api/translations/navdatepicker').as('getNavDatepickerTranslations');
      cy.visit('/fyllut/navdatepicker/veiledning?sub=paper');
      cy.wait('@getConfig');
      cy.wait('@getNavDatepickerForm');
    });

    describe('Date input value', () => {
      beforeEach(() => {
        cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('06.06.2022');
        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      });

      it('is rendered on summary page', () => {
        cy.get('dl')
          .first()
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Tilfeldig dato');
            cy.get('dd').eq(0).should('contain.text', '6.6.2022');
          });
      });

      it('is editable after returning from summary page', () => {
        cy.findByRole('link', { name: 'Rediger veiledning' }).click();
        cy.findByRole('heading', { name: 'Veiledning' }).should('be.visible');
        cy.findByRoleWhenAttached('textbox', { name: 'Tilfeldig dato' }).should('be.visible').and('be.enabled');
        cy.findByRoleWhenAttached('textbox', { name: 'Tilfeldig dato' }).type('{selectall}18.06.2020');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
        cy.get('dl')
          .first()
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Tilfeldig dato');
            cy.get('dd').eq(0).should('contain.text', '18.6.2020');
          });
      });

      it('is cleared when user removes textbox content', () => {
        cy.findByRole('navigation', { name: 'Søknadssteg' })
          .should('exist')
          .within(() => {
            cy.findByRole('link', { name: 'Veiledning' }).click();
          });
        cy.findByRole('heading', { name: 'Veiledning' }).should('exist');

        cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('be.visible').and('be.enabled');
        cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('have.value', '06.06.2022');
        cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type('{selectall}{backspace}');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('not.exist');
        cy.findAllByText('Du må fylle ut: Tilfeldig dato').should('have.length', 1);
        cy.findAllByText('Tilfeldig dato: Du må fylle ut: Tilfeldig dato').should('have.length', 1);
      });
    });

    describe('Date input field', () => {
      it('has focus after clicking validation message link', () => {
        cy.clickNextStep();

        cy.findAllByText('Du må fylle ut: Tilfeldig dato').should('have.length', 1);
        cy.findByRoleWhenAttached('link', { name: 'Tilfeldig dato: Du må fylle ut: Tilfeldig dato' })
          .should('exist')
          .click();

        cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('have.focus').type('02.02.2023');
        cy.clickNextStep();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      });
    });

    describe('Valdation against another date input field', () => {
      const MY_TEST_DATE = '15.05.2023';

      beforeEach(() => {
        cy.findByRole('textbox', { name: 'Tilfeldig dato' }).should('be.visible');
        cy.findByRole('textbox', { name: 'Tilfeldig dato' }).type(`${MY_TEST_DATE}{esc}`);
      });

      describe('mayBeEqual=false', () => {
        const LABEL = 'Dato med validering mot annet datofelt (valgfritt)';
        const VALIDATION_TEXT = `Datoen må være senere enn ${MY_TEST_DATE}`;

        it('fails when date is before', () => {
          cy.findByRole('textbox', { name: LABEL }).type('14.05.2023');
          cy.clickNextStep();

          cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
        });

        it('fails when date is equal', () => {
          cy.findByRole('textbox', { name: LABEL }).type('15.05.2023');
          cy.clickNextStep();

          cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
        });

        it('ok when date is later', () => {
          cy.findByRole('textbox', { name: LABEL }).type('16.05.2023');
          cy.clickNextStep();

          cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
        });
      });

      describe('mayBeEqual=true', () => {
        const LABEL = 'Dato med validering mot annet datofelt (kan være lik) (valgfritt)';
        const VALIDATION_TEXT = `Datoen kan ikke være tidligere enn ${MY_TEST_DATE}`;

        it('fails when date is before', () => {
          cy.findByRole('textbox', { name: LABEL }).type(`14.05.2023{esc}`);
          cy.clickNextStep();

          cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
        });

        it('fails when date is equal', () => {
          cy.findByRole('textbox', { name: LABEL }).type('15.05.2023{esc}');
          cy.clickNextStep();

          cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
        });

        it('ok when date is later', () => {
          cy.findByRole('textbox', { name: LABEL }).type('16.05.2023{esc}');
          cy.clickNextStep();

          cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
        });
      });
    });

    describe('Validation of date with earliest / latest contraint', () => {
      const LABEL = 'Dato med validering av tidligst og senest (valgfritt)';
      const EARLIEST_DATE = '01.08.2023';
      const LATEST_DATE = '31.08.2023';
      const VALIDATION_TEXT = `Datoen kan ikke være tidligere enn ${EARLIEST_DATE} eller senere enn ${LATEST_DATE}`;

      it("fails when date is before 'earliest date'", () => {
        cy.findByRole('textbox', { name: LABEL }).type('15.07.2023{esc}');
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
      });

      it("is ok when date is equal to 'earliest date'", () => {
        cy.findByRole('textbox', { name: LABEL }).type(`${EARLIEST_DATE}{esc}`);
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
      });

      it("is ok when date is equal to 'latest date'", () => {
        cy.findByRole('textbox', { name: LABEL }).type(`${LATEST_DATE}{esc}`);
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
      });

      it("fails when date is after 'latest date'", () => {
        cy.findByRole('textbox', { name: LABEL }).type('01.09.2023{esc}');
        cy.clickNextStep();

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
      });
    });

    describe('Validation of date with earliest (-10) / latest (5) relative constraint', () => {
      const EARLIEST_RELATIVE = -10;
      const LATEST_RELATIVE = 5;

      const LABEL = 'Dato med validering av antall dager tilbake eller framover (valgfritt)';
      const NOW = moment();
      const INPUT_FORMAT = 'DD.MM.YYYY';
      const plusDays = (date, number) => date.clone().add(number, 'days').format(INPUT_FORMAT);
      const VALIDATION_TEXT = `Datoen kan ikke være tidligere enn ${plusDays(
        NOW,
        EARLIEST_RELATIVE,
      )} eller senere enn ${plusDays(NOW, LATEST_RELATIVE)}`;

      it('fails when date is before the earliest limit', () => {
        cy.findByRole('textbox', { name: LABEL }).type(plusDays(NOW, EARLIEST_RELATIVE - 1));
        cy.clickNextStep();
        console.log('VALIDATION_TEXT', VALIDATION_TEXT);

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
      });

      it('is ok when date is exactly the earliest limit', () => {
        cy.findByRole('textbox', { name: LABEL }).type(plusDays(NOW, EARLIEST_RELATIVE));
        cy.clickNextStep();
        console.log('VALIDATION_TEXT', VALIDATION_TEXT);

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
      });

      it('is ok when date is exactly the latest limit', () => {
        cy.findByRole('textbox', { name: LABEL }).type(plusDays(NOW, LATEST_RELATIVE));
        cy.clickNextStep();
        console.log('VALIDATION_TEXT', VALIDATION_TEXT);

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 0);
      });

      it('fails when date is after the earliest limit', () => {
        cy.findByRole('textbox', { name: LABEL }).type(plusDays(NOW, LATEST_RELATIVE + 1));
        cy.clickNextStep();
        console.log('VALIDATION_TEXT', VALIDATION_TEXT);

        cy.findAllByText(VALIDATION_TEXT).should('have.length', 1);
      });
    });
  });

  describe('NavAlert', () => {
    beforeEach(() => {
      cy.intercept('GET', '/fyllut/api/forms/testingalert').as('getAlertForm');
      cy.visit('/fyllut/testingalert/page1?sub=paper');
      cy.wait('@getConfig');
      cy.wait('@getAlertForm');
    });

    // New alerts (using react)
    it('should show default info with content', () => {
      cy.get('.navds-alert').contains('New alert 1');
    });

    it('should show success variant with content', () => {
      cy.get('.navds-alert--success').contains('New alert 2');
    });

    it('should have marginBottom of var(--a-spacing-10) which is 2.5rem = 40px', () => {
      cy.contains('.formio-component-alertstripe', 'New alert 1').should('have.css', 'marginBottom', '40px');
    });

    it('should have marginBottom of 0px as the last element in the group', () => {
      cy.contains('.formio-component-alertstripe', 'New alert 2').should('have.css', 'marginBottom', '0px');
    });

    it('should not show any labels', () => {
      cy.get('.formio-form').should('not.have.descendants', 'label');
    });

    it('should display html content - h1 and a link to nav.no', () => {
      cy.get('.formio-component-alertstripehtml').find('h1').should('have.text', 'Tittel');
      cy.get('.formio-component-alertstripehtml').find('a').should('have.attr', 'href', 'https://www.nav.no/');
    });

    // Old alerts (components have input=true on component and label defined)
    it('should have marginBottom from input=true of var(--a-spacing-10) which is 2.5rem = 40px', () => {
      cy.contains('.formio-component-alertstripe', 'Old alert 1').should('have.css', 'marginBottom', '40px');
    });

    it('should have marginBottom from input=true of var(--a-spacing-10) which is 2.5rem = 40px for last element in group', () => {
      cy.contains('.formio-component-alertstripe', 'Old alert 2').should('have.css', 'marginBottom', '40px');
    });
  });
});
