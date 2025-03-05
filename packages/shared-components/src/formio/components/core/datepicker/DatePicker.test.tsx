import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupNavFormio } from '../../../../../test/navform-render';
import NavForm from '../../../../components/nav-form/NavForm';
import { AppConfigProvider } from '../../../../context/config/configContext';
import DatePicker from './DatePicker';

Date.now = vi.fn(() => new Date('2030-05-15T12:00:00.000Z').getTime());

describe('NavDatePicker', () => {
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
    vi.spyOn(DatePicker.prototype, 't').mockImplementation(mockedTranslate as any);
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
      return render(
        <AppConfigProvider dokumentinnsendingBaseURL={undefined} fyllutBaseURL={undefined}>
          <NavForm {...props} />
        </AppConfigProvider>,
      );
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
      datepickerInput.blur();
      expect(datepickerInput.value).toBe('');

      const nextButton = screen.getByRole('button', { name: 'Neste steg' });
      expect(nextButton).toBeInTheDocument();
      await act(async () => nextButton.click());

      const errorMessage = await screen.findByText('Du må fylle ut: Dato (dd.mm.åååå)');
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
