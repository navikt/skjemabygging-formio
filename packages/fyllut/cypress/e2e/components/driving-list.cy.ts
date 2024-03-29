import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const ACTIVITIES_LABEL = TEXTS.statiske.activities.label;
const DATE_PICKER_LABEL = TEXTS.statiske.drivingList.datePicker;
const PERIOD_TYPE_LABEL = TEXTS.statiske.drivingList.periodType;
const PARKING_LABEL = TEXTS.statiske.drivingList.parking;
const PARKING_EXPENSES_LABEL = /Parkeringsutgifter \(kr\)/;
const DAY_PICKER_LABEL_WITH_PARKING =
  TEXTS.statiske.drivingList.dateSelect + ' ' + TEXTS.statiske.drivingList.dateSelectParking;

const dateFormatShortYear: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
};

const toLocaleDateShortYear = (date: string, locale = 'no') =>
  new Date(date).toLocaleString(locale, dateFormatShortYear);

describe('DrivingList', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsExternal();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('paper', () => {
    it('should fill out form and show data in summary', () => {
      cy.visit(`/fyllut/testdrivinglist?sub=paper`);
      cy.defaultWaits();
      cy.clickStart();

      // Should not show parking and date input before selecting period type
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).should('not.exist');
      cy.findByRole('group', { name: PARKING_LABEL }).should('not.exist');

      cy.findByRole('group', { name: PERIOD_TYPE_LABEL })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: 'Månedlig' }).should('exist');
          cy.findByRole('radio', { name: 'Ukentlig' }).should('exist').check();
        });

      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).should('exist').type('15.05.23{esc}');
      cy.findByRole('group', { name: PARKING_LABEL })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: 'Ja' }).should('exist').check();
        });

      cy.findByRole('button', { name: '15.05.2023 - 21.05.2023' }).click();

      cy.findByRole('group', { name: DAY_PICKER_LABEL_WITH_PARKING })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 7);
          cy.findByRole('checkbox', { name: 'mandag 15.05.23' }).should('exist').check();
          cy.findByRole('checkbox', { name: 'søndag 21.05.23' }).should('exist').check();
          cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(0).should('exist').type('100');
        });

      cy.clickNextStep();

      // Summary
      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Legg til kjøreliste for en eller flere perioder');

          cy.findAllByRole('listitem').should('have.length', 2);
          cy.findByText('15.05.2023 - 100kr').should('exist');
          cy.findByText('21.05.2023').should('exist');
        });
    });

    it('should show errors', () => {
      cy.visit(`/fyllut/testdrivinglist?sub=paper`);
      cy.defaultWaits();
      cy.clickStart();

      // Should fill out form
      cy.clickNextStep();
      cy.findByRole('region', { name: TEXTS.validering.error })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: `Du må fylle ut: ${PERIOD_TYPE_LABEL}` })
            .should('exist')
            .click();
        });

      cy.findByRole('group', { name: PERIOD_TYPE_LABEL })
        .should('exist')
        .should('have.focus')
        .within(() => {
          cy.findByRole('radio', { name: 'Ukentlig' }).should('exist').check();
        });

      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).should('exist').type('15.05.23{esc}');
      cy.findByRole('radio', { name: 'Ja' }).should('exist').check();
      cy.findByRole('button', { name: '15.05.2023 - 21.05.2023' }).click();
      cy.findByRole('checkbox', { name: 'mandag 15.05.23' }).should('exist').check();

      // Parking expenses should not be over 100
      cy.findByRole('textbox', { name: PARKING_EXPENSES_LABEL }).should('exist').type('101');
      cy.clickNextStep();
      cy.findByRole('region', { name: TEXTS.validering.error })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: TEXTS.validering.parkingExpensesAboveHundred }).should('exist');
        });

      // Parking expenses should be a number
      cy.findByRole('textbox', { name: PARKING_EXPENSES_LABEL }).clear();
      cy.findByRole('textbox', { name: PARKING_EXPENSES_LABEL }).type('text');
      cy.clickNextStep();
      cy.findByRole('region', { name: TEXTS.validering.error })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Parkeringsutgiftene for 15.05.2023 må være et gyldig beløp' })
            .should('exist')
            .click();
        });

      cy.findByRole('textbox', { name: PARKING_EXPENSES_LABEL }).should('have.focus').type('{selectall}78');
      cy.findByRole('region', { name: TEXTS.validering.error }).should('not.exist');
    });

    it('should add and remove periods', () => {
      cy.visit(`/fyllut/testdrivinglist?sub=paper`);
      cy.defaultWaits();
      cy.clickStart();

      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      cy.findByRole('radio', { name: 'Ukentlig' }).should('exist').check();

      const dateString = `${toLocaleDateShortYear(twoWeeksAgo.toString())}{esc}`;
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).should('exist').type(dateString);
      cy.findByRole('radio', { name: 'Ja' }).should('exist').check();

      cy.findByRole('button', { name: 'Fjern periode' }).should('not.exist');
      cy.findByRole('button', { name: 'Legg til periode' }).click();
      cy.get('.navds-accordion__item').should('have.length', 2);
      cy.findByRole('button', { name: 'Legg til periode' }).should('not.exist');

      cy.findByRole('button', { name: 'Fjern periode' }).should('exist').click();
      cy.get('.navds-accordion__item').should('have.length', 1);
    });
  });

  describe('digital', () => {
    it('should fill out form and show data in summary', () => {
      cy.visit(`/fyllut/testdrivinglist?sub=digital`);
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@getActivities');

      cy.findByRole('group', { name: ACTIVITIES_LABEL })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Arbeidstrening: 01.01.2024 - 31.08.2024' }).should('exist').check();
        });

      cy.get('.navds-alert').within(() => {
        cy.findByRole('heading', { name: 'Aktivitet' }).should('exist');
        cy.findByText('Arbeidstrening').should('exist');

        cy.findByRole('heading', { name: 'Periode for aktiviteten' }).should('exist');
        cy.findByText('01.01.2024 - 31.08.2024').should('exist');

        cy.findByRole('heading', { name: 'Din dagsats uten parkeringsutgift' }).should('exist');
        cy.findByText('67kr').should('exist');
      });

      cy.findByRole('heading', { name: 'Perioder du tidligere har fått refundert reiseutgifter for' }).should('exist');
      cy.findByText('01.01.2024 - 07.01.2024 (335 kr)').should('exist');

      cy.findByRole('button', { name: '08.01.2024 - 14.01.2024' }).click();
      cy.findByRole('button', { name: '15.01.2024 - 21.01.2024' }).click();

      cy.findAllByRole('group', { name: DAY_PICKER_LABEL_WITH_PARKING })
        .should('exist')
        .first()
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 7);
          cy.findByRole('checkbox', { name: 'lørdag 13.01.24' }).should('exist').check();
          cy.findByRole('textbox', { name: PARKING_EXPENSES_LABEL }).should('exist').type('100');
        });

      cy.findAllByRole('group', { name: DAY_PICKER_LABEL_WITH_PARKING })
        .should('exist')
        .last()
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 7);
          cy.findByRole('checkbox', { name: 'fredag 19.01.24' }).should('exist').check();
        });

      cy.clickSaveAndContinue();

      // Summary
      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Legg til kjøreliste for en eller flere perioder');

          cy.findAllByRole('listitem').should('have.length', 2);
          cy.findByText('13.01.2024 - 100kr').should('exist');
          cy.findByText('19.01.2024').should('exist');
        });
    });

    it('should fill out mellomlagret values', () => {
      cy.visit(`/fyllut/testdrivinglist/veiledning?sub=digital&innsendingsId=8495201b-71fd-4a95-82f8-d224d32237e5`);
      cy.mocksUseRouteVariant('get-soknad:success-driving-list');
      cy.defaultWaits();
      cy.wait('@getActivities');

      cy.findByRole('radio', { name: 'Arbeidstrening: 01.01.2024 - 31.08.2024' }).should('be.checked');

      cy.findByRole('button', { name: '08.01.2024 - 14.01.2024' }).click();
      cy.findByRole('checkbox', { name: 'mandag 08.01.24' }).should('be.checked');
      cy.findByRole('checkbox', { name: 'fredag 12.01.24' }).should('be.checked');
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(0).should('have.value', '');
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(1).should('have.value', '50');

      cy.findByRole('button', { name: '15.01.2024 - 21.01.2024' }).click();
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(2).should('have.value', '100');
      cy.findByRole('checkbox', { name: 'mandag 15.01.24' }).should('be.checked');
    });

    it('should show errors', () => {
      cy.visit(`/fyllut/testdrivinglist?sub=digital`);
      cy.defaultWaits();

      cy.clickStart();
      cy.wait('@getActivities');

      cy.clickSaveAndContinue();
      cy.findByRole('region', { name: TEXTS.validering.error })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: `Du må fylle ut: ${ACTIVITIES_LABEL}` })
            .should('exist')
            .click();
        });

      cy.findByRole('group', { name: ACTIVITIES_LABEL })
        .should('exist')
        .should('have.focus')
        .within(() => {
          cy.findByRole('radio', { name: 'Arbeidstrening: 01.01.2024 - 31.08.2024' }).should('exist').check();
        });

      // Expenses are higher than the refund limit
      cy.findByRole('button', { name: '08.01.2024 - 14.01.2024' }).click();
      cy.findByRole('checkbox', { name: 'fredag 12.01.24' }).should('exist').check();
      cy.findByRole('checkbox', { name: 'lørdag 13.01.24' }).should('exist').check();
      cy.findByRole('checkbox', { name: 'søndag 14.01.24' }).should('exist').check();

      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(0).should('exist').type('100');
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(1).should('exist').type('100');
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(2).should('exist').type('100');

      cy.get('.navds-alert')
        .eq(1)
        .within(() => {
          cy.findByRole('heading', { name: TEXTS.statiske.drivingList.expensesTooHighHeader }).should('exist');
        });
    });

    it('should render alert when there are no activities and error when trying to continue', () => {
      cy.visit(`/fyllut/testdrivinglist?sub=digital`);
      cy.defaultWaits();
      cy.mocksUseRouteVariant('get-activities:success-empty');
      cy.clickStart();
      cy.wait('@getActivities');

      cy.get('.navds-alert').within(() => {
        cy.findByText(TEXTS.statiske.drivingList.noVedtak).should('exist');
      });

      cy.clickSaveAndContinue();
      cy.findByRole('region', { name: TEXTS.validering.error })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: `Du må fylle ut: ${ACTIVITIES_LABEL}` }).should('exist');
        });
    });
  });
});
