import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { LanguagesProvider } from '../../../context/languages';
import FyllUtLanguageSelector from './FyllUtLanguageSelector';

const defaultTranslations = {};

const renderFyllUtLanguageSelector = (translations, path = '') => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LanguagesProvider translations={translations || defaultTranslations}>
        <FyllUtLanguageSelector />
      </LanguagesProvider>
    </MemoryRouter>,
  );
};

describe('Test FyllUtLanguageSelector in FyllUtRouter', () => {
  it('not render languageSelecor when there is no selected language and no translations', () => {
    renderFyllUtLanguageSelector();
    expect(screen.queryByText('Norsk bokmål')).toBeNull();
  });

  it('render languageSelector with default label and nynorsk as option when there is no language selected and only with nynorsk translations', async () => {
    renderFyllUtLanguageSelector({ 'nn-NO': { Etternavn: 'Etternamn', Fornavn: 'Fornamn' } });
    const languageSelector = screen.getByRole('button', { name: 'Norsk bokmål' });
    expect(languageSelector).toBeDefined();
    await userEvent.click(languageSelector);
    expect(screen.getByText('Norsk nynorsk')).toBeTruthy();
  });

  it('render languageSelector with Nynorsk as label and Bokmål as option when the selected language is nynorsk and there is only nynorsk translations', async () => {
    renderFyllUtLanguageSelector(
      { 'nn-NO': { Etternavn: 'Etternamn', Fornavn: 'Fornamn' } },
      '/testForm/view?lang=nn-NO',
    );
    const languageSelector = screen.getByRole('button', { name: 'Norsk nynorsk' });
    expect(languageSelector).toBeDefined();
    await userEvent.click(languageSelector);
    expect(screen.getByText('Norsk bokmål')).toBeTruthy();
  });

  it('render languageSelector with Nynorsk as label and Bokmål as option when there are bokmål translations and nynorsk translations', async () => {
    renderFyllUtLanguageSelector(
      { 'nn-NO': { Etternavn: 'Etternamn', Fornavn: 'Fornamn' } },
      '/testForm/view?lang=nn-NO',
    );
    const languageSelector = screen.getByRole('button', { name: 'Norsk nynorsk' });
    expect(languageSelector).toBeDefined();
    await userEvent.click(languageSelector);
    expect(screen.getByText('Norsk bokmål')).toBeTruthy();
  });

  it('render languageSelector with default label and nynorsk as option when the selected language has no translation send in', async () => {
    renderFyllUtLanguageSelector({ 'nn-NO': { Etternavn: 'Etternamn', Fornavn: 'Fornamn' } }, '/testForm/view?lang=cn');
    const languageSelector = screen.getByRole('button', { name: 'Norsk bokmål' });
    expect(languageSelector).toBeDefined();
    await userEvent.click(languageSelector);
    expect(screen.getByText('Norsk nynorsk')).toBeTruthy();
    expect(screen.queryByText('Chinese')).toBeNull();
  });

  it('Keep all search params in url when selecting other language', async () => {
    const originalWindowLocation = window.location;
    delete window.location;
    window.location = new URL('https://www.unittest.nav.no/fyllut/nav123456?sub=digital&lang=nn-NO&foo=bar');

    renderFyllUtLanguageSelector(
      { 'nn-NO': { Etternavn: 'Etternamn', Fornavn: 'Fornamn' } },
      '/nav123456?sub=digital&lang=nn-NO&foo=bar',
    );
    const languageSelector = screen.getByRole('button', { name: 'Norsk nynorsk' });
    await userEvent.click(languageSelector); // <-- open language selector
    const bokmalLink = screen.getByRole('link', { name: 'Norsk bokmål' });
    expect(bokmalLink).toHaveAttribute('href', '/nav123456?sub=digital&lang=nb-NO&foo=bar');

    window.location = originalWindowLocation;
  });
});
