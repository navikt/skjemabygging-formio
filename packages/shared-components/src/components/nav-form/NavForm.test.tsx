import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupNavFormio } from '../../../test/navform-render';
import { AppConfigProvider } from '../../context/config/configContext';
import NavForm from './NavForm';

const testFormWithStandardAndReactComponents = {
  title: 'Testskjema med vanilla og React componenter',
  display: 'wizard',
  type: 'form',
  components: [
    {
      type: 'panel',
      key: 'panel1',
      label: 'Panel 1',
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
        {
          label: 'Dato (dd.mm.åååå)',
          type: 'navDatepicker',
          key: 'datepicker',
          input: true,
          dataGridLabel: true,
          validateOn: 'blur',
          validate: {
            required: true,
          },
        },
        {
          label: 'IBAN',
          type: 'iban',
          key: `iban`,
          fieldSize: 'input--l',
          input: true,
          spellcheck: false,
          dataGridLabel: true,
          validateOn: 'blur',
          clearOnHide: true,
          validate: {
            custom: 'valid = instance.validateIban(input);',
            required: true,
          },
        },
      ],
    },
  ],
};

const testskjemaForOversettelser = {
  title: 'Testskjema',
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
} as NavFormType;

describe('NavForm', () => {
  beforeAll(setupNavFormio);

  const renderNavForm = async (props) => {
    return await act(async () =>
      render(
        <AppConfigProvider>
          <NavForm {...props} />
        </AppConfigProvider>,
      ),
    );
  };

  describe('i18n', () => {
    it('should render norwegian label as specified in i18n', async () => {
      const i18n = { en: { Fornavn: 'First name' }, 'nb-NO': { Fornavn: 'Fornavn', submit: 'Lagre' } };
      await renderNavForm({
        form: testskjemaForOversettelser,
        language: 'nb-NO',
        i18n,
      });
      const fornavnInput = await screen.findByLabelText('Fornavn');
      expect(fornavnInput).toBeInTheDocument();
    });

    it('should render the english label as specified in i18n', async () => {
      const i18n = { en: { Fornavn: 'First name' }, 'nb-NO': { Fornavn: 'Fornavn', submit: 'Lagre' } };
      await renderNavForm({
        form: testskjemaForOversettelser,
        language: 'en',
        i18n,
      });
      const fornavnInput = await screen.findByLabelText('First name');
      expect(fornavnInput).toBeInTheDocument();
    });

    it('should change language from norwegian to english', async () => {
      const i18n = { en: { Fornavn: 'First name' }, 'nb-NO': { Fornavn: 'Fornavn', submit: 'Lagre' } };
      const { rerender } = await renderNavForm({
        form: testskjemaForOversettelser,
        language: 'nb-NO',
        i18n,
      });
      expect(await screen.findByLabelText('Fornavn')).toBeInTheDocument();

      rerender(
        <AppConfigProvider>
          <NavForm form={testskjemaForOversettelser} language="en" i18n={i18n} />
        </AppConfigProvider>,
      );
      expect(await screen.findByLabelText('First name')).toBeInTheDocument();
    });
  });

  describe('re-initializing with submission', () => {
    it('should load all values', async () => {
      const mockedOnSubmit = vi.fn();
      await renderNavForm({
        form: testFormWithStandardAndReactComponents,
        language: 'nb-NO',
        submission: {
          data: {
            textfield: 'Donald',
            datepicker: '2000-01-01',
            iban: 'GB33BUKB20201555555555',
          },
        },
        events: {
          onSubmit: mockedOnSubmit,
        },
      });
      const textField = await screen.findByLabelText('Fornavn');
      expect(textField).toBeInTheDocument();
      await waitFor(() => {
        expect(textField).toHaveValue('Donald');
      });
      const datepicker = await screen.findByLabelText('Dato (dd.mm.åååå)');
      await waitFor(() => {
        expect(datepicker).toHaveValue('01.01.2000');
      });

      const ibanField = await screen.findByLabelText('IBAN');
      expect(ibanField).toBeInTheDocument();
      expect(ibanField).toHaveValue('GB33 BUKB 2020 1555 5555 55');

      const nextLink = await screen.findByRole('button', { name: 'Neste steg' });
      await userEvent.click(nextLink);
      await waitFor(() => expect(mockedOnSubmit).toHaveBeenCalled());
    });
  });
});
