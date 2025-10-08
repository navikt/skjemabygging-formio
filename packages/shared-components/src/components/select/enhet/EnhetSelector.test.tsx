import { Enhet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LanguagesProvider } from '../../../context/languages';
import EnhetSelector from './EnhetSelector';

vi.mock('../../../context/languages/hooks/useLanguageCodeFromURL', () => {
  return {
    default: () => '',
  };
});
const mockOnSelectEnhet = vi.fn();
const mockEnhetsListe = [
  { enhetNr: '1', navn: 'Nav abc' },
  { enhetNr: '2', navn: 'Nav def' },
  { enhetNr: '3', navn: 'Nav ghi' },
  { enhetNr: '4', navn: 'Nav jkl' },
];

describe('EnhetSelector', () => {
  const renderEnhetSelector = (enhetsListe = mockEnhetsListe) => {
    render(
      <LanguagesProvider translations={{}}>
        <EnhetSelector enhetsliste={enhetsListe as Enhet[]} onSelectEnhet={mockOnSelectEnhet} />,
      </LanguagesProvider>,
    );
  };

  describe('When enhetsListe is provided', () => {
    beforeEach(async () => {
      renderEnhetSelector();
      const DOWN_ARROW = { keyCode: 40 };
      const enhetSelector = screen.getByText(TEXTS.statiske.prepareLetterPage.selectEntityDefault);
      fireEvent.keyDown(enhetSelector, DOWN_ARROW);
      await waitFor(() => expect(screen.getByText('Nav abc')).toBeTruthy());
    });

    it.each(mockEnhetsListe)('renders each option', (enhet) => {
      expect(screen.getByText(enhet.navn)).toBeDefined();
    });

    it('returns the selected enhet when selected', () => {
      fireEvent.click(screen.getByText('Nav ghi'));
      expect(mockOnSelectEnhet).toHaveBeenCalledTimes(1);
      expect(mockOnSelectEnhet).toHaveBeenCalledWith('3');
    });
  });

  describe('When enhetsListe is empty', () => {
    it('does not render the select', () => {
      renderEnhetSelector([]);
      expect(screen.queryByLabelText(TEXTS.statiske.prepareLetterPage.chooseEntity)).toBeNull();
    });
  });
});
