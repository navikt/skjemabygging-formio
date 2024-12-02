import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderNavForm, setupNavFormio } from '../../../../../test/navform-render';

describe('NavSelect', () => {
  beforeAll(setupNavFormio);

  const testForm: NavFormType = {
    title: 'Testskjema',
    type: 'form',
    display: 'wizard',
    components: [
      {
        title: 'Første panel',
        type: 'panel',
        components: [
          {
            label: 'Velg frukt',
            uniqueOptions: false,
            tableView: true,
            dataSrc: 'values',
            data: {
              values: [
                {
                  label: 'Eple',
                  value: 'eple',
                },
                {
                  label: 'Banan',
                  value: 'banan',
                },
                {
                  label: 'Persimon',
                  value: 'persimon',
                },
              ],
              resource: '',
              json: '',
              url: '',
              custom: '',
            },
            idPath: 'id',
            limit: 100,
            template: '<span>{{ item.label }}</span>',
            clearOnRefresh: false,
            searchEnabled: true,
            selectThreshold: 0.3,
            readOnlyValue: false,
            customOptions: {},
            useExactSearch: false,
            validateOn: 'blur',
            validate: {
              onlyAvailableItems: false,
              required: true,
            },
            key: 'velgFrukt',
            type: 'navSelect',
            indexeddb: {
              filter: {},
            },
            searchDebounce: 0.3,
            minSearch: 0,
            lazyLoad: true,
            authenticate: false,
            ignoreCache: false,
            fuseOptions: {
              include: 'score',
              threshold: 0.3,
            },
            input: true,
            dataGridLabel: true,
          },
        ],
      },
      {
        title: 'Andre panel',
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
  } as unknown as NavFormType;

  it('selects item in dropdown', async () => {
    await renderNavForm({
      form: testForm,
    });
    const nedtrekksliste = screen.getByLabelText(/Velg frukt.*/) as HTMLInputElement;
    expect(nedtrekksliste).toBeInTheDocument();
    expect(nedtrekksliste.value).toBe('');

    await userEvent.click(nedtrekksliste);
    const optionPersimon = await screen.findByText('Persimon');
    await userEvent.click(optionPersimon);

    await waitFor(() => {
      const valgtFrukt = screen.getByText('Persimon');
      expect(valgtFrukt).toBeInTheDocument();
    });
  });

  it('shows error message when validation fails', async () => {
    await renderNavForm({
      form: testForm,
    });
    const nedtrekksliste = screen.getByLabelText(/Velg frukt.*/) as HTMLInputElement;
    expect(nedtrekksliste).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: 'Neste steg' });
    expect(nextButton).toBeInTheDocument();
    await userEvent.click(nextButton);

    const errorMessages = await screen.findAllByText('Du må fylle ut: Velg frukt');
    expect(errorMessages).toHaveLength(1); // nedenfor input-feltet
  });

  it('changes language', async () => {
    const i18n = {
      en: {
        'Velg frukt': 'Choose fruit',
        Eple: 'Apple',
        Banan: 'Banana',
        Persimon: 'Persimon',
        'Neste steg': 'Next step',
        Avbryt: 'Cancel',
        'Første panel': 'First panel',
      },
    };
    const { rerender, NavFormForTest } = await renderNavForm({
      form: testForm,
      i18n,
    });
    const dropdownNorwegian = screen.getByLabelText(/Velg frukt.*/) as HTMLInputElement;
    expect(dropdownNorwegian).toBeInTheDocument();

    rerender(<NavFormForTest form={testForm} language="en" i18n={i18n} />);
    const dropdownEnglish = (await screen.findByLabelText(/Choose fruit.*/)) as HTMLInputElement;
    expect(dropdownEnglish).toBeInTheDocument();

    await userEvent.click(dropdownEnglish);
    const optionApple = await screen.findByText('Apple');
    await userEvent.click(optionApple);

    await waitFor(() => {
      const valgtFrukt = screen.getByText('Apple');
      expect(valgtFrukt).toBeInTheDocument();
    });
  });
});
