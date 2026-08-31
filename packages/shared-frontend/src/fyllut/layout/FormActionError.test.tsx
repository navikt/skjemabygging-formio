import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '../../context/language/LanguageContext';
import { SubmissionStateProvider } from '../../context/state/SubmissionStateContext';
import { FormActionsProvider, useFormActions } from '../context/form-actions/FormActionsContext';
import FormActionError from './FormActionError';

const renderWithFailingSave = (root: Root, container: HTMLElement, save: () => Promise<void>) => {
  const Harness = () => {
    const { saveDraft } = useFormActions();
    return (
      <>
        <button type="button" onClick={() => void saveDraft()}>
          Save
        </button>
        <FormActionError />
      </>
    );
  };

  act(() => {
    root.render(
      <LanguageProvider translations={{}} currentLanguage="nb" availableLanguages={['nb']}>
        <SubmissionStateProvider initialSubmission={{ data: {} }}>
          <FormActionsProvider save={save}>
            <Harness />
          </FormActionsProvider>
        </SubmissionStateProvider>
      </LanguageProvider>,
    );
  });
};

describe('FormActionError', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders nothing when there is no error', () => {
    renderWithFailingSave(root, container, async () => {});
    expect(container.querySelector('.navds-alert')).toBeNull();
  });

  it('renders the user message when a save fails', async () => {
    renderWithFailingSave(root, container, async () => {
      throw { cause: new Error('network'), userMessage: 'Kunne ikke lagre utkastet.' };
    });

    await act(async () => {
      (container.querySelector('button') as HTMLButtonElement).click();
    });

    expect(container.textContent).toContain('Kunne ikke lagre utkastet.');
  });

  it('falls back to a generic error message for errors without a user message', async () => {
    renderWithFailingSave(root, container, async () => {
      throw new Error('boom');
    });

    await act(async () => {
      (container.querySelector('button') as HTMLButtonElement).click();
    });

    expect(container.textContent).toContain(TEXTS.statiske.error.serverErrorTitle);
  });
});
