import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import ApiError from '../../api/ApiError';
import EditFormTranslationsProvider, { useEditFormTranslations } from './EditFormTranslationsContext';

// Mock the useFormTranslations function
const mocks = vi.hoisted(() => ({
  saveTranslation: vi.fn().mockImplementation((translation) => Promise.resolve(translation)),
  loadTranslations: vi.fn(),
  originalTranslation: { id: 42, revision: 2, key: 'original', nb: 'original' },
}));
vi.mock('./FormTranslationsContext', () => {
  return {
    useFormTranslations: () => ({
      storedTranslations: { original: mocks.originalTranslation },
      saveTranslation: mocks.saveTranslation,
      loadTranslations: mocks.loadTranslations,
    }),
  };
});
vi.mock('../../notifications/FeedbackContext', () => {
  return {
    useFeedbackEmit: () => ({
      success: vi.fn(),
      error: vi.fn(),
    }),
  };
});

const TestComponent = ({
  updates = [],
  keyBasedUpdate,
}: {
  updates?: Array<[original: FormsApiTranslation, lang: TranslationLang, value: string]>;
  keyBasedUpdate?: { key: string; value: string };
}) => {
  const { updateTranslation, updateKeyBasedText, saveChanges, errors, editState } = useEditFormTranslations();
  const [returnedKey, setReturnedKey] = useState('');

  const onSave = async () => {
    try {
      await saveChanges();
    } catch (_e) {
      /* empty */
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          for (const update of updates) {
            updateTranslation(...update);
          }
        }}
      >
        Update Translations
      </button>
      <button
        onClick={() => keyBasedUpdate && setReturnedKey(updateKeyBasedText(keyBasedUpdate.value, keyBasedUpdate.key))}
      >
        Update Key Based Text
      </button>
      <button onClick={onSave}>Save Changes</button>
      <div data-testid="errors">{errors.map((error) => error.message).toString()}</div>
      <div data-testid="editState">{editState}</div>
      <div data-testid="returnedKey">{returnedKey}</div>
    </div>
  );
};

describe('EditFormTranslationsContext', () => {
  afterEach(() => {
    mocks.saveTranslation.mockReset();
    mocks.saveTranslation.mockImplementation((translation) => Promise.resolve(translation));
    mocks.loadTranslations.mockReset();
  });

  it('should initialize with default values', () => {
    render(
      <EditFormTranslationsProvider>
        <TestComponent />
      </EditFormTranslationsProvider>,
    );

    expect(screen.getByTestId('errors')).toHaveTextContent('');
    expect(screen.getByTestId('editState')).toHaveTextContent('INIT');
  });

  it('should update both nn and en for a single translation', async () => {
    render(
      <EditFormTranslationsProvider>
        <TestComponent
          updates={[
            [mocks.originalTranslation, 'nn', 'oppdatert'],
            [mocks.originalTranslation, 'en', 'updated'],
          ]}
        />
      </EditFormTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Update Translations'));
    expect(screen.getByTestId('editState')).toHaveTextContent('EDITING');
    fireEvent.click(screen.getByText('Save Changes'));
    expect(screen.getByTestId('editState')).toHaveTextContent('SAVING');
    expect(mocks.saveTranslation).toHaveBeenCalledTimes(1);
    expect(mocks.saveTranslation).toHaveBeenCalledWith({
      ...mocks.originalTranslation,
      nn: 'oppdatert',
      en: 'updated',
    });
    await waitFor(() => expect(screen.getByTestId('editState')).toHaveTextContent('SAVED'));
  });

  it('should not save if no changes are made', async () => {
    render(
      <EditFormTranslationsProvider>
        <TestComponent />
      </EditFormTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Save Changes'));
    expect(mocks.saveTranslation).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('editState')).toHaveTextContent('INIT'));
  });

  it('should not save if there are validation errors', async () => {
    render(
      <EditFormTranslationsProvider>
        <TestComponent
          updates={[
            [mocks.originalTranslation, 'nn', 'LoremIpsum'.repeat(521)],
            [mocks.originalTranslation, 'en', 'updated'],
          ]}
        />
      </EditFormTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Update Translations'));
    fireEvent.click(screen.getByText('Save Changes'));
    expect(mocks.saveTranslation).not.toHaveBeenCalled();
    expect(screen.getByTestId('editState')).toHaveTextContent('EDITING');
  });

  it('should return error if one of the updates fails', async () => {
    mocks.saveTranslation.mockImplementation((translation) => {
      if (translation.key === 'yieldsError') {
        throw new ApiError(409, 'Conflict');
      }
      return translation;
    });

    render(
      <EditFormTranslationsProvider>
        <TestComponent
          updates={[
            [mocks.originalTranslation, 'nn', 'oppdatert'],
            [mocks.originalTranslation, 'en', 'updated'],
            [{ ...mocks.originalTranslation, key: 'yieldsError' }, 'nn', 'skal feile'],
          ]}
        />
      </EditFormTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Update Translations'));
    fireEvent.click(screen.getByText('Save Changes'));
    expect(mocks.saveTranslation).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(screen.getByTestId('errors')).toHaveTextContent('Det oppsto en konflikt. Last siden på nytt for å endre'),
    );
    await waitFor(() => expect(screen.getByTestId('editState')).toHaveTextContent('SAVED'));
  });

  it('should create a new intro page translation when updateKeyBasedText gets an unknown key', async () => {
    render(
      <EditFormTranslationsProvider>
        <TestComponent keyBasedUpdate={{ key: 'missing-key', value: 'Ny tekst' }} />
      </EditFormTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Update Key Based Text'));

    await waitFor(() => expect(screen.getByTestId('returnedKey')).not.toHaveTextContent(''));
    expect(screen.getByTestId('returnedKey')).not.toHaveTextContent('missing-key');

    fireEvent.click(screen.getByText('Save Changes'));

    expect(mocks.saveTranslation).toHaveBeenCalledTimes(1);
    expect(mocks.saveTranslation).toHaveBeenCalledWith({
      key: screen.getByTestId('returnedKey').textContent,
      nb: 'Ny tekst',
      tag: 'introPage',
    });
    await waitFor(() => expect(screen.getByTestId('editState')).toHaveTextContent('SAVED'));
  });
});
