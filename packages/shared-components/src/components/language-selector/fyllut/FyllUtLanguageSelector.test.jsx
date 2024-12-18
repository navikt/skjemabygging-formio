import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
});
