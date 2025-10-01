import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { setupNavFormio } from '../../test/navform-render';
import { form, translationsForNavForm } from '../../test/test-data/form/skjema-med-oversettelser';
import { languagesInOriginalLanguage } from '../components/language-selector/fyllut/FyllUtLanguageSelector';
import { AppConfigProvider } from '../context/config/configContext';
import { LanguagesProvider } from '../context/languages';
import { getPanelSlug } from '../util/form/form';
import FyllUtRouter from './FyllUtRouter';

const mockFormPath = `/${form.path}`;
const firstPanelSlug = getPanelSlug(form, 0);
vi.mock('react-router', async () => {
  const actual = await vi.importActual<object>('react-router');
  return {
    ...actual,
    useResolvedPath: () => ({
      pathname: mockFormPath,
    }),
  };
});

const labelNorskBokmal = languagesInOriginalLanguage['nb-NO'];

describe('FyllUtRouter', () => {
  beforeAll(setupNavFormio);

  const renderFyllUtRouter = ({ form, translationsForNavForm }, appConfigProps) => {
    const config = {
      featureToggles: {},
      ...appConfigProps,
    };

    const router = createMemoryRouter(
      [
        {
          path: `${mockFormPath}/*`,
          element: (
            <LanguagesProvider translations={translationsForNavForm}>
              <FyllUtRouter form={form} />
            </LanguagesProvider>
          ),
        },
      ],
      {
        initialEntries: [`${mockFormPath}/${firstPanelSlug}`],
      },
    );

    render(
      <AppConfigProvider {...config}>
        <RouterProvider router={router} />
      </AppConfigProvider>,
    );
  };

  it('Knapp for å velge språk rendres', () => {
    renderFyllUtRouter({ form, translationsForNavForm }, { featureToggles: {} });
    expect(screen.queryByRole('button', { name: labelNorskBokmal })).not.toBeNull();
  });

  describe('Endring av språk', () => {
    it('Skjema oversettes fra norsk til engelsk', async () => {
      const norskTittel = form.title;
      const engelskTittel = translationsForNavForm['en'][`${form.title}`];
      renderFyllUtRouter({ form, translationsForNavForm }, {});

      expect(screen.queryByRole('heading', { name: norskTittel })).toBeTruthy();
      expect(screen.queryByRole('heading', { name: engelskTittel })).toBeNull();

      const velgSprakButton = screen.getByRole('button', { name: labelNorskBokmal });
      await userEvent.click(velgSprakButton);

      const englishOption = screen.getByRole('link', { name: 'English' });
      await userEvent.click(englishOption);

      expect(await screen.findByRole('heading', { name: engelskTittel })).toBeTruthy();
      expect(screen.queryByRole('heading', { name: norskTittel })).toBeNull();

      // FIXME Vanskelig å teste formio-koden:
      // Av en eller annen grunn blir aldri instance.ready resolve't i testen (se NavForm linje 72),
      // og derfor får vi ikke satt language på formio-instansen (linje 136).
      // await waitFor(() => expect(screen.queryByText("Guidance")).toBeTruthy());
      // expect(screen.queryByText("Veiledning")).toBeNull();
    });
  });
});
