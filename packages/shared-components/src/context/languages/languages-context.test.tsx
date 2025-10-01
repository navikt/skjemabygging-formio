import { I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { LanguagesProvider, useLanguages } from './languages-context';

vi.mock('./hooks/useCurrentLanguage', () => {
  return {
    default: () => ({
      currentLanguage: 'en',
      initialLanguage: 'en',
    }),
  };
});

const TestComponent = ({ text, params }) => {
  const { translate } = useLanguages();
  return <div>{translate(text, params)}</div>;
};

const defaultTranslations = {};

type ParamsMap = { [key: string]: string | undefined };
type TestComponentInput = { text: string; params?: ParamsMap };
const renderTestComponent = ({ text, params }: TestComponentInput, translations: I18nTranslations) => {
  render(
    <BrowserRouter>
      <LanguagesProvider translations={translations || defaultTranslations}>
        <TestComponent text={text} params={params} />
      </LanguagesProvider>
    </BrowserRouter>,
  );
};

describe('languages-context (med engelsk som valgt språk)', () => {
  it('Beholder originaltekst dersom ingen oversettelser eksisterer', () => {
    renderTestComponent({ text: 'Min tekst' }, {});
    expect(screen.getByText('Min tekst')).toBeTruthy();
  });

  it('Oversetter tekst til engelsk', () => {
    const translations = {
      en: {
        'Min tekst': 'My text',
      },
    };
    renderTestComponent({ text: 'Min tekst' }, translations);
    expect(screen.getByText('My text')).toBeTruthy();
  });

  describe('Injisering av parameter', () => {
    it('Erstatter uttrykket med oppgitt tekst', () => {
      const staticText = 'Trykk på "{{downloadApplication}}" for å åpne dokumentet';
      renderTestComponent({ text: staticText, params: { downloadApplication: 'Last ned pdf' } }, {});
      expect(screen.getByText('Trykk på "Last ned pdf" for å åpne dokumentet')).toBeTruthy();
    });

    it('Beholder uttrykket dersom parameter mangler', () => {
      const staticText = 'Trykk på "{{downloadApplication}}" for å åpne dokumentet';
      renderTestComponent({ text: staticText, params: { downloadApplication: undefined } }, {});
      expect(screen.getByText('Trykk på "{{downloadApplication}}" for å åpne dokumentet')).toBeTruthy();
    });

    it('Oversetter også uttrykkets oppgitte tekst', () => {
      const staticText = 'Trykk på "{{downloadApplication}}" for å åpne dokumentet';
      const translations = {
        en: {
          [staticText]: 'Click "{{downloadApplication}}" to open the document',
          'Last ned pdf': 'Download pdf',
        },
      };
      renderTestComponent({ text: staticText, params: { downloadApplication: 'Last ned pdf' } }, translations);
      expect(screen.getByText('Click "Download pdf" to open the document')).toBeTruthy();
    });

    it('Oversetter tekst til engelsk, men beholder uttrykkets tekst på originalspråk siden oversettelse mangler', () => {
      const staticText = 'Trykk på "{{downloadApplication}}" for å åpne dokumentet';
      const translations = {
        en: {
          [staticText]: 'Click "{{downloadApplication}}" to open the document',
        },
      };
      renderTestComponent({ text: staticText, params: { downloadApplication: 'Last ned pdf' } }, translations);
      expect(screen.getByText('Click "Last ned pdf" to open the document')).toBeTruthy();
    });

    it('Erstatter flere uttrykk i samme input-tekst', () => {
      const staticText = '1) {{dyr1}}, 2) {{dyr2}}, 3) {{dyr3}}.';
      renderTestComponent({ text: staticText, params: { dyr1: 'hund', dyr2: 'katt', dyr3: 'marsvin' } }, {});
      expect(screen.getByText('1) hund, 2) katt, 3) marsvin.')).toBeTruthy();
    });
  });
});
