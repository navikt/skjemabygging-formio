import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupNavFormio } from '../../../../../test/navform-render';
import NavForm from '../../../../components/nav-form/NavForm';
import { AppConfigProvider } from '../../../../context/config/configContext';
import DatePicker from './DatePicker';

Date.now = vi.fn(() => new Date('2030-05-15T12:00:00.000Z').getTime());

describe('NavDatePicker', () => {
  let datePicker;

  const mockedTranslate = (text: string, params?: Record<string, any>) => {
    text = TEXTS.validering[text] ? TEXTS.validering[text] : text;
    if (params)
      return text
        .replace(/{{2}([^{}]*field)}{2}/, params.field)
        .replace(/{{2}([^{}]*minDate)}{2}/, params.minDate)
        .replace(/{{2}([^{}]*maxDate)}{2}/, params.maxDate)
        .replace(/{{2}([^{}]*fromDate)}{2}/, params.fromDate);
    else return text;
  };

  beforeEach(() => {
    datePicker = new DatePicker(undefined, {}, {});
    vi.spyOn(DatePicker.prototype, 't').mockImplementation(mockedTranslate as any);
  });

  describe('Valideringsfunksjonene', () => {
    const createComponent = (
      beforeDateInputKey,
      mayBeEqual,
      earliestAllowedDate,
      latestAllowedDate?: number | undefined,
    ) => ({
      beforeDateInputKey,
      mayBeEqual,
      earliestAllowedDate,
      latestAllowedDate,
    });

    it('returns true when input is undefined', () => {
      expect(datePicker.validateDatePicker(undefined)).toBe(true);
      expect(datePicker.validateDatePickerV2(undefined)).toBe(true);
    });

    it('returns error message for to and from date, when both validations fail', () => {
      const comp = createComponent('fromDate', false, '10', undefined);
      const expectedValidationErrorMessage = 'Datoen må være senere enn 21.05.2030';
      expect(
        datePicker.validateDatePicker(
          '2030-05-20',
          { fromDate: '2030-05-21' },
          comp.beforeDateInputKey,
          comp.mayBeEqual,
          comp.earliestAllowedDate,
        ),
      ).toBe(expectedValidationErrorMessage);
      expect(datePicker.validateDatePickerV2('2030-05-20', { fromDate: '2030-05-21' }, comp)).toBe(
        expectedValidationErrorMessage,
      );
    });

    it('returns error message for earliest/latest date when only earliest/latest validation fails', () => {
      const comp = createComponent('fromDate', false, '10');
      const expectedValidationErrorMessage = 'Datoen kan ikke være tidligere enn 25.05.2030';
      expect(
        datePicker.validateDatePicker(
          '2030-05-20',
          { fromDate: '2030-05-19' },
          comp.beforeDateInputKey,
          comp.mayBeEqual,
          comp.earliestAllowedDate,
        ),
      ).toBe(expectedValidationErrorMessage);
      expect(datePicker.validateDatePickerV2('2030-05-20', { fromDate: '2030-05-19' }, comp)).toBe(
        expectedValidationErrorMessage,
      );
    });

    it('returns error message when both earliest/latest is set to number 0', () => {
      const comp = createComponent('fromDate', false, 0, 0);
      const expectedValidationErrorMessage =
        'Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030';
      expect(
        datePicker.validateDatePicker(
          '2030-05-20',
          { fromDate: '2030-05-19' },
          comp.beforeDateInputKey,
          comp.mayBeEqual,
          comp.earliestAllowedDate,
          comp.latestAllowedDate,
        ),
      ).toBe(expectedValidationErrorMessage);
      expect(datePicker.validateDatePickerV2('2030-05-20', { fromDate: '2030-05-19' }, comp)).toBe(
        expectedValidationErrorMessage,
      );
    });

    describe('Validation inside data grid', () => {
      it('fails validation for date inside data grid', () => {
        const input = '2021-10-01';
        const submissionData = { datagrid: [{ fraDato: '2021-10-02', tilDato: '2021-10-01' }] };
        const expectedValidationErrorMessage = 'Datoen kan ikke være tidligere enn 02.10.2021';
        const comp = createComponent('datagrid.fraDato', true, undefined, undefined);
        const row = { fraDato: '2021-10-02', tilDato: '2021-10-01' };
        expect(
          datePicker.validateDatePicker(
            input,
            submissionData,
            comp.beforeDateInputKey,
            comp.mayBeEqual,
            comp.earliestAllowedDate,
            comp.latestAllowedDate,
            row,
          ),
        ).toBe(expectedValidationErrorMessage);
        expect(datePicker.validateDatePickerV2(input, submissionData, comp, row)).toBe(expectedValidationErrorMessage);
      });

      it('validation ok when date is later than fromDate inside data grid', () => {
        const input = '2021-10-03';
        const submissionData = { datagrid: [{ fraDato: '2021-10-02', tilDato: '2021-10-03' }] };
        const comp = createComponent('datagrid.fraDato', true, undefined, undefined);
        const row = { fraDato: '2021-10-02', tilDato: '2021-10-03' };
        expect(
          datePicker.validateDatePicker(
            input,
            submissionData,
            comp.beforeDateInputKey,
            comp.mayBeEqual,
            comp.earliestAllowedDate,
            comp.latestAllowedDate,
            row,
          ),
        ).toBe(true);
        expect(datePicker.validateDatePickerV2(input, submissionData, comp, row)).toBe(true);
      });
    });
  });

  describe('Datovalidering', () => {
    const defaultDatePickerComponent = {
      id: 'oppgiDato',
      key: 'oppgiDatoKey',
      type: 'navDatepicker',
      label: 'Oppgi dato',
      dataGridLabel: true,
      validateOn: 'blur',
    };

    describe('Validation of relative latestAllowedDate/earliestAllowedDate', () => {
      describe('Datepicker med latestAllowedDate 14 dager tilbake i tid', () => {
        const component = {
          ...defaultDatePickerComponent,
          latestAllowedDate: '-14',
          beforeDateInputKey: undefined,
          mayBeEqual: undefined,
          earliestAllowedDate: undefined,
        };

        describe('Validering feiler når valgt dato er 13 dager tilbake i tid', () => {
          const submissionData = { oppgiDatoKey: '2030-05-02' };
          const row = submissionData;

          it('validateDatePicker', () => {
            const validationResultV1 = datePicker.validateDatePicker(
              '2030-05-02',
              submissionData,
              component.beforeDateInputKey,
              component.mayBeEqual,
              component.earliestAllowedDate,
              component.latestAllowedDate,
              row,
            );
            expect(validationResultV1).toBe('Datoen kan ikke være senere enn 01.05.2030');
          });

          it('validateDatePickerV2', () => {
            const validationResultV2 = datePicker.validateDatePickerV2('2030-05-02', submissionData, component, row);
            expect(validationResultV2).toBe('Datoen kan ikke være senere enn 01.05.2030');
          });
        });

        describe('Validering ok når valgt dato er 14 dager tilbake i tid', () => {
          const submissionData = { oppgiDatoKey: '2030-05-01' };
          const row = submissionData;

          it('validateDatePicker', () => {
            const validationResultV1 = datePicker.validateDatePicker(
              '2030-05-01',
              submissionData,
              component.beforeDateInputKey,
              component.mayBeEqual,
              component.earliestAllowedDate,
              component.latestAllowedDate,
              row,
            );
            expect(validationResultV1).toBe(true);
          });

          it('validateDatePickerV2', () => {
            const validationResultV2 = datePicker.validateDatePickerV2('2030-05-01', submissionData, component, row);
            expect(validationResultV2).toBe(true);
          });
        });
      });
    });

    describe('Validation of a specific earliest and/or latest date', () => {
      describe("Datepicker med specificEarliestAllowedDate lik '2030-05-03'", () => {
        const component = {
          ...defaultDatePickerComponent,
          specificEarliestAllowedDate: '2030-05-03',
        };

        it('Validering feiler når valgt dato er tidligere enn specificEarliestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-02' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-02', submissionData, component, row);
          expect(validationResultV2).toBe('Datoen kan ikke være tidligere enn 03.05.2030');
        });

        it('Validering ok når valgt dato er samme som specificEarliestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-03' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-03', submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });
      });

      describe("Datepicker med specificLatestAllowedDate lik '2030-05-02'", () => {
        const component = {
          ...defaultDatePickerComponent,
          specificLatestAllowedDate: '2030-05-02',
        };

        it('Validering feiler når valgt dato er senere enn specificLatestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-03' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-03', submissionData, component, row);
          expect(validationResultV2).toBe('Datoen kan ikke være senere enn 02.05.2030');
        });

        it('Validering ok når valgt dato er samme som specificLatestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-02' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-02', submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });
      });

      describe("Datepicker med specificEarliestAllowedDate lik '2030-05-02', og specificLatestAllowedDate lik '2030-05-03'", () => {
        const component = {
          ...defaultDatePickerComponent,
          specificEarliestAllowedDate: '2030-05-02',
          specificLatestAllowedDate: '2030-05-03',
        };

        it('Validering feiler når valgt dato er senere enn specificLatestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-04' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-04', submissionData, component, row);
          expect(validationResultV2).toBe('Datoen kan ikke være tidligere enn 02.05.2030 eller senere enn 03.05.2030');
        });

        it('Validering feiler når valgt dato er tidligere enn specificEarliestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-01' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-01', submissionData, component, row);
          expect(validationResultV2).toBe('Datoen kan ikke være tidligere enn 02.05.2030 eller senere enn 03.05.2030');
        });

        it('Validering ok når valgt dato er samme som specificEarliestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-02' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-02', submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });

        it('Validering ok når valgt dato er samme som specificLatestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-03' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-03', submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });
      });
    });

    describe('Validation of a combination of relative and specific dates', () => {
      describe("Datepicker med specificEarliestAllowedDate lik '2030-05-02', og latestAllowedDate lik 0", () => {
        const component = {
          ...defaultDatePickerComponent,
          specificEarliestAllowedDate: '2030-05-02',
          latestAllowedDate: 0,
        };

        it('Validering feiler når valgt dato er dagen før specificEarliestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-01' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-01', submissionData, component, row);
          expect(validationResultV2).toBe('Datoen kan ikke være tidligere enn 02.05.2030');
        });

        it('Validering ok når valgt dato er samme dag som specificEarliestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-02' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-02', submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });

        it('Validering feiler når valgt dato er dagen etter latestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-16' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-16', submissionData, component, row);
          expect(validationResultV2).toBe('Datoen kan ikke være senere enn 15.05.2030');
        });

        it('Validering ok når valgt dato er samme dag som latestAllowedDate', () => {
          const submissionData = { oppgiDatoKey: '2030-05-15' };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2('2030-05-15', submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });
      });
    });
  });

  describe('when rendered with Form.io', () => {
    beforeAll(setupNavFormio);

    const testForm = {
      title: 'Testskjema',
      type: 'form',
      display: 'wizard',
      components: [
        {
          title: 'Panel',
          type: 'panel',
          components: [
            {
              visArvelger: true,
              label: 'Dato (dd.mm.åååå)',
              mayBeEqual: false,
              validate: {
                required: true,
                custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
              },
              validateOn: 'blur',
              key: 'datoDdMmAaaa',
              type: 'navDatepicker',
              dataGridLabel: true,
              input: true,
              tableView: false,
            },
          ],
        },
        {
          title: 'Panel',
          type: 'panel',
          components: [
            {
              label: 'Fornavn',
              type: 'textfield',
              key: 'textfield',
              inputType: 'text',
              input: true,
              validate: {
                required: true,
              },
            },
          ],
        },
      ],
    };

    const renderNavForm = async (props) => {
      const formReady = vi.fn();
      const renderReturn = render(
        <AppConfigProvider dokumentinnsendingBaseURL={undefined} fyllutBaseURL={undefined}>
          <NavForm {...props} formReady={formReady} />
        </AppConfigProvider>,
      );
      await waitFor(() => expect(formReady).toHaveBeenCalledTimes(1));
      return renderReturn;
    };

    it('sets value to empty string when clearing value', async () => {
      await renderNavForm({
        form: testForm,
      });
      const form = await screen.findByRole('form');
      expect(form).toBeInTheDocument();
      const datepickerInput: HTMLInputElement = screen.getByLabelText('Dato (dd.mm.åååå)');
      expect(datepickerInput).toBeInTheDocument();
      await act(async () => datepickerInput.focus());

      await userEvent.type(datepickerInput, '01.01.2020');
      expect(datepickerInput.value).toBe('01.01.2020');

      await userEvent.clear(datepickerInput);
      expect(datepickerInput.value).toBe('');

      const nextButton = screen.getByRole('button', { name: 'Neste steg' });
      expect(nextButton).toBeInTheDocument();
      nextButton.click();

      const errorMessage = await screen.findByText('Du må fylle ut: Dato (dd.mm.åååå)');
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
