import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ApplicationTextTranslationEditPanel, {
  getTranslationByOriginalText,
} from './ApplicationTextTranslationEditPanel';

describe('ApplicationTextTranslationEditPanel', () => {
  describe('getTranslationByOriginalText', () => {
    it('returns translation object that matches originalText', () => {
      expect(
        getTranslationByOriginalText('bbb', [
          { id: 'id1', originalText: 'aaa', translatedText: 'AAA' },
          { id: 'id2', originalText: 'bbb', translatedText: 'BBB' },
          { id: 'id3', originalText: 'ccc', translatedText: 'CCC' },
        ]),
      ).toEqual({ id: 'id2', originalText: 'bbb', translatedText: 'BBB' });
    });

    it('returns nothing if translations has no matching originalText', () => {
      expect(
        getTranslationByOriginalText('original text', [
          { id: 'id', originalText: 'a different original text', translatedText: 'translated text' },
        ]),
      ).toBeUndefined();
    });
  });

  describe('Rendering with Grensesnitt texts and one translation', () => {
    const mockedUpdateTranslation = vi.fn();
    beforeEach(() => {
      render(
        <ApplicationTextTranslationEditPanel
          selectedTag={'grensesnitt'}
          translations={[{ id: 'id', originalText: 'Juli', translatedText: 'July' }]}
          languageCode={'en'}
          updateTranslation={mockedUpdateTranslation}
        />,
      );
    });

    afterEach(() => {
      mockedUpdateTranslation.mockClear();
    });

    it('renders all grensesnitt inputs', () => {
      expect(screen.getAllByRole('textbox')).toHaveLength(69);
    });

    it('renders originalText with translatedText as value', () => {
      expect(screen.getByLabelText('Juli').getAttribute('value')).toBe('July');
    });

    it('renders originalText without a value', () => {
      expect(screen.getByLabelText('Juni').getAttribute('value')).toBe('');
    });

    describe('onChange', () => {
      it('calls updateTranslation with existing id, text and new value, when text already has a translation', async () => {
        const text1 = screen.getByLabelText('Juli');
        fireEvent.change(text1, { target: { value: 'new global translation' } });
        await waitFor(() => expect(mockedUpdateTranslation).toHaveBeenCalledTimes(1));
        expect(mockedUpdateTranslation).toHaveBeenCalledWith('id', 'Juli', 'new global translation');
      });
      it('calls updateTranslation with empty string as id, text and new value, when text did not have a translation', async () => {
        const text1 = screen.getByLabelText('Juni');
        fireEvent.change(text1, { target: { value: 'new global translation' } });
        await waitFor(() => expect(mockedUpdateTranslation).toHaveBeenCalledTimes(1));
        expect(mockedUpdateTranslation).toHaveBeenCalledWith('', 'Juni', 'new global translation');
      });
    });
  });
});
