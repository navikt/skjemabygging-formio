import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const ACTIVITIES_LABEL = TEXTS.statiske.activities.label;
const DATE_PICKER_LABEL = TEXTS.statiske.drivingList.datePicker;
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

      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).should('exist').type('15.05.23{esc}');
      cy.findByRole('group', { name: PARKING_LABEL })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: 'Ja' }).should('exist').check();
        });

      cy.findByRole('button', { name: '15. mai 2023 - 21. mai 2023' }).click();

      cy.findByRole('group', { name: DAY_PICKER_LABEL_WITH_PARKING })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 7);
          cy.findByRole('checkbox', { name: 'mandag 15. mai 2023' }).should('exist').check();
          cy.findByRole('checkbox', { name: 'søndag 21. mai 2023' }).should('exist').check();
          cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(0).should('exist').type('100');
        });

      cy.clickNextStep();

      // Summary
      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Legg til kjøreliste for en eller flere perioder');

          cy.findAllByRole('listitem').should('have.length', 2);
          cy.findByText('mandag 15. mai 2023, parkeringsutgift: 100 kr').should('exist');
          cy.findByText('søndag 21. mai 2023').should('exist');
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
          cy.findByRole('link', { name: `Du må fylle ut: ${DATE_PICKER_LABEL}` })
            .should('exist')
            .click();
        });

      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).should('exist').type('15.05.23{esc}');
      cy.findByRole('radio', { name: 'Ja' }).should('exist').check();
      cy.findByRole('button', { name: '15. mai 2023 - 21. mai 2023' }).click();
      cy.findByRole('checkbox', { name: 'mandag 15. mai 2023' }).should('exist').check();

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

      // Parking expenses should not show even with value over 100
      cy.findByRole('textbox', { name: PARKING_EXPENSES_LABEL }).should('exist').type('101');
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('should add and remove periods', () => {
      cy.visit(`/fyllut/testdrivinglist?sub=paper`);
      cy.defaultWaits();
      cy.clickStart();

      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const dateString = `${toLocaleDateShortYear(twoWeeksAgo.toString())}{esc}`;
      cy.findByRole('textbox', { name: DATE_PICKER_LABEL }).should('exist').type(dateString);
      cy.findByRole('radio', { name: 'Ja' }).should('exist').check();

      cy.findByRole('button', { name: 'Fjern periode' }).should('not.exist');
      cy.findByRole('button', { name: 'Legg til periode' }).click();
      cy.findByRole('button', { name: 'Legg til periode' }).click();

      cy.get('.navds-accordion__item').should('have.length', 3);
      cy.findByRole('button', { name: 'Legg til periode' }).should('not.exist');

      cy.findByRole('button', { name: 'Fjern periode' }).should('exist').click();
      cy.get('.navds-accordion__item').should('have.length', 2);
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
          cy.findByRole('radio', { name: 'Arbeidstrening: 01. januar 2024 - 31. august 2024' }).should('exist').check();
        });

      cy.get('.navds-alert')
        .eq(0)
        .within(() => {
          cy.findByRole('heading', { name: 'Dine aktiviteter' }).should('exist');

          cy.findByRole('heading', { name: 'Arbeidstrening' }).should('exist');
          cy.findByText('Periode: 01. januar 2024 - 31. august 2024').should('exist');
          cy.findAllByText('Dagsats for parkeringsavgift: 67 kr').eq(0).should('exist').get;

          cy.findByRole('heading', { name: 'Avklaring' }).should('exist');
          cy.findByText('Periode: 01. februar 2024 - 31. mars 2024').should('exist');
          cy.findAllByText('Dagsats for parkeringsavgift: 67 kr').eq(1).should('exist');
        });

      cy.findByRole('heading', { name: 'Perioder du tidligere har fått refundert reiseutgifter for' }).should('exist');
      cy.findByText('01. januar 2024 - 07. januar 2024 (335 kr)').should('exist');

      cy.findByRole('button', { name: '08. januar 2024 - 14. januar 2024' }).click();
      cy.findByRole('button', { name: '15. januar 2024 - 21. januar 2024' }).click();

      cy.findAllByRole('group', { name: DAY_PICKER_LABEL_WITH_PARKING })
        .should('exist')
        .first()
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 7);
          cy.findByRole('checkbox', { name: 'lørdag 13. januar 2024' }).should('exist').check();
          cy.findByRole('textbox', { name: PARKING_EXPENSES_LABEL }).should('exist').type('100');
        });

      cy.findAllByRole('group', { name: DAY_PICKER_LABEL_WITH_PARKING })
        .should('exist')
        .last()
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 7);
          cy.findByRole('checkbox', { name: 'fredag 19. januar 2024' }).should('exist').check();
        });

      cy.clickSaveAndContinue();

      // Summary
      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Legg til kjøreliste for en eller flere perioder');

          cy.findAllByRole('listitem').should('have.length', 2);
          cy.findByText('lørdag 13. januar 2024, parkeringsutgift: 100 kr').should('exist');
          cy.findByText('fredag 19. januar 2024').should('exist');
        });
    });

    it('should fill out mellomlagret values', () => {
      cy.visit(`/fyllut/testdrivinglist/veiledning?sub=digital&innsendingsId=8495201b-71fd-4a95-82f8-d224d32237e5`);
      cy.mocksUseRouteVariant('get-soknad:success-driving-list');
      cy.defaultWaits();
      cy.wait('@getActivities');

      cy.findByRole('radio', { name: 'Arbeidstrening: 01. januar 2024 - 31. august 2024' }).should('be.checked');

      cy.findByRole('button', { name: '08. januar 2024 - 14. januar 2024' }).click();
      cy.findByRole('checkbox', { name: 'mandag 08. januar 2024' }).should('be.checked');
      cy.findByRole('checkbox', { name: 'fredag 12. januar 2024' }).should('be.checked');
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(0).should('have.value', '');
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(1).should('have.value', '50');

      cy.findByRole('button', { name: '15. januar 2024 - 21. januar 2024' }).click();
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(2).should('have.value', '100');
      cy.findByRole('checkbox', { name: 'mandag 15. januar 2024' }).should('be.checked');
    });

    it('should load driving list without dates', () => {
      cy.visit(`/fyllut/testdrivinglist/veiledning?sub=digital&innsendingsId=a66e8932-ce2a-41c1-932b-716fc487813b`);
      cy.mocksUseRouteVariant('get-soknad:success-driving-list-no-dates');
      cy.defaultWaits();
      cy.wait('@getActivities');

      cy.findByRole('radio', { name: 'Arbeidstrening: 01. januar 2024 - 31. august 2024' }).should('be.checked');

      // Should not show error message when loading mellomlagret driving list without dates. Only show the activity alert and alert for parking
      cy.get('.navds-alert')
        .should('have.length', 2)
        .eq(0)
        .within(() => {
          cy.findByText('Dine aktiviteter').should('exist');
        });
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
          cy.findByRole('radio', { name: 'Arbeidstrening: 01. januar 2024 - 31. august 2024' }).should('exist').check();
        });

      // Expenses are higher than the refund limit
      cy.findByRole('button', { name: '08. januar 2024 - 14. januar 2024' }).click();
      cy.findByRole('checkbox', { name: 'fredag 12. januar 2024' }).should('exist').check();
      cy.findByRole('checkbox', { name: 'lørdag 13. januar 2024' }).should('exist').check();
      cy.findByRole('checkbox', { name: 'søndag 14. januar 2024' }).should('exist').check();

      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(0).should('exist').type('100');
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(1).should('exist').type('100');
      cy.findAllByRole('textbox', { name: PARKING_EXPENSES_LABEL }).eq(2).should('exist').type('100');

      cy.get('.navds-alert')
        .eq(2)
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
        cy.findByText(TEXTS.statiske.drivingList.noVedtakHeading).should('exist');
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
