import { FormsApiGlobalTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ApiError from '../../api/ApiError';
import EditGlobalTranslationsProvider, { useEditGlobalTranslations } from './EditGlobalTranslationsContext';

// Mock the useGlobalTranslations function
const mocks = vi.hoisted(() => ({
  saveTranslation: vi.fn().mockImplementation((translation) => Promise.resolve(translation)),
  loadTranslations: vi.fn(),
  createNewTranslation: vi.fn(),
  originalTranslation: {
    id: 42,
    revision: 2,
    tag: 'skjematekster',
    key: 'original',
    nb: 'original',
  } as FormsApiGlobalTranslation,
}));
vi.mock('./GlobalTranslationsContext', () => {
  return {
    useGlobalTranslations: () => ({
      storedTranslations: { original: mocks.originalTranslation },
      saveTranslation: mocks.saveTranslation,
      loadTranslations: mocks.loadTranslations,
      createNewTranslation: mocks.createNewTranslation,
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
  newTranslation = {},
}: {
  updates?: Array<[original: FormsApiGlobalTranslation, lang: TranslationLang, value: string]>;
  newTranslation?: { nb?: string; nn?: string; en?: string };
}) => {
  const { updateNewTranslation, updateTranslation, saveChanges, errors, editState } = useEditGlobalTranslations();

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
        onClick={() => {
          for (const [lang, value] of Object.entries(newTranslation)) {
            updateNewTranslation(lang as TranslationLang, value);
          }
        }}
      >
        Update New Translation
      </button>
      <button onClick={saveChanges}>Save Changes</button>
      <div data-testid="errors">{errors.map((error) => error.message).toString()}</div>
      <div data-testid="editState">{editState}</div>
    </div>
  );
};

describe('EditGlobalTranslationsContext', () => {
  afterEach(() => {
    mocks.saveTranslation.mockClear();
    mocks.createNewTranslation.mockClear();
  });

  it('should initialize with default values', () => {
    render(
      <EditGlobalTranslationsProvider>
        <TestComponent />
      </EditGlobalTranslationsProvider>,
    );

    expect(screen.getByTestId('errors')).toHaveTextContent('');
    expect(screen.getByTestId('editState')).toHaveTextContent('INIT');
  });

  it('should update both nn and en for a single translation', async () => {
    render(
      <EditGlobalTranslationsProvider>
        <TestComponent
          updates={[
            [mocks.originalTranslation, 'nn', 'oppdatert'],
            [mocks.originalTranslation, 'en', 'updated'],
          ]}
        />
      </EditGlobalTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Update Translations'));
    expect(screen.getByTestId('editState')).toHaveTextContent('EDITING');
    fireEvent.click(screen.getByText('Save Changes'));
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
      <EditGlobalTranslationsProvider>
        <TestComponent />
      </EditGlobalTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Save Changes'));
    expect(mocks.saveTranslation).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('editState')).toHaveTextContent('INIT'));
  });

  it('should not save if there are validation errors', async () => {
    render(
      <EditGlobalTranslationsProvider>
        <TestComponent
          updates={[
            [mocks.originalTranslation, 'nn', 'LoremIpsum'.repeat(103)],
            [mocks.originalTranslation, 'en', 'updated'],
          ]}
        />
      </EditGlobalTranslationsProvider>,
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
      <EditGlobalTranslationsProvider>
        <TestComponent
          updates={[
            [mocks.originalTranslation, 'nn', 'oppdatert'],
            [mocks.originalTranslation, 'en', 'updated'],
            [{ ...mocks.originalTranslation, key: 'yieldsError' }, 'nn', 'skal feile'],
          ]}
        />
      </EditGlobalTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Update Translations'));
    fireEvent.click(screen.getByText('Save Changes'));
    expect(mocks.saveTranslation).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(screen.getByTestId('errors')).toHaveTextContent('Det oppsto en konflikt. Last siden på nytt for å endre'),
    );
    await waitFor(() => expect(screen.getByTestId('editState')).toHaveTextContent('SAVED'));
  });

  it('should create a new translation', async () => {
    const newTranslation = { nb: 'ny oversettelse', nn: 'ny omsetjing', en: 'new translation' };

    render(
      <EditGlobalTranslationsProvider>
        <TestComponent newTranslation={newTranslation} />
      </EditGlobalTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Update New Translation'));
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() =>
      expect(mocks.createNewTranslation).toHaveBeenCalledWith(expect.objectContaining(newTranslation)),
    );
    expect(screen.getByTestId('editState')).toHaveTextContent('SAVED');
  });

  it('should not create a new translation if there are validation errors', async () => {
    const newTranslation = { nn: 'ny oversettelse', en: 'new translation' };

    render(
      <EditGlobalTranslationsProvider>
        <TestComponent newTranslation={newTranslation} />
      </EditGlobalTranslationsProvider>,
    );

    fireEvent.click(screen.getByText('Update New Translation'));
    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByTestId('errors')).toHaveTextContent('Legg til bokmålstekst for å opprette ny oversettelse');

    expect(mocks.createNewTranslation).not.toHaveBeenCalled();
    expect(screen.getByTestId('editState')).toHaveTextContent('EDITING');
  });
});
