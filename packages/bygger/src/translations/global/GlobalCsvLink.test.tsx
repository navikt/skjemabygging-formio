import { GlobalTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import GlobalCsvLink from './GlobalCsvLink';

describe('GlobalCsvLink', () => {
  it('renders link to download csv', async () => {
    const allGlobalTranslations: GlobalTranslationMap = {
      en: [
        {
          id: '4',
          name: 'global',
          scope: 'global',
          tag: 'skjematekster',
          translations: { Personopplysninger: { value: 'Personal information', scope: 'global' } },
        },
      ],
    };
    render(<GlobalCsvLink allGlobalTranslations={allGlobalTranslations} languageCode="en" />);
    const link = await screen.findByRole('link', { name: 'Eksporter' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('download');
    expect(link.getAttribute('download')).toBe('globale-oversettelser-en.csv');
    expect(link).toHaveAttribute('href');
  });

  it('Test for createObjectURL (blob) issue solved with overrides in setupTests.ts', async () => {
    const csv = '"Globale tekster";"EN"\n"Personopplysninger";"Personal information"';
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv' });

    // This is the error we get from react-csv, but have isolated this to this simple test.
    expect(() => URL.createObjectURL(blob)).not.toThrow();
  });
});
