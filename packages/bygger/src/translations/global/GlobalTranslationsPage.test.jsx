import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import I18nStateProvider from '../../context/i18n';
import GlobalTranslationsPage from './GlobalTranslationsPage';
import globalTranslations from './testdata/global-translations.js';
import { tags } from './utils';

describe('GlobalTranslationsPage', () => {
  let mockedDeleteTranslation;
  let mockedSaveTranslations;

  const renderGlobalTranslationsPage = async (loadTranslation, languageCode = '', tag = 'skjematekster') => {
    mockedDeleteTranslation = vi.fn();
    mockedSaveTranslations = vi.fn();

    await act(async () => {
      render(
        <AppConfigProvider featureToggles={{ enableTranslations: true }}>
          <MemoryRouter initialEntries={[`/translations/global/${languageCode}/${tag}`]}>
            <I18nStateProvider loadTranslations={loadTranslation}>
              <Routes>
                <Route
                  path="/translations/global/:languageCode?/:tag?"
                  element={
                    <GlobalTranslationsPage
                      loadGlobalTranslations={loadTranslation}
                      projectURL={''}
                      deleteTranslation={mockedDeleteTranslation}
                      saveTranslation={mockedSaveTranslations}
                    />
                  }
                />
              </Routes>
            </I18nStateProvider>
          </MemoryRouter>
        </AppConfigProvider>,
      );
    });
  };

  afterEach(() => {
    mockedDeleteTranslation.mockClear();
    mockedSaveTranslations.mockClear();
  });

  describe('Render global translation page with English translations', () => {
    let mockedLoadTranslation;

    beforeEach(async () => {
      mockedLoadTranslation = vi.fn(() => Promise.resolve(globalTranslations));
      await renderGlobalTranslationsPage(mockedLoadTranslation, 'en');
    });

    afterEach(() => {
      mockedLoadTranslation.mockClear();
    });

    it('renders header with English label', async () => {
      const addNewTranslationButton = screen.getByRole('button', { name: 'Legg til ny tekst' });
      const languageHeading = screen.getByRole('heading', { level: 1, name: 'Engelsk' });
      const originalTextField = await screen.findByDisplayValue('Fornavn');
      const translationField = screen.getByDisplayValue('First name');

      expect(addNewTranslationButton).toBeDefined();
      expect(languageHeading).toBeInTheDocument();
      expect(originalTextField).toBeInTheDocument();
      expect(translationField).toBeInTheDocument();
    });
  });

  describe('Navigation between tags', () => {
    beforeEach(async () => {
      const loadGlobalTranslations = vi.fn(() => Promise.resolve(globalTranslations));
      await renderGlobalTranslationsPage(loadGlobalTranslations, 'en', tags.SKJEMATEKSTER);
    });

    it("renders tag 'skjematekster' default", async () => {
      const inputFieldWithSkjematekster = await screen.findByDisplayValue('First name');
      expect(inputFieldWithSkjematekster).toBeInTheDocument();

      const inputFieldWithValidering = screen.queryByDisplayValue('No IBAN was provided');
      expect(inputFieldWithValidering).not.toBeInTheDocument();
    });

    it("navigates to tag 'validering'", async () => {
      const valideringLink = await screen.findByRole('link', { name: 'Validering' });
      expect(valideringLink).toBeInTheDocument();
      await userEvent.click(valideringLink);

      const inputFieldWithValidering = await screen.findByDisplayValue('No IBAN was provided');
      expect(inputFieldWithValidering).toBeInTheDocument();

      const inputFieldWithSkjematekster = screen.queryByDisplayValue('First name');
      expect(inputFieldWithSkjematekster).not.toBeInTheDocument();
    });
  });

  describe('Obsolete translations', () => {
    describe('tag: validering', () => {
      beforeEach(async () => {
        const loadGlobalTranslations = vi.fn(() => Promise.resolve(globalTranslations));
        await renderGlobalTranslationsPage(loadGlobalTranslations, 'en', tags.VALIDERING);
      });

      it('Shows number of obsolete translations', async () => {
        const obsoleteTranslationsTitle = await screen.findByText(/Antall ubrukte oversettelser: \d{1,2}/);
        expect(obsoleteTranslationsTitle).toBeInTheDocument();
      });
    });
  });
});
