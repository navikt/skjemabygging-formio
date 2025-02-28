import { FormsApiFormTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ApiError from '../../api/ApiError';
import EditFormTranslationsProvider, { useEditFormTranslations } from './EditFormTranslationsContext';

// Mock the useFormTranslations function
const mocks = vi.hoisted(() => ({
  saveTranslation: vi.fn().mockImplementation((translation) => Promise.resolve(translation)),
  loadTranslations: vi.fn(),
  originalTranslation: { id: 42, revision: 2, key: 'original', nb: 'original' },
}));
vi.mock(import('./FormTranslationsContext'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
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
}: {
  updates?: Array<[original: FormsApiFormTranslation, lang: TranslationLang, value: string]>;
}) => {
  const { updateTranslation, saveChanges, errors, editState } = useEditFormTranslations();

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
      <button onClick={saveChanges}>Save Changes</button>
      <div data-testid="errors">{errors.map((error) => error.message).toString()}</div>
      <div data-testid="editState">{editState}</div>
    </div>
  );
};

describe('EditFormTranslationsContext', () => {
  afterEach(() => {
    mocks.saveTranslation.mockClear();
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
});
